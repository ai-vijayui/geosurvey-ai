import type { ReactNode } from "react";

type RightRailPanelProps = {
  title: string;
  children: ReactNode;
};

export function RightRailPanel({ title, children }: RightRailPanelProps) {
  return (
    <section className="reference-card reference-card--soft space-y-3">
      <div className="mb-3 flex items-center justify-between gap-3">
        <strong className="text-sm font-semibold text-slate-900">{title}</strong>
      </div>
      <div className="space-y-3 text-sm text-slate-600">{children}</div>
    </section>
  );
}
