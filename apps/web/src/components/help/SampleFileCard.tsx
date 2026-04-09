import { Link } from "react-router-dom";
import type { SampleLink } from "./helpContent";

type Props = {
  title: string;
  surveyType: string;
  description: string;
  requiredFiles: string[];
  optionalFiles: string[];
  supportedFormats: string[];
  sampleLinks: SampleLink[];
  steps: string[];
  demoQuery: string;
  advancedDetails?: string[];
};

export function SampleFileCard({
  title,
  surveyType,
  description,
  requiredFiles,
  optionalFiles,
  supportedFormats,
  sampleLinks,
  steps,
  demoQuery,
  advancedDetails = []
}: Props) {
  return (
    <article className="sample-file-card">
      <div className="sample-file-card__header">
        <div className="space-y-2">
          <span className="use-case-card__tag">{surveyType}</span>
          <strong>{title}</strong>
          <p>{description}</p>
        </div>
      </div>

      <div className="sample-file-card__grid">
        <div className="sample-file-card__list">
          <span className="sample-file-card__label">Required files</span>
          {requiredFiles.map((item) => <span key={item}>{item}</span>)}
        </div>
        <div className="sample-file-card__list">
          <span className="sample-file-card__label">Optional files</span>
          {optionalFiles.map((item) => <span key={item}>{item}</span>)}
        </div>
        <div className="sample-file-card__list">
          <span className="sample-file-card__label">Supported formats</span>
          {supportedFormats.map((item) => <span key={item}>{item}</span>)}
        </div>
      </div>

      <div className="sample-file-card__downloads">
        {sampleLinks.map((link) => (
          <a key={link.href} className="button-secondary" href={link.href} download>
            {link.label}
          </a>
        ))}
      </div>

      <details className="help-advanced" open>
        <summary>How to use</summary>
        <div className="help-advanced__body">
          <ol className="sample-file-card__steps">
            {steps.map((step) => <li key={step}>{step}</li>)}
          </ol>
        </div>
      </details>

      {advancedDetails.length > 0 ? (
        <details className="help-advanced">
          <summary>Advanced details</summary>
          <div className="help-advanced__body">
            <ul className="sample-file-card__steps">
              {advancedDetails.map((item) => <li key={item}>{item}</li>)}
            </ul>
          </div>
        </details>
      ) : null}

      <div className="sample-file-card__footer">
        <Link className="button-primary" to={demoQuery}>Start demo project</Link>
      </div>
    </article>
  );
}
