import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import type { BoundaryGeoJson, GnssPoint, InputFile, MapMarker, OutputFile, SurveyJob } from "@geosurvey-ai/shared";
import { Link, useLocation, useParams } from "react-router-dom";
import { AiChatPanel } from "../components/AiChatPanel";
import { AiInsightCard } from "../components/AiInsightCard";
import { BoundaryEditor } from "../components/BoundaryEditor";
import { FileUploadZone } from "../components/FileUploadZone";
import { GnssImportPanel } from "../components/GnssImportPanel";
import { MapView } from "../components/MapView";
import { ProgressTracker } from "../components/ProgressTracker";
import { apiDelete, apiGet, apiPatch, apiPost } from "../lib/api";

type JobDetailRecord = SurveyJob & { gnssPoints: GnssPoint[]; boundaryGeojson?: BoundaryGeoJson | null };
type ProjectRecord = { id: string; name: string };
type TabKey = "Overview" | "Files" | "Map" | "Point Cloud" | "AI Insights" | "Reports";

const tabs: TabKey[] = ["Overview", "Files", "Map", "Point Cloud", "AI Insights", "Reports"];

function formatDate(value: string | null | undefined) {
  if (!value) {
    return "-";
  }
  return new Date(value).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function formatLabel(value: string) {
  return value.replaceAll("_", " ");
}

function formatFileSize(sizeBytes: number) {
  if (sizeBytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(sizeBytes / 1024))} KB`;
  }
  return `${(sizeBytes / (1024 * 1024)).toFixed(2)} MB`;
}

function getAllowedNextStatuses(status: string) {
  if (status === "PENDING") {
    return ["PROCESSING", "FAILED"];
  }
  if (status === "PROCESSING") {
    return ["REVIEW", "COMPLETED", "FAILED"];
  }
  if (status === "REVIEW") {
    return ["COMPLETED", "FAILED"];
  }
  if (status === "FAILED") {
    return ["PENDING"];
  }
  return [];
}

function makeMapGeojson(job: JobDetailRecord | undefined, gnssGeojson?: Record<string, unknown>) {
  const features = [
    ...(job?.boundaryGeojson?.features ?? []),
    ...(typeof job?.markerLat === "number" && typeof job?.markerLng === "number"
      ? [{
          type: "Feature" as const,
          properties: { name: "Saved marker" },
          geometry: { type: "Point" as const, coordinates: [job.markerLng, job.markerLat, 0] as [number, number, number] }
        }]
      : []),
    ...(((gnssGeojson as { features?: unknown[] } | undefined)?.features ?? []) as Array<Record<string, unknown>>)
  ];

  return features.length > 0 ? { type: "FeatureCollection", features } : undefined;
}

export function JobDetailPage() {
  const { id = "" } = useParams();
  const location = useLocation();
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
    queryFn: () => apiGet<Record<string, unknown>>(`/api/gnss/${id}/points`),
    enabled: Boolean(id)
  });

  const startProcessing = useMutation({
    mutationFn: () => apiPost<{ queued: boolean }>(`/api/jobs/${id}/process`, {}),
    onSuccess: () => {
      setActiveTab("Overview");
      void queryClient.invalidateQueries({ queryKey: ["job", id] });
    }
  });
  const runAiAnalysis = useMutation({
    mutationFn: () => apiPost<{ insights: Array<unknown> }>(`/api/jobs/${id}/ai-analyze`, {}),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["job", id] })
  });
  const updateStatus = useMutation({
    mutationFn: (status: string) => apiPatch(`/api/jobs/${id}/status`, { status }),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["job", id] })
  });
  const deleteFile = useMutation({
    mutationFn: (fileId: string) => apiDelete(`/api/jobs/${id}/files/${fileId}`),
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: ["job", id] })
  });

  const job = jobQuery.data;
  const projectName = projectsQuery.data?.find((project) => project.id === job?.projectId)?.name ?? "Unknown project";
  const gnssGeojson = gnssQuery.data;
  const mapGeojson = useMemo(() => makeMapGeojson(job, gnssGeojson), [gnssGeojson, job]);
  const savedMarker = useMemo<MapMarker | null>(() => {
    if (typeof job?.markerLat !== "number" || typeof job?.markerLng !== "number") {
      return null;
    }
    return { lat: job.markerLat, lng: job.markerLng };
  }, [job?.markerLat, job?.markerLng]);
  const areaHectares = job?.areaSqM ? job.areaSqM / 10_000 : null;
  const gnssPoints = job?.gnssPoints ?? [];
  const nextStatuses = getAllowedNextStatuses(job?.status ?? "");
  const processingTimeline = job?.processingMetadata?.timeline ?? [];

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const requestedTab = params.get("tourTab");
    if (requestedTab && tabs.includes(requestedTab as TabKey)) {
      setActiveTab(requestedTab as TabKey);
    }
  }, [location.search]);

  async function handleDownload(file: InputFile | OutputFile) {
    try {
      const payload = await apiGet<{ url: string }>(`/api/jobs/${id}/download/${file.id}`);
      window.open(payload.url, "_blank", "noopener,noreferrer");
    } catch (error) {
      window.alert(error instanceof Error ? error.message : "Unable to open the download link.");
    }
  }

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
              <span className="type-badge">{formatLabel(job.type)}</span>
              <span className="status-badge">{job.status}</span>
            </div>
          </div>
          <div className="row">
            <button data-tour="map-tab" onClick={() => setActiveTab("Map")}>Open Map</button>
            <button onClick={() => setActiveTab("Files")}>Review Files</button>
            <button className="button-primary" data-tour="process-btn" disabled={startProcessing.isPending || job.inputFiles.length === 0 || job.status === "PROCESSING"} onClick={() => startProcessing.mutate()}>
              {startProcessing.isPending ? "Starting..." : "Start Processing"}
            </button>
          </div>
        </div>

        <div className="tabs-row">
          {tabs.map((tab) => (
            <button
              key={tab}
              className={`tab-button${activeTab === tab ? " active" : ""}`}
              data-tour={tab === "Map" ? "map-tab" : tab === "AI Insights" ? "insights-tab" : tab === "Reports" ? "reports-tab" : undefined}
              onClick={() => setActiveTab(tab)}
            >
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
              ["Survey type", formatLabel(job.type)],
              ["Total points", job.pointCount?.toLocaleString() ?? "-"],
              ["Area (ha)", areaHectares ? areaHectares.toFixed(2) : "-"],
              ["RMSE", job.accuracyRmse ? `${job.accuracyRmse.toFixed(2)} m` : "-"],
              ["Updated at", formatDate(job.updatedAt)]
            ].map(([label, value]) => (
              <div key={label} className="card stack" style={{ gap: "0.35rem" }}>
                <span className="text-muted">{label}</span>
                <strong>{String(value)}</strong>
              </div>
            ))}
          </div>

          <div className="cards-grid">
            <div className="card stack">
              <div className="section-title">
                <strong>Workflow controls</strong>
                <span className="text-muted">Processing and review actions for this job.</span>
              </div>
              <div className="row">
                <button className="button-primary" data-tour="process-btn" disabled={startProcessing.isPending || job.inputFiles.length === 0 || job.status === "PROCESSING"} onClick={() => startProcessing.mutate()}>
                  {startProcessing.isPending ? "Starting..." : "Queue processing"}
                </button>
                {nextStatuses.map((status) => (
                  <button key={status} disabled={updateStatus.isPending} onClick={() => updateStatus.mutate(status)}>
                    Mark {status}
                  </button>
                ))}
              </div>
              <span className="text-muted">Boundary, files, and reports are available in the other tabs; live processing state stays here.</span>
            </div>

            <div className="card stack">
              <div className="section-title">
                <strong>Saved geometry</strong>
                <span className="text-muted">Current spatial context stored for this job.</span>
              </div>
              <div className="stats-grid">
                <div className="stat-chip">
                  <span className="text-muted">GNSS points</span>
                  <strong>{gnssPoints.length}</strong>
                </div>
                <div className="stat-chip">
                  <span className="text-muted">Boundary stored</span>
                  <strong>{job.boundaryGeojson ? "Yes" : "No"}</strong>
                </div>
                <div className="stat-chip">
                  <span className="text-muted">Marker stored</span>
                  <strong>{savedMarker ? "Yes" : "No"}</strong>
                </div>
                <div className="stat-chip">
                  <span className="text-muted">Centroid</span>
                  <strong>{job.centroidLat && job.centroidLng ? `${job.centroidLat.toFixed(4)}, ${job.centroidLng.toFixed(4)}` : "-"}</strong>
                </div>
              </div>
            </div>
          </div>

          <ProgressTracker jobId={id} onComplete={() => void queryClient.invalidateQueries({ queryKey: ["job", id] })} />

          <div className="card stack">
            <div className="section-title">
              <strong>Processing timeline</strong>
              <span className="text-muted">Persisted timeline entries from the backend worker.</span>
            </div>
            {processingTimeline.length === 0 ? (
              <div className="empty-panel compact-empty">
                <strong>No timeline yet</strong>
                <span className="text-muted">Timeline events appear here after processing begins.</span>
              </div>
            ) : (
              processingTimeline.map((entry) => (
                <div key={`${entry.stage}-${entry.timestamp}`} className="list-row">
                  <div className="stack" style={{ gap: "0.15rem" }}>
                    <strong>{entry.stage}</strong>
                    <span className="text-muted">{entry.message}</span>
                  </div>
                  <div className="stack" style={{ gap: "0.15rem", justifyItems: "end" }}>
                    <span className="status-badge">{entry.status}</span>
                    <span className="text-muted">{formatDate(entry.timestamp)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ) : null}

      {activeTab === "Files" ? (
        <div className="cards-grid file-grid">
          <FileUploadZone jobId={id} onUploadComplete={() => void queryClient.invalidateQueries({ queryKey: ["job", id] })} showStartProcessingButton={false} />
          <div className="card stack">
            <div className="section-title">
              <strong>Uploaded files</strong>
              <span className="text-muted">Delete, download, or continue processing from the current source set.</span>
            </div>
            {job.inputFiles.length === 0 ? (
              <div className="empty-panel compact-empty">
                <strong>No uploaded files</strong>
                <span className="text-muted">Add source files before processing or report generation.</span>
              </div>
            ) : (
              job.inputFiles.map((file) => (
                <div key={file.id} className="list-row">
                  <div className="stack" style={{ gap: "0.15rem" }}>
                    <strong>{file.fileName}</strong>
                    <span className="text-muted">{file.fileType} · {formatFileSize(file.sizeBytes)} · {formatDate(file.uploadedAt)}</span>
                  </div>
                  <div className="row">
                    <button onClick={() => void handleDownload(file)}>Download</button>
                    <button disabled={deleteFile.isPending} onClick={() => deleteFile.mutate(file.id)}>Delete</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ) : null}

      {activeTab === "Map" ? (
        <div className="page-grid">
          <BoundaryEditor
            jobId={id}
            pointsGeojson={gnssGeojson as never}
            initialBoundary={job.boundaryGeojson ?? null}
            initialMarker={savedMarker}
            onBoundarySaved={() => {
              void queryClient.invalidateQueries({ queryKey: ["job", id] });
              void queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
            }}
          />
          <div className="card stack">
            <div className="section-title">
              <strong>GNSS import</strong>
              <span className="text-muted">Bring more observations into the same map workflow.</span>
            </div>
            <GnssImportPanel
              fixedJobId={id}
              importedGeojson={gnssGeojson as never}
              onImported={() => {
                void queryClient.invalidateQueries({ queryKey: ["gnss-points", id] });
                void queryClient.invalidateQueries({ queryKey: ["job", id] });
              }}
            />
          </div>
        </div>
      ) : null}

      {activeTab === "Point Cloud" ? (
        <div className="page-grid">
          <div className="card stack">
            <div className="section-title">
              <strong>Point cloud workspace</strong>
              <span className="text-muted">Structured fallback while a full 3D viewer is unavailable.</span>
            </div>
            <div className="stats-grid">
              <div className="stat-chip">
                <span className="text-muted">LiDAR-style inputs</span>
                <strong>{job.inputFiles.filter((file) => file.fileType === "LAS" || file.fileType === "LAZ").length}</strong>
              </div>
              <div className="stat-chip">
                <span className="text-muted">Processing stage</span>
                <strong>{job.processingMetadata?.currentStage ?? "Not started"}</strong>
              </div>
              <div className="stat-chip">
                <span className="text-muted">Derived point count</span>
                <strong>{job.pointCount?.toLocaleString() ?? "-"}</strong>
              </div>
            </div>
            <div className="inline-note">
              This project currently uses realistic processing metadata and artifact generation as a graceful fallback when a native point-cloud viewer or full PDAL/GDAL stack is unavailable.
            </div>
            <MapView geojson={mapGeojson as never} height="420px" autoFit fitSignal={fitSignal} />
          </div>
        </div>
      ) : null}

      {activeTab === "AI Insights" ? (
        <div className="page-grid">
          <div className="section-title">
            <div className="stack" style={{ gap: "0.25rem" }}>
              <strong>AI Insights</strong>
              <span className="text-muted">Run NVIDIA-hosted GPT-OSS analysis and review structured survey QA findings.</span>
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

      {activeTab === "Reports" ? (
        <div className="page-grid">
          <div className="card stack">
            <div className="section-title">
              <strong>Output artifacts</strong>
              <span className="text-muted">Generated deliverables and retained input context for this job.</span>
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
                    <span className="text-muted">{formatLabel(output.fileType)} · {formatFileSize(output.sizeBytes)} · {formatDate(output.createdAt)}</span>
                  </div>
                  <button onClick={() => void handleDownload(output)}>Download</button>
                </div>
              ))
            )}
          </div>

          <div className="card stack">
            <div className="section-title">
              <strong>Related report actions</strong>
              <span className="text-muted">Move between job-level and cross-job artifact views.</span>
            </div>
            <div className="row export-actions">
              <Link className="table-action" to="/reports">
                Open reports inventory
              </Link>
              <button onClick={() => setFitSignal((value) => value + 1)}>Fit map to current data</button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

