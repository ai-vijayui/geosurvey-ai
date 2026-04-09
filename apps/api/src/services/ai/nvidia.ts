import { logger } from "../../utils/logger.js";
import type { AiProvider, ChatMessage } from "./provider.js";

const baseUrl = process.env.NVIDIA_API_BASE_URL ?? "https://integrate.api.nvidia.com/v1";
const model = process.env.NVIDIA_LLM_MODEL ?? "openai/gpt-oss-120b";

type ChatCompletionChoice = {
  message?: { content?: string | null };
  delta?: { content?: string | null };
};

function getHeaders() {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${process.env.NVIDIA_API_KEY ?? ""}`
  };
}

async function parseJsonResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`NVIDIA AI request failed (${response.status}): ${text}`);
  }
  return response.json() as Promise<T>;
}

export class NvidiaAiProvider implements AiProvider {
  async analyzeJson(systemPrompt: string, userPrompt: string): Promise<string> {
    if (!process.env.NVIDIA_API_KEY) {
      throw new Error("NVIDIA_API_KEY is not configured.");
    }

    const payload = await parseJsonResponse<{ choices?: ChatCompletionChoice[] }>(
      await fetch(`${baseUrl}/chat/completions`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({
          model,
          temperature: 0.2,
          response_format: { type: "json_object" },
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt }
          ]
        })
      })
    );

    return payload.choices?.[0]?.message?.content ?? "[]";
  }

  async *streamChat(systemPrompt: string, messages: ChatMessage[], signal?: AbortSignal): AsyncGenerator<string> {
    if (!process.env.NVIDIA_API_KEY) {
      throw new Error("NVIDIA_API_KEY is not configured.");
    }

    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: getHeaders(),
      body: JSON.stringify({
        model,
        temperature: 0.4,
        stream: true,
        messages: [{ role: "system", content: systemPrompt }, ...messages]
      }),
      signal
    });

    if (!response.ok || !response.body) {
      const text = await response.text();
      throw new Error(`NVIDIA AI stream failed (${response.status}): ${text}`);
    }

    const decoder = new TextDecoder();
    const reader = response.body.getReader();
    let buffer = "";

    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }

      buffer += decoder.decode(value, { stream: true });
      const events = buffer.split("\n\n");
      buffer = events.pop() ?? "";

      for (const event of events) {
        const line = event
          .split("\n")
          .find((candidate) => candidate.startsWith("data:"));
        if (!line) {
          continue;
        }
        const payload = line.replace(/^data:\s*/, "").trim();
        if (!payload || payload === "[DONE]") {
          continue;
        }

        try {
          const parsed = JSON.parse(payload) as { choices?: ChatCompletionChoice[] };
          const token = parsed.choices?.[0]?.delta?.content;
          if (token) {
            yield token;
          }
        } catch (error) {
          logger.warn("Unable to parse NVIDIA streaming payload", error);
        }
      }
    }
  }
}
