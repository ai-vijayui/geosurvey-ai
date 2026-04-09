import type { ReactNode } from "react";
import { cn } from "./cn";

type StatCardProps = {
  label: string;
  value: ReactNode;
  meta?: ReactNode;
  className?: string;
};

export function StatCard({ label, value, meta, className }: StatCardProps) {
  return (
    <div className={cn("ui-stat-card", className)}>
      <span className="ui-stat-card__label">{label}</span>
      <strong className="ui-stat-card__value">{value}</strong>
      {meta ? <span className="ui-stat-card__meta">{meta}</span> : null}
    </div>
  );
}
