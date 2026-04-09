import type { AiInsight } from "@geosurvey-ai/shared";

type Props = { insight: AiInsight };

export function AiInsightCard({ insight }: Props) {
  const severityClasses = {
    info: "bg-slate-100 text-slate-700 border-slate-200",
    warning: "bg-amber-50 text-amber-700 border-amber-200",
    error: "bg-rose-50 text-rose-700 border-rose-200",
    success: "bg-emerald-50 text-emerald-700 border-emerald-200"
  }[insight.severity.toLowerCase() as "info" | "warning" | "error" | "success"];

  return (
    <div className="space-y-4 rounded-[22px] border border-[#e9e1d9] bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <span className={`inline-flex rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] ${severityClasses}`}>
          {insight.severity}
        </span>
        <span className="text-xs text-slate-500">{Math.round(insight.confidence * 100)}% confidence</span>
      </div>
      <div className="space-y-1.5">
        <strong className="block text-sm font-semibold text-slate-900">{insight.category}</strong>
        <div className="text-sm leading-6 text-slate-600">{insight.message}</div>
      </div>
      <div className="h-2 rounded-full bg-[#f4eee8]">
        <span className="block h-2 rounded-full bg-[#f45b55]" style={{ width: `${insight.confidence * 100}%` }} />
      </div>
      <div className="rounded-2xl border border-[#efe6dd] bg-[#faf6f2] px-4 py-3">
        <span className="block text-xs uppercase tracking-[0.14em] text-slate-500">Recommendation</span>
        <strong className="mt-1 block text-sm font-semibold leading-6 text-slate-800">{String(insight.metadata?.recommendation ?? "Review the job workspace and confirm the next action.")}</strong>
      </div>
    </div>
  );
}
