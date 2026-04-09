import type { ReactNode } from "react";

type EmptyStateProps = {
  eyebrow?: string;
  title: string;
  description: string;
  action?: ReactNode;
  compact?: boolean;
};

export function EmptyState({ eyebrow, title, description, action, compact = false }: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center justify-center rounded-[28px] border border-dashed border-[#eadfd5] bg-[#faf7f3] px-6 text-center ${compact ? "min-h-[12rem] py-6" : "min-h-[18rem] py-10"}`}>
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[#ff746c] to-[#f0453f] text-sm font-semibold tracking-[0.18em] text-white shadow-[0_14px_30px_rgba(240,69,63,0.22)]" aria-hidden="true">
        GS
      </div>
      {eyebrow ? <span className="mb-2 inline-flex rounded-full bg-[#f45b5514] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#f45b55]">{eyebrow}</span> : null}
      <strong className="text-lg font-semibold text-slate-900">{title}</strong>
      <span className="mt-2 max-w-[32rem] text-sm leading-6 text-slate-500">{description}</span>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
