import { Router } from "express";
import { z } from "zod";
import { persistMarketingInquiry } from "../services/marketingInquiries.js";
import { logger } from "../utils/logger.js";
import { fail, ok } from "../utils/respond.js";

export const marketingRouter = Router();

const inquirySchema = z.object({
  name: z.string().trim().min(2, "Name is required"),
  email: z.email("A valid work email is required").transform((value) => value.trim().toLowerCase()),
  company: z.string().trim().min(2, "Company is required"),
  interest: z.enum(["contact", "demo"]).default("contact"),
  teamSize: z.string().trim().optional().default(""),
  message: z.string().trim().min(10, "Please share a little more context"),
  sourcePage: z.string().trim().optional().default("website"),
  website: z.string().trim().max(0).optional().default("")
});

marketingRouter.post("/contact", async (req, res) => {
  const parsed = inquirySchema.safeParse(req.body);

  if (!parsed.success) {
    return fail(res, parsed.error.issues[0]?.message ?? "Invalid inquiry payload");
  }

  const inquiry = parsed.data;

  if (inquiry.website) {
    return ok(res, {
      accepted: true,
      referenceId: `inq_${Date.now()}`,
      message: "Thanks. We received your request."
    }, 201);
  }

  const referenceId = `inq_${Date.now()}`;
  const receivedAt = new Date().toISOString();

  const inquiryRecord = {
    referenceId,
    receivedAt,
    interest: inquiry.interest,
    name: inquiry.name,
    email: inquiry.email,
    company: inquiry.company,
    teamSize: inquiry.teamSize || "",
    sourcePage: inquiry.sourcePage,
    message: inquiry.message
  } as const;

  const savedTo = await persistMarketingInquiry(inquiryRecord);

  logger.info("marketing_inquiry", {
    ...inquiryRecord,
    savedTo
  });

  return ok(res, {
    accepted: true,
    referenceId,
    message:
      inquiry.interest === "demo"
        ? "Demo request received. Our team will follow up shortly."
        : "Thanks for reaching out. Our team will follow up shortly."
  }, 201);
});
