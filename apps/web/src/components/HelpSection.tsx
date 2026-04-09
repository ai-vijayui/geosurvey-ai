import type { ReactNode } from "react";

type Props = {
  id: string;
  title: string;
  eyebrow?: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
};

export function HelpSection({ id, title, eyebrow, description, action, children }: Props) {
  return (
    <section id={id} className="help-section reference-card space-y-5">
      <div className="help-section__header">
        <div className="help-section__copy">
          {eyebrow ? <span className="reference-chip">{eyebrow}</span> : null}
          <div className="space-y-2">
            <h2>{title}</h2>
            {description ? <p className="help-section__description">{description}</p> : null}
          </div>
        </div>
        {action ? <div className="help-section__action">{action}</div> : null}
      </div>
      {children}
    </section>
  );
}
