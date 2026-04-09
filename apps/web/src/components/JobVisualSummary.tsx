import type { SurveyJob } from "@geosurvey-ai/shared";
import { MapView } from "./MapView";

type Props = {
  job: Partial<SurveyJob> | null | undefined;
  compact?: boolean;
};

type SummaryMetric = {
  label: string;
  value: string;
  ratio: number;
};

function clampRatio(value: number) {
  return Math.max(0.08, Math.min(1, value));
}

function formatCount(value: number | null | undefined) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "N/A";
  }
  return value.toLocaleString();
}

function formatArea(value: number | null | undefined) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "N/A";
  }
  if (value >= 10000) {
    return `${(value / 10000).toFixed(2)} ha`;
  }
  return `${Math.round(value)} sqm`;
}

function formatRmse(value: number | null | undefined) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "N/A";
  }
  return `${value.toFixed(2)} m`;
}

function getInsightsBySeverity(job: Partial<SurveyJob> | null | undefined) {
  const insights = job?.aiInsights ?? [];
  return {
    total: insights.length,
    errors: insights.filter((insight) => insight.severity === "ERROR").length,
    warnings: insights.filter((insight) => insight.severity === "WARNING").length,
    success: insights.filter((insight) => insight.severity === "SUCCESS").length
  };
}

function buildMapGeojson(job: Partial<SurveyJob> | null | undefined) {
  const features = [...((job?.boundaryGeojson?.features ?? []) as unknown as Array<Record<string, unknown>>)];

  if (typeof job?.markerLat === "number" && typeof job?.markerLng === "number") {
    features.push({
      type: "Feature",
      properties: { name: "Survey marker" },
      geometry: { type: "Point", coordinates: [job.markerLng, job.markerLat, 0] }
    });
  } else if (typeof job?.centroidLat === "number" && typeof job?.centroidLng === "number") {
    features.push({
      type: "Feature",
      properties: { name: "Survey centroid" },
      geometry: { type: "Point", coordinates: [job.centroidLng, job.centroidLat, 0] }
    });
  }

  return features.length > 0 ? { type: "FeatureCollection" as const, features } : undefined;
}

export function JobVisualSummary({ job, compact = false }: Props) {
  const fileCount = job?.inputFiles?.length ?? 0;
  const outputCount = job?.outputs?.length ?? 0;
  const insights = getInsightsBySeverity(job);
  const mapGeojson = buildMapGeojson(job);
  const metrics: SummaryMetric[] = [
    {
      label: "Coverage",
      value: formatArea(job?.areaSqM),
      ratio: clampRatio(Math.min((job?.areaSqM ?? 0) / 120000, 1))
    },
    {
      label: "Point density",
      value: formatCount(job?.pointCount),
      ratio: clampRatio(Math.min((job?.pointCount ?? 0) / 20000, 1))
    },
    {
      label: "Accuracy",
      value: formatRmse(job?.accuracyRmse),
      ratio: clampRatio(1 - Math.min((job?.accuracyRmse ?? 0) / 10, 1))
    },
    {
      label: "Outputs ready",
      value: `${outputCount}`,
      ratio: clampRatio(Math.min(outputCount / 6, 1))
    }
  ];

  return (
    <div className={`job-visual-summary${compact ? " job-visual-summary-compact" : ""}`}>
      <div className="job-visual-summary__stats">
        <div className="job-visual-summary__overview">
          <div className="job-visual-summary__pill-row">
            <span className="job-visual-summary__pill">{job?.status ?? "No status"}</span>
            <span className="job-visual-summary__pill job-visual-summary__pill-soft">{job?.type?.replaceAll("_", " ") ?? "Survey job"}</span>
          </div>
          <div className="job-visual-summary__chips">
            <div className="job-visual-summary__chip">
              <span>Inputs</span>
              <strong>{fileCount}</strong>
            </div>
            <div className="job-visual-summary__chip">
              <span>Outputs</span>
              <strong>{outputCount}</strong>
            </div>
            <div className="job-visual-summary__chip">
              <span>Insights</span>
              <strong>{insights.total}</strong>
            </div>
          </div>
        </div>

        <div className="job-visual-summary__graph">
          {metrics.map((metric) => (
            <div key={metric.label} className="job-visual-summary__metric-row">
              <div className="job-visual-summary__metric-copy">
                <span>{metric.label}</span>
                <strong>{metric.value}</strong>
              </div>
              <div className="job-visual-summary__track">
                <span className="job-visual-summary__bar" style={{ width: `${metric.ratio * 100}%` }} />
              </div>
            </div>
          ))}
        </div>

        <div className="job-visual-summary__insights">
          <div className="job-visual-summary__severity">
            <span>Critical</span>
            <strong>{insights.errors}</strong>
          </div>
          <div className="job-visual-summary__severity">
            <span>Warnings</span>
            <strong>{insights.warnings}</strong>
          </div>
          <div className="job-visual-summary__severity">
            <span>Confirmed</span>
            <strong>{insights.success}</strong>
          </div>
        </div>
      </div>

      <div className="job-visual-summary__map">
        {mapGeojson ? (
          <MapView geojson={mapGeojson as never} height={compact ? "180px" : "220px"} autoFit fitSignal={`${job?.id ?? "job"}-${mapGeojson.features.length}`} />
        ) : (
          <div className="job-visual-summary__map-empty">
            <strong>Map preview unavailable</strong>
            <span>Add a boundary or marker to see a spatial summary here.</span>
          </div>
        )}
      </div>
    </div>
  );
}
