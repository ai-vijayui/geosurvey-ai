import type { PropsWithChildren, ReactNode } from "react";
import { cn } from "./cn";

type FilterBarProps = PropsWithChildren<{
  footer?: ReactNode;
  className?: string;
}>;

export function FilterBar({ children, footer, className }: FilterBarProps) {
  return (
    <div className={cn("ui-filter-bar", className)}>
      <div className="ui-filter-bar__grid">{children}</div>
      {footer ? <div className="ui-filter-bar__footer">{footer}</div> : null}
    </div>
  );
}
