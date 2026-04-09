import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { SurveyJob } from "@geosurvey-ai/shared";
import { apiGet } from "../lib/api";

type JobSummary = {
  id: string;
  projectId: string;
  name: string;
  createdAt: string;
};

type ProjectRecord = {
  id: string;
  name: string;
};

function formatDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

export function Reports() {
  const [selectedJob, setSelectedJob] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedDate, setSelectedDate] = useState("");

  const jobsQuery = useQuery({
    queryKey: ["reports", "jobs"],
    queryFn: () => apiGet<JobSummary[]>("/api/jobs?limit=100")
  });
  const projectsQuery = useQuery({
    queryKey: ["reports", "projects"],
    queryFn: () => apiGet<ProjectRecord[]>("/api/projects")
  });
  const reportJobsQuery = useQuery({
    queryKey: ["reports", "job-details", jobsQuery.data?.map((job) => job.id).join(",")],
    queryFn: async () => Promise.all((jobsQuery.data ?? []).map((job) => apiGet<SurveyJob>(`/api/jobs/${job.id}`))),
    enabled: Boolean(jobsQuery.data && jobsQuery.data.length > 0)
  });

  const projectLookup = useMemo(
    () => new Map((projectsQuery.data ?? []).map((project) => [project.id, project.name])),
    [projectsQuery.data]
  );

  const outputRows = useMemo(() => {
    return (reportJobsQuery.data ?? []).flatMap((job) =>
      job.outputs.map((output) => ({
        jobId: job.id,
        jobName: job.name,
        projectName: projectLookup.get(job.projectId) ?? "Unknown project",
        fileName: output.fileName,
        outputType: output.fileType,
        createdAt: output.createdAt
      }))
    );
  }, [projectLookup, reportJobsQuery.data]);

  const filteredOutputs = outputRows.filter((row) => {
    if (selectedJob !== "all" && row.jobId !== selectedJob) {
      return false;
    }
    if (selectedType !== "all" && row.outputType !== selectedType) {
      return false;
    }
    if (selectedDate && !row.createdAt.startsWith(selectedDate)) {
      return false;
    }
    return true;
  });

  const groupedOutputs = filteredOutputs.reduce<Record<string, typeof filteredOutputs>>((groups, row) => {
    groups[row.jobId] = [...(groups[row.jobId] ?? []), row];
    return groups;
  }, {});

  return (
    <div className="page-grid">
      <div className="page-header">
        <div>
          <h1 style={{ margin: 0 }}>Reports</h1>
          <p className="text-muted" style={{ margin: "0.35rem 0 0" }}>
            Browse exported survey artifacts grouped by job, then narrow the list by output type or report date.
          </p>
        </div>
      </div>

      <div className="card stack">
        <div className="filters-row">
          <label className="field">
            <span>Job</span>
            <select value={selectedJob} onChange={(event) => setSelectedJob(event.target.value)}>
              <option value="all">All jobs</option>
              {(jobsQuery.data ?? []).map((job) => (
                <option key={job.id} value={job.id}>
                  {job.name}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>File type</span>
            <select value={selectedType} onChange={(event) => setSelectedType(event.target.value)}>
              <option value="all">All file types</option>
              {Array.from(new Set(outputRows.map((row) => row.outputType))).map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>Date</span>
            <input type="date" value={selectedDate} onChange={(event) => setSelectedDate(event.target.value)} />
          </label>
        </div>
      </div>

      {jobsQuery.isLoading || reportJobsQuery.isLoading ? (
        <div className="card stack">
          <div className="skeleton-line" />
          <div className="skeleton-line" />
          <div className="skeleton-line" />
        </div>
      ) : filteredOutputs.length === 0 ? (
        <div className="empty-panel">
          <strong>No report artifacts found</strong>
          <span className="text-muted">Outputs will appear here after jobs complete processing and generators create downloadable artifacts.</span>
        </div>
      ) : (
        Object.entries(groupedOutputs).map(([jobId, rows]) => (
          <div key={jobId} className="card stack">
            <div className="section-title">
              <div className="stack" style={{ gap: "0.2rem" }}>
                <strong>{rows[0].jobName}</strong>
                <span className="text-muted">{rows[0].projectName}</span>
              </div>
              <span className="text-muted">{rows.length} artifact(s)</span>
            </div>
            {rows.map((row) => (
              <div key={`${row.jobId}-${row.fileName}-${row.createdAt}`} className="list-row">
                <div className="stack" style={{ gap: "0.15rem" }}>
                  <strong>{row.fileName}</strong>
                  <span className="text-muted">{row.outputType} · {formatDate(row.createdAt)}</span>
                </div>
                <button disabled title="Output download endpoint is not exposed by the backend yet">
                  Download unavailable
                </button>
              </div>
            ))}
          </div>
        ))
      )}
    </div>
  );
}
