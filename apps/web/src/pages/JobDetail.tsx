import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Feature, FeatureCollection, Polygon } from "geojson";
import type { GnssPoint, SurveyJob } from "@geosurvey-ai/shared";
import { useParams } from "react-router-dom";
import { AiChatPanel } from "../components/AiChatPanel";
import { AiInsightCard } from "../components/AiInsightCard";
import { FileUploadZone } from "../components/FileUploadZone";
import { GnssImportPanel } from "../components/GnssImportPanel";
import { MapView } from "../components/MapView";
import { ProgressTracker } from "../components/ProgressTracker";
import { apiGet, apiPost } from "../lib/api";

type JobDetailRecord = SurveyJob & { gnssPoints: GnssPoint[] };
type ProjectRecord = { id: string; name: string };

type PointFeature = Feature & { geometry: { type: "Point"; coordinates: [number, number, number?] } };

type TabKey = "Overview" | "GNSS Data" | "Files" | "Processing" | "AI Insights" | "Outputs";

const tabs: TabKey[] = ["Overview", "GNSS Data", "Files", "Processing", "AI Insights", "Outputs"];

function formatDate(value: string) {
  return new Date(value).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function makeCoverageGeojson(pointsGeojson?: FeatureCollection): FeatureCollection | undefined {
  if (!pointsGeojson || pointsGeojson.features.length === 0) {
    return pointsGeojson;
  }

  const pointFeatures = pointsGeojson.features.filter(
    (feature): feature is PointFeature => feature.geometry.type === "Point"
  );
  if (pointFeatures.length === 0) {
    return pointsGeojson;
  }

  const coordinates = pointFeatures.map((feature) => feature.geometry.coordinates);
  const lngs = coordinates.map((coordinate) => coordinate[0]);
  const lats = coordinates.map((coordinate) => coordinate[1]);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);

  const polygon: Feature<Polygon> = {
    type: "Feature",
    geometry: {
      type: "Polygon",
      coordinates: [[
        [minLng, minLat],
        [maxLng, minLat],
        [maxLng, maxLat],
        [minLng, maxLat],
        [minLng, minLat]
      ]]
    },
    properties: { name: "Survey extent" }
  };

  return {
    type: "FeatureCollection",
    features: [polygon, ...pointFeatures]
  };
}

export function JobDetail() {
  const { id = "" } = useParams();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<TabKey>("Overview");
  const [fitSignal, setFitSignal] = useState(0);

  const jobQuery = useQuery({
    queryKey: ["job", id],
    queryFn: () => apiGet<JobDetailRecord>(`/api/jobs/${id}`),
    enabled: Boolean(id)
  });
  const projectsQuery = useQuery({
    queryKey: ["projects", "list"],
    queryFn: () => apiGet<ProjectRecord[]>("/api/projects")
  });
  const gnssQuery = useQuery({
    queryKey: ["gnss-points", id],
    queryFn: () => apiGet<FeatureCollection>(`/api/gnss/${id}/points`),
    enabled: Boolean(id)
  });

  const startProcessing = useMutation({
    mutationFn: () => apiPost<{ queued: boolean }>(`/api/jobs/${id}/process`, {}),
    onSuccess: () => {
      setActiveTab("Processing");
      void queryClient.invalidateQueries({ queryKey: ["job", id] });
    }
  });

  const runAiAnalysis = useMutation({
    mutationFn: () => apiPost<{ insights: Array<unknown> }>(`/api/jobs/${id}/ai-analyze`, {}),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["job", id] })
  });

  const job = jobQuery.data;
  const projectName = projectsQuery.data?.find((project) => project.id === job?.projectId)?.name ?? "Unknown project";
  const gnssGeojson = gnssQuery.data;
  const summaryGeojson = useMemo(() => makeCoverageGeojson(gnssGeojson), [gnssGeojson]);
  const areaHectares = job?.areaSqM ? job.areaSqM / 10_000 : null;

  if (jobQuery.isLoading) {
    return (
      <div className="page-grid">
        <div className="card stack">
          <div className="skeleton-line" />
          <div className="skeleton-line" />
          <div className="skeleton-line" />
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="card stack">
        <strong>Job unavailable</strong>
        <span className="text-muted">The requested survey job could not be loaded from the API.</span>
      </div>
    );
  }

  return (
    <div className="page-grid">
      <div className="sticky-panel stack">
        <div className="page-header">
          <div className="stack" style={{ gap: "0.35rem" }}>
            <h1 style={{ margin: 0 }}>{job.name}</h1>
            <div className="row">
              <span className="text-muted">{projectName}</span>
              <span className="type-badge">{job.type.replaceAll("_", " ")}</span>
              <span className="status-badge">{job.status}</span>
            </div>
          </div>
          <div className="row">
            <button onClick={() => setActiveTab("GNSS Data")}>Import GNSS CSV</button>
            <button onClick={() => setActiveTab("Files")}>Upload Files</button>
            <button className="button-primary" disabled={startProcessing.isPending || job.inputFiles.length === 0 || job.status === "PROCESSING"} onClick={() => startProcessing.mutate()}>
              {startProcessing.isPending ? "Starting..." : "Start Processing"}
            </button>
          </div>
        </div>

        <div className="tabs-row">
          {tabs.map((tab) => (
            <button key={tab} className={`tab-button${activeTab === tab ? " active" : ""}`} onClick={() => setActiveTab(tab)}>
              {tab}
            </button>
          ))}
        </div>
      </div>

      {activeTab === "Overview" ? (
        <div className="page-grid">
          <div className="cards-grid">
            {[
              ["Status", job.status],
              ["Total points", job.pointCount?.toLocaleString() ?? "-"],
              ["Area (ha)", areaHectares ? areaHectares.toFixed(2) : "-"],
              ["RMSE", job.accuracyRmse ? `${job.accuracyRmse.toFixed(2)} m` : "-"],
              ["Created at", formatDate(job.createdAt)],
              ["Updated at", formatDate(job.updatedAt)]
            ].map(([label, value]) => (
              <div key={label} className="card stack" style={{ gap: "0.35rem" }}>
                <span className="text-muted">{label}</span>
                <strong>{String(value)}</strong>
              </div>
            ))}
          </div>

          <div className="card stack">
            <div className="section-title">
              <div className="stack" style={{ gap: "0.25rem" }}>
                <strong>Coverage map</strong>
                <span className="text-muted">Boundary extent and imported GNSS observations for this survey job.</span>
              </div>
              <button onClick={() => setFitSignal((value) => value + 1)}>Fit to bounds</button>
            </div>
            <MapView geojson={summaryGeojson} height="460px" autoFit fitSignal={fitSignal} />
            <div className="legend-row">
              <span><i className="legend-dot legend-good" /> Good accuracy</span>
              <span><i className="legend-dot legend-fair" /> Fair accuracy</span>
              <span><i className="legend-dot legend-poor" /> Poor accuracy</span>
              <span><i className="legend-swatch" /> Survey extent</span>
            </div>
          </div>
        </div>
      ) : null}

      {activeTab === "GNSS Data" ? (
        <GnssImportPanel
          fixedJobId={id}
          importedGeojson={gnssGeojson}
          onImported={() => {
            void queryClient.invalidateQueries({ queryKey: ["gnss-points", id] });
            void queryClient.invalidateQueries({ queryKey: ["job", id] });
          }}
        />
      ) : null}

      {activeTab === "Files" ? (
        <div className="cards-grid file-grid">
          <FileUploadZone jobId={id} onUploadComplete={() => void queryClient.invalidateQueries({ queryKey: ["job", id] })} showStartProcessingButton={false} />
          <div className="card stack">
            <strong>Uploaded files</strong>
            {job.inputFiles.length === 0 ? (
              <div className="empty-panel compact-empty">
                <strong>No uploaded files</strong>
                <span className="text-muted">Add point clouds, reports, or source artifacts before starting processing.</span>
              </div>
            ) : (
              job.inputFiles.map((file) => (
                <div key={file.id} className="list-row">
                  <div className="stack" style={{ gap: "0.15rem" }}>
                    <strong>{file.fileName}</strong>
                    <span className="text-muted">{file.fileType} · {(file.sizeBytes / (1024 * 1024)).toFixed(2)} MB</span>
                  </div>
                  <span className="text-muted">{formatDate(file.uploadedAt)}</span>
                </div>
              ))
            )}
          </div>
        </div>
      ) : null}

      {activeTab === "Processing" ? (
        <div className="page-grid">
          {job.inputFiles.length === 0 ? (
            <div className="empty-panel">
              <strong>Processing is blocked</strong>
              <span className="text-muted">Upload at least one job file before starting the survey processing pipeline.</span>
              <button onClick={() => setActiveTab("Files")}>Go to Files</button>
            </div>
          ) : null}
          <ProgressTracker jobId={id} onComplete={() => void queryClient.invalidateQueries({ queryKey: ["job", id] })} />
        </div>
      ) : null}

      {activeTab === "AI Insights" ? (
        <div className="page-grid">
          <div className="section-title">
            <div className="stack" style={{ gap: "0.25rem" }}>
              <strong>AI Insights</strong>
              <span className="text-muted">Review automated survey QA findings and recommendations generated for this job.</span>
            </div>
            <button className="button-primary" onClick={() => runAiAnalysis.mutate()} disabled={runAiAnalysis.isPending}>
              {runAiAnalysis.isPending ? "Running..." : "Run AI Analysis"}
            </button>
          </div>
          {job.aiInsights.length === 0 ? (
            <div className="empty-panel">
              <strong>No insights yet</strong>
              <span className="text-muted">Run AI analysis after importing data or completing processing to surface QA findings and recommendations.</span>
            </div>
          ) : (
            <div className="cards-grid">
              {job.aiInsights.map((insight) => (
                <AiInsightCard key={insight.id} insight={insight} />
              ))}
            </div>
          )}
          <AiChatPanel jobId={id} jobMetrics={job} />
        </div>
      ) : null}

      {activeTab === "Outputs" ? (
        <div className="page-grid">
          <div className="card stack">
            <div className="section-title">
              <strong>Generated outputs</strong>
              <span className="text-muted">Export artifacts produced by processing and reporting steps.</span>
            </div>
            {job.outputs.length === 0 ? (
              <div className="empty-panel compact-empty">
                <strong>No outputs available</strong>
                <span className="text-muted">Outputs will appear here after processing completes and generators create deliverables.</span>
              </div>
            ) : (
              job.outputs.map((output) => (
                <div key={output.id} className="list-row">
                  <div className="stack" style={{ gap: "0.15rem" }}>
                    <strong>{output.fileName}</strong>
                    <span className="text-muted">{output.fileType} · {formatDate(output.createdAt)}</span>
                  </div>
                  <button disabled title="Backend download endpoint for output files is not available yet">
                    Download unavailable
                  </button>
                </div>
              ))
            )}
          </div>

          <div className="card stack">
            <strong>Export actions</strong>
            <div className="row export-actions">
              <button disabled>Export CSV (pending backend)</button>
              <button disabled>Export GeoJSON (pending backend)</button>
              <button disabled>Export PDF report (pending backend)</button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
