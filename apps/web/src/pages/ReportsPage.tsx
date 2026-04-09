import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { InputFile, OutputFile, SurveyJob } from "@geosurvey-ai/shared";
import { Link } from "react-router-dom";
import { JobVisualSummary } from "../components/JobVisualSummary";
import { EmptyState } from "../components/feedback/EmptyState";
import { SkeletonBlock } from "../components/feedback/SkeletonBlock";
import { useNotifications } from "../context/NotificationContext";
import { getButtonClass, PrimaryButton, SecondaryButton } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { FilterBar } from "../components/ui/FilterBar";
import { SearchInput, SelectField } from "../components/ui/Fields";
import { PageHeader } from "../components/ui/PageHeader";
import { SectionHeader } from "../components/ui/SectionHeader";
import { StatCard } from "../components/ui/StatCard";
import { apiGet, type PaginatedResponse } from "../lib/api";

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

type ArtifactRow = {
  artifactId: string;
  artifactKind: "Input" | "Output";
  jobId: string;
  jobName: string;
  projectName: string;
  fileName: string;
  artifactType: string;
  createdAt: string;
  sizeBytes: number;
  downloadPath?: string;
};

function formatDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

function formatFileSize(sizeBytes: number) {
  if (sizeBytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(sizeBytes / 1024))} KB`;
  }
  return `${(sizeBytes / (1024 * 1024)).toFixed(2)} MB`;
}

function formatLabel(value: string) {
  return value.replaceAll("_", " ");
}

export function ReportsPage() {
  const { addNotification } = useNotifications();
  const [selectedJob, setSelectedJob] = useState("all");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedKind, setSelectedKind] = useState<"all" | "Input" | "Output">("all");
  const [selectedDate, setSelectedDate] = useState("");
  const [search, setSearch] = useState("");

  const jobsQuery = useQuery({
    queryKey: ["reports", "jobs"],
    queryFn: () => apiGet<PaginatedResponse<JobSummary[]>>("/api/jobs?limit=100")
  });
  const projectsQuery = useQuery({
    queryKey: ["reports", "projects"],
    queryFn: () => apiGet<ProjectRecord[]>("/api/projects")
  });
  const reportJobsQuery = useQuery({
    queryKey: ["reports", "job-details", jobsQuery.data?.data?.map((job) => job.id).join(",")],
    queryFn: async () => Promise.all((jobsQuery.data?.data ?? []).map((job) => apiGet<SurveyJob>(`/api/jobs/${job.id}`))),
    enabled: Boolean(jobsQuery.data?.data && jobsQuery.data.data.length > 0)
  });

  const projectLookup = useMemo(
    () => new Map((projectsQuery.data ?? []).map((project) => [project.id, project.name])),
    [projectsQuery.data]
  );

  const artifactRows = useMemo(() => {
    return (reportJobsQuery.data ?? []).flatMap((job) => {
      const projectName = projectLookup.get(job.projectId) ?? "Unknown project";

      const inputs = job.inputFiles.map((file: InputFile) => ({
        artifactId: file.id,
        artifactKind: "Input" as const,
        jobId: job.id,
        jobName: job.name,
        projectName,
        fileName: file.fileName,
        artifactType: file.fileType,
        createdAt: file.uploadedAt,
        sizeBytes: file.sizeBytes,
        downloadPath: `/api/jobs/${job.id}/download/${file.id}`
      }));

      const outputs = job.outputs.map((file: OutputFile) => ({
        artifactId: file.id,
        artifactKind: "Output" as const,
        jobId: job.id,
        jobName: job.name,
        projectName,
        fileName: file.fileName,
        artifactType: file.fileType,
        createdAt: file.createdAt,
        sizeBytes: file.sizeBytes,
        downloadPath: `/api/jobs/${job.id}/download/${file.id}`
      }));

      return [...outputs, ...inputs];
    });
  }, [projectLookup, reportJobsQuery.data]);

  const jobsById = useMemo(
    () => new Map((reportJobsQuery.data ?? []).map((job) => [job.id, job])),
    [reportJobsQuery.data]
  );

  const filteredArtifacts = useMemo(() => {
    return artifactRows.filter((row) => {
      if (selectedJob !== "all" && row.jobId !== selectedJob) {
        return false;
      }
      if (selectedKind !== "all" && row.artifactKind !== selectedKind) {
        return false;
      }
      if (selectedType !== "all" && row.artifactType !== selectedType) {
        return false;
      }
      if (selectedDate && !row.createdAt.startsWith(selectedDate)) {
        return false;
      }
      if (search.trim()) {
        const haystack = `${row.fileName} ${row.jobName} ${row.projectName} ${row.artifactType}`.toLowerCase();
        if (!haystack.includes(search.trim().toLowerCase())) {
          return false;
        }
      }
      return true;
    });
  }, [artifactRows, search, selectedDate, selectedJob, selectedKind, selectedType]);

  const groupedArtifacts = filteredArtifacts.reduce<Record<string, ArtifactRow[]>>((groups, row) => {
    groups[row.jobId] = [...(groups[row.jobId] ?? []), row];
    return groups;
  }, {});

  async function openArtifact(path: string) {
    try {
      const payload = await apiGet<{ url: string }>(path);
      window.open(payload.url, "_blank", "noopener,noreferrer");
    } catch (error) {
      addNotification({
        title: "Download unavailable",
        message: error instanceof Error ? error.message : "Unable to open the download link.",
        tone: "error",
        source: "reports"
      });
    }
  }

  return (
    <div className="reference-page">
      <PageHeader
        title="Reports"
        subtitle="Browse the artifact inventory across jobs, including generated outputs and retained source files."
        actions={<Link className={getButtonClass("primary")} to="/jobs?createJob=1">Create Job</Link>}
      />

      <div className="reference-panel-grid">
        <Card variant="accent" className="space-y-4">
          <span className="reference-chip">Artifact library</span>
          <strong className="block text-2xl font-semibold leading-tight text-[var(--text-primary)]">Review uploads and exports from one searchable workspace.</strong>
          <span className="block max-w-2xl text-sm leading-6 text-[var(--text-secondary)]">
            Filter by job, file type, artifact kind, and date so field teams can find the right deliverable quickly on desktop or mobile.
          </span>
        </Card>
        <div className="jobs-kpi-grid">
          <StatCard label="Artifacts in view" value={filteredArtifacts.length} meta="All files matching the current filters" />
          <StatCard label="Generated outputs" value={artifactRows.filter((row) => row.artifactKind === "Output").length} meta="Exports ready for review or download" />
          <StatCard label="Source files retained" value={artifactRows.filter((row) => row.artifactKind === "Input").length} meta="Original uploads still available in storage" />
          <StatCard label="Jobs represented" value={Object.keys(groupedArtifacts).length} meta="Jobs currently represented in the artifact library" />
        </div>
      </div>

      <FilterBar
        footer={<SecondaryButton onClick={() => { setSelectedJob("all"); setSelectedType("all"); setSelectedKind("all"); setSelectedDate(""); setSearch(""); }}>Reset filters</SecondaryButton>}
      >
        <SearchInput value={search} onChange={(event) => setSearch(event.target.value)} label="Search" placeholder="Search artifact, job, project, or type" />
        <SelectField label="Job" value={selectedJob} onChange={(event) => setSelectedJob(event.target.value)}>
          <option value="all">All jobs</option>
          {(jobsQuery.data?.data ?? []).map((job) => (
            <option key={job.id} value={job.id}>
              {job.name}
            </option>
          ))}
        </SelectField>
        <SelectField label="Artifact kind" value={selectedKind} onChange={(event) => setSelectedKind(event.target.value as "all" | "Input" | "Output")}>
          <option value="all">All artifacts</option>
          <option value="Output">Outputs</option>
          <option value="Input">Inputs</option>
        </SelectField>
        <SelectField label="Type" value={selectedType} onChange={(event) => setSelectedType(event.target.value)}>
          <option value="all">All types</option>
          {Array.from(new Set(artifactRows.map((row) => row.artifactType))).sort().map((type) => (
            <option key={type} value={type}>
              {formatLabel(type)}
            </option>
          ))}
        </SelectField>
        <label className="ui-field">
          <span className="ui-field__label">Date</span>
          <input className="ui-input" type="date" value={selectedDate} onChange={(event) => setSelectedDate(event.target.value)} />
        </label>
      </FilterBar>

      {jobsQuery.isLoading || reportJobsQuery.isLoading ? (
        <SkeletonBlock lines={4} />
      ) : jobsQuery.isError || projectsQuery.isError || reportJobsQuery.isError ? (
        <EmptyState
          eyebrow="Unavailable"
          title="Reports could not be loaded"
          description="The artifact inventory is temporarily unavailable. Retry to restore uploads, outputs, and download actions."
          icon="reports"
          action={<PrimaryButton onClick={() => { void jobsQuery.refetch(); void projectsQuery.refetch(); void reportJobsQuery.refetch(); }}>Retry</PrimaryButton>}
        />
      ) : artifactRows.length === 0 ? (
        <EmptyState
          title="No artifacts found"
          description="Outputs and uploaded source files will appear here as the workflow progresses. Create a job, upload files, and start processing to populate this inventory."
          icon="reports"
          action={<Link className={getButtonClass("primary")} to="/jobs?createJob=1">Create Job</Link>}
        />
      ) : filteredArtifacts.length === 0 ? (
        <EmptyState
          eyebrow="Filters"
          title="No artifacts match the current filters"
          description="Try clearing one or more filters or search terms to see the full artifact library again."
          icon="search"
          action={<PrimaryButton onClick={() => { setSelectedJob("all"); setSelectedType("all"); setSelectedKind("all"); setSelectedDate(""); setSearch(""); }}>Reset Filters</PrimaryButton>}
        />
      ) : (
        Object.entries(groupedArtifacts).map(([jobId, rows]) => (
          <Card key={jobId} className="space-y-4">
            <SectionHeader
              title={rows[0].jobName}
              subtitle={rows[0].projectName}
              action={<div className="flex items-center gap-3"><span className="text-sm text-[var(--text-muted)]">{rows.length} artifact(s)</span><Link className={getButtonClass("secondary")} to={`/jobs/${jobId}`}>Open job</Link></div>}
            />

            <JobVisualSummary job={jobsById.get(jobId)} />

            {rows.map((row) => (
              <div key={row.artifactId} className="flex items-center justify-between gap-4 border-t border-slate-200 pt-4">
                <div className="space-y-1">
                  <strong className="block text-base font-semibold text-slate-900">{row.fileName}</strong>
                  <span className="text-sm text-slate-500">
                    {row.artifactKind} / {formatLabel(row.artifactType)} / {formatFileSize(row.sizeBytes)} / {formatDate(row.createdAt)}
                  </span>
                </div>
                {row.downloadPath ? (
                  <SecondaryButton onClick={() => void openArtifact(row.downloadPath!)}>Download</SecondaryButton>
                ) : (
                  <button disabled title="Download path unavailable for this artifact.">Download unavailable</button>
                )}
              </div>
            ))}
          </Card>
        ))
      )}
    </div>
  );
}
