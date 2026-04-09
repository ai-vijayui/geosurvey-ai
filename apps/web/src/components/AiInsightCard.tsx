import type { AiInsight } from "@geosurvey-ai/shared";

import { StatusBadge } from "./ui/StatusBadge";

type Props = { insight: AiInsight };

export function AiInsightCard({ insight }: Props) {
  const severityTone = {
    info: "info",
    warning: "warning",
    error: "error",
    success: "success"
  }[insight.severity.toLowerCase() as "info" | "warning" | "error" | "success"] as "info" | "warning" | "error" | "success";

  return (
    <div className="ui-insight-card">
      <div className="ui-insight-card__header">
        <StatusBadge label={insight.severity} tone={severityTone} />
        <span className="ui-insight-card__confidence">{Math.round(insight.confidence * 100)}% confidence</span>
      </div>
      <div className="ui-insight-card__copy">
        <strong>{insight.category}</strong>
        <div>{insight.message}</div>
      </div>
      <div className="ui-insight-card__meter">
        <span className="ui-insight-card__meter-fill" style={{ width: `${insight.confidence * 100}%` }} />
      </div>
      <div className="ui-insight-card__recommendation">
        <span>Recommendation</span>
        <strong>{String(insight.metadata?.recommendation ?? "Review the job workspace and confirm the next action.")}</strong>
      </div>
    </div>
  );
}
