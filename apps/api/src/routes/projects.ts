import { Router } from "express";
import { z } from "zod";
import { prisma } from "../prisma.js";
import { ok } from "../utils/respond.js";

export const projectsRouter = Router();
const createProjectSchema = z.object({
  name: z.string().min(1, "Project name is required"),
  client: z.string().trim().optional().default(""),
  location: z.string().trim().optional().default("")
});

projectsRouter.get("/", async (_req, res) => {
  const projects = await prisma.project.findMany({
    include: { surveyJobs: { select: { id: true, name: true, status: true, type: true } } },
    orderBy: { createdAt: "desc" }
  });
  return ok(res, projects);
});

projectsRouter.post("/", async (req, res) => {
  const parsed = createProjectSchema.parse(req.body);
  const organization = await prisma.organization.upsert({
    where: { clerkOrgId: req.orgId ?? "dev-org" },
    update: {},
    create: {
      name: "GeoSurvey Workspace",
      clerkOrgId: req.orgId ?? "dev-org"
    }
  });

  const project = await prisma.project.create({
    data: {
      name: parsed.name.trim(),
      orgId: organization.id,
      description: [parsed.client, parsed.location].filter(Boolean).join(" • ") || null
    },
    include: { surveyJobs: { select: { id: true, name: true, status: true, type: true } } }
  });

  return ok(res, project, 201);
});
