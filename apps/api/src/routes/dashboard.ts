import { Router } from "express";
import type { JobStatus } from "@geosurvey-ai/shared";
import { prisma } from "../prisma.js";
import { ok } from "../utils/respond.js";

const statuses: JobStatus[] = ["PENDING", "PROCESSING", "REVIEW", "COMPLETED", "FAILED"];

export const dashboardRouter = Router();

dashboardRouter.get("/stats", async (_req, res) => {
  const [aggregate, activeJobs, recentInsights, jobsByStatusRows, jobsWithBoundaries] = await Promise.all([
    prisma.surveyJob.aggregate({
      where: { status: "COMPLETED" },
      _sum: { areaSqM: true, pointCount: true },
      _avg: { accuracyRmse: true }
    }),
    prisma.surveyJob.count({
      where: { status: { in: ["PROCESSING", "REVIEW"] } }
    }),
    prisma.aiInsight.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { job: { select: { name: true } } }
    }),
    prisma.surveyJob.groupBy({ by: ["status"], _count: { _all: true } }),
    prisma.surveyJob.findMany({
      select: { id: true, name: true, projectId: true, status: true, type: true, boundaryGeojson: true, centroidLat: true, centroidLng: true }
    })
  ]);

  const jobsByStatus = statuses.reduce<Record<JobStatus, number>>((accumulator, status) => {
    accumulator[status] = 0;
    return accumulator;
  }, { PENDING: 0, PROCESSING: 0, REVIEW: 0, COMPLETED: 0, FAILED: 0 });

  for (const row of jobsByStatusRows) {
    jobsByStatus[row.status as JobStatus] = row._count._all;
  }

  return ok(res, {
    totalAreaHa: Number(((aggregate._sum.areaSqM ?? 0) / 10_000).toFixed(2)),
    activeJobs,
    totalPoints: Number(aggregate._sum.pointCount ?? BigInt(0)),
    avgRmse: Number((aggregate._avg.accuracyRmse ?? 0).toFixed(2)),
    recentInsights,
    jobsByStatus,
    jobBoundaries: jobsWithBoundaries.filter((job) => job.boundaryGeojson)
  });
});
