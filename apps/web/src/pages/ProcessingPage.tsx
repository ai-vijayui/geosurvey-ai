import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { ProgressTracker } from "../components/ProgressTracker";
import { EmptyState } from "../components/feedback/EmptyState";
import { apiGet, type PaginatedResponse } from "../lib/api";

type ProcessingJob = {
  id: string;
  name: string;
  projectId: string;
  type: string;
  status: string;
  inputFiles?: Array<{ id: string }>;
};

export function ProcessingPage() {
  const jobsQuery = useQuery({
    queryKey: ["processing", "jobs"],
    queryFn: () => apiGet<PaginatedResponse<ProcessingJob[]>>("/api/jobs?limit=12")
  });

  const jobs = jobsQuery.data?.data ?? [];
  const activeJobs = jobs.filter((job) => job.status === "PROCESSING" || job.status === "REVIEW");
  const reviewJobs = jobs.filter((job) => job.status === "REVIEW");
  const queuedInputs = activeJobs.reduce((sum, job) => sum + (job.inputFiles?.length ?? 0), 0);

  return (
    <div className="reference-page">
      <div className="reference-page-header">
        <div className="reference-page-header__copy">
          <h1>Processing</h1>
          <p>
            Track live workflow progress from validation through outputs and AI analysis.
          </p>
        </div>
        <Link className="button-primary dashboard-cta-link" to="/jobs">
          New Job
        </Link>
      </div>

      <div className="reference-panel-grid">
        <div className="reference-card reference-card--accent space-y-4">
          <span className="reference-chip">Live operations</span>
          <strong className="block text-2xl font-semibold leading-tight text-slate-900">
            {activeJobs.length > 0 ? "Track jobs that are moving right now" : "No work is currently running"}
          </strong>
          <span className="block max-w-2xl text-sm leading-6 text-slate-500">
            Watch pipeline progress, see what is waiting for review, and jump straight into the active job that needs attention next.
          </span>
          <div className="flex flex-wrap items-center gap-3">
            <Link className="button-primary dashboard-cta-link" to="/jobs">
              Open jobs
            </Link>
            <Link className="table-action" to="/reports">
              Open reports
            </Link>
          </div>
        </div>
        <div className="reference-metrics">
          <div className="reference-metric">
            <span className="reference-metric__label">Live jobs</span>
            <strong className="reference-metric__value">{activeJobs.length}</strong>
            <span className="reference-metric__meta">Jobs currently moving through the pipeline</span>
          </div>
          <div className="reference-metric">
            <span className="reference-metric__label">In review</span>
            <strong className="reference-metric__value">{reviewJobs.length}</strong>
            <span className="reference-metric__meta">Jobs waiting for operator validation</span>
          </div>
          <div className="reference-metric">
            <span className="reference-metric__label">Queued inputs</span>
            <strong className="reference-metric__value">{queuedInputs}</strong>
            <span className="reference-metric__meta">Input files attached to active jobs</span>
          </div>
          <div className="reference-metric">
            <span className="reference-metric__label">Workflow focus</span>
            <strong className="reference-metric__value">{activeJobs.length > 0 ? "Live" : "Idle"}</strong>
            <span className="reference-metric__meta">The processing board updates as worker events stream in</span>
          </div>
        </div>
      </div>

      {jobsQuery.isLoading ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="space-y-3">
            <div className="h-4 rounded-full bg-slate-200/80" />
            <div className="h-4 rounded-full bg-slate-200/70" />
            <div className="h-4 rounded-full bg-slate-200/60" />
          </div>
        </div>
      ) : jobsQuery.isError ? (
        <EmptyState
          eyebrow="Unavailable"
          title="Processing status is unavailable"
          description="The live processing board could not load. Retry to restore the current queue and worker progress."
          action={<button className="button-primary" onClick={() => void jobsQuery.refetch()}>Retry</button>}
        />
      ) : activeJobs.length === 0 ? (
        <EmptyState
          eyebrow="Pipeline"
          title="No processing jobs right now"
          description="Create or open a job, upload files, then start processing to watch live workflow progress here."
          action={<Link className="button-primary dashboard-cta-link" to="/jobs">Open jobs</Link>}
        />
      ) : (
        <div className="space-y-4">
          {activeJobs.map((job) => (
            <section key={job.id} className="reference-card space-y-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div className="space-y-1">
                  <strong className="block text-lg font-semibold text-slate-900">{job.name}</strong>
                  <span className="block text-sm leading-6 text-slate-500">{job.type.replaceAll("_", " ")} workflow</span>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-600">
                    {job.status}
                  </span>
                  <Link className="table-action" to={`/jobs/${job.id}`}>
                    Open job
                  </Link>
                </div>
              </div>
              <ProgressTracker jobId={job.id} onComplete={() => undefined} />
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
