import type { ProgressCardData } from "../../../features/ai-command/types";

type Props = {
  progress: ProgressCardData;
};

export function ProgressCardBlock({ progress }: Props) {
  return (
    <div className="ai-panel-card ai-panel-card-soft">
      <div className="flex items-center justify-between gap-3">
        <strong className="text-sm font-semibold text-slate-900">{progress.jobName}</strong>
        <span className="ai-panel-badge">{progress.status}</span>
      </div>
      <span className="mt-2 block text-sm leading-6 text-slate-600">{progress.message}</span>
    </div>
  );
}
