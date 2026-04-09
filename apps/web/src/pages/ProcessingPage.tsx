import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { ProgressTracker } from "../components/ProgressTracker";
import { EmptyState } from "../components/feedback/EmptyState";
import { getButtonClass, PrimaryButton } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { PageHeader } from "../components/ui/PageHeader";
import { SectionHeader } from "../components/ui/SectionHeader";
import { SkeletonBlock } from "../components/feedback/SkeletonBlock";
import { StatCard } from "../components/ui/StatCard";
import { StatusBadge } from "../components/ui/StatusBadge";
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
  const getStatusTone = (status: string) => status === "REVIEW" ? "warning" : status === "PROCESSING" ? "info" : "default";

  return (
    <div className="reference-page">
      <PageHeader
        title="Processing"
        subtitle="Track live workflow progress from validation through outputs and AI analysis."
        actions={<Link className={getButtonClass("primary")} to="/jobs">New Job</Link>}
      />

      <div className="reference-panel-grid">
        <Card variant="accent" className="space-y-4">
          <span className="reference-chip">Live operations</span>
          <strong className="block text-2xl font-semibold leading-tight text-[var(--text-primary)]">
            {activeJobs.length > 0 ? "Track jobs that are moving right now" : "No work is currently running"}
          </strong>
          <span className="block max-w-2xl text-sm leading-6 text-[var(--text-secondary)]">
            Watch pipeline progress, see what is waiting for review, and jump straight into the active job that needs attention next.
          </span>
          <div className="flex flex-wrap items-center gap-3">
            <Link className={getButtonClass("primary")} to="/jobs">
              Open jobs
            </Link>
            <Link className={getButtonClass("secondary")} to="/reports">
              Open reports
            </Link>
          </div>
        </Card>
        <div className="jobs-kpi-grid">
          <StatCard label="Live jobs" value={activeJobs.length} meta="Jobs currently moving through the pipeline" />
          <StatCard label="In review" value={reviewJobs.length} meta="Jobs waiting for operator validation" />
          <StatCard label="Queued inputs" value={queuedInputs} meta="Input files attached to active jobs" />
          <StatCard label="Workflow focus" value={activeJobs.length > 0 ? "Live" : "Idle"} meta="The processing board updates as worker events stream in" />
        </div>
      </div>

      {jobsQuery.isLoading ? (
        <SkeletonBlock lines={4} />
      ) : jobsQuery.isError ? (
        <EmptyState
          eyebrow="Unavailable"
          title="Processing status is unavailable"
          description="The live processing board could not load. Retry to restore the current queue and worker progress."
          icon="processing"
          action={<PrimaryButton onClick={() => void jobsQuery.refetch()}>Retry</PrimaryButton>}
        />
      ) : activeJobs.length === 0 ? (
        <EmptyState
          eyebrow="Pipeline"
          title="No processing jobs right now"
          description="Create or open a job, upload files, then start processing to watch live workflow progress here."
          icon="processing"
          action={<Link className={getButtonClass("primary")} to="/jobs">Open jobs</Link>}
        />
      ) : (
        <div className="space-y-4">
          {activeJobs.map((job) => (
            <Card key={job.id} className="space-y-4">
              <SectionHeader
                title={job.name}
                subtitle={`${job.type.replaceAll("_", " ")} workflow`}
                action={<div className="flex flex-wrap items-center gap-2"><StatusBadge label={job.status} tone={getStatusTone(job.status)} /><Link className={getButtonClass("secondary")} to={`/jobs/${job.id}`}>Open job</Link></div>}
              />
              <ProgressTracker jobId={job.id} onComplete={() => undefined} />
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
