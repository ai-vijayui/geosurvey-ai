import type { PropsWithChildren, ReactNode } from "react";
import { Reveal } from "../../components/animation/Reveal";
import { SectionFlowLinks } from "./SectionFlowLinks";

type SectionContainerProps = PropsWithChildren<{
  eyebrow?: string;
  title?: string;
  description?: string;
  align?: "left" | "center";
  actions?: ReactNode;
  className?: string;
  showFlowLinks?: boolean;
}>;

export function SectionContainer({
  eyebrow,
  title,
  description,
  align = "left",
  actions,
  className,
  showFlowLinks = true,
  children
}: SectionContainerProps) {
  return (
    <section className={`marketing-section ${className ?? ""}`.trim()}>
      <div className="marketing-shell">
        {eyebrow || title || description || actions ? (
          <Reveal className={`marketing-section__header marketing-section__header--${align}`}>
            <div className="marketing-section__copy">
              {eyebrow ? <span className="marketing-eyebrow">{eyebrow}</span> : null}
              {title ? <h2>{title}</h2> : null}
              {description ? <p>{description}</p> : null}
            </div>
            {actions ? <div className="marketing-section__actions">{actions}</div> : null}
          </Reveal>
        ) : null}
        {children}
        {showFlowLinks ? <SectionFlowLinks /> : null}
      </div>
    </section>
  );
}
