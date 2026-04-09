import type { ReactNode } from "react";
import { AppIcon, type AppIconName } from "../ui/AppIcon";

type EmptyStateProps = {
  eyebrow?: string;
  title: string;
  description: string;
  action?: ReactNode;
  compact?: boolean;
  icon?: AppIconName;
};

export function EmptyState({ eyebrow, title, description, action, compact = false, icon = "spark" }: EmptyStateProps) {
  return (
    <div className={`ui-empty-state ${compact ? "ui-empty-state--compact" : ""}`}>
      <div className="ui-empty-state__icon" aria-hidden="true">
        <AppIcon name={icon} className="h-6 w-6" />
      </div>
      {eyebrow ? <span className="ui-empty-state__eyebrow">{eyebrow}</span> : null}
      <strong className="ui-empty-state__title">{title}</strong>
      <span className="ui-empty-state__description">{description}</span>
      {action ? <div className="ui-empty-state__action">{action}</div> : null}
    </div>
  );
}
