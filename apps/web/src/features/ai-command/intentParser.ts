import type { SurveyType } from "@geosurvey-ai/shared";
import type { AiCommandContext, ParsedIntent } from "./types";

const typeKeywords: Array<{ type: SurveyType; patterns: string[] }> = [
  { type: "DRONE_PHOTOGRAMMETRY", patterns: ["drone", "photogrammetry", "drone survey"] },
  { type: "LIDAR", patterns: ["lidar", "point cloud", "laser scan"] },
  { type: "GNSS_TRAVERSE", patterns: ["gnss", "traverse", "gps"] },
  { type: "TOTAL_STATION", patterns: ["total station"] },
  { type: "HYBRID", patterns: ["hybrid", "mixed survey"] }
];

function normalize(input: string) {
  return input.trim().toLowerCase().replace(/\s+/g, " ");
}

function extractNamedValue(input: string, patterns: RegExp[]) {
  for (const pattern of patterns) {
    const match = pattern.exec(input);
    if (match?.[1]) {
      return match[1].trim().replace(/^["']|["']$/g, "");
    }
  }
  return "";
}

function detectSurveyType(input: string): SurveyType | null {
  for (const entry of typeKeywords) {
    if (entry.patterns.some((pattern) => input.includes(pattern))) {
      return entry.type;
    }
  }
  return null;
}

function includesCurrentJobReference(input: string) {
  return /\b(this job|current job|that job)\b/.test(input);
}

function includesCurrentProjectReference(input: string) {
  return /\b(this project|current project|that project)\b/.test(input);
}

export function parseAiIntent(rawInput: string, context: AiCommandContext): ParsedIntent {
  const input = normalize(rawInput);
  const namedValue = extractNamedValue(rawInput, [/called\s+(.+)$/i, /named\s+(.+)$/i, /for\s+(.+)$/i]);
  const surveyType = detectSurveyType(input);
  const currentJobId = context.currentJobId ?? null;
  const currentProjectId = context.currentProjectId ?? null;

  if (!input) {
    return { intent: "HELP", confidence: 0, requiresConfirmation: false, payload: {}, explanation: "Try creating a project, creating a job, starting processing, analyzing a job, or showing failed jobs." };
  }
  if (/\b(open|go to|show)\s+reports\b/.test(input)) {
    return { intent: "OPEN_REPORTS", confidence: 0.98, requiresConfirmation: false, payload: {} };
  }
  if (/\b(show|list)\s+failed\s+jobs\b/.test(input)) {
    return { intent: "LIST_FAILED_JOBS", confidence: 0.98, requiresConfirmation: false, payload: {} };
  }
  if (/\b(list|show)\s+projects\b/.test(input)) {
    return { intent: "LIST_PROJECTS", confidence: 0.95, requiresConfirmation: false, payload: {} };
  }
  if (/\b(list|show)\s+jobs\b/.test(input)) {
    return { intent: "LIST_JOBS", confidence: 0.94, requiresConfirmation: false, payload: {} };
  }
  if (/\b(status|job status|show status)\b/.test(input) && (includesCurrentJobReference(input) || currentJobId)) {
    return { intent: "GET_JOB_STATUS", confidence: 0.9, requiresConfirmation: false, payload: { jobId: currentJobId } };
  }
  if (/\b(start|run|begin)\s+processing\b/.test(input)) {
    return {
      intent: "START_JOB_PROCESSING",
      confidence: currentJobId || includesCurrentJobReference(input) ? 0.97 : 0.64,
      requiresConfirmation: false,
      payload: { jobId: currentJobId },
      explanation: currentJobId ? undefined : "Open a job first or say which job to process."
    };
  }
  if (/\b(analyze|analyse|run ai|ai analysis)\b/.test(input) && /\b(job|this)\b/.test(input)) {
    return {
      intent: "RUN_JOB_AI_ANALYSIS",
      confidence: currentJobId ? 0.97 : 0.66,
      requiresConfirmation: false,
      payload: { jobId: currentJobId },
      explanation: currentJobId ? undefined : "Open a job first so I know which job to analyze."
    };
  }
  if (/\b(retry|reset)\b/.test(input) && /\bfailed job|this failed job|job\b/.test(input)) {
    return {
      intent: "RETRY_FAILED_JOB",
      confidence: currentJobId ? 0.88 : 0.72,
      requiresConfirmation: true,
      payload: { jobId: currentJobId },
      explanation: currentJobId ? undefined : "Open a failed job or specify which failed job to retry."
    };
  }
  if ((/\bopen\s+job\b/.test(input) || /\bgo to\b.*\bjob\b/.test(input)) && (currentJobId || includesCurrentJobReference(input))) {
    return { intent: "OPEN_JOB", confidence: 0.96, requiresConfirmation: false, payload: { jobId: currentJobId } };
  }
  if (/\b(create|make)\b/.test(input) && /\bproject\b/.test(input) && /\bjob\b/.test(input)) {
    return {
      intent: "CREATE_PROJECT_AND_JOB",
      confidence: 0.95,
      requiresConfirmation: false,
      payload: { projectName: namedValue || "New GeoSurvey Project", jobName: namedValue || "New Survey Job", type: surveyType ?? "GNSS_TRAVERSE" }
    };
  }
  if (/\b(create|make)\b/.test(input) && /\bproject\b/.test(input)) {
    return { intent: "CREATE_PROJECT", confidence: namedValue ? 0.97 : 0.82, requiresConfirmation: false, payload: { name: namedValue || "New GeoSurvey Project" } };
  }
  if (/\b(create|make)\b/.test(input) && /\bjob\b/.test(input)) {
    return {
      intent: "CREATE_JOB",
      confidence: currentProjectId || includesCurrentProjectReference(input) || namedValue ? 0.93 : 0.74,
      requiresConfirmation: false,
      payload: { projectId: currentProjectId, name: namedValue || `${surveyType ? surveyType.replaceAll("_", " ") : "Survey"} Job`, type: surveyType ?? "GNSS_TRAVERSE" },
      explanation: currentProjectId ? undefined : "Open or filter to a project first, or create a project and job together."
    };
  }
  if (/\bhelp\b/.test(input) || /\bwhat can you do\b/.test(input)) {
    return { intent: "HELP", confidence: 1, requiresConfirmation: false, payload: {} };
  }

  return {
    intent: "HELP",
    confidence: 0.25,
    requiresConfirmation: false,
    payload: {},
    explanation: "I can create projects, create jobs, start processing, analyze jobs, list failed jobs, open reports, and show job status."
  };
}
