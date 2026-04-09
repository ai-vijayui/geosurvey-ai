import "../config/loadEnv.js";
import { Worker } from "bullmq";
import { appendJobProgress, setJobStatus } from "../services/jobState.js";
import { connection } from "../services/queue.js";
import { aiInsightEngine } from "./aiInsightEngine.js";
import { classificationEngine } from "./classificationEngine.js";
import { fileValidator } from "./fileValidator.js";
import { outputGenerator } from "./outputGenerator.js";
import { pointCloudProcessor } from "./pointCloudProcessor.js";

const ts = () => new Date().toISOString();

export const worker = new Worker(
  "survey-processing",
  async (job) => {
    const { jobId } = job.data as { jobId: string };
    const emitProgress = async (event: { type: "PROGRESS" | "COMPLETE" | "FAILED"; stage: string; progress: number; message?: string; error?: string }) => {
      const payload = { ...event, jobId, timestamp: ts() };
      await job.updateProgress(payload);
      await appendJobProgress(jobId, payload, {
        currentStage: event.stage,
        progressPct: event.progress,
        completedAt: event.type === "COMPLETE" ? payload.timestamp : undefined,
        lastError: event.type === "FAILED" ? event.error ?? payload.message ?? "Processing failed" : null
      });
    };

    await emitProgress({ type: "PROGRESS", stage: "FILE_VALIDATOR", progress: 5, message: "Validating input files..." });
    await fileValidator(jobId);
    await emitProgress({ type: "PROGRESS", stage: "FILE_VALIDATOR", progress: 10, message: "Validation complete" });
    await emitProgress({ type: "PROGRESS", stage: "POINT_CLOUD_PROCESSOR", progress: 15, message: "Starting point cloud processing..." });
    await pointCloudProcessor(jobId);
    await emitProgress({ type: "PROGRESS", stage: "POINT_CLOUD_PROCESSOR", progress: 60, message: "Point cloud processed" });
    await emitProgress({ type: "PROGRESS", stage: "CLASSIFICATION_ENGINE", progress: 62, message: "Classifying returns..." });
    await classificationEngine(jobId);
    await emitProgress({ type: "PROGRESS", stage: "CLASSIFICATION_ENGINE", progress: 80, message: "Classification complete" });
    await emitProgress({ type: "PROGRESS", stage: "OUTPUT_GENERATOR", progress: 82, message: "Generating output files..." });
    await outputGenerator(jobId);
    await emitProgress({ type: "PROGRESS", stage: "AI_INSIGHT_ENGINE", progress: 95, message: "Running AI analysis..." });
    await aiInsightEngine(jobId);
    await emitProgress({ type: "COMPLETE", stage: "AI_INSIGHT_ENGINE", progress: 100, message: "Processing complete" });
    await setJobStatus(jobId, "COMPLETED", { currentStage: "COMPLETED", progressPct: 100, completedAt: ts(), lastError: null });
    return { jobId };
  },
  { connection, concurrency: 2 }
);

worker.on("failed", async (job, err) => {
  if (job) {
    const jobId = (job.data as { jobId: string }).jobId;
    await appendJobProgress(jobId, { type: "FAILED", jobId, stage: "FAILED", error: err.message, timestamp: ts() }, {
      currentStage: "FAILED",
      progressPct: 100,
      lastError: err.message
    });
    await setJobStatus(jobId, "FAILED", { currentStage: "FAILED", progressPct: 100, lastError: err.message });
    console.error(`Job ${(job.data as { jobId: string }).jobId} failed:`, err.message);
  }
});

console.log("Survey processing worker started");
