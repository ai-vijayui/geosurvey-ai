import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { EmptyState } from "../components/feedback/EmptyState";
import { ProjectCreateModal } from "../components/ProjectCreateModal";
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
    <div className="grid gap-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Projects</h1>
          <p className="max-w-3xl text-sm leading-6 text-slate-500">
            Organize every job, upload, and report under a clear project so teams always know what comes next.
          </p>
        </div>
        <div>
          <button className="button-primary" onClick={() => setIsCreateOpen(true)}>
            New Project
          </button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <span className="block text-xs font-medium uppercase tracking-[0.14em] text-slate-500">Projects</span>
          <strong className="mt-3 block text-3xl font-semibold tracking-tight text-slate-900">{summary.totalProjects}</strong>
          <span className="mt-2 block text-sm leading-6 text-slate-500">Active containers for survey delivery</span>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <span className="block text-xs font-medium uppercase tracking-[0.14em] text-slate-500">Jobs in portfolio</span>
          <strong className="mt-3 block text-3xl font-semibold tracking-tight text-slate-900">{summary.totalJobs}</strong>
          <span className="mt-2 block text-sm leading-6 text-slate-500">All mapped workflows across projects</span>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <span className="block text-xs font-medium uppercase tracking-[0.14em] text-slate-500">Active workflows</span>
          <strong className="mt-3 block text-3xl font-semibold tracking-tight text-slate-900">{summary.activeJobs}</strong>
          <span className="mt-2 block text-sm leading-6 text-slate-500">Jobs currently processing or in review</span>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <span className="block text-xs font-medium uppercase tracking-[0.14em] text-slate-500">Workflow health</span>
          <strong className="mt-3 block text-3xl font-semibold tracking-tight text-slate-900">{projects.length === 0 ? "0%" : `${Math.round((summary.activeJobs / Math.max(summary.totalJobs, 1)) * 100)}%`}</strong>
          <span className="mt-2 block text-sm leading-6 text-slate-500">Share of jobs actively moving through the pipeline</span>
        </div>
      </div>

      {projectsQuery.isLoading ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="h-4 rounded-full bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 bg-[length:220%_100%] animate-[shimmer_1.4s_linear_infinite]" />
          <div className="mt-3 h-4 rounded-full bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 bg-[length:220%_100%] animate-[shimmer_1.4s_linear_infinite]" />
          <div className="mt-3 h-4 rounded-full bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 bg-[length:220%_100%] animate-[shimmer_1.4s_linear_infinite]" />
        </div>
      ) : projectsQuery.isError ? (
        <EmptyState
          eyebrow="Unavailable"
          title="Projects could not be loaded"
          description="The projects workspace is temporarily unavailable. Retry to restore the portfolio view."
          action={<button className="button-primary" onClick={() => void projectsQuery.refetch()}>Retry</button>}
        />
      ) : projects.length === 0 ? (
        <div className="flex min-h-[18rem] flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-slate-50/70 px-6 py-10 text-center">
          <strong className="text-lg font-semibold text-slate-900">Create your first project</strong>
          <span className="mt-2 max-w-xl text-sm leading-6 text-slate-500">Projects anchor the full workflow: jobs, uploads, processing, review, and exports.</span>
          <button className="button-primary mt-5" onClick={() => setIsCreateOpen(true)}>
            Create project
          </button>
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {projects.map((project) => (
            <div key={project.id} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <strong className="block text-lg font-semibold text-slate-900">{project.name}</strong>
                  <span className="block text-sm leading-6 text-slate-500">{project.description || "No client or location details yet."}</span>
                </div>
                <span className="status-badge">{formatDate(project.createdAt)}</span>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3">
                  <span className="block text-xs uppercase tracking-[0.14em] text-slate-500">Jobs</span>
                  <strong className="mt-1 block text-lg font-semibold text-slate-900">{project.surveyJobs?.length ?? 0}</strong>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-3">
                  <span className="block text-xs uppercase tracking-[0.14em] text-slate-500">Active</span>
                  <strong className="mt-1 block text-lg font-semibold text-slate-900">{(project.surveyJobs ?? []).filter((job) => job.status === "PROCESSING" || job.status === "REVIEW").length}</strong>
                </div>
              </div>
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm text-slate-500">
                  {(project.surveyJobs ?? []).length === 0 ? "Next: create a job" : "Continue with the latest job workflow"}
                </span>
                <Link className="table-action" to={`/jobs?projectId=${project.id}`}>
                  Open jobs
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      <ProjectCreateModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
    </div>
  );
}
