import { Router } from "express";
import { z } from "zod";
import { streamAiChat } from "../services/aiOrchestrator.js";
import { buildPlatformGeneralAssistantPrompt } from "../services/ai/platformPrompt.js";

const aiChatSchema = z.object({
  message: z.string().min(1),
  history: z.array(z.object({ role: z.enum(["user", "assistant"]), content: z.string() })).default([]),
  context: z.object({
    route: z.string().min(1),
    page: z.string().min(1)
  })
});

export const aiRouter = Router();

aiRouter.post("/chat", async (req, res) => {
  const parsed = aiChatSchema.parse(req.body);

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  const controller = new AbortController();
  req.on("close", () => controller.abort());

  const systemPrompt = buildPlatformGeneralAssistantPrompt(parsed.context);

  for await (const token of streamAiChat(systemPrompt, [...parsed.history, { role: "user", content: parsed.message }], controller.signal)) {
    res.write(`data: ${JSON.stringify({ token })}\n\n`);
  }

  res.write("data: [DONE]\n\n");
  res.end();
});
