import type { JobCardData } from "../../../features/ai-command/types";

type Props = {
  job: JobCardData;
};

function formatLabel(value: string) {
  return value.replaceAll("_", " ");
}

export function JobCardBlock({ job }: Props) {
  return (
    <div className="ai-panel-card">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <strong className="block text-sm font-semibold text-slate-900">{job.name}</strong>
          <span className="block text-sm text-slate-500">{job.projectName || "Project context not loaded"}</span>
        </div>
        <span className="ai-panel-badge">{job.status}</span>
      </div>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <div className="ai-panel-subcard">
          <span className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Type</span>
          <strong className="mt-1 block text-sm text-slate-900">{formatLabel(job.type)}</strong>
        </div>
        <div className="ai-panel-subcard">
          <span className="block text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-500">Insights</span>
          <strong className="mt-1 block text-sm text-slate-900">{job.insightCount ?? 0}</strong>
        </div>
      </div>
    </div>
  );
}
