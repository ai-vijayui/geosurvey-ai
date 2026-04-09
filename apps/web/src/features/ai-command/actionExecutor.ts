import type { QueryClient } from "@tanstack/react-query";
import type { SurveyJob, SurveyType } from "@geosurvey-ai/shared";
import { apiGet, apiPatch, apiPost, type PaginatedResponse } from "../../lib/api";
import { buildErrorBlock, buildInsightCard, buildJobCard, buildProgressCard, buildProjectCard, buildQuickActions, toInsightCardData, toJobCardData, toProjectCardData } from "./responseBuilder";
import type { AiCommandContext, CommandExecutionResult, ParsedIntent } from "./types";

type ProjectRecord = {
  id: string;
  name: string;
  description?: string | null;
  surveyJobs?: Array<{ id: string; name: string; status: string; type: string }>;
};

type ExecutionDeps = {
  queryClient: QueryClient;
  navigate: (to: string) => void;
};

function normalize(text: string) {
  return text.trim().toLowerCase();
}

async function invalidateCommandState(queryClient: QueryClient) {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] }),
    queryClient.invalidateQueries({ queryKey: ["processing-jobs"] }),
    queryClient.invalidateQueries({ queryKey: ["projects"] }),
    queryClient.invalidateQueries({ queryKey: ["jobs"] }),
    queryClient.invalidateQueries({ queryKey: ["job"] }),
    queryClient.invalidateQueries({ queryKey: ["gnss-points"] }),
    queryClient.invalidateQueries({ queryKey: ["reports"] }),
    queryClient.invalidateQueries({ queryKey: ["settings"] }),
    queryClient.invalidateQueries({ queryKey: ["ai-workspace"] }),
    queryClient.invalidateQueries({ queryKey: ["layout"] }),
    queryClient.invalidateQueries({ queryKey: ["processing"] })
  ]);
}

async function resolveProjectId(context: AiCommandContext, preferredName?: string) {
  if (context.currentProjectId) {
    return context.currentProjectId;
  }

  const projects = await apiGet<ProjectRecord[]>("/api/projects");
  if (preferredName) {
    const matched = projects.find((project) => normalize(project.name) === normalize(preferredName));
    if (matched) {
      return matched.id;
    }
  }
  if (projects.length === 1) {
    return projects[0].id;
  }
  return null;
}

async function getJob(jobId: string) {
  return apiGet<SurveyJob>(`/api/jobs/${jobId}`);
}

export async function executeAiIntent(parsed: ParsedIntent, context: AiCommandContext, deps: ExecutionDeps): Promise<CommandExecutionResult> {
  try {
    switch (parsed.intent) {
      case "CREATE_PROJECT": {
        const project = await apiPost<ProjectRecord>("/api/projects", { name: String(parsed.payload.name ?? "New GeoSurvey Project"), client: "", location: "" });
        await invalidateCommandState(deps.queryClient);
        return {
          ok: true,
          message: `Project "${project.name}" created successfully.`,
          blocks: [
            buildProjectCard(toProjectCardData(project)),
            buildQuickActions([
              { id: "create_job_for_project", label: "Create Job", variant: "primary", payload: { projectId: project.id } },
              { id: "open_project", label: "Open Project Jobs", variant: "secondary", payload: { projectId: project.id } }
            ])
          ],
          data: { project: toProjectCardData(project) }
        };
      }

      case "CREATE_JOB": {
        const projectId = await resolveProjectId(context, String(parsed.payload.projectName ?? ""));
        if (!projectId) {
          return {
            ok: false,
            message: "I need a project before I can create a job.",
            blocks: [buildErrorBlock("Project required", parsed.explanation ?? "Open a project first, or ask me to create a project and job together.")]
          };
        }
        const job = await apiPost<SurveyJob>("/api/jobs", {
          projectId,
          name: String(parsed.payload.name ?? "New Survey Job"),
          type: String(parsed.payload.type ?? "GNSS_TRAVERSE") as SurveyType
        });
        await invalidateCommandState(deps.queryClient);
        const jobCard = toJobCardData({ ...job, projectId });
        return {
          ok: true,
          message: `Job "${job.name}" created successfully.`,
          blocks: [
            buildJobCard(jobCard),
            buildQuickActions([
              { id: "upload_files_tab", label: "Upload Files", variant: "primary", payload: { jobId: job.id } },
              { id: "start_job_processing", label: "Start Processing", variant: "secondary", payload: { jobId: job.id } },
              { id: "open_job", label: "Open Job", variant: "secondary", payload: { jobId: job.id } }
            ])
          ],
          data: { job: jobCard, rawJob: job }
        };
      }

      case "CREATE_PROJECT_AND_JOB": {
        const project = await apiPost<ProjectRecord>("/api/projects", { name: String(parsed.payload.projectName ?? "New GeoSurvey Project"), client: "", location: "" });
        const job = await apiPost<SurveyJob>("/api/jobs", {
          projectId: project.id,
          name: String(parsed.payload.jobName ?? "New Survey Job"),
          type: String(parsed.payload.type ?? "GNSS_TRAVERSE") as SurveyType
        });
        await invalidateCommandState(deps.queryClient);
        return {
          ok: true,
          message: `Created project "${project.name}" and job "${job.name}".`,
          blocks: [
            buildProjectCard(toProjectCardData(project)),
            buildJobCard(toJobCardData({ ...job, projectId: project.id, projectName: project.name })),
            buildQuickActions([
              { id: "upload_files_tab", label: "Upload Files", variant: "primary", payload: { jobId: job.id } },
              { id: "start_job_processing", label: "Start Processing", variant: "secondary", payload: { jobId: job.id } },
              { id: "open_job", label: "Open Job", variant: "secondary", payload: { jobId: job.id } }
            ])
          ]
        };
      }

      case "START_JOB_PROCESSING": {
        const jobId = String(parsed.payload.jobId ?? context.currentJobId ?? "");
        if (!jobId) {
          return { ok: false, message: "I need a job to start processing.", blocks: [buildErrorBlock("Job required", parsed.explanation ?? "Open a job first, then ask me to start processing it.")] };
        }
        await apiPost(`/api/jobs/${jobId}/process`, {});
        const job = await getJob(jobId);
        await invalidateCommandState(deps.queryClient);
        return {
          ok: true,
          message: `Started processing for "${job.name}".`,
          blocks: [
            buildProgressCard(job.id, job.name, job.status, "The job has been queued for processing."),
            buildQuickActions([
              { id: "open_job", label: "Open Job", variant: "primary", payload: { jobId: job.id } },
              { id: "open_reports", label: "View Reports", variant: "secondary" }
            ])
          ]
        };
      }

      case "RUN_JOB_AI_ANALYSIS": {
        const jobId = String(parsed.payload.jobId ?? context.currentJobId ?? "");
        if (!jobId) {
          return { ok: false, message: "I need a job to analyze.", blocks: [buildErrorBlock("Job required", parsed.explanation ?? "Open a job first, then ask me to analyze it.")] };
        }
        const response = await apiPost<{ insights: Array<any> }>(`/api/jobs/${jobId}/ai-analyze`, {});
        const job = await getJob(jobId);
        await invalidateCommandState(deps.queryClient);
        return {
          ok: true,
          message: response.insights.length > 0 ? `AI analysis finished for "${job.name}".` : `AI analysis ran for "${job.name}", but no new insights were returned.`,
          blocks: [
            buildJobCard(toJobCardData(job as SurveyJob & { id: string; name: string; status: string; type: string })),
            ...response.insights.slice(0, 3).map((insight) => buildInsightCard(toInsightCardData(insight))),
            buildQuickActions([
              { id: "open_job", label: "Open Job", variant: "primary", payload: { jobId: job.id } },
              { id: "open_reports", label: "View Reports", variant: "secondary" }
            ])
          ]
        };
      }

      case "GET_JOB_STATUS": {
        const jobId = String(parsed.payload.jobId ?? context.currentJobId ?? "");
        if (!jobId) {
          return { ok: false, message: "I need a job to check status.", blocks: [buildErrorBlock("Job required", parsed.explanation ?? "Open a job first, then ask for its status.")] };
        }
        const job = await getJob(jobId);
        return {
          ok: true,
          message: `Here is the latest status for "${job.name}".`,
          blocks: [
            buildJobCard(toJobCardData(job as SurveyJob & { id: string; name: string; status: string; type: string })),
            buildQuickActions([
              { id: "open_job", label: "Open Job", variant: "primary", payload: { jobId: job.id } },
              { id: "start_job_processing", label: "Start Processing", variant: "secondary", payload: { jobId: job.id } }
            ])
          ]
        };
      }

      case "LIST_PROJECTS": {
        const projects = await apiGet<ProjectRecord[]>("/api/projects");
        return {
          ok: true,
          message: projects.length > 0 ? `Found ${projects.length} project${projects.length === 1 ? "" : "s"}.` : "No projects found yet.",
          blocks: projects.length > 0
            ? projects.slice(0, 4).flatMap((project) => [
                buildProjectCard(toProjectCardData(project)),
                buildQuickActions([
                  { id: "open_project", label: "Open Project Jobs", variant: "secondary", payload: { projectId: project.id } },
                  { id: "create_job_for_project", label: "Create Job", variant: "primary", payload: { projectId: project.id } }
                ])
              ])
            : [buildErrorBlock("No projects yet", "Create your first project to start organizing jobs and outputs.")]
        };
      }

      case "LIST_JOBS":
      case "LIST_FAILED_JOBS": {
        const statusQuery = parsed.intent === "LIST_FAILED_JOBS" ? "&status=FAILED" : "";
        const response = await apiGet<PaginatedResponse<SurveyJob[]>>(`/api/jobs?limit=8${statusQuery}`);
        return {
          ok: true,
          message: response.data.length > 0 ? `Found ${response.data.length} ${parsed.intent === "LIST_FAILED_JOBS" ? "failed " : ""}job${response.data.length === 1 ? "" : "s"}.` : `No ${parsed.intent === "LIST_FAILED_JOBS" ? "failed " : ""}jobs found.`,
          blocks: response.data.length > 0
            ? response.data.flatMap((job) => [
                buildJobCard(toJobCardData(job as SurveyJob & { id: string; name: string; status: string; type: string })),
                buildQuickActions([
                  { id: "open_job", label: "Open", variant: "secondary", payload: { jobId: job.id } },
                  ...(job.status === "FAILED" ? [{ id: "retry_failed_job" as const, label: "Retry", variant: "danger" as const, payload: { jobId: job.id } }] : [])
                ])
              ])
            : [buildErrorBlock("No matching jobs", parsed.intent === "LIST_FAILED_JOBS" ? "No failed jobs are currently available." : "No jobs matched that request.")]
        };
      }

      case "RETRY_FAILED_JOB": {
        const jobId = String(parsed.payload.jobId ?? context.currentJobId ?? "");
        if (!jobId) {
          return { ok: false, message: "I need a failed job to retry.", blocks: [buildErrorBlock("Job required", parsed.explanation ?? "Open a failed job first, then ask me to retry it.")] };
        }
        await apiPatch(`/api/jobs/${jobId}/status`, { status: "PENDING" });
        const job = await getJob(jobId);
        await invalidateCommandState(deps.queryClient);
        return {
          ok: true,
          message: `Reset "${job.name}" back to PENDING.`,
          blocks: [
            buildJobCard(toJobCardData(job as SurveyJob & { id: string; name: string; status: string; type: string })),
            buildQuickActions([
              { id: "start_job_processing", label: "Start Processing", variant: "primary", payload: { jobId: job.id } },
              { id: "open_job", label: "Open Job", variant: "secondary", payload: { jobId: job.id } }
            ])
          ]
        };
      }

      case "OPEN_JOB": {
        const jobId = String(parsed.payload.jobId ?? context.currentJobId ?? "");
        if (!jobId) {
          return { ok: false, message: "I need a job to open.", blocks: [buildErrorBlock("Job required", "Open a job first, or ask me to list jobs so you can choose one.")] };
        }
        deps.navigate(`/jobs/${jobId}`);
        return { ok: true, message: "Opened the selected job.", blocks: [] };
      }

      case "OPEN_REPORTS": {
        deps.navigate("/reports");
        return { ok: true, message: "Opened reports.", blocks: [] };
      }

      case "HELP":
      default:
        return {
          ok: true,
          message: parsed.explanation ?? "I can create projects, create jobs, start processing, analyze jobs, list failed jobs, open reports, and show job status.",
          blocks: [buildQuickActions([{ id: "help", label: "Show Examples", variant: "secondary" }, { id: "list_failed_jobs", label: "Show Failed Jobs", variant: "secondary" }, { id: "open_reports", label: "Open Reports", variant: "secondary" }])]
        };
    }
  } catch (error) {
    return {
      ok: false,
      message: error instanceof Error ? error.message : "Command failed.",
      blocks: [buildErrorBlock("Command failed", error instanceof Error ? error.message : "Something went wrong while running that command.")]
    };
  }
}
