import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useLocation, useNavigate } from "react-router-dom";
import type { SurveyType } from "@geosurvey-ai/shared";
import { ProjectCreateModal } from "../components/ProjectCreateModal";
import { EmptyState } from "../components/feedback/EmptyState";
import { useNotifications } from "../context/NotificationContext";
import { apiGet, apiPost, type PaginatedResponse } from "../lib/api";

type JobRecord = {
  id: string;
  projectId: string;
  name: string;
  status: string;
  type: SurveyType;
  createdAt: string;
  updatedAt: string;
  pointCount?: number;
  accuracyRmse?: number;
  inputFiles?: Array<{ id: string }>;
  outputs?: Array<{ id: string }>;
};

type ProjectRecord = {
  id: string;
  name: string;
  description?: string | null;
  surveyJobs?: Array<{ id: string }>;
};

type NewJobForm = {
  projectId: string;
  name: string;
  type: SurveyType;
};

const surveyTypes: Array<{ value: SurveyType; label: string; helper: string }> = [
  { value: "GNSS_TRAVERSE", label: "GNSS Traverse", helper: "Best for control points, traverses, and high-accuracy field surveys." },
  { value: "LIDAR", label: "LiDAR", helper: "Point clouds, terrain capture, and large area scanning workflows." },
  { value: "DRONE_PHOTOGRAMMETRY", label: "Drone Photogrammetry", helper: "Imagery-based mapping, orthomosaics, and surface models." },
  { value: "TOTAL_STATION", label: "Total Station", helper: "Structured topographic and construction survey workflows." },
  { value: "HYBRID", label: "Hybrid", helper: "Blend multiple field data sources into one review workflow." }
];
const jobStatuses = ["all", "PENDING", "PROCESSING", "REVIEW", "COMPLETED", "FAILED"] as const;
const lastProjectStorageKey = "geosurvey_last_project_id";

function formatDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

function formatSurveyType(type: SurveyType) {
  return type.replaceAll("_", " ");
}

function getStatusTone(status: string) {
  return status === "FAILED" ? "status-danger" : "";
}

function getWorkflowCopy(projectCount: number, jobCount: number) {
  if (projectCount === 0) {
    return {
      title: "Start with a project",
      body: "Projects give every upload, job, report, and AI review a clear place to live.",
      cta: "Create project"
    };
  }
  if (jobCount === 0) {
    return {
      title: "Create a job to start surveying",
      body: "Once a project exists, create a job to upload source files and begin processing.",
      cta: "Create job"
    };
  }
  return {
    title: "Keep the workflow moving",
    body: "Open a job to upload files, run processing, review the map, and export outputs.",
    cta: "Create another job"
  };
}

export function JobList() {
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const { addNotification } = useNotifications();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<(typeof jobStatuses)[number]>("all");
  const [typeFilter, setTypeFilter] = useState<SurveyType | "all">("all");
  const [projectFilter, setProjectFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [form, setForm] = useState<NewJobForm>({ projectId: "", name: "", type: "GNSS_TRAVERSE" });
  const [createError, setCreateError] = useState<string | null>(null);

  const jobsQuery = useQuery({
    queryKey: ["jobs", "list", page, statusFilter, typeFilter, projectFilter],
    queryFn: () =>
      apiGet<PaginatedResponse<JobRecord[]>>(
        `/api/jobs?page=${page}&limit=12${statusFilter !== "all" ? `&status=${statusFilter}` : ""}${typeFilter !== "all" ? `&type=${typeFilter}` : ""}${projectFilter !== "all" ? `&projectId=${projectFilter}` : ""}`
      )
  });
  const projectsQuery = useQuery({
    queryKey: ["projects", "list"],
    queryFn: () => apiGet<ProjectRecord[]>("/api/projects")
  });

  const projectLookup = useMemo(
    () => new Map((projectsQuery.data ?? []).map((project) => [project.id, project.name])),
    [projectsQuery.data]
  );

  const filteredJobs = useMemo(() => {
    return (jobsQuery.data?.data ?? []).filter((job) => {
      if (search.trim()) {
        const haystack = `${job.name} ${projectLookup.get(job.projectId) ?? ""} ${job.type} ${job.status}`.toLowerCase();
        if (!haystack.includes(search.trim().toLowerCase())) {
          return false;
        }
      }
      return true;
    });
  }, [jobsQuery.data, projectLookup, search]);

  const summary = useMemo(() => {
    const jobs = jobsQuery.data?.data ?? [];
    return {
      total: jobsQuery.data?.pagination.total ?? jobs.length,
      active: jobs.filter((job) => job.status === "PROCESSING" || job.status === "REVIEW").length,
      completed: jobs.filter((job) => job.status === "COMPLETED").length,
      totalPoints: jobs.reduce((sum, job) => sum + (job.pointCount ?? 0), 0)
    };
  }, [jobsQuery.data]);

  const createJob = useMutation({
    mutationFn: () =>
      apiPost<JobRecord>("/api/jobs", {
        projectId: form.projectId,
        name: form.name.trim(),
        type: form.type
      }),
    onSuccess: async (job) => {
      await queryClient.invalidateQueries({ queryKey: ["jobs"] });
      setCreateError(null);
      setIsModalOpen(false);
      if (typeof window !== "undefined") {
        window.localStorage.setItem(lastProjectStorageKey, form.projectId);
      }
      setForm({ projectId: "", name: "", type: "GNSS_TRAVERSE" });
      addNotification({
        title: "Job created",
        message: `${job.name} is ready for uploads and processing.`,
        tone: "success",
        href: `/jobs/${job.id}`,
        source: "jobs"
      });
      navigate(`/jobs/${job.id}`);
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : "We couldn't create the job. Check the details and try again.";
      setCreateError(message);
      addNotification({
        title: "Job creation failed",
        message,
        tone: "error",
        source: "jobs"
      });
    }
  });

  const projects = projectsQuery.data ?? [];
  const pagination = jobsQuery.data?.pagination;
  const totalPages = pagination ? Math.max(1, Math.ceil(pagination.total / pagination.limit)) : 1;
  const workflowCopy = getWorkflowCopy(projects.length, summary.total);
  const selectedType = surveyTypes.find((type) => type.value === form.type);

  function openNewJobModal() {
    setCreateError(null);
    if (projects.length === 0) {
      setIsCreateProjectOpen(true);
      return;
    }
    const params = new URLSearchParams(location.search);
    const requestedProject = params.get("projectId");
    const rememberedProject = typeof window !== "undefined" ? window.localStorage.getItem(lastProjectStorageKey) : null;
    const preferredProject = requestedProject && projects.some((project) => project.id === requestedProject)
      ? requestedProject
      : rememberedProject && projects.some((project) => project.id === rememberedProject)
        ? rememberedProject
        : projects[0]?.id ?? "";
    setForm((current) => ({ ...current, projectId: preferredProject }));
    setIsModalOpen(true);
  }

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const requestedSearch = params.get("q");
    const requestedProject = params.get("projectId");
    if (requestedSearch) {
      setSearch(requestedSearch);
    }
    if (requestedProject) {
      setProjectFilter(requestedProject);
    }
    if ((params.get("tourModal") === "create" || params.get("createJob") === "1") && projectsQuery.isSuccess) {
      openNewJobModal();
    }
  }, [location.search, projectsQuery.isSuccess]);

  useEffect(() => {
    if (projects.length === 0) {
      return;
    }
    const rememberedProject = typeof window !== "undefined" ? window.localStorage.getItem(lastProjectStorageKey) : null;
    const fallbackProject = rememberedProject && projects.some((project) => project.id === rememberedProject) ? rememberedProject : projects[0]?.id ?? "";
    setForm((current) => ({ ...current, projectId: current.projectId || fallbackProject }));
  }, [projects]);

  function updateFilters(resetPage = true, updater: () => void) {
    updater();
    if (resetPage) {
      setPage(1);
    }
  }

  return (
    <div className="reference-page">
      <div className="reference-page-header">
        <div className="reference-page-header__copy">
          <h1>Jobs</h1>
          <p>
            Move from project setup to upload, processing, review, and export without losing your place.
          </p>
        </div>
        <div className="reference-actions">
          <Link className="button-secondary" to="/projects">
            View projects
          </Link>
          <button className="button-primary" onClick={openNewJobModal}>
            New Job
          </button>
        </div>
      </div>

      <div className="reference-panel-grid">
        <div className="reference-card reference-card--accent space-y-4">
          <span className="reference-chip">Next action</span>
          <strong className="block text-2xl font-semibold leading-tight text-slate-900">{workflowCopy.title}</strong>
          <span className="block max-w-2xl text-sm leading-6 text-slate-500">{workflowCopy.body}</span>
          <div className="flex flex-wrap items-center gap-3">
            <button className="button-primary" onClick={openNewJobModal}>
              {workflowCopy.cta}
            </button>
            <Link className="button-secondary" to="/processing">
              View processing
            </Link>
          </div>
        </div>
        <div className="reference-metrics">
          <div className="reference-metric">
            <span className="reference-metric__label">Total jobs</span>
            <strong className="reference-metric__value">{summary.total}</strong>
            <span className="reference-metric__meta">All jobs in the current queue</span>
          </div>
          <div className="reference-metric">
            <span className="reference-metric__label">Active workflow</span>
            <strong className="reference-metric__value">{summary.active}</strong>
            <span className="reference-metric__meta">Jobs currently processing or under review</span>
          </div>
          <div className="reference-metric">
            <span className="reference-metric__label">Completed jobs</span>
            <strong className="reference-metric__value">{summary.completed}</strong>
            <span className="reference-metric__meta">Finished surveys ready for export</span>
          </div>
          <div className="reference-metric">
            <span className="reference-metric__label">Imported points</span>
            <strong className="reference-metric__value">{summary.totalPoints.toLocaleString()}</strong>
            <span className="reference-metric__meta">Total point volume across visible jobs</span>
          </div>
        </div>
      </div>

      <div className="reference-card space-y-4">
        <div className="reference-filter-bar">
          <label className="grid gap-2 text-sm text-slate-600">
            <span>Search</span>
            <input className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-slate-300 focus:ring-2 focus:ring-emerald-500/20" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search job, project, type, or status" />
          </label>

          <label className="grid gap-2 text-sm text-slate-600">
            <span>Status</span>
            <select
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-slate-300 focus:ring-2 focus:ring-emerald-500/20"
              value={statusFilter}
              onChange={(event) => updateFilters(true, () => setStatusFilter(event.target.value as (typeof jobStatuses)[number]))}
            >
              {jobStatuses.map((status) => (
                <option key={status} value={status}>
                  {status === "all" ? "All statuses" : status}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-2 text-sm text-slate-600">
            <span>Survey type</span>
            <select className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-slate-300 focus:ring-2 focus:ring-emerald-500/20" value={typeFilter} onChange={(event) => updateFilters(true, () => setTypeFilter(event.target.value as SurveyType | "all"))}>
              <option value="all">All types</option>
              {surveyTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-2 text-sm text-slate-600">
            <span>Project</span>
            <select className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition focus:border-slate-300 focus:ring-2 focus:ring-emerald-500/20" value={projectFilter} onChange={(event) => updateFilters(true, () => setProjectFilter(event.target.value))}>
              <option value="all">All projects</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <span className="text-sm text-slate-500">
            Showing {filteredJobs.length} of {pagination?.total ?? filteredJobs.length} jobs
          </span>
          <button
            className="button-secondary"
            onClick={() => {
              setSearch("");
              setStatusFilter("all");
              setTypeFilter("all");
              setProjectFilter("all");
              setPage(1);
            }}
          >
            Reset filters
          </button>
        </div>
      </div>

      <div className="reference-card reference-table-card">
        {jobsQuery.isLoading ? (
          <div>
            <div className="h-4 rounded-full bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 bg-[length:220%_100%] animate-[shimmer_1.4s_linear_infinite]" />
            <div className="mt-3 h-4 rounded-full bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 bg-[length:220%_100%] animate-[shimmer_1.4s_linear_infinite]" />
            <div className="mt-3 h-4 rounded-full bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 bg-[length:220%_100%] animate-[shimmer_1.4s_linear_infinite]" />
          </div>
        ) : jobsQuery.isError || projectsQuery.isError ? (
          <EmptyState
            eyebrow="Unavailable"
            title="Jobs could not be loaded"
            description="The job workspace is temporarily unavailable. Retry loading jobs before creating or opening workflows."
            action={<button className="button-primary" onClick={() => { void jobsQuery.refetch(); void projectsQuery.refetch(); }}>Retry</button>}
          />
        ) : filteredJobs.length === 0 ? (
          <div className="flex min-h-[18rem] flex-col items-center justify-center rounded-3xl border border-dashed border-slate-200 bg-slate-50/70 px-6 py-10 text-center">
            <strong className="text-lg font-semibold text-slate-900">{projects.length === 0 ? "Create a project to start surveying" : (pagination?.total ?? 0) > 0 ? "No jobs match the current filters" : "Create a job to start surveying"}</strong>
            <span className="mt-2 max-w-2xl text-sm leading-6 text-slate-500">
              {projects.length === 0
                ? "Projects are required before jobs can be created. Start there and the job workflow will continue automatically."
                : (jobsQuery.data?.data?.length ?? 0) > 0 || (pagination?.total ?? 0) > 0
                  ? "Clear one or more filters to see the full workflow queue."
                  : "Create a job, upload survey files, run processing, then review map results and AI insights."}
            </span>
            <button className="button-primary mt-5" onClick={projects.length === 0 ? () => setIsCreateProjectOpen(true) : openNewJobModal}>
              {projects.length === 0 ? "Create project" : (jobsQuery.data?.data?.length ?? 0) > 0 || (pagination?.total ?? 0) > 0 ? "Create another job" : "Create first job"}
            </button>
          </div>
        ) : (
          <div className="reference-table-shell">
            <div className="job-mobile-cards">
              {filteredJobs.map((job) => {
                const inputCount = job.inputFiles?.length ?? 0;
                const outputCount = job.outputs?.length ?? 0;
                const nextAction = inputCount === 0 ? "Upload files" : job.status === "PENDING" ? "Start processing" : job.status === "PROCESSING" ? "Monitor progress" : job.status === "REVIEW" ? "Review insights" : outputCount > 0 ? "Download outputs" : "Open job";

                return (
                  <article key={job.id} className="job-mobile-card">
                    <div className="job-mobile-card__header">
                      <div className="space-y-1">
                        <strong className="block text-sm font-semibold text-slate-900">{job.name}</strong>
                        <span className="text-xs text-slate-500">{projectLookup.get(job.projectId) ?? "Unassigned project"}</span>
                      </div>
                      <span className={`status-badge ${getStatusTone(job.status)}`.trim()}>{job.status}</span>
                    </div>

                    <div className="job-mobile-card__grid">
                      <div>
                        <span className="job-mobile-card__label">Survey type</span>
                        <strong>{formatSurveyType(job.type)}</strong>
                      </div>
                      <div>
                        <span className="job-mobile-card__label">Created</span>
                        <strong>{formatDate(job.createdAt)}</strong>
                      </div>
                      <div>
                        <span className="job-mobile-card__label">Points</span>
                        <strong>{job.pointCount?.toLocaleString() ?? "-"}</strong>
                      </div>
                      <div>
                        <span className="job-mobile-card__label">RMSE</span>
                        <strong>{job.accuracyRmse ? `${job.accuracyRmse.toFixed(2)} m` : "-"}</strong>
                      </div>
                    </div>

                    <div className="job-mobile-card__footer">
                      <div className="space-y-1">
                        <span className="job-mobile-card__label">Workflow</span>
                        <strong>{nextAction}</strong>
                        <span className="text-xs text-slate-500">{inputCount} input / {outputCount} output</span>
                      </div>
                      <Link className="table-action" to={`/jobs/${job.id}`}>
                        Open
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
            <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead>
                <tr className="bg-slate-50">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Job</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Project</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Survey type</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Created</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Points</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">RMSE</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Workflow</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.14em] text-slate-500" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {filteredJobs.map((job) => {
                  const inputCount = job.inputFiles?.length ?? 0;
                  const outputCount = job.outputs?.length ?? 0;
                  const nextAction = inputCount === 0 ? "Upload files" : job.status === "PENDING" ? "Start processing" : job.status === "PROCESSING" ? "Monitor progress" : job.status === "REVIEW" ? "Review insights" : outputCount > 0 ? "Download outputs" : "Open job";

                  return (
                    <tr key={job.id} className="align-top">
                      <td className="px-4 py-4">
                        <div className="space-y-1">
                          <strong className="block text-sm font-semibold text-slate-900">{job.name}</strong>
                          <span className="text-xs text-slate-500">Updated {formatDate(job.updatedAt)}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-slate-600">{projectLookup.get(job.projectId) ?? "Unassigned project"}</td>
                      <td className="px-4 py-4 text-sm text-slate-600">{formatSurveyType(job.type)}</td>
                      <td className="px-4 py-4">
                        <span className={`status-badge ${getStatusTone(job.status)}`.trim()}>{job.status}</span>
                      </td>
                      <td className="px-4 py-4 text-sm text-slate-600">{formatDate(job.createdAt)}</td>
                      <td className="px-4 py-4 text-sm text-slate-600">{job.pointCount?.toLocaleString() ?? "-"}</td>
                      <td className="px-4 py-4 text-sm text-slate-600">{job.accuracyRmse ? `${job.accuracyRmse.toFixed(2)} m` : "-"}</td>
                      <td className="px-4 py-4">
                        <div className="space-y-1">
                          <span className="block text-sm text-slate-600">{nextAction}</span>
                          <span className="block text-xs text-slate-500">{inputCount} input / {outputCount} output</span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <Link className="table-action" to={`/jobs/${job.id}`}>
                          Open
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            </div>
          </div>
        )}
      </div>

      <div className="reference-pagination">
        <span className="text-sm text-slate-500">
          Page {page} of {totalPages}
        </span>
        <div className="flex items-center gap-2">
          <button disabled={page <= 1 || jobsQuery.isFetching} onClick={() => setPage((current) => Math.max(1, current - 1))}>
            Previous
          </button>
          <button
            disabled={page >= totalPages || jobsQuery.isFetching}
            onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
          >
            Next
          </button>
        </div>
      </div>

      {isModalOpen ? (
        <div className="modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="modal-card" onClick={(event) => event.stopPropagation()}>
            <div className="section-title">
              <div className="stack" style={{ gap: "0.2rem" }}>
                <strong>Create job</strong>
                <span className="text-muted">Choose a project, name the job, and continue directly into uploads.</span>
              </div>
              <button className="icon-button" onClick={() => setIsModalOpen(false)}>
                Close
              </button>
            </div>

            <div className="form-grid">
              <label className="field">
                <span>Project</span>
                <select value={form.projectId} onChange={(event) => setForm((current) => ({ ...current, projectId: event.target.value }))}>
                  <option value="">Select project</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="field field-wide">
                <span>Job name</span>
                <input
                  autoFocus
                  value={form.name}
                  onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                  placeholder="South boundary traverse"
                />
              </label>
            </div>

            <div className="stack" style={{ gap: "0.5rem" }}>
              <span>Survey type</span>
              <div className="chip-grid">
                {surveyTypes.map((type) => (
              <button
                    key={type.value}
                    type="button"
                    className={`selection-chip${form.type === type.value ? " active" : ""}`}
                    onClick={() => setForm((current) => ({ ...current, type: type.value }))}
                  >
                    <strong>{type.label}</strong>
                    <span className="text-muted">{type.helper}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="inline-note">
              {selectedType?.helper} Next step after creation: upload survey files so processing can begin immediately.
            </div>

            {projects.length === 0 ? (
              <div className="empty-panel compact-empty">
                <strong>Create a project first</strong>
                <span className="text-muted">Jobs can only be created inside a project. Create one now and we'll keep you in this flow.</span>
                <button className="button-primary" onClick={() => setIsCreateProjectOpen(true)}>
                  Create project
                </button>
              </div>
            ) : null}

            {form.projectId ? (
              <div className="stats-grid">
                <div className="stat-chip">
                  <span className="text-muted">Selected project</span>
                  <strong>{projectLookup.get(form.projectId) ?? "Unknown project"}</strong>
                </div>
                <div className="stat-chip">
                  <span className="text-muted">Existing jobs in project</span>
                  <strong>{projects.find((project) => project.id === form.projectId)?.surveyJobs?.length ?? 0}</strong>
                </div>
                <div className="stat-chip">
                  <span className="text-muted">Next step after create</span>
                  <strong>Upload files</strong>
                </div>
              </div>
            ) : null}

            {createError ? <div className="error-text">{createError}</div> : null}

            <div className="row" style={{ justifyContent: "flex-end" }}>
              <button className="button-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
              <button
                className="button-primary"
                disabled={!form.projectId || !form.name.trim() || createJob.isPending || projects.length === 0}
                onClick={() => createJob.mutate()}
              >
                {createJob.isPending ? "Creating..." : "Create job"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      <ProjectCreateModal
        isOpen={isCreateProjectOpen}
        onClose={() => setIsCreateProjectOpen(false)}
        onCreated={(project) => {
          if (typeof window !== "undefined") {
            window.localStorage.setItem(lastProjectStorageKey, project.id);
          }
          setForm((current) => ({ ...current, projectId: project.id }));
          setIsModalOpen(true);
        }}
      />
    </div>
  );
}
