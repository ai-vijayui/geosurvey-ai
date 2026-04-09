import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import type { SurveyJob } from "@geosurvey-ai/shared";
import { apiUrl } from "../lib/api";

type Props = {
  jobId?: string;
  jobMetrics?: Partial<SurveyJob>;
  heading?: string;
  subheading?: string;
  summaryLabel?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  headerAction?: ReactNode;
};

type Message = { role: "user" | "assistant"; content: string };
type PropsWithVariant = Props & { variant?: "default" | "rail" };

const starterPrompts = [
  "Explain current issues",
  "What should I do next?",
  "Is this survey ready for export?",
  "Summarize risks in plain English"
];

async function getToken() {
  try {
    const clerk = (window as Window & { Clerk?: { session?: { getToken?: () => Promise<string | null> } } }).Clerk;
    return clerk ? await clerk.session?.getToken?.() ?? null : null;
  } catch {
    return null;
  }
}

export function AiChatPanel({
  jobId,
  jobMetrics = {},
  variant = "default",
  heading,
  subheading,
  summaryLabel,
  emptyTitle,
  emptyDescription,
  headerAction
}: PropsWithVariant) {
  const isRail = variant === "rail";
  const [messages, setMessages] = useState<Message[]>([]);
  const [value, setValue] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, streaming]);

  const summary = useMemo(() => {
    const metricSummary = `RMSE ${jobMetrics.accuracyRmse ?? "N/A"} | Area ${jobMetrics.areaSqM ?? "N/A"} sqm | Points ${jobMetrics.pointCount ?? "N/A"}`;
    return summaryLabel ? `${summaryLabel} | ${metricSummary}` : metricSummary;
  }, [jobMetrics, summaryLabel]);

  const sendMessage = async (content: string) => {
    const trimmed = content.trim();
    if (!trimmed || !jobId) {
      return;
    }

    const history = messages.filter((message) => message.role === "user" || message.role === "assistant");
    const nextMessages = [...history, { role: "user" as const, content: trimmed }];

    setError(null);
    setMessages([...nextMessages, { role: "assistant", content: "" }]);
    setStreaming(true);

    try {
      const token = await getToken();
      const response = await fetch(apiUrl(`/api/jobs/${jobId}/ai-chat`), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ message: trimmed, history })
      });

      if (!response.ok) {
        const payload = await response.json().catch(() => null) as { error?: string; message?: string } | null;
        throw new Error(payload?.error ?? payload?.message ?? "Unable to reach the AI chat service right now.");
      }

      if (!response.body) {
        throw new Error("The AI chat service returned an empty response.");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value: chunk } = await reader.read();
        if (done) {
          break;
        }
        buffer += decoder.decode(chunk, { stream: true });
        const packets = buffer.split("\n\n");
        buffer = packets.pop() ?? "";

        for (const packet of packets) {
          const line = packet.replace(/^data:\s*/, "");
          if (line === "[DONE]") {
            continue;
          }

          const parsed = JSON.parse(line) as { token?: string };
          if (parsed.token) {
            setMessages((current) => {
              const next = [...current];
              const last = next[next.length - 1];
              if (last && last.role === "assistant") {
                next[next.length - 1] = { ...last, content: `${last.content}${parsed.token}` };
              }
              return next;
            });
          }
        }
      }
    } catch (err) {
      setMessages(nextMessages);
      setError(err instanceof Error ? err.message : "Unable to reach the AI chat service right now.");
    } finally {
      setStreaming(false);
    }
  };

  if (!isRail) {
    return (
      <div className="card stack ai-chat-panel" data-tour="ai-chat">
        <div className="section-title">
          <div className="stack" style={{ gap: "0.2rem" }}>
            <strong>{heading ?? "AI Chat"}</strong>
            <span className="text-muted">
              {subheading ?? "Ask for next steps, explain risks, or translate technical QA into plain language."}
            </span>
          </div>
          <div className="row" style={{ gap: "0.5rem", justifyContent: "flex-end" }}>
            <button onClick={() => setMessages([])}>Clear conversation</button>
            {headerAction}
          </div>
        </div>
        {jobId ? <div className="inline-note">{summary}</div> : <div className="inline-note">Select or open a survey job to ask context-aware AI questions.</div>}
        {error ? <div className="inline-note inline-note-danger">{error}</div> : null}
        {messages.length === 0 ? (
          <div className="row">
            {starterPrompts.map((prompt) => (
              <button key={prompt} className="tab-button" onClick={() => void sendMessage(prompt)}>
                {prompt}
              </button>
            ))}
          </div>
        ) : null}
        <div className="chat-window" ref={scrollRef}>
          {messages.map((message, index) => (
            <div key={`${message.role}-${index}`} className={`bubble ${message.role}`}>
              {message.role === "assistant" ? (
                <>
                  <ReactMarkdown>{message.content}</ReactMarkdown>
                  <button onClick={() => void navigator.clipboard.writeText(message.content)}>Copy response</button>
                  {streaming && index === messages.length - 1 ? <span className="cursor" /> : null}
                </>
              ) : (
                message.content
              )}
            </div>
          ))}
        </div>
        <div className="row ai-chat-input-row">
          <input
            value={value}
            disabled={streaming || !jobId}
            onChange={(event) => setValue(event.target.value)}
            placeholder={jobId ? "Describe what to build or ask about this survey job..." : "Open a job to start asking GeoSurvey AI..."}
            style={{ flex: 1, padding: "0.75rem", borderRadius: 12 }}
          />
          <button
            disabled={streaming || !value.trim() || !jobId}
            onClick={() => {
              const content = value.trim();
              setValue("");
              void sendMessage(content);
            }}
          >
            Send
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-col rounded-[20px] border border-slate-200 bg-white shadow-[0_18px_44px_rgba(15,23,42,0.10)]" data-tour="ai-chat">
      <div className="flex items-start justify-between gap-3 border-b border-slate-200 px-4 py-4">
        <div className="space-y-1">
          <div className="inline-flex items-center rounded-full bg-emerald-500/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-emerald-700">
            AI Copilot
          </div>
          <strong className="block text-sm font-semibold tracking-[0.08em] text-slate-900">{heading ?? "CHAT"}</strong>
          <span className="block max-w-[18rem] text-sm leading-5 text-slate-500">
            {subheading ?? "Survey copilot for QA, blockers, and next steps."}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-50"
            onClick={() => setMessages([])}
          >
            Clear
          </button>
          {headerAction}
        </div>
      </div>

      <div className="border-b border-slate-200 bg-slate-50/70 px-4 py-3">
        <div className="rounded-2xl border border-slate-200 bg-white px-3 py-3 text-xs leading-5 text-slate-600">
          {jobId ? summary : "Select or open a survey job to ask context-aware AI questions."}
        </div>
        {error ? (
          <div className="mt-3 rounded-2xl border border-rose-200 bg-rose-50 px-3 py-3 text-xs leading-5 text-rose-700">
            {error}
          </div>
        ) : null}
      </div>

      <div ref={scrollRef} className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {messages.length === 0 ? (
          <div className="flex min-h-[18rem] flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-slate-50/70 px-5 py-8 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 text-sm font-semibold tracking-[0.18em] text-white">
              AI
            </div>
            <strong className="text-base font-semibold text-slate-900">{emptyTitle ?? "Build with GeoSurvey AI"}</strong>
            <span className="mt-2 max-w-[18rem] text-sm leading-6 text-slate-500">
              {emptyDescription ?? "Ask about job readiness, geometry quality, exports, or what to do next."}
            </span>
            <div className="mt-5 grid w-full gap-2">
              {starterPrompts.map((prompt) => (
                <button
                  key={prompt}
                  disabled={!jobId}
                  className="rounded-2xl border border-slate-200 bg-white px-3 py-3 text-left text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                  onClick={() => void sendMessage(prompt)}
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        {messages.map((message, index) => (
          <div
            key={`${message.role}-${index}`}
            className={
              message.role === "user"
                ? "ml-auto w-fit max-w-[92%] rounded-[22px] rounded-br-md bg-slate-900 px-4 py-3 text-sm leading-6 text-white shadow-sm"
                : "w-fit max-w-[92%] rounded-[22px] rounded-bl-md border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-700 shadow-sm"
            }
          >
            {message.role === "assistant" ? (
              <>
                <div className="prose prose-sm max-w-none prose-p:my-2 prose-headings:text-slate-900 prose-strong:text-slate-900 prose-li:my-1">
                  <ReactMarkdown>{message.content}</ReactMarkdown>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <button
                    className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-100"
                    onClick={() => void navigator.clipboard.writeText(message.content)}
                  >
                    Copy response
                  </button>
                  {streaming && index === messages.length - 1 ? <span className="cursor" /> : null}
                </div>
              </>
            ) : (
              message.content
            )}
          </div>
        ))}
      </div>

      <div className="border-t border-slate-200 bg-white px-4 py-4">
        <div className="flex items-end gap-3">
          <textarea
            rows={3}
            className="min-h-[84px] flex-1 resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-slate-300 focus:bg-white focus:ring-2 focus:ring-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-50"
            value={value}
            disabled={streaming || !jobId}
            onChange={(event) => setValue(event.target.value)}
            placeholder={jobId ? "Describe what to build or ask about this survey job..." : "Open a job to start asking GeoSurvey AI..."}
          />
          <button
            className="inline-flex h-12 items-center justify-center rounded-2xl bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-300"
            disabled={streaming || !value.trim() || !jobId}
            onClick={() => {
              const content = value.trim();
              setValue("");
              void sendMessage(content);
            }}
          >
            {streaming ? "Sending..." : "Send"}
          </button>
        </div>
      </div>
    </div>
  );
}
