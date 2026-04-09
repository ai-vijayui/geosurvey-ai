import { prisma } from "../prisma.js";
import { analyzeSurveyJob } from "../services/aiOrchestrator.js";
import { calculateBoundingBox } from "../utils/geoprocessing.js";

export async function aiInsightEngine(jobId: string) {
  const job = await prisma.surveyJob.findUnique({
    where: { id: jobId },
    include: { inputFiles: true, aiInsights: true, gnssPoints: true }
  });

  if (!job) {
    throw new Error(`Survey job ${jobId} not found`);
  }

  const insights = await analyzeSurveyJob(
    {
      name: job.name,
      type: job.type,
      status: job.status,
      areaSqM: job.areaSqM ?? undefined,
      pointCount: job.pointCount ? Number(job.pointCount) : undefined,
      accuracyRmse: job.accuracyRmse ?? undefined
    },
    {
      gnssCount: job.gnssPoints.length,
      gcpResiduals: job.gnssPoints.map((point: typeof job.gnssPoints[number]) => Number(point.accuracy.toFixed(2))),
      classStats: (job.metadata as Record<string, unknown> | null)?.classification as Record<string, number> | undefined,
      fileTypes: job.inputFiles.map((file: typeof job.inputFiles[number]) => file.fileType),
      existingInsightCount: job.aiInsights.length,
      bbox: calculateBoundingBox(job.gnssPoints)
    }
  );

  await prisma.aiInsight.deleteMany({ where: { jobId } });
  if (insights.length > 0) {
    await prisma.aiInsight.createMany({
      data: insights.map((insight) => ({
        jobId,
        severity: insight.severity,
        category: insight.category,
        message: insight.message,
        confidence: insight.confidence,
        metadata: { recommendation: insight.recommendation }
      }))
    });
  }
}
