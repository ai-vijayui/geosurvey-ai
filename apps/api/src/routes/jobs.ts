import type { BoundaryState, JobStatus, ProgressEvent, SurveyType } from "@geosurvey-ai/shared";
import { Prisma } from "@prisma/client";
import { Router } from "express";
import multer from "multer";
import { z } from "zod";
import { prisma } from "../prisma.js";
import { analyzeSurveyJob, streamSurveyChat } from "../services/aiOrchestrator.js";
import { buildPlatformAssistantPrompt } from "../services/ai/platformPrompt.js";
import { appendJobProgress, serializeForApi, setJobStatus } from "../services/jobState.js";
import { ensureOutputArtifactUploaded } from "../services/outputArtifacts.js";
import { surveyQueue, surveyQueueEvents } from "../services/queue.js";
import { createDownloadUrl, deleteObject, makeStorageKey, objectExists, uploadBuffer } from "../services/storage.js";
import { calculateAreaSqMFromBoundary, calculateBoundingBox, validateFileExtension } from "../utils/geoprocessing.js";
import { fail, ok, okPaginated } from "../utils/respond.js";

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 2 * 1024 * 1024 * 1024 } });
const jobStatuses = ["PENDING", "PROCESSING", "REVIEW", "COMPLETED", "FAILED"] as const satisfies readonly JobStatus[];
const surveyTypes = ["LIDAR", "DRONE_PHOTOGRAMMETRY", "GNSS_TRAVERSE", "TOTAL_STATION", "HYBRID"] as const satisfies readonly SurveyType[];

const createJobSchema = z.object({
  projectId: z.string().min(1),
  name: z.string().min(1),
  type: z.enum(surveyTypes)
});
const statusSchema = z.object({ status: z.enum(jobStatuses) });
const aiChatSchema = z.object({
  message: z.string().min(1),
  history: z.array(z.object({ role: z.string(), content: z.string() })).default([])
});
const boundarySchema = z.object({
  type: z.literal("FeatureCollection"),
  features: z.array(
    z.object({
      type: z.literal("Feature"),
      properties: z.record(z.string(), z.unknown()).optional().default({}),
      geometry: z.union([
        z.object({
          type: z.literal("Polygon"),
          coordinates: z.array(z.array(z.tuple([z.number(), z.number()]))).min(1)
        }),
        z.object({
          type: z.literal("MultiPolygon"),
          coordinates: z.array(z.array(z.array(z.tuple([z.number(), z.number()])))).min(1)
        })
      ])
    })
  ).min(1)
});
const markerSchema = z.object({
  lat: z.number().finite(),
  lng: z.number().finite()
});
const boundaryPayloadSchema = z.object({
  boundaryGeojson: boundarySchema.nullish(),
  marker: markerSchema.nullish()
}).refine((value) => value.boundaryGeojson || value.marker, {
  message: "Boundary or marker data is required"
});

type BoundaryGeoJson = z.infer<typeof boundarySchema>;

const transitionMap: Record<JobStatus, JobStatus[]> = {
  PENDING: ["PROCESSING", "FAILED"],
  PROCESSING: ["REVIEW", "COMPLETED", "FAILED"],
  REVIEW: ["COMPLETED", "FAILED"],
  COMPLETED: [],
  FAILED: ["PENDING"]
};

function getCentroid(boundary: BoundaryGeoJson) {
  const coordinates = boundary.features.flatMap((feature: BoundaryGeoJson["features"][number]) =>
    feature.geometry.type === "Polygon"
      ? feature.geometry.coordinates.flat()
      : feature.geometry.coordinates.flat(2)
  );

  if (coordinates.length === 0) {
    return { centroidLat: null, centroidLng: null };
  }

  const [sumLng, sumLat] = coordinates.reduce<[number, number]>(
    (accumulator, [lng, lat]: [number, number]) => [accumulator[0] + lng, accumulator[1] + lat],
    [0, 0]
  );
  return {
    centroidLng: Number((sumLng / coordinates.length).toFixed(6)),
    centroidLat: Number((sumLat / coordinates.length).toFixed(6))
  };
}

function countUniqueVertices(coordinates: Array<[number, number]>) {
  const unique = new Set(coordinates.map(([lng, lat]) => `${lng},${lat}`));
  return unique.size;
}

function hasValidBoundaryGeometry(boundary: BoundaryGeoJson) {
  return boundary.features.every((feature) => {
    if (feature.geometry.type === "Polygon") {
      const outerRing = feature.geometry.coordinates[0] ?? [];
      return outerRing.length >= 4 && countUniqueVertices(outerRing) >= 3;
    }

    return feature.geometry.coordinates.every((polygon) => {
      const outerRing = polygon[0] ?? [];
      return outerRing.length >= 4 && countUniqueVertices(outerRing) >= 3;
    });
  });
}

function getMarker(markerLat: number | null | undefined, markerLng: number | null | undefined) {
  if (typeof markerLat !== "number" || typeof markerLng !== "number") {
    return null;
  }

  return { lat: markerLat, lng: markerLng };
}

function toBoundaryState(job: {
  boundaryGeojson: unknown;
  areaSqM: number | null;
  centroidLat: number | null;
  centroidLng: number | null;
  markerLat: number | null;
  markerLng: number | null;
}): BoundaryState {
  return serializeForApi({
    boundaryGeojson: (job.boundaryGeojson as BoundaryGeoJson | null | undefined) ?? null,
    areaSqM: job.areaSqM,
    centroidLat: job.centroidLat,
    centroidLng: job.centroidLng,
    marker: getMarker(job.markerLat, job.markerLng)
  });
}

export const jobsRouter = Router();

jobsRouter.get("/", async (req, res) => {
  const page = Math.max(1, Number(req.query.page ?? 1));
  const limit = Math.min(100, Math.max(1, Number(req.query.limit ?? 20)));
  const where = {
    ...(req.query.status ? { status: String(req.query.status) as JobStatus } : {}),
    ...(req.query.type ? { type: String(req.query.type) as SurveyType } : {}),
    ...(req.query.projectId ? { projectId: String(req.query.projectId) } : {})
  };

  const [total, jobs] = await Promise.all([
    prisma.surveyJob.count({ where }),
    prisma.surveyJob.findMany({
      where,
      include: {
        inputFiles: { select: { id: true } },
        outputs: { select: { id: true } },
        _count: { select: { aiInsights: true, gnssPoints: true } }
      },
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * limit,
      take: limit
    })
  ]);

  return okPaginated(res, serializeForApi(jobs), { page, limit, total });
});

jobsRouter.post("/", async (req, res) => {
  const parsed = createJobSchema.parse(req.body);
  const job = await prisma.surveyJob.create({
    data: {
      ...parsed,
      status: "PENDING",
      processingMetadata: {
        currentStage: "QUEUED",
        progressPct: 0,
        timeline: []
      }
    }
  });
  return ok(res, serializeForApi(job), 201);
});

jobsRouter.get("/:id", async (req, res) => {
  const job = await prisma.surveyJob.findUnique({
    where: { id: req.params.id },
    include: {
      inputFiles: { orderBy: { uploadedAt: "desc" } },
      outputs: { orderBy: { createdAt: "desc" } },
      aiInsights: { orderBy: { createdAt: "desc" } },
      gnssPoints: { take: 100, orderBy: { timestamp: "asc" } }
    }
  });
  if (!job) {
    return fail(res, "Job not found", 404);
  }
  return ok(res, serializeForApi(job));
});

jobsRouter.get("/:id/boundary", async (req, res) => {
  const job = await prisma.surveyJob.findUnique({
    where: { id: req.params.id },
    select: { id: true, boundaryGeojson: true, areaSqM: true, centroidLat: true, centroidLng: true, markerLat: true, markerLng: true }
  });
  if (!job) {
    return fail(res, "Job not found", 404);
  }
  return ok(res, toBoundaryState(job));
});

jobsRouter.post("/:id/boundary", async (req, res) => {
  const parsed = "type" in (req.body ?? {})
    ? { boundaryGeojson: boundarySchema.parse(req.body) as BoundaryGeoJson, marker: null }
    : boundaryPayloadSchema.parse(req.body);
  const existing = await prisma.surveyJob.findUnique({ where: { id: req.params.id }, select: { id: true } });
  if (!existing) {
    return fail(res, "Job not found", 404);
  }

  if (parsed.boundaryGeojson && !hasValidBoundaryGeometry(parsed.boundaryGeojson)) {
    return fail(res, "Boundary polygon must contain at least 3 distinct vertices", 400);
  }

  const areaSqM = calculateAreaSqMFromBoundary(parsed.boundaryGeojson ?? null);
  const centroid = parsed.boundaryGeojson ? getCentroid(parsed.boundaryGeojson) : { centroidLat: null, centroidLng: null };
  const job = await prisma.surveyJob.update({
    where: { id: req.params.id },
    data: {
      boundaryGeojson: parsed.boundaryGeojson ? (parsed.boundaryGeojson as Prisma.InputJsonValue) : Prisma.JsonNull,
      areaSqM,
      centroidLat: centroid.centroidLat,
      centroidLng: centroid.centroidLng,
      markerLat: parsed.marker?.lat ?? null,
      markerLng: parsed.marker?.lng ?? null
    }
  });

  return ok(res, toBoundaryState(job));
});

jobsRouter.delete("/:id/boundary", async (req, res) => {
  const existing = await prisma.surveyJob.findUnique({ where: { id: req.params.id }, select: { id: true } });
  if (!existing) {
    return fail(res, "Job not found", 404);
  }

  const job = await prisma.surveyJob.update({
    where: { id: req.params.id },
    data: { boundaryGeojson: Prisma.JsonNull, areaSqM: null, centroidLat: null, centroidLng: null, markerLat: null, markerLng: null }
  });
  return ok(res, toBoundaryState(job));
});

jobsRouter.patch("/:id/status", async (req, res) => {
  const parsed = statusSchema.parse(req.body);
  const job = await prisma.surveyJob.findUnique({ where: { id: req.params.id } });
  if (!job) {
    return fail(res, "Job not found", 404);
  }
  if (!transitionMap[job.status as JobStatus].includes(parsed.status)) {
    return fail(res, `Invalid status transition from ${job.status} to ${parsed.status}`, 400);
  }
  await setJobStatus(req.params.id, parsed.status, {
    currentStage: parsed.status === "FAILED" ? "FAILED" : parsed.status,
    completedAt: parsed.status === "COMPLETED" ? new Date().toISOString() : undefined,
    lastError: parsed.status === "FAILED" ? "Status manually updated to FAILED." : null
  });
  const updated = await prisma.surveyJob.findUnique({ where: { id: req.params.id } });
  return ok(res, serializeForApi(updated));
});

jobsRouter.post("/:id/upload", upload.single("file") as never, async (req, res) => {
  if (!req.file) {
    return fail(res, "File is required", 400);
  }
  const fileType = validateFileExtension(req.file.originalname);
  if (!fileType) {
    return fail(res, "Unsupported file type", 400);
  }

  const key = makeStorageKey(req.params.id, req.file.originalname);
  await uploadBuffer(key, req.file.buffer, req.file.mimetype);
  const inputFile = await prisma.inputFile.create({
    data: { jobId: req.params.id, fileName: req.file.originalname, fileType, s3Key: key, sizeBytes: BigInt(req.file.size) }
  });
  return ok(res, serializeForApi(inputFile), 201);
});

jobsRouter.delete("/:id/files/:fileId", async (req, res) => {
  const file = await prisma.inputFile.findFirst({ where: { id: req.params.fileId, jobId: req.params.id } });
  if (!file) {
    return fail(res, "Input file not found", 404);
  }

  await deleteObject(file.s3Key);
  await prisma.inputFile.delete({ where: { id: file.id } });
  return ok(res, { deleted: true, fileId: file.id });
});

jobsRouter.get("/:id/download/:fileId", async (req, res) => {
  const [inputFile, outputFile] = await Promise.all([
    prisma.inputFile.findFirst({ where: { id: req.params.fileId, jobId: req.params.id } }),
    prisma.outputFile.findFirst({ where: { id: req.params.fileId, jobId: req.params.id } })
  ]);
  const file = inputFile ?? outputFile;
  if (!file) {
    return fail(res, "File not found", 404);
  }

  if (outputFile && !(await objectExists(outputFile.s3Key))) {
    const sizeBytes = await ensureOutputArtifactUploaded(outputFile);
    await prisma.outputFile.update({
      where: { id: outputFile.id },
      data: { sizeBytes: BigInt(sizeBytes) }
    });
  }

  return ok(res, { url: await createDownloadUrl(file.s3Key) });
});

jobsRouter.post("/:id/process", async (req, res) => {
  const job = await prisma.surveyJob.findUnique({ where: { id: req.params.id }, include: { inputFiles: true } });
  if (!job) {
    return fail(res, "Job not found", 404);
  }
  if (job.inputFiles.length === 0) {
    return fail(res, "At least one input file is required before processing", 400);
  }

  const startTs = new Date().toISOString();
  await setJobStatus(job.id, "PROCESSING", {
    currentStage: "QUEUED",
    progressPct: 0,
    lastError: null,
    startedAt: startTs,
    completedAt: null,
    timeline: [{ stage: "QUEUED", progress: 0, message: "Job queued for processing", timestamp: startTs, status: "queued" }]
  });
  await surveyQueue.add("process-job", { jobId: job.id }, { jobId: job.id, removeOnComplete: 50, removeOnFail: 50 });
  return ok(res, { queued: true, jobId: job.id });
});

jobsRouter.get("/:id/stream", async (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders();

  const writeEvent = (event: ProgressEvent) => res.write(`data: ${JSON.stringify(event)}\n\n`);
  const existing = await prisma.surveyJob.findUnique({ where: { id: req.params.id }, select: { processingMetadata: true } });
  const timeline = Array.isArray((existing?.processingMetadata as Record<string, unknown> | null)?.timeline)
    ? ((existing?.processingMetadata as Record<string, unknown>).timeline as Array<Record<string, unknown>>)
    : [];
  for (const entry of timeline.slice(-10)) {
    writeEvent({
      type: entry.status === "failed" ? "FAILED" : "PROGRESS",
      jobId: req.params.id,
      stage: String(entry.stage ?? "UNKNOWN"),
      progress: Number(entry.progress ?? 0),
      message: String(entry.message ?? ""),
      error: entry.status === "failed" ? String(entry.message ?? "Processing failed") : undefined,
      timestamp: String(entry.timestamp ?? new Date().toISOString())
    });
  }

  const heartbeat = setInterval(() => {
    writeEvent({ type: "HEARTBEAT", jobId: req.params.id, timestamp: new Date().toISOString() });
  }, 15_000);

  const onProgress = async ({ jobId, data }: { jobId: string; data: unknown }) => {
    if (jobId === req.params.id && data && typeof data === "object") {
      writeEvent(data as ProgressEvent);
    }
  };
  const onCompleted = async ({ jobId }: { jobId: string }) => {
    if (jobId === req.params.id) {
      writeEvent({ type: "COMPLETE", jobId, message: "Processing complete", timestamp: new Date().toISOString() });
      cleanup();
    }
  };
  const onFailed = async ({ jobId, failedReason }: { jobId: string; failedReason?: string }) => {
    if (jobId === req.params.id) {
      writeEvent({ type: "FAILED", jobId, error: failedReason, timestamp: new Date().toISOString() });
      cleanup();
    }
  };
  const cleanup = () => {
    clearInterval(heartbeat);
    surveyQueueEvents.off("progress", onProgress);
    surveyQueueEvents.off("completed", onCompleted);
    surveyQueueEvents.off("failed", onFailed);
    if (!res.writableEnded) {
      res.end();
    }
  };

  surveyQueueEvents.on("progress", onProgress);
  surveyQueueEvents.on("completed", onCompleted);
  surveyQueueEvents.on("failed", onFailed);
  req.on("close", cleanup);
});

jobsRouter.post("/:id/ai-analyze", async (req, res) => {
  const job = await prisma.surveyJob.findUnique({
    where: { id: req.params.id },
    include: { aiInsights: true, gnssPoints: true, inputFiles: true }
  });
  if (!job) {
    return fail(res, "Job not found", 404);
  }

  const insights = await analyzeSurveyJob(
    {
      name: job.name,
      type: job.type,
      status: job.status as JobStatus,
      areaSqM: job.areaSqM ?? undefined,
      pointCount: job.pointCount ? Number(job.pointCount) : undefined,
      accuracyRmse: job.accuracyRmse ?? undefined
    },
    {
      gnssCount: job.gnssPoints.length,
      gcpResiduals: job.gnssPoints.map((point: typeof job.gnssPoints[number]) => point.accuracy),
      classStats: (job.metadata as Record<string, unknown> | null)?.classification as Record<string, number> | undefined,
      fileTypes: job.inputFiles.map((file: typeof job.inputFiles[number]) => file.fileType),
      existingInsightCount: job.aiInsights.length,
      bbox: calculateBoundingBox(job.gnssPoints)
    }
  );

  await prisma.aiInsight.deleteMany({ where: { jobId: job.id } });
  if (insights.length > 0) {
    await prisma.aiInsight.createMany({
      data: insights.map((insight) => ({
        jobId: job.id,
        severity: insight.severity,
        category: insight.category,
        message: insight.message,
        confidence: insight.confidence,
        metadata: { recommendation: insight.recommendation }
      }))
    });
  }

  const savedInsights = await prisma.aiInsight.findMany({ where: { jobId: job.id }, orderBy: { createdAt: "desc" } });
  return ok(res, { insights: serializeForApi(savedInsights) });
});

jobsRouter.post("/:id/ai-chat", async (req, res) => {
  const parsed = aiChatSchema.parse(req.body);
  const job = await prisma.surveyJob.findUnique({
    where: { id: req.params.id },
    include: { aiInsights: true, gnssPoints: true, inputFiles: true }
  });
  if (!job) {
    return fail(res, "Job not found", 404);
  }

  if (!process.env.NVIDIA_API_KEY?.trim() || process.env.NVIDIA_API_KEY.trim().endsWith("...")) {
    const acceptHeader = req.headers.accept ?? "";
    if (acceptHeader.includes("application/json")) {
      return res.status(503).json({
        error: "AI_NOT_CONFIGURED",
        message: "AI chat is not configured. Add NVIDIA_API_KEY in .env and restart server."
      });
    }
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  const controller = new AbortController();
  req.on("close", () => controller.abort());

  const systemPrompt = buildPlatformAssistantPrompt({
    name: job.name,
    type: job.type,
    status: job.status,
    areaSqM: job.areaSqM,
    pointCount: job.pointCount ? Number(job.pointCount) : null,
    accuracyRmse: job.accuracyRmse,
    gnssCount: job.gnssPoints.length,
    insightCount: job.aiInsights.length,
    inputFileTypes: job.inputFiles.map((file: typeof job.inputFiles[number]) => file.fileType)
  });

  for await (const token of streamSurveyChat(systemPrompt, [...parsed.history, { role: "user", content: parsed.message }], controller.signal)) {
    res.write(`data: ${JSON.stringify({ token })}\n\n`);
  }
  res.write("data: [DONE]\n\n");
  res.end();
});
