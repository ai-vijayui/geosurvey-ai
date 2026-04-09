import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate } from "react-router-dom";
import { AiInsightCard } from "../components/AiInsightCard";
import { MapView } from "../components/MapView";
import { ProjectCreateModal } from "../components/ProjectCreateModal";
import { EmptyState } from "../components/feedback/EmptyState";
import { ProgressTracker } from "../components/ProgressTracker";
import { WorkflowStepper } from "../components/workflow/WorkflowStepper";
import { getButtonClass, PrimaryButton } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { PageHeader } from "../components/ui/PageHeader";
import { SectionHeader } from "../components/ui/SectionHeader";
import { StatCard } from "../components/ui/StatCard";
import { apiGet, type PaginatedResponse } from "../lib/api";

type DashboardStats = {
  totalAreaHa: number;
  activeJobs: number;
  totalPoints: number;
  avgRmse: number;
  recentInsights: Array<any>;
  jobsByStatus: Record<string, number>;
  jobBoundaries: Array<any>;
};

type ProcessingJob = {
  id: string;
  name: string;
  type: string;
  status: string;
};

type ProjectRecord = {
  id: string;
  name: string;
  surveyJobs?: Array<{ id: string }>;
};

export function Dashboard() {
  const navigate = useNavigate();
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);
  const statsQuery = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: () => apiGet<DashboardStats>("/api/dashboard/stats")
  });

  const processingJobsQuery = useQuery({
    queryKey: ["processing-jobs"],
    queryFn: () => apiGet<PaginatedResponse<ProcessingJob[]>>("/api/jobs?status=PROCESSING&limit=4"),
    refetchInterval: 10_000
  });
  const projectsQuery = useQuery({
    queryKey: ["projects", "list"],
    queryFn: () => apiGet<ProjectRecord[]>("/api/projects")
  });

  const stats = statsQuery.data;
  const jobs = processingJobsQuery.data?.data ?? [];
  const projects = projectsQuery.data ?? [];
  const totalJobs = Object.values(stats?.jobsByStatus ?? {}).reduce((sum, count) => sum + Number(count ?? 0), 0);
  const workflowSteps = [
    { key: "project", label: "Project", status: projects.length > 0 ? "complete" as const : "current" as const },
    { key: "job", label: "Job", status: totalJobs > 0 ? "complete" as const : projects.length > 0 ? "current" as const : "upcoming" as const },
    { key: "upload", label: "Upload", status: totalJobs > 0 ? "current" as const : "upcoming" as const },
    { key: "process", label: "Process", status: jobs.length > 0 ? "complete" as const : totalJobs > 0 ? "current" as const : "upcoming" as const },
    { key: "review", label: "Review", status: (stats?.recentInsights?.length ?? 0) > 0 ? "complete" as const : totalJobs > 0 ? "current" as const : "upcoming" as const },
    { key: "export", label: "Export", status: "upcoming" as const }
  ];
  const boundariesGeojson = useMemo(() => {
    const features = (stats?.jobBoundaries ?? []).flatMap((job) => job.boundaryGeojson?.features ?? []);
    return features.length > 0 ? { type: "FeatureCollection", features } : undefined;
  }, [stats?.jobBoundaries]);
  const hasDataError = statsQuery.isError || processingJobsQuery.isError || projectsQuery.isError;

  return (
    <div className="reference-page dashboard-page" data-tour="dashboard-page">
      <ProjectCreateModal
        isOpen={isCreateProjectOpen}
        onClose={() => setIsCreateProjectOpen(false)}
        onCreated={(project) => {
          navigate(`/jobs?projectId=${project.id}&createJob=1`);
        }}
      />
      <PageHeader
        title="Dashboard"
        subtitle="Monitor the GeoSurvey pipeline with a calm operations view of live metrics, workflow readiness, mapped coverage, and recent AI findings."
        actions={(
          <>
            <Link className={getButtonClass("secondary")} to="/help#start-here">
              Show Me How
            </Link>
            <Link className={getButtonClass("secondary")} to="/help#how-this-app-works">
              Explain This Page
            </Link>
            {projects.length === 0 ? (
              <PrimaryButton onClick={() => setIsCreateProjectOpen(true)}>New Project</PrimaryButton>
            ) : (
              <Link className={getButtonClass("primary")} to="/jobs?createJob=1">
                New Job
              </Link>
            )}
          </>
        )}
      />

      <div className="reference-panel-grid dashboard-panel-grid">
        <Card variant="accent" className="space-y-4 dashboard-hero-card">
          <span className="reference-chip">Portfolio overview</span>
          <strong className="dashboard-hero-card__title block text-2xl font-semibold leading-tight text-[var(--text-primary)]">{projects.length === 0 ? "Create your first project" : totalJobs === 0 ? "Create your first job" : jobs.length === 0 ? "Queue work for processing" : "Monitor active workflows"}</strong>
          <span className="block max-w-2xl text-sm leading-6 text-[var(--text-secondary)]">
            {projects.length === 0
              ? "Projects anchor the full GeoSurvey workflow. Start there so jobs, files, and reports all stay organized."
              : totalJobs === 0
                ? "Your workspace is ready. Create a job next so you can upload files and start processing."
                : jobs.length === 0
                  ? "Open a job, upload files, and start processing to see live progress and AI insights here."
                  : "Live progress, mapped coverage, and AI findings stay visible here while the team keeps working."}
          </span>
          <div className="dashboard-hero-card__actions flex flex-wrap items-center gap-3">
            {projects.length === 0 ? (
              <PrimaryButton onClick={() => setIsCreateProjectOpen(true)}>Create project</PrimaryButton>
            ) : (
              <Link className={getButtonClass("primary")} to="/jobs">
                {totalJobs === 0 ? "Create job" : "Open jobs"}
              </Link>
            )}
            <Link className={getButtonClass("secondary")} to="/processing">
              Open processing
            </Link>
          </div>
        </Card>
        <Card variant="soft" className="space-y-4 dashboard-workflow-card">
          <span className="reference-chip">Workflow</span>
          <WorkflowStepper steps={workflowSteps} compact />
        </Card>
      </div>

      <div className="reference-metrics dashboard-metrics" data-tour="dashboard-kpis">
        {[
          ["Total Area (ha)", stats?.totalAreaHa ?? 0, "Tracked coverage across all saved boundaries"],
          ["Active Jobs", stats?.activeJobs ?? 0, jobs.length > 0 ? "Live workflows are currently moving" : "No active processing right now"],
          ["Total Points", stats?.totalPoints?.toLocaleString?.() ?? 0, "Imported survey points in the workspace"],
          ["Avg RMSE", stats?.avgRmse ?? 0, "Quality baseline across processed jobs"]
        ].map(([label, value, trend], index) => (
          <StatCard key={label} label={String(label)} value={value} meta={trend} className="dashboard-metric" />
        ))}
      </div>

      {hasDataError ? (
        <EmptyState
          eyebrow="Unavailable"
          title="Dashboard data is unavailable"
          description="The operations overview could not load. Retry to restore live metrics, queue visibility, and AI insights."
          action={<div className="reference-actions"><PrimaryButton onClick={() => { void statsQuery.refetch(); void processingJobsQuery.refetch(); void projectsQuery.refetch(); }}>Retry</PrimaryButton><Link className={getButtonClass("secondary")} to="/help#troubleshooting">Open Help</Link></div>}
        />
      ) : projects.length === 0 ? (
        <EmptyState
          title="Create your first project"
          description="Projects unlock the full workflow: jobs, uploads, processing, review, and export."
          icon="projects"
          action={<div className="reference-actions"><PrimaryButton onClick={() => setIsCreateProjectOpen(true)}>Create Project</PrimaryButton><Link className={getButtonClass("secondary")} to="/help#getting-started">Open Help</Link></div>}
        />
      ) : totalJobs === 0 ? (
        <EmptyState
          title="Create your first survey job"
          description="Your project is ready. Create a job next so you can upload files, process outputs, and review AI findings."
          icon="jobs"
          action={<div className="reference-actions"><Link className={getButtonClass("primary")} data-tour="create-job-btn" to="/jobs?createJob=1">Create Job</Link><Link className={getButtonClass("secondary")} to="/help#workflow-guide">Open Help</Link></div>}
        />
      ) : null}

      <Card className="space-y-4 dashboard-map-card">
        <SectionHeader
          title="Project coverage map"
          subtitle="Saved job boundaries and map context from the active project portfolio."
        />
        {boundariesGeojson ? <MapView geojson={boundariesGeojson as never} height="360px" autoFit fitSignal={stats?.jobBoundaries.length ?? 0} /> : (
          <EmptyState compact icon="map" title="No saved boundaries yet" description="Saved survey polygons will appear here once jobs store boundary geometry." />
        )}
      </Card>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card className="space-y-4 dashboard-section-card">
          <SectionHeader title="Processing queue" action={<Link className={getButtonClass("ghost")} to="/jobs">View all</Link>} />
          {jobs.length === 0 ? (
            <EmptyState compact icon="processing" title="No active processing jobs" description="Queue a job from the workflow pages to watch live progress here." />
          ) : (
            jobs.map((job) => (
              <section key={job.id} className="dashboard-queue-item space-y-4 rounded-[16px] border border-[var(--border-subtle)] bg-[rgba(251,248,247,0.92)] p-4">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div className="space-y-1">
                    <strong className="block text-base font-semibold text-[var(--text-primary)]">{job.name}</strong>
                    <span className="text-sm leading-6 text-[var(--text-secondary)]">Live worker events and stage progress for this active survey job.</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="type-badge">{job.type.replaceAll("_", " ")}</span>
                    <Link className={getButtonClass("secondary")} to={`/jobs/${job.id}`}>Open job</Link>
                  </div>
                </div>
                <ProgressTracker jobId={job.id} onComplete={() => undefined} />
              </section>
            ))
          )}
        </Card>
        <Card className="space-y-4 dashboard-section-card">
          <SectionHeader title="AI Insights feed" subtitle="Recent model-generated QA findings across the portfolio." />
          {(stats?.recentInsights ?? []).length === 0 ? (
            <EmptyState compact icon="ai" title="No insights yet" description="Run AI analysis on jobs to populate the feed." />
          ) : (
            (stats?.recentInsights ?? []).map((insight) => (
              <AiInsightCard
                key={insight.id}
                insight={{
                  ...insight,
                  createdAt: String(insight.createdAt),
                  jobId: insight.jobId,
                  metadata: insight.metadata ?? {}
                }}
              />
            ))
          )}
        </Card>
      </div>
    </div>
  );
}
