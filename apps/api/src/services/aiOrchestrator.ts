import type { SurveyJob } from "@geosurvey-ai/shared";
import { logger } from "../utils/logger.js";
import { NvidiaAiProvider } from "./ai/nvidia.js";
import { buildPlatformAnalysisPrompt } from "./ai/platformPrompt.js";
import { aiInsightArraySchema, type ChatMessage } from "./ai/provider.js";

type AnalysisMetricShape = {
  gnssCount: number;
  gcpResiduals?: number[];
  classStats?: Record<string, number>;
  fileTypes: string[];
  existingInsightCount: number;
  bbox?: Record<string, number | null>;
};

const provider = new NvidiaAiProvider();

export function hasNvidiaApiKey() {
  const key = process.env.NVIDIA_API_KEY?.trim();
  return Boolean(key && !key.endsWith("..."));
}

export function getNvidiaKeyPreview() {
  const key = process.env.NVIDIA_API_KEY?.trim();
  if (!key) {
    return null;
  }

  return `${key.slice(0, 6)}...`;
}

export function logAiProviderStatus() {
  if (!process.env.NVIDIA_API_KEY) {
    console.warn("NVIDIA_API_KEY not found in environment");
  }

  console.log("AI Provider: NVIDIA | Status:", hasNvidiaApiKey() ? "READY" : "NOT CONFIGURED");
}

function buildSystemPrompt() {
  return `${buildPlatformAnalysisPrompt()}
You are a senior geodetic engineer and land surveying expert.
Analyze survey metrics and identify issues including boundary encroachments, GCP outliers, accuracy anomalies, classification errors, data gaps, and compliance concerns.
Return JSON only. No preamble. No markdown. No commentary.`;
}

function buildUserPrompt(
  job: Pick<SurveyJob, "name" | "type" | "status" | "areaSqM" | "pointCount"> & { accuracyRmse?: number },
  metrics: AnalysisMetricShape
) {
  return `Return a JSON array where each item exactly matches:
{
  "severity": "INFO"|"WARNING"|"ERROR"|"SUCCESS",
  "category": string,
  "message": string,
  "confidence": number,
  "recommendation": string
}

Survey job: "${job.name}"
Type: ${job.type}
Status: ${job.status}
Area hectares: ${((job.areaSqM ?? 0) / 10000).toFixed(2)}
Point count: ${job.pointCount ?? "unknown"}
RMSE accuracy: ${job.accuracyRmse ?? "N/A"}
GNSS point count: ${metrics.gnssCount}
GCP residuals: ${JSON.stringify(metrics.gcpResiduals ?? [])}
Classification stats: ${JSON.stringify(metrics.classStats ?? {})}
Input file types: ${metrics.fileTypes.join(", ")}
Existing insight count: ${metrics.existingInsightCount}
Bounding box: ${JSON.stringify(metrics.bbox ?? {})}`;
}

function cleanJsonPayload(raw: string) {
  return raw.replace(/```json|```/g, "").trim();
}

export async function analyzeSurveyJob(
  job: Pick<SurveyJob, "name" | "type" | "status" | "areaSqM" | "pointCount"> & { accuracyRmse?: number },
  metrics: AnalysisMetricShape
) {
  if (!hasNvidiaApiKey()) {
    return [
      {
        severity: "INFO" as const,
        category: "Offline Analysis",
        message: "NVIDIA API key not configured; returned synthetic analysis.",
        confidence: 0.6,
        recommendation: "Set NVIDIA_API_KEY to enable model-backed insight generation."
      }
    ];
  }

  try {
    const raw = await provider.analyzeJson(buildSystemPrompt(), buildUserPrompt(job, metrics));
    const cleaned = cleanJsonPayload(raw);
    const parsed = JSON.parse(cleaned);
    const normalized = Array.isArray(parsed) ? parsed : parsed.insights ?? [];
    return aiInsightArraySchema.parse(normalized);
  } catch (error) {
    logger.error("AI analysis parse/provider error", error);
    return [];
  }
}

export async function* streamSurveyChat(systemPrompt: string, messages: { role: string; content: string }[], signal?: AbortSignal) {
  yield* streamAiChat(systemPrompt, messages, signal);
}

export async function* streamAiChat(systemPrompt: string, messages: { role: string; content: string }[], signal?: AbortSignal) {
  if (!hasNvidiaApiKey()) {
    yield "AI service is currently unavailable. Please configure API key.";
    return;
  }

  const normalizedMessages = messages
    .filter((message) => message.role === "user" || message.role === "assistant")
    .map((message) => ({ role: message.role, content: message.content })) as ChatMessage[];

  try {
    for await (const token of provider.streamChat(systemPrompt, normalizedMessages, signal)) {
      yield token;
    }
  } catch (error) {
    logger.error("AI chat streaming error", error);
    yield "The AI stream disconnected unexpectedly. ";
  }
}
