import { Queue, QueueEvents } from "bullmq";
import Redis from "ioredis";

const RedisCtor = Redis as unknown as new (url: string, options: { maxRetriesPerRequest: null }) => any;

export const connection = new RedisCtor(process.env.REDIS_URL ?? "redis://localhost:6379", {
  maxRetriesPerRequest: null
});

export const surveyQueue = new Queue("survey-processing", { connection });
export const surveyQueueEvents = new QueueEvents("survey-processing", { connection });

export function emitProgress(jobId: string, stage: string, progress: number, message: string) {
  return surveyQueue.getJob(jobId).then((job) =>
    job?.updateProgress({
      type: "PROGRESS",
      jobId,
      stage,
      progress,
      message,
      timestamp: new Date().toISOString()
    })
  );
}
