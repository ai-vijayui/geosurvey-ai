import { cn } from "./cn";

type StatusTone = "default" | "success" | "warning" | "error" | "info";

type StatusBadgeProps = {
  label: string;
  tone?: StatusTone;
  className?: string;
};

export function StatusBadge({ label, tone = "default", className }: StatusBadgeProps) {
  return <span className={cn("ui-status-badge", `ui-status-badge--${tone}`, className)}>{label}</span>;
}
