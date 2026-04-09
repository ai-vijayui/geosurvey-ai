import type { PropsWithChildren, ReactNode } from "react";
import { cn } from "./cn";

type PageHeaderProps = PropsWithChildren<{
  title: string;
  subtitle?: string;
  eyebrow?: string;
  actions?: ReactNode;
  className?: string;
}>;

export function PageHeader({ title, subtitle, eyebrow, actions, className, children }: PageHeaderProps) {
  return (
    <header className={cn("ui-page-header", className)}>
      <div className="ui-page-header__content">
        {eyebrow ? <span className="ui-page-header__eyebrow">{eyebrow}</span> : null}
        <div className="ui-page-header__copy">
          <h1>{title}</h1>
          {subtitle ? <p>{subtitle}</p> : null}
        </div>
        {children}
      </div>
      {actions ? <div className="ui-page-header__actions">{actions}</div> : null}
    </header>
  );
}
