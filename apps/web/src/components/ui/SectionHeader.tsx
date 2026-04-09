import type { ReactNode } from "react";
import { cn } from "./cn";

type SectionHeaderProps = {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  className?: string;
};

export function SectionHeader({ title, subtitle, action, className }: SectionHeaderProps) {
  return (
    <div className={cn("ui-section-header", className)}>
      <div className="ui-section-header__copy">
        <strong>{title}</strong>
        {subtitle ? <span>{subtitle}</span> : null}
      </div>
      {action ? <div className="ui-section-header__action">{action}</div> : null}
    </div>
  );
}
