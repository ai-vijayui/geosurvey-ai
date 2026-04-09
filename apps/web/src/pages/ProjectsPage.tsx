import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { EmptyState } from "../components/feedback/EmptyState";
import { ProjectCreateModal } from "../components/ProjectCreateModal";
import { PrimaryButton, getButtonClass } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { PageHeader } from "../components/ui/PageHeader";
import { SkeletonBlock } from "../components/feedback/SkeletonBlock";
import { StatCard } from "../components/ui/StatCard";
import { apiGet } from "../lib/api";

type ProjectRecord = {
  id: string;
  name: string;
  description?: string | null;
  createdAt: string;
  surveyJobs?: Array<{ id: string; name: string; status: string; type: string }>;
};

function formatDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

export function ProjectsPage() {
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const projectsQuery = useQuery({
    queryKey: ["projects", "list"],
    queryFn: () => apiGet<ProjectRecord[]>("/api/projects")
  });

  const projects = projectsQuery.data ?? [];
  const summary = useMemo(() => ({
    totalProjects: projects.length,
    activeJobs: projects.reduce((sum, project) => sum + (project.surveyJobs ?? []).filter((job) => job.status === "PROCESSING" || job.status === "REVIEW").length, 0),
    totalJobs: projects.reduce((sum, project) => sum + (project.surveyJobs?.length ?? 0), 0)
  }), [projects]);

  return (
    <div className="reference-page">
      <PageHeader
        title="Projects"
        subtitle="Organize every job, upload, and report under a clear project so teams always know what comes next."
        actions={<PrimaryButton onClick={() => setIsCreateOpen(true)}>New Project</PrimaryButton>}
      />

      <div className="jobs-kpi-grid">
        <StatCard label="Projects" value={summary.totalProjects} meta="Active containers for survey delivery" />
        <StatCard label="Jobs in portfolio" value={summary.totalJobs} meta="All mapped workflows across projects" />
        <StatCard label="Active workflows" value={summary.activeJobs} meta="Jobs currently processing or in review" />
        <StatCard label="Workflow health" value={projects.length === 0 ? "0%" : `${Math.round((summary.activeJobs / Math.max(summary.totalJobs, 1)) * 100)}%`} meta="Share of jobs actively moving through the pipeline" />
      </div>

      {projectsQuery.isLoading ? (
        <SkeletonBlock lines={4} />
      ) : projectsQuery.isError ? (
        <EmptyState
          eyebrow="Unavailable"
          title="Projects could not be loaded"
          description="The projects workspace is temporarily unavailable. Retry to restore the portfolio view."
          icon="projects"
          action={<PrimaryButton onClick={() => void projectsQuery.refetch()}>Retry</PrimaryButton>}
        />
      ) : projects.length === 0 ? (
        <EmptyState
          icon="projects"
          title="Create your first project"
          description="Projects anchor the full workflow: jobs, uploads, processing, review, and exports."
          action={<PrimaryButton onClick={() => setIsCreateOpen(true)}>Create project</PrimaryButton>}
        />
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {projects.map((project) => (
            <Card key={project.id} className="space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <strong className="block text-lg font-semibold text-[var(--text-primary)]">{project.name}</strong>
                  <span className="block text-sm leading-6 text-[var(--text-secondary)]">{project.description || "No client or location details yet."}</span>
                </div>
                <span className="status-badge">{formatDate(project.createdAt)}</span>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="ui-metric-tile">
                  <span className="ui-metric-tile__label">Jobs</span>
                  <strong className="ui-metric-tile__value">{project.surveyJobs?.length ?? 0}</strong>
                </div>
                <div className="ui-metric-tile">
                  <span className="ui-metric-tile__label">Active</span>
                  <strong className="ui-metric-tile__value">{(project.surveyJobs ?? []).filter((job) => job.status === "PROCESSING" || job.status === "REVIEW").length}</strong>
                </div>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm text-[var(--text-secondary)]">
                  {(project.surveyJobs ?? []).length === 0 ? "Next: create a job" : "Continue with the latest job workflow"}
                </span>
                <Link className={getButtonClass("secondary")} to={`/jobs?projectId=${project.id}`}>
                  Open jobs
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}

      <ProjectCreateModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
    </div>
  );
}
