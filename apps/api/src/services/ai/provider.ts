import { z } from "zod";

export const aiInsightSchema = z.object({
  severity: z.enum(["INFO", "WARNING", "ERROR", "SUCCESS"]),
  category: z.string().min(1).max(40),
  message: z.string().min(1).max(120),
  confidence: z.number().min(0).max(1),
  recommendation: z.string().min(1).max(200)
});

export const aiInsightArraySchema = z.array(aiInsightSchema);

export type AiInsightDraft = z.infer<typeof aiInsightSchema>;
export type ChatMessage = { role: "system" | "user" | "assistant"; content: string };

export interface AiProvider {
  analyzeJson(systemPrompt: string, userPrompt: string): Promise<string>;
  streamChat(systemPrompt: string, messages: ChatMessage[], signal?: AbortSignal): AsyncGenerator<string>;
}
