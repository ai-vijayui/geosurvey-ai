import { Router } from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { withOrg } from "../middleware/withOrg.js";
import { aiRouter } from "./ai.js";
import { dashboardRouter } from "./dashboard.js";
import { gnssRouter } from "./gnss.js";
import { jobsRouter } from "./jobs.js";
import { projectsRouter } from "./projects.js";
import { getNvidiaKeyPreview, hasNvidiaApiKey } from "../services/aiOrchestrator.js";
import { marketingRouter } from "./marketing.js";

export const router = Router();

router.get("/debug/env", (_req, res) => {
  res.json({
    hasNvidiaKey: hasNvidiaApiKey(),
    keyPreview: getNvidiaKeyPreview()
  });
});

router.use("/marketing", marketingRouter);

router.use(requireAuth, withOrg);

router.use("/ai", aiRouter);
router.use("/dashboard", dashboardRouter);
router.use("/projects", projectsRouter);
router.use("/jobs", jobsRouter);
router.use("/gnss", gnssRouter);
