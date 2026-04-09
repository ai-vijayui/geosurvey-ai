import { useEffect, useRef, useState } from "react";
import { useNotifications } from "../context/NotificationContext";
import { apiUrl } from "../lib/api";

type Props = { jobId: string; onComplete: () => void };

type ProgressState = {
  stage: string;
  progress: number;
  message: string;
  logs: string[];
  status: "idle" | "streaming" | "complete" | "failed";
  startTime: number | null;
  updatedAt: number;
  error?: string;
};

const STEPS = [
  { label: "Validate", minProgress: 0, maxProgress: 14 },
  { label: "Parse", minProgress: 15, maxProgress: 34 },
  { label: "Generate geometry", minProgress: 35, maxProgress: 54 },
  { label: "Compute metrics", minProgress: 55, maxProgress: 76 },
  { label: "Create outputs", minProgress: 77, maxProgress: 92 },
  { label: "Run AI", minProgress: 93, maxProgress: 100 }
];

function formatLabel(value: string | null | undefined) {
  if (!value) {
    return "Pending";
  }

  return value
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatLogLabel(value: string | null | undefined) {
  if (!value) {
    return "System";
  }

  return formatLabel(value);
}

function getStepState(index: number, progress: number, status: ProgressState["status"]) {
  const step = STEPS[index];
  if (status === "failed" && progress >= step.minProgress) {
    return "failed";
  }
  if (progress > step.maxProgress || (status === "complete" && progress >= step.minProgress)) {
    return "complete";
  }
  if (progress >= step.minProgress && progress <= step.maxProgress) {
    return "active";
  }
  return "pending";
}

function formatElapsed(startTime: number | null, updatedAt: number) {
  if (!startTime) {
    return "00:00";
  }
  const totalSeconds = Math.max(0, Math.floor((updatedAt - startTime) / 1000));
  return `${String(Math.floor(totalSeconds / 60)).padStart(2, "0")}:${String(totalSeconds % 60).padStart(2, "0")}`;
}

function trackerStatusClasses(status: ProgressState["status"]) {
  if (status === "failed") {
    return "inline-flex items-center rounded-full border border-rose-200 bg-rose-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-rose-700";
  }

  if (status === "complete") {
    return "inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-700";
  }

  if (status === "streaming") {
    return "inline-flex items-center rounded-full border border-sky-200 bg-sky-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-sky-700";
  }

  return "inline-flex items-center rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-600";
}

function stepMarkerClasses(status: string) {
  if (status === "complete") {
    return "flex h-11 w-11 items-center justify-center rounded-full border border-emerald-600 bg-emerald-600 text-[11px] font-semibold uppercase tracking-[0.12em] text-white";
  }

  if (status === "active") {
    return "flex h-11 w-11 items-center justify-center rounded-full border border-emerald-300 bg-emerald-50 text-[11px] font-semibold uppercase tracking-[0.12em] text-emerald-700";
  }

  if (status === "failed") {
    return "flex h-11 w-11 items-center justify-center rounded-full border border-rose-200 bg-rose-50 text-[11px] font-semibold uppercase tracking-[0.12em] text-rose-700";
  }

  return "flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-slate-100 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-500";
}

function stepCardClasses(status: string) {
  if (status === "complete") {
    return "grid grid-cols-[44px_minmax(0,1fr)] gap-3 rounded-2xl border border-emerald-200 bg-emerald-50/80 p-3";
  }

  if (status === "active") {
    return "grid grid-cols-[44px_minmax(0,1fr)] gap-3 rounded-2xl border border-emerald-300 bg-white p-3 shadow-sm";
  }

  if (status === "failed") {
    return "grid grid-cols-[44px_minmax(0,1fr)] gap-3 rounded-2xl border border-rose-200 bg-rose-50/80 p-3";
  }

  return "grid grid-cols-[44px_minmax(0,1fr)] gap-3 rounded-2xl border border-slate-200 bg-slate-50/80 p-3";
}

export function ProgressTracker({ jobId, onComplete }: Props) {
  const { addNotification } = useNotifications();
  const [state, setState] = useState<ProgressState>({
    stage: "",
    progress: 0,
    message: "",
    logs: [],
    status: "idle",
    startTime: null,
    updatedAt: Date.now()
  });
  const [retrySeed, setRetrySeed] = useState(0);
  const retries = useRef(0);
  const logRef = useRef<HTMLPreElement | null>(null);

  useEffect(() => {
    const ticker = window.setInterval(() => {
      setState((current) => (current.startTime ? { ...current, updatedAt: Date.now() } : current));
    }, 1000);
    return () => window.clearInterval(ticker);
  }, []);

  useEffect(() => {
    let eventSource: EventSource | null = null;
    let cancelled = false;
    let retryTimer: number | undefined;

    const connect = () => {
      eventSource = new EventSource(apiUrl(`/api/jobs/${jobId}/stream`));
      eventSource.onmessage = (event) => {
        if (event.data === "[DONE]") {
          return;
        }

        const data = JSON.parse(event.data) as {
          type: "PROGRESS" | "COMPLETE" | "FAILED" | "HEARTBEAT";
          stage?: string;
          progress?: number;
          message?: string;
          error?: string;
        };

        if (data.type === "HEARTBEAT") {
          return;
        }

        setState((current) => {
          const now = Date.now();
          const logLine = `${new Date(now).toLocaleTimeString()} ${formatLogLabel(data.stage ?? data.type)}: ${data.message ?? data.error ?? ""}`.trim();
          return {
            stage: data.stage ?? current.stage,
            progress: data.progress ?? current.progress,
            message: data.message ?? current.message,
            logs: [...current.logs, logLine].slice(-25),
            status: data.type === "COMPLETE" ? "complete" : data.type === "FAILED" ? "failed" : "streaming",
            startTime: current.startTime ?? now,
            updatedAt: now,
            error: data.error
          };
        });

        if (data.type === "COMPLETE") {
          addNotification({
            title: "Job completed",
            message: "Processing finished successfully and outputs are ready for review.",
            tone: "success",
            href: `/jobs/${jobId}`,
            source: "processing"
          });
          window.setTimeout(onComplete, 1000);
          eventSource?.close();
        } else if (data.type === "FAILED") {
          addNotification({
            title: "Job failed",
            message: data.error ?? "Processing failed and needs attention.",
            tone: "error",
            href: `/jobs/${jobId}`,
            source: "processing"
          });
        }
      };

      eventSource.onerror = () => {
        eventSource?.close();
        if (!cancelled && retries.current < 5) {
          const delay = 2 ** retries.current * 500;
          retries.current += 1;
          retryTimer = window.setTimeout(connect, delay);
        } else if (!cancelled) {
          setState((current) => ({ ...current, status: "failed", updatedAt: Date.now(), error: "Unable to reconnect to the processing stream." }));
        }
      };
    };

    connect();
    return () => {
      cancelled = true;
      eventSource?.close();
      if (retryTimer) {
        window.clearTimeout(retryTimer);
      }
    };
  }, [jobId, onComplete, retrySeed]);

  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [state.logs]);

  const elapsed = formatElapsed(state.startTime, state.updatedAt);
  const nextStep = STEPS.find((step) => state.progress < step.minProgress)?.label ?? (state.status === "complete" ? "Review results" : "Finishing current stage");

  return (
    <section className="space-y-5 rounded-[22px] border border-slate-200 bg-white p-5 shadow-sm" data-tour="progress-tracker">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="space-y-1">
          <strong className="block text-base font-semibold text-slate-900">Processing panel</strong>
          <span className="block text-sm leading-6 text-slate-500">Live survey processing events streamed from the backend worker.</span>
        </div>
        <div className="space-y-1 md:text-right">
          <strong className="block text-3xl font-semibold tracking-tight text-slate-900">{state.progress}%</strong>
          <span className="block text-sm leading-6 text-slate-500">Elapsed {elapsed}</span>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
          <span className="block text-xs font-medium uppercase tracking-[0.14em] text-slate-500">Current step</span>
          <strong className="mt-2 block text-base font-semibold text-slate-900">{formatLabel(state.stage || "Queued")}</strong>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
          <span className="block text-xs font-medium uppercase tracking-[0.14em] text-slate-500">Next up</span>
          <strong className="mt-2 block text-base font-semibold text-slate-900">{nextStep}</strong>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
          <span className="block text-xs font-medium uppercase tracking-[0.14em] text-slate-500">Status</span>
          <span className={`mt-3 ${trackerStatusClasses(state.status)}`}>{formatLabel(state.status)}</span>
        </div>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-slate-100">
        <span className="block h-full rounded-full bg-emerald-600 transition-[width] duration-300" style={{ width: `${state.progress}%` }} />
      </div>
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(18rem,0.85fr)]">
        <div className="space-y-3">
          {STEPS.map((step, index) => {
            const status = getStepState(index, state.progress, state.status);
            return (
              <div key={step.label} className={stepCardClasses(status)}>
                <div className={stepMarkerClasses(status)}>
                  {status === "complete" ? "OK" : status === "active" ? "..." : status === "failed" ? "X" : `${index + 1}`}
                </div>
                <div className="min-w-0 space-y-1">
                  <strong className="block text-sm font-semibold text-slate-900">{step.label}</strong>
                  <span className="block text-sm leading-6 text-slate-500">
                    {status === "active" ? state.message || "In progress" : status === "complete" ? "Complete" : status === "failed" ? state.error || "Processing stopped" : "Pending"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
        <aside className="space-y-4 rounded-3xl border border-slate-200 bg-slate-50/80 p-5">
          <div className="flex items-start justify-between gap-3">
            <strong className="text-base font-semibold text-slate-900">Current stage</strong>
            <span className={trackerStatusClasses(state.status)}>{formatLabel(state.status)}</span>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4 text-sm leading-6 text-slate-700">
            {state.message || "Waiting for processing events..."}
          </div>
          <div className="text-sm leading-6 text-slate-500">Worker stage: {formatLabel(state.stage)}</div>
          {state.error ? (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm leading-6 text-rose-700">{state.error}</div>
          ) : null}
          {state.status === "failed" ? (
            <button className="button-secondary" onClick={() => { retries.current = 0; setRetrySeed((value) => value + 1); }}>Retry stream</button>
          ) : null}
          <div className="space-y-2">
            <strong className="block text-sm font-semibold uppercase tracking-[0.14em] text-slate-600">Recent logs</strong>
            <pre ref={logRef} className="max-h-[220px] overflow-auto rounded-2xl bg-slate-950 px-4 py-4 text-xs leading-6 text-slate-100">
              {state.logs.join("\n") || "No logs yet"}
            </pre>
          </div>
        </aside>
      </div>
    </section>
  );
}
