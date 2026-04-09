import type { ReactNode } from "react";

type Props = {
  id: string;
  title: string;
  summary: string;
  action?: ReactNode;
  children: ReactNode;
  advancedDetails?: ReactNode;
  onCopyLink?: () => void;
};

export function HelpSection({ id, title, summary, action, children, advancedDetails, onCopyLink }: Props) {
  return (
    <section id={id} className="help-section reference-card space-y-5">
      <div className="help-section__header">
        <div className="help-section__copy">
          <span className="reference-chip">Help & Learning</span>
          <div className="space-y-2">
            <h2>{title}</h2>
            <p className="help-section__description">{summary}</p>
          </div>
        </div>
        <div className="help-section__actions">
          {action}
          {onCopyLink ? <button className="button-ghost" onClick={onCopyLink}>Copy link</button> : null}
        </div>
      </div>
      {children}
      {advancedDetails ? (
        <details className="help-advanced">
          <summary>Advanced details</summary>
          <div className="help-advanced__body">{advancedDetails}</div>
        </details>
      ) : null}
    </section>
  );
}
