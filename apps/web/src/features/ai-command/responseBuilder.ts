import type { AiInsight, SurveyJob } from "@geosurvey-ai/shared";
import type { AiResponseBlock, InsightCardData, JobCardData, PendingActionSummaryItem, ProjectCardData, QuickAction } from "./types";

export function buildAssistantText(text: string): AiResponseBlock {
  return { type: "assistant_text", data: { text } };
}

export function buildErrorBlock(title: string, description: string): AiResponseBlock {
  return { type: "error_alert", data: { title, description } };
}

export function buildProjectCard(project: ProjectCardData): AiResponseBlock {
  return { type: "project_card", data: project };
}

export function buildJobCard(job: JobCardData): AiResponseBlock {
  return { type: "job_card", data: job };
}

export function buildProgressCard(jobId: string, jobName: string, status: string, message: string): AiResponseBlock {
  return { type: "progress_card", data: { jobId, jobName, status, message } };
}

export function buildInsightCard(insight: InsightCardData): AiResponseBlock {
  return { type: "insight_card", data: insight };
}

export function buildQuickActions(actions: QuickAction[]): AiResponseBlock {
  return { type: "quick_actions", data: { actions } };
}

export function buildConfirmationCard(
  message: string,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  options?: {
    title?: string;
    summary?: PendingActionSummaryItem[];
    editLabel?: string;
    showEdit?: boolean;
  }
): AiResponseBlock {
  return {
    type: "confirmation_card",
    data: {
      title: options?.title,
      message,
      summary: options?.summary,
      confirmLabel,
      cancelLabel,
      editLabel: options?.editLabel,
      showEdit: options?.showEdit
    }
  };
}

export function toProjectCardData(project: { id: string; name: string; description?: string | null; surveyJobs?: Array<unknown> }): ProjectCardData {
  return {
    id: project.id,
    name: project.name,
    description: project.description ?? null,
    surveyJobCount: project.surveyJobs?.length ?? 0
  };
}

export function toJobCardData(job: Partial<SurveyJob> & { id: string; name: string; status: string; type: string; projectId?: string; projectName?: string | null }): JobCardData {
  return {
    id: job.id,
    name: job.name,
    status: job.status,
    type: job.type,
    projectId: job.projectId,
    projectName: job.projectName ?? null,
    pointCount: typeof job.pointCount === "number" ? job.pointCount : job.pointCount ? Number(job.pointCount) : null,
    accuracyRmse: job.accuracyRmse ?? null,
    outputCount: job.outputs?.length,
    insightCount: job.aiInsights?.length
  };
}

export function toInsightCardData(insight: AiInsight): InsightCardData {
  return {
    id: insight.id,
    severity: insight.severity,
    category: insight.category,
    message: insight.message,
    confidence: insight.confidence,
    metadata: insight.metadata
  };
}
