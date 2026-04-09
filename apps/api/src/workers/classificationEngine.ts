import { prisma } from "../prisma.js";

export async function classificationEngine(jobId: string) {
  const job = await prisma.surveyJob.findUnique({ where: { id: jobId } });
  if (!job) {
    throw new Error(`Survey job ${jobId} not found`);
  }

  await prisma.surveyJob.update({
    where: { id: jobId },
    data: {
      metadata: {
        ...(typeof job.metadata === "object" && job.metadata ? (job.metadata as Record<string, unknown>) : {}),
        classification: { ground: 0.62, vegetation: 0.23, structures: 0.15 }
      }
    }
  });
}
