import type { AiInsight, SurveyJob, SurveyType } from "@geosurvey-ai/shared";

export type AiCommandIntent =
  | "CREATE_PROJECT"
  | "CREATE_JOB"
  | "CREATE_PROJECT_AND_JOB"
  | "START_JOB_PROCESSING"
  | "RUN_JOB_AI_ANALYSIS"
  | "GET_JOB_STATUS"
  | "LIST_PROJECTS"
  | "LIST_JOBS"
  | "LIST_FAILED_JOBS"
  | "RETRY_FAILED_JOB"
  | "OPEN_JOB"
  | "OPEN_REPORTS"
  | "HELP";

export type QuickActionId =
  | "open_project"
  | "create_job_for_project"
  | "upload_files_tab"
  | "start_job_processing"
  | "run_job_ai_analysis"
  | "open_job"
  | "open_reports"
  | "retry_failed_job"
  | "list_failed_jobs"
  | "help";

export type AiCommandContext = {
  currentRoute?: string;
  currentProjectId?: string | null;
  currentProjectName?: string | null;
  currentJobId?: string | null;
  currentJobName?: string | null;
};

export type ParsedIntent = {
  intent: AiCommandIntent;
  confidence: number;
  requiresConfirmation: boolean;
  payload: Record<string, unknown>;
  explanation?: string;
};

export type QuickAction = {
  id: QuickActionId;
  label: string;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  payload?: Record<string, unknown>;
};

export type ConfirmationAction = {
  intent: AiCommandIntent;
  payload: Record<string, unknown>;
  message: string;
};

export type PendingAction = {
  intent: AiCommandIntent;
  collectedData: Record<string, unknown>;
  missingFields: string[];
  requiresConfirmation: boolean;
};

export type PendingActionSummaryItem = {
  label: string;
  value: string;
};

export type ProjectCardData = {
  id: string;
  name: string;
  description?: string | null;
  surveyJobCount?: number;
};

export type JobCardData = {
  id: string;
  name: string;
  status: string;
  type: SurveyType | string;
  projectId?: string;
  projectName?: string | null;
  pointCount?: number | null;
  accuracyRmse?: number | null;
  outputCount?: number;
  insightCount?: number;
};

export type ProgressCardData = {
  jobId: string;
  jobName: string;
  status: string;
  message: string;
};

export type ErrorAlertData = {
  title: string;
  description: string;
};

export type InsightCardData = Pick<AiInsight, "id" | "severity" | "category" | "message" | "confidence" | "metadata">;

export type AiResponseBlock =
  | { type: "assistant_text"; data: { text: string } }
  | { type: "project_card"; data: ProjectCardData }
  | { type: "job_card"; data: JobCardData }
  | { type: "progress_card"; data: ProgressCardData }
  | { type: "insight_card"; data: InsightCardData }
  | { type: "error_alert"; data: ErrorAlertData }
  | { type: "quick_actions"; data: { actions: QuickAction[] } }
  | {
      type: "confirmation_card";
      data: {
        title?: string;
        message: string;
        summary?: PendingActionSummaryItem[];
        confirmLabel?: string;
        cancelLabel?: string;
        editLabel?: string;
        showEdit?: boolean;
      };
    };

export type CommandExecutionResult = {
  ok: boolean;
  message: string;
  blocks: AiResponseBlock[];
  navigateTo?: string;
  data?: {
    project?: ProjectCardData;
    job?: JobCardData;
    jobs?: JobCardData[];
    insights?: InsightCardData[];
    rawJob?: Partial<SurveyJob>;
  };
};
