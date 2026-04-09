import type { JobStatus, ProgressEvent } from "@geosurvey-ai/shared";
import { Prisma } from "@prisma/client";
import { prisma } from "../prisma.js";

type ProcessingMetadata = {
  currentStage?: string;
  progressPct?: number;
  lastError?: string | null;
  startedAt?: string | null;
  completedAt?: string | null;
  timeline?: Array<{ stage: string; progress: number; message: string; timestamp: string; status: "queued" | "running" | "completed" | "failed" }>;
  metricsSummary?: Record<string, unknown>;
};

type MetadataLike = Record<string, unknown> | null | undefined;

function normalizeProcessingMetadata(metadata: MetadataLike): ProcessingMetadata {
  if (!metadata || typeof metadata !== "object") {
    return { timeline: [] };
  }
  return {
    currentStage: typeof metadata.currentStage === "string" ? metadata.currentStage : undefined,
    progressPct: typeof metadata.progressPct === "number" ? metadata.progressPct : undefined,
    lastError: typeof metadata.lastError === "string" ? metadata.lastError : null,
    startedAt: typeof metadata.startedAt === "string" ? metadata.startedAt : null,
    completedAt: typeof metadata.completedAt === "string" ? metadata.completedAt : null,
    metricsSummary: typeof metadata.metricsSummary === "object" && metadata.metricsSummary ? metadata.metricsSummary as Record<string, unknown> : undefined,
    timeline: Array.isArray(metadata.timeline) ? metadata.timeline as ProcessingMetadata["timeline"] : []
  };
}

export function serializeForApi<T>(value: T): T {
  return JSON.parse(JSON.stringify(value, (_key, current) => (typeof current === "bigint" ? Number(current) : current))) as T;
}

function toJsonValue(value: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

export async function appendJobProgress(jobId: string, event: ProgressEvent, updates?: Partial<ProcessingMetadata>) {
  const job = await prisma.surveyJob.findUnique({
    where: { id: jobId },
    select: { processingMetadata: true }
  });

  const current = normalizeProcessingMetadata(job?.processingMetadata as MetadataLike);
  const timeline = [...(current.timeline ?? []), {
    stage: event.stage ?? "UNKNOWN",
    progress: event.progress ?? current.progressPct ?? 0,
    message: event.message ?? event.error ?? "",
    timestamp: event.timestamp,
    status: event.type === "FAILED" ? "failed" : event.type === "COMPLETE" ? "completed" : "running"
  }].slice(-50);

  await prisma.surveyJob.update({
    where: { id: jobId },
    data: {
      processingMetadata: toJsonValue({
        ...current,
        currentStage: updates?.currentStage ?? event.stage ?? current.currentStage,
        progressPct: updates?.progressPct ?? event.progress ?? current.progressPct,
        lastError: updates?.lastError ?? (event.type === "FAILED" ? event.error ?? "Processing failed" : current.lastError),
        startedAt: updates?.startedAt ?? current.startedAt ?? event.timestamp,
        completedAt: updates?.completedAt ?? (event.type === "COMPLETE" ? event.timestamp : current.completedAt),
        metricsSummary: updates?.metricsSummary ?? current.metricsSummary,
        timeline
      })
    }
  });
}

export async function setJobStatus(jobId: string, status: JobStatus, updates?: Partial<ProcessingMetadata>) {
  const job = await prisma.surveyJob.findUnique({
    where: { id: jobId },
    select: { processingMetadata: true }
  });
  const current = normalizeProcessingMetadata(job?.processingMetadata as MetadataLike);

  await prisma.surveyJob.update({
    where: { id: jobId },
    data: {
      status,
      processingMetadata: toJsonValue({
        ...current,
        ...updates
      })
    }
  });
}
