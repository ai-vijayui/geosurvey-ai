import type { PropsWithChildren } from "react";
import { cn } from "./cn";

type SidebarSectionProps = PropsWithChildren<{
  title?: string;
  className?: string;
}>;

export function SidebarSection({ title, className, children }: SidebarSectionProps) {
  return (
    <section className={cn("ui-sidebar-section", className)}>
      {title ? <span className="ui-sidebar-section__label">{title}</span> : null}
      {children}
    </section>
  );
}
