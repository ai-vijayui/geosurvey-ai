import type { ProgressCardData } from "../../../features/ai-command/types";

type Props = {
  progress: ProgressCardData;
};

export function ProgressCardBlock({ progress }: Props) {
  return (
    <div className="ai-panel-card ai-panel-card-soft">
      <div className="flex items-center justify-between gap-3">
        <strong className="text-sm font-semibold text-[var(--text-primary)]">{progress.jobName}</strong>
        <span className="ai-panel-badge">{progress.status}</span>
      </div>
      <span className="mt-2 block text-sm leading-6 text-[var(--text-secondary)]">{progress.message}</span>
    </div>
  );
}
