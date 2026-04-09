import type { SurveyJob } from "@geosurvey-ai/shared";
import { JobVisualSummary } from "../JobVisualSummary";

type Props = {
  jobAware: boolean;
  job?: Partial<SurveyJob> | null;
  helperText: string;
};

function formatValue(value: string | number | null | undefined, suffix = "") {
  if (value === null || value === undefined || value === "") {
    return "N/A";
  }
  return `${value}${suffix}`;
}

export function AiContextCard({ jobAware, job, helperText }: Props) {
  if (!jobAware) {
    return (
      <div className="ai-context-card">
        <span className="eyebrow">Context</span>
        <strong>GeoSurvey workspace</strong>
        <span className="text-muted">{helperText}</span>
      </div>
    );
  }

  return (
    <div className="ai-context-card">
      <div className="stack" style={{ gap: "0.25rem" }}>
        <span className="eyebrow">Context</span>
        <strong>{job?.name ?? "Current survey job"}</strong>
        <span className="text-muted">{helperText}</span>
      </div>
      <div className="ai-context-grid">
        <div className="ai-context-chip">
          <span className="text-muted">Status</span>
          <strong>{formatValue(job?.status)}</strong>
        </div>
        <div className="ai-context-chip">
          <span className="text-muted">Type</span>
          <strong>{formatValue(job?.type)}</strong>
        </div>
        <div className="ai-context-chip">
          <span className="text-muted">RMSE</span>
          <strong>{formatValue(job?.accuracyRmse, " m")}</strong>
        </div>
        <div className="ai-context-chip">
          <span className="text-muted">Area</span>
          <strong>{formatValue(job?.areaSqM, " sqm")}</strong>
        </div>
        <div className="ai-context-chip">
          <span className="text-muted">Points</span>
          <strong>{formatValue(job?.pointCount)}</strong>
        </div>
      </div>
      <JobVisualSummary job={job} compact />
    </div>
  );
}
