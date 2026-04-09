import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";
import type { BoundaryGeoJson, GnssPoint, InputFile, MapMarker, OutputFile, SurveyJob } from "@geosurvey-ai/shared";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { AiInsightCard } from "../components/AiInsightCard";
import { BoundaryEditor } from "../components/BoundaryEditor";
import { FileUploadZone } from "../components/FileUploadZone";
import { GnssImportPanel } from "../components/GnssImportPanel";
import { MapView } from "../components/MapView";
import { ProgressTracker } from "../components/ProgressTracker";
import { EmptyState } from "../components/feedback/EmptyState";
import { UploadHelpPanel } from "../components/help/UploadHelpPanel";
import { SkeletonBlock } from "../components/feedback/SkeletonBlock";
import { RightRailPanel } from "../components/shell/RightRailPanel";
import { getButtonClass, GhostButton, PrimaryButton, SecondaryButton } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { PageHeader } from "../components/ui/PageHeader";
import { SectionHeader } from "../components/ui/SectionHeader";
import { StatCard } from "../components/ui/StatCard";
import { StatusBadge } from "../components/ui/StatusBadge";
import { WorkflowStepper } from "../components/workflow/WorkflowStepper";
import { useNotifications } from "../context/NotificationContext";
import { apiDelete, apiGet, apiPatch, apiPost } from "../lib/api";

type JobDetailRecord = SurveyJob & { gnssPoints: GnssPoint[]; boundaryGeojson?: BoundaryGeoJson | null };
type ProjectRecord = { id: string; name: string };
type TabKey = "Upload" | "Processing" | "Map" | "AI Insights" | "Outputs";

const tabs: TabKey[] = ["Upload", "Processing", "Map", "AI Insights", "Outputs"];

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

function hasPointCloudOutput(outputs: OutputFile[]) {
  return outputs.some((output) => output.fileType === "POINT_CLOUD");
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

function getWorkflowState(job: JobDetailRecord | undefined) {
  const hasFiles = (job?.inputFiles.length ?? 0) > 0;
  const isProcessing = job?.status === "PROCESSING";
  const hasReview = (job?.aiInsights.length ?? 0) > 0 || job?.status === "REVIEW" || job?.status === "COMPLETED";
  const hasOutputs = (job?.outputs.length ?? 0) > 0;

  return [
    { key: "project", label: "Project", status: "complete" as const },
    { key: "job", label: "Job", status: "complete" as const },
    { key: "upload", label: "Upload", status: hasFiles ? "complete" as const : "current" as const },
    { key: "process", label: "Processing", status: hasFiles ? (isProcessing || hasReview || hasOutputs ? "complete" as const : "current" as const) : "upcoming" as const },
    { key: "review", label: "Review", status: hasReview ? "complete" as const : hasFiles ? "current" as const : "upcoming" as const },
    { key: "export", label: "Export", status: hasOutputs ? "complete" as const : hasReview ? "current" as const : "upcoming" as const }
  ];
}

function getNextAction(job: JobDetailRecord) {
  if (job.inputFiles.length === 0) {
    return {
      title: "Upload survey files to continue",
      body: "Add source files before validation, processing, map review, or export can begin.",
      actionLabel: "Open Upload",
      tab: "Upload" as TabKey
    };
  }
  if (job.status === "PENDING" || job.status === "FAILED") {
    return {
      title: "Start processing",
      body: "Validate the source set, generate outputs, and move the job into AI-assisted review.",
      actionLabel: "Open Processing",
      tab: "Processing" as TabKey
    };
  }
  if (job.aiInsights.length === 0) {
    return {
      title: "Run AI analysis",
      body: "Generate QA findings and recommendations before approving the job for export.",
      actionLabel: "Open AI Review",
      tab: "AI Insights" as TabKey
    };
  }
  if (job.outputs.length === 0) {
    return {
      title: "Review outputs readiness",
      body: "Check the map, findings, and workflow status before exporting deliverables.",
      actionLabel: "Open Outputs",
      tab: "Outputs" as TabKey
    };
  }
  return {
    title: "Download report package",
    body: "Outputs are ready. Review the final files and export the deliverables.",
    actionLabel: "Open Outputs",
    tab: "Outputs" as TabKey
  };
}

function groupInsights(job: JobDetailRecord) {
  return {
    critical: job.aiInsights.filter((insight) => insight.severity === "ERROR"),
    warning: job.aiInsights.filter((insight) => insight.severity === "WARNING"),
    info: job.aiInsights.filter((insight) => insight.severity !== "ERROR" && insight.severity !== "WARNING")
  };
}

function tabClasses(active: boolean) {
  return active
    ? "ui-job-tab ui-job-tab--active"
    : "ui-job-tab";
}

function metricTile(label: string, value: string | number) {
  return (
    <div key={label} className="ui-metric-tile">
      <span className="ui-metric-tile__label">{label}</span>
      <strong className="ui-metric-tile__value">{value}</strong>
    </div>
  );
}

function getStatusTone(status: string) {
  if (status === "FAILED") return "error";
  if (status === "COMPLETED") return "success";
  if (status === "REVIEW") return "warning";
  if (status === "PROCESSING") return "info";
  return "default";
}

export function JobWorkspacePage() {
  const { id = "" } = useParams();
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const { addNotification } = useNotifications();
  const [activeTab, setActiveTab] = useState<TabKey>("Upload");
  const [fitSignal, setFitSignal] = useState(0);
  const [showLogs, setShowLogs] = useState(false);

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
      openTab("Processing");
      void queryClient.invalidateQueries({ queryKey: ["job", id] });
      addNotification({
        title: "Processing started",
        message: "The job has been queued for processing.",
        tone: "info",
        href: `/jobs/${id}?tab=Processing`,
        source: "processing"
      });
    },
    onError: (error) => {
      addNotification({
        title: "Processing could not start",
        message: error instanceof Error ? error.message : "Unable to start processing.",
        tone: "error",
        href: `/jobs/${id}`,
        source: "processing"
      });
    }
  });
  const runAiAnalysis = useMutation({
    mutationFn: () => apiPost<{ insights: Array<unknown> }>(`/api/jobs/${id}/ai-analyze`, {}),
    onSuccess: () => {
      openTab("AI Insights");
      void queryClient.invalidateQueries({ queryKey: ["job", id] });
      addNotification({
        title: "AI analysis complete",
        message: "New AI findings are ready to review.",
        tone: "success",
        href: `/jobs/${id}?tab=AI%20Insights`,
        source: "ai"
      });
    },
    onError: (error) => {
      addNotification({
        title: "AI analysis failed",
        message: error instanceof Error ? error.message : "Unable to run AI analysis.",
        tone: "error",
        href: `/jobs/${id}?tab=AI%20Insights`,
        source: "ai"
      });
    }
  });
  const updateStatus = useMutation({
    mutationFn: (status: string) => apiPatch(`/api/jobs/${id}/status`, { status }),
    onSuccess: (_, status) => {
      void queryClient.invalidateQueries({ queryKey: ["job", id] });
      addNotification({
        title: "Job status updated",
        message: `The job status is now ${status}.`,
        tone: "success",
        href: `/jobs/${id}`,
        source: "jobs"
      });
    },
    onError: (error) => {
      addNotification({
        title: "Status update failed",
        message: error instanceof Error ? error.message : "Unable to update the job status.",
        tone: "error",
        href: `/jobs/${id}`,
        source: "jobs"
      });
    }
  });
  const deleteFile = useMutation({
    mutationFn: (fileId: string) => apiDelete(`/api/jobs/${id}/files/${fileId}`),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["job", id] });
      addNotification({
        title: "File removed",
        message: "The file was removed from this job.",
        tone: "success",
        href: `/jobs/${id}?tab=Upload`,
        source: "uploads",
        toast: true
      });
    },
    onError: (error) => {
      addNotification({
        title: "File removal failed",
        message: error instanceof Error ? error.message : "Unable to remove the file.",
        tone: "error",
        href: `/jobs/${id}?tab=Upload`,
        source: "uploads"
      });
    }
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
  const workflowSteps = getWorkflowState(job);
  const insightGroups = job ? groupInsights(job) : { critical: [], warning: [], info: [] };
  const pointCloudAvailable = hasPointCloudOutput(job?.outputs ?? []);

  function openTab(tab: TabKey) {
    setActiveTab(tab);
  }

  useEffect(() => {
    if (job) {
      const requestedTab = searchParams.get("tab");
      if (requestedTab && tabs.includes(requestedTab as TabKey)) {
        setActiveTab(requestedTab as TabKey);
        return;
      }
      setActiveTab(getNextAction(job).tab);
    }
  }, [id, job, searchParams]);

  async function handleDownload(file: InputFile | OutputFile) {
    try {
      const payload = await apiGet<{ url: string }>(`/api/jobs/${id}/download/${file.id}`);
      window.open(payload.url, "_blank", "noopener,noreferrer");
    } catch (error) {
      addNotification({
        title: "Download unavailable",
        message: error instanceof Error ? error.message : "Unable to open the download link.",
        tone: "error",
        href: `/jobs/${id}`,
        source: "downloads"
      });
    }
  }

  if (jobQuery.isLoading) {
    return (
      <div className="page-grid">
        <SkeletonBlock lines={4} />
      </div>
    );
  }

  if (!job) {
    return (
      <EmptyState
        eyebrow="Unavailable"
        title="Job unavailable"
        description="The requested survey job could not be loaded. Return to jobs and reopen it, or try refreshing the page."
        action={<Link className="button-primary dashboard-cta-link" to="/jobs">Open Jobs</Link>}
      />
    );
  }

  const nextAction = getNextAction(job);
  const processingBlockedReason = job.inputFiles.length === 0
    ? "Upload files first so validation and processing have source data to run."
    : job.status === "PROCESSING"
      ? "This job is already processing. Review live progress below."
      : null;

  return (
    <div className="reference-page">
      <Card variant="accent" className="space-y-5">
        <PageHeader
          eyebrow="Job workspace"
          title={job.name}
          subtitle="Move this survey job from source upload through processing, AI review, and export without losing the next step."
          actions={(
            <>
              <StatusBadge label={formatLabel(job.type)} />
              <StatusBadge label={job.status} tone={getStatusTone(job.status)} />
              <Link className={getButtonClass("secondary")} to="/help#workflow-guide">Show Me How</Link>
              <Link className={getButtonClass("secondary")} to="/help#common-problems">Explain This Page</Link>
            </>
          )}
        >
          <span className="text-sm leading-6 text-[var(--text-secondary)]">{projectName} / {job.name}</span>
        </PageHeader>

        <WorkflowStepper steps={workflowSteps} />

        <div className="ui-job-tabs">
          {tabs.map((tab) => (
            <button key={tab} className={tabClasses(activeTab === tab)} onClick={() => openTab(tab)}>
              {tab}
            </button>
          ))}
          <PrimaryButton onClick={() => openTab(nextAction.tab)}>
            {nextAction.actionLabel}
          </PrimaryButton>
        </div>
      </Card>

      <div className="job-workspace-stats">
        <StatCard label="Status" value={job.status} meta="Current workflow state" />
        <StatCard label="Source files" value={job.inputFiles.length} meta="Inputs attached to this job" />
        <StatCard label="Outputs" value={job.outputs.length} meta="Generated deliverables available" />
        <StatCard label="AI insights" value={job.aiInsights.length} meta="Model findings ready for review" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="min-w-0 space-y-6">

          {activeTab === "Upload" ? (
            <div className="space-y-6">
              <Card className="space-y-4">
                <UploadHelpPanel
                  sampleLinks={[
                    { label: "Sample GNSS CSV", href: "/samples/sample-gnss-points.csv" },
                    { label: "Sample Guide", href: "/samples/README.txt" }
                  ]}
                  helpAnchor="/help#what-files-to-upload"
                  demoQuery="/jobs?createJob=1&demoType=GNSS_TRAVERSE&demoName=Demo%20GNSS%20Land%20Survey"
                />
                <FileUploadZone
                  jobId={id}
                  onUploadComplete={() => void queryClient.invalidateQueries({ queryKey: ["job", id] })}
                  showStartProcessingButton={false}
                />
              </Card>

              <Card className="space-y-4">
                <SectionHeader
                  title="Current source inventory"
                  subtitle="Keep the upload list clean before starting processing."
                  action={job.inputFiles.length > 0 ? <PrimaryButton onClick={() => openTab("Processing")}>Next: Start Processing</PrimaryButton> : null}
                />
                
                
                  {job.inputFiles.length > 0 ? (
                    null
                  ) : null}

                {job.inputFiles.length === 0 ? (
                  <EmptyState
                    compact
                    eyebrow="Upload"
                    title="No files uploaded yet"
                    description="Upload survey files to continue. Once valid files are attached, processing becomes available."
                    icon="upload"
                    action={<div className="reference-actions"><a className={getButtonClass("secondary")} href="/samples/sample-gnss-points.csv" download>Download Sample</a><Link className={getButtonClass("secondary")} to="/help#sample-files">Open Help</Link></div>}
                  />
                ) : (
                  <div className="space-y-3">
                    {job.inputFiles.map((file) => (
                      <div key={file.id} className="reference-list-row md:items-start">
                        <div className="space-y-1">
                          <strong className="block text-sm font-semibold text-slate-900">{file.fileName}</strong>
                          <span className="block text-sm leading-6 text-slate-500">{file.fileType} / {formatFileSize(file.sizeBytes)} / {formatDate(file.uploadedAt)}</span>
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <SecondaryButton onClick={() => void handleDownload(file)}>Download</SecondaryButton>
                          <GhostButton disabled={deleteFile.isPending} onClick={() => deleteFile.mutate(file.id)}>Remove</GhostButton>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            </div>
          ) : null}

          {activeTab === "Processing" ? (
            <div className="space-y-6">
              <Card className="space-y-4">
                <SectionHeader
                  title="Processing pipeline"
                  subtitle="Track validation, geometry, metrics, output generation, and AI analysis in one place."
                  action={(
                    <PrimaryButton
                    disabled={startProcessing.isPending || Boolean(processingBlockedReason)}
                    onClick={() => startProcessing.mutate()}
                  >
                    {startProcessing.isPending ? "Starting..." : "Start Processing"}
                    </PrimaryButton>
                  )}
                />

                {processingBlockedReason ? (
                  <div className="ui-inline-note">{processingBlockedReason}</div>
                ) : null}
                <ProgressTracker jobId={id} onComplete={() => void queryClient.invalidateQueries({ queryKey: ["job", id] })} />

                <div className="flex flex-wrap gap-2">
                  {nextStatuses.map((status) => (
                    <SecondaryButton key={status} disabled={updateStatus.isPending} onClick={() => updateStatus.mutate(status)}>
                      Mark {status}
                    </SecondaryButton>
                  ))}
                  <GhostButton onClick={() => setShowLogs((value) => !value)}>
                    {showLogs ? "Hide log panel" : "Show log panel"}
                  </GhostButton>
                </div>
              </Card>

              {showLogs ? (
                <Card className="space-y-4">
                  <SectionHeader title="Processing log" subtitle="Live timeline from validation through AI insight generation." />
                  {processingTimeline.length === 0 ? (
                    <EmptyState
                      compact
                      eyebrow="Logs"
                      title="No timeline yet"
                      description="Processing events will appear here after the job enters the queue."
                      icon="processing"
                    />
                  ) : (
                    <div className="space-y-3">
                      {processingTimeline.map((entry) => (
                        <div key={`${entry.stage}-${entry.timestamp}`} className="reference-list-row md:items-start">
                          <div className="space-y-1">
                            <strong className="block text-sm font-semibold text-slate-900">{entry.stage}</strong>
                            <span className="block text-sm leading-6 text-slate-500">{entry.message}</span>
                          </div>
                          <div className="space-y-1 md:text-right">
                            <StatusBadge label={entry.status} tone={getStatusTone(entry.status)} />
                            <span className="block text-sm leading-6 text-slate-500">{formatDate(entry.timestamp)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              ) : null}
            </div>
          ) : null}

          {activeTab === "Map" ? (
            <div className="space-y-6">
              <Card className="space-y-4">
                <SectionHeader title="Survey map workspace" subtitle="Review boundaries, points, markers, and imported GNSS data together." />
                {mapGeojson ? (
                  <MapView geojson={mapGeojson as never} height="460px" autoFit fitSignal={fitSignal} />
                ) : (
                  <EmptyState
                    compact
                    eyebrow="Map"
                    title="No map data yet"
                    description="Upload files or import GNSS data first, then save a boundary to populate the map workspace."
                    icon="map"
                  />
                )}
              </Card>

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

              <Card className="space-y-4">
                <SectionHeader title="GNSS import" subtitle="Bring more observations into the same survey workspace." />
                <GnssImportPanel
                  fixedJobId={id}
                  importedGeojson={gnssGeojson as never}
                  onImported={() => {
                    void queryClient.invalidateQueries({ queryKey: ["gnss-points", id] });
                    void queryClient.invalidateQueries({ queryKey: ["job", id] });
                  }}
                />
              </Card>
            </div>
          ) : null}

          {activeTab === "AI Insights" ? (
            <div className="space-y-6">
              <Card className="space-y-4">
                <SectionHeader
                  title="AI review workspace"
                  subtitle="Surface the highest-risk findings first, then ask the assistant what to do next."
                  action={<PrimaryButton onClick={() => runAiAnalysis.mutate()} disabled={runAiAnalysis.isPending}>
                    {runAiAnalysis.isPending ? "Running..." : "Run AI Analysis"}
                  </PrimaryButton>}
                />
              </Card>

              {job.aiInsights.length === 0 ? (
                <EmptyState
                  eyebrow="AI review"
                  title="No insights yet"
                  description="Run AI analysis after files are uploaded or processing is complete to generate QA findings and recommendations."
                  icon="ai"
                  action={
                    <PrimaryButton onClick={() => runAiAnalysis.mutate()} disabled={runAiAnalysis.isPending}>
                      {runAiAnalysis.isPending ? "Running..." : "Run AI Analysis"}
                    </PrimaryButton>
                  }
                />
              ) : (
                <div className="space-y-6">
                  {([
                    ["Critical", insightGroups.critical],
                    ["Warning", insightGroups.warning],
                    ["Info", insightGroups.info]
                  ] as Array<[string, typeof job.aiInsights]>).map(([label, insights]) =>
                    insights.length > 0 ? (
                      <Card key={label} className="space-y-4">
                        <SectionHeader title={label} action={<span className="text-sm text-[var(--text-muted)]">{insights.length} finding(s)</span>} />
                        <div className="grid gap-4 xl:grid-cols-2">
                          {insights.map((insight) => (
                            <AiInsightCard key={insight.id} insight={insight} />
                          ))}
                        </div>
                      </Card>
                    ) : null
                  )}
                </div>
              )}

            </div>
          ) : null}

          {activeTab === "Outputs" ? (
            <Card className="space-y-4">
              <SectionHeader
                title="Output inventory"
                subtitle="Review deliverables, download files, and confirm the survey is ready for export."
                action={<div className="flex flex-wrap gap-2">
                  {pointCloudAvailable ? (
                    <Link className={getButtonClass("secondary")} to={`/viewer/${id}`}>
                      Open Point Cloud
                    </Link>
                  ) : null}
                  <Link className={getButtonClass("secondary")} to="/reports">
                    Open reports inventory
                  </Link>
                </div>}
              />

              {job.outputs.length === 0 ? (
                <EmptyState
                  eyebrow="Export"
                  title="No outputs available yet"
                  description="Outputs appear here after processing completes and generators produce deliverables."
                  icon="reports"
                  action={<SecondaryButton onClick={() => openTab("Processing")}>Open Processing</SecondaryButton>}
                />
              ) : (
                <div className="space-y-3">
                  {job.outputs.map((output) => (
                    <div key={output.id} className="reference-list-row md:items-start">
                      <div className="space-y-1">
                        <strong className="block text-sm font-semibold text-slate-900">{output.fileName}</strong>
                        <span className="block text-sm leading-6 text-slate-500">{formatLabel(output.fileType)} / {formatFileSize(output.sizeBytes)} / {formatDate(output.createdAt)}</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {output.fileType === "POINT_CLOUD" ? (
                          <Link className={getButtonClass("secondary")} to={`/viewer/${id}`}>
                            View
                          </Link>
                        ) : null}
                        <SecondaryButton onClick={() => void handleDownload(output)}>Download</SecondaryButton>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          ) : null}
        </div>

        <aside className="space-y-4 xl:sticky xl:top-24 xl:self-start">
          <RightRailPanel title="Next best action">
            <strong>{nextAction.title}</strong>
            <span className="text-slate-500">{nextAction.body}</span>
            <PrimaryButton onClick={() => openTab(nextAction.tab)}>
              {nextAction.actionLabel}
            </PrimaryButton>
          </RightRailPanel>

          <RightRailPanel title="Status">
            <div className="grid gap-3 sm:grid-cols-2">
              {metricTile("Status", job.status)}
              {metricTile("Files", job.inputFiles.length)}
              {metricTile("Outputs", job.outputs.length)}
              {metricTile("Insights", job.aiInsights.length)}
            </div>
          </RightRailPanel>

          <RightRailPanel title="Recent activity">
            {processingTimeline.length === 0 ? (
              <span className="text-slate-500">No live activity yet. Start processing to generate timeline updates.</span>
            ) : (
              processingTimeline.slice(-3).reverse().map((entry) => (
                <div key={`${entry.stage}-${entry.timestamp}`} className="ui-activity-card">
                  <strong className="block text-sm font-semibold text-[var(--text-primary)]">{entry.stage}</strong>
                  <span className="block text-sm leading-6 text-[var(--text-secondary)]">{entry.message}</span>
                  <span className="block text-sm leading-6 text-[var(--text-muted)]">{formatDate(entry.timestamp)}</span>
                </div>
              ))
            )}
          </RightRailPanel>

          <RightRailPanel title="AI recommendations">
            {job.aiInsights.length === 0 ? (
              <span className="text-slate-500">Run AI analysis to surface recommendations and plain-English guidance.</span>
            ) : (
              <>
                <strong>{job.aiInsights[0].category}</strong>
                <span className="text-slate-500">{job.aiInsights[0].message}</span>
                <span className="text-slate-500">
                  Confidence {Math.round(job.aiInsights[0].confidence * 100)}% / Recommendation {String(job.aiInsights[0].metadata?.recommendation ?? "Review the job workspace")}
                </span>
              </>
            )}
          </RightRailPanel>

          <RightRailPanel title="Survey geometry">
            <div className="grid gap-3 sm:grid-cols-2">
              {metricTile("GNSS points", gnssPoints.length)}
              {metricTile("Boundary", job.boundaryGeojson ? "Saved" : "Missing")}
              {metricTile("Area", areaHectares ? `${areaHectares.toFixed(2)} ha` : "-")}
              {metricTile("Marker", savedMarker ? "Saved" : "Missing")}
            </div>
            {pointCloudAvailable ? (
              <Link className={getButtonClass("secondary")} to={`/viewer/${id}`}>
                Open point cloud viewer
              </Link>
            ) : null}
            <SecondaryButton onClick={() => setFitSignal((value) => value + 1)}>Fit map to current data</SecondaryButton>
          </RightRailPanel>
        </aside>
      </div>
    </div>
  );
}
