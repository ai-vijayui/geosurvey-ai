import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { SurveyJob, SurveyType } from "@geosurvey-ai/shared";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAiPanelState, type AiMessage } from "../../context/AiPanelContext";
import { executeAiIntent } from "../../features/ai-command/actionExecutor";
import { buildAiCommandViewContext } from "../../features/ai-command/context";
import { parseAiIntent } from "../../features/ai-command/intentParser";
import { buildAssistantText, buildConfirmationCard, buildErrorBlock, buildQuickActions } from "../../features/ai-command/responseBuilder";
import type { AiViewContext } from "../../hooks/useAiContext";
import { useAiContext } from "../../hooks/useAiContext";
import { apiGet, apiUrl, type PaginatedResponse } from "../../lib/api";
import type { PendingAction, PendingActionSummaryItem } from "../../features/ai-command/types";
import { AiContextCard } from "./AiContextCard";
import { AiInputBar } from "./AiInputBar";
import { AiMessageList } from "./AiMessageList";
import { AiPanelHeader } from "./AiPanelHeader";
import { AiPromptChips } from "./AiPromptChips";

async function getToken() {
  try {
    const clerk = (window as Window & { Clerk?: { session?: { getToken?: () => Promise<string | null> } } }).Clerk;
    return clerk ? await clerk.session?.getToken?.() ?? null : null;
  } catch {
    return null;
  }
}

type Props = {
  mobile?: boolean;
  onClose?: () => void;
  contextOverride?: AiViewContext;
};

type PendingPhase = "collecting" | "optional_description" | "confirming" | "editing";
type PendingActionState = PendingAction & {
  phase: PendingPhase;
};

const surveyTypeKeywords: Array<{ type: SurveyType; patterns: string[] }> = [
  { type: "DRONE_PHOTOGRAMMETRY", patterns: ["drone", "photogrammetry"] },
  { type: "LIDAR", patterns: ["lidar", "point cloud", "laser scan"] },
  { type: "GNSS_TRAVERSE", patterns: ["gnss", "traverse", "gps"] },
  { type: "TOTAL_STATION", patterns: ["total station"] },
  { type: "HYBRID", patterns: ["hybrid", "mixed survey"] }
];

const commandPrompts = [
  "Create a new project",
  "Create a drone survey job",
  "Start processing this job",
  "Analyze this job",
  "Show failed jobs",
  "What should I do next?"
];

function normalize(value: string) {
  return value.trim().toLowerCase();
}

function extractNamedValue(input: string) {
  const match = /(?:called|named)\s+(.+)$/i.exec(input);
  return match?.[1]?.trim().replace(/^["']|["']$/g, "") ?? "";
}

function detectSurveyType(input: string): SurveyType | null {
  const normalized = normalize(input);
  for (const entry of surveyTypeKeywords) {
    if (entry.patterns.some((pattern) => normalized.includes(pattern))) {
      return entry.type;
    }
  }
  return null;
}

function isCancelIntent(input: string) {
  return /^(cancel|stop|never mind|nevermind)$/i.test(input.trim());
}

function isEditIntent(input: string) {
  return /^(edit|change|update)$/i.test(input.trim());
}

function isSkipIntent(input: string) {
  return /^(skip|no|none|nope)$/i.test(input.trim());
}

export function FixedAiPanel({ mobile = false, onClose, contextOverride }: Props) {
  const [value, setValue] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [commandBusy, setCommandBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingActions, setPendingActions] = useState<Record<string, PendingActionState | null>>({});
  const { clearThread, getThread, setThread } = useAiPanelState();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const routeContext = useAiContext();
  const baseContext = contextOverride ?? routeContext;
  const messages = getThread(baseContext.threadKey);

  const envQuery = useQuery({
    queryKey: ["ai", "env"],
    queryFn: async () => {
      const response = await fetch(apiUrl("/api/debug/env"));
      if (!response.ok) {
        throw new Error("Unable to load AI configuration state.");
      }
      return response.json() as Promise<{ hasNvidiaKey: boolean; keyPreview: string | null }>;
    }
  });
  const jobQuery = useQuery({
    queryKey: ["ai", "job-context", baseContext.jobId],
    queryFn: () => apiGet<SurveyJob>(`/api/jobs/${baseContext.jobId}`),
    enabled: Boolean(baseContext.jobId)
  });
  const projectsQuery = useQuery({
    queryKey: ["ai", "project-context"],
    queryFn: () => apiGet<Array<{ id: string; name: string }>>("/api/projects")
  });
  const jobsQuery = useQuery({
    queryKey: ["ai", "recent-jobs"],
    queryFn: () => apiGet<PaginatedResponse<SurveyJob[]>>("/api/jobs?limit=8")
  });

  const ai = useMemo(() => {
    const currentProjectId = baseContext.projectId ?? jobQuery.data?.projectId ?? null;
    const currentProjectName = baseContext.currentProjectName ?? projectsQuery.data?.find((project) => project.id === currentProjectId)?.name ?? null;
    const currentJobName = baseContext.currentJobName ?? jobQuery.data?.name ?? null;
    return buildAiCommandViewContext({
      route: baseContext.route,
      page: baseContext.page,
      currentProjectId,
      currentProjectName,
      currentJobId: baseContext.jobId ?? null,
      currentJobName
    });
  }, [baseContext, jobQuery.data, projectsQuery.data]);

  const helperText = useMemo(() => {
    if (ai.jobAware) {
      return "Use this panel to ask questions, run commands, and control the current job without leaving the workspace.";
    }
    return "Use this panel as a command center for projects, jobs, reports, and workflow guidance.";
  }, [ai.jobAware]);

  const unavailable = envQuery.data ? !envQuery.data.hasNvidiaKey : false;
  const pendingAction = pendingActions[ai.threadKey] ?? null;
  const recentProjects = projectsQuery.data ?? [];
  const recentJobs = jobsQuery.data?.data ?? [];

  function appendAssistantMessage(message: AiMessage) {
    setThread(ai.threadKey, (current) => [...current, message]);
  }

  function setPendingAction(next: PendingActionState | null) {
    setPendingActions((current) => ({ ...current, [ai.threadKey]: next }));
  }

  function matchProject(input: string) {
    const normalized = normalize(input);
    const exact = recentProjects.find((project) => normalize(project.name) === normalized);
    if (exact) {
      return { kind: "matched" as const, item: exact };
    }
    const partial = recentProjects.filter((project) => normalize(project.name).includes(normalized));
    if (partial.length === 1) {
      return { kind: "matched" as const, item: partial[0] };
    }
    if (partial.length > 1) {
      return { kind: "ambiguous" as const, items: partial.slice(0, 5) };
    }
    return { kind: "none" as const };
  }

  function matchJob(input: string) {
    const normalized = normalize(input);
    const exact = recentJobs.find((job) => normalize(job.name) === normalized);
    if (exact) {
      return { kind: "matched" as const, item: exact };
    }
    const partial = recentJobs.filter((job) => normalize(job.name).includes(normalized));
    if (partial.length === 1) {
      return { kind: "matched" as const, item: partial[0] };
    }
    if (partial.length > 1) {
      return { kind: "ambiguous" as const, items: partial.slice(0, 5) };
    }
    return { kind: "none" as const };
  }

  function buildPendingSummary(current: PendingActionState): PendingActionSummaryItem[] {
    switch (current.intent) {
      case "CREATE_PROJECT":
        return [
          { label: "Action", value: "Create Project" },
          { label: "Name", value: String(current.collectedData.name ?? "Not set") },
          { label: "Description", value: String(current.collectedData.description ?? "None") }
        ];
      case "CREATE_JOB":
        return [
          { label: "Action", value: "Create Job" },
          { label: "Project", value: String(current.collectedData.projectName ?? current.collectedData.projectId ?? "Not set") },
          { label: "Name", value: String(current.collectedData.name ?? "Not set") },
          { label: "Type", value: String(current.collectedData.type ?? "Not set").replaceAll("_", " ") }
        ];
      case "START_JOB_PROCESSING":
        return [
          { label: "Action", value: "Start Job Processing" },
          { label: "Job", value: String(current.collectedData.jobName ?? current.collectedData.jobId ?? "Not set") }
        ];
      case "RUN_JOB_AI_ANALYSIS":
        return [
          { label: "Action", value: "Run Job AI Analysis" },
          { label: "Job", value: String(current.collectedData.jobName ?? current.collectedData.jobId ?? "Not set") }
        ];
      default:
        return [{ label: "Action", value: current.intent }];
    }
  }

  function showPendingPrompt(current: PendingActionState) {
    if (current.phase === "optional_description") {
      appendAssistantMessage({
        role: "assistant",
        content: "Do you also want to add a description?",
        blocks: [buildAssistantText("Reply with the description, or say `skip` to continue without one.")]
      });
      return;
    }

    if (current.phase === "editing") {
      appendAssistantMessage({
        role: "assistant",
        content: "Tell me which field you want to change using `field: value`.",
        blocks: [buildAssistantText("Examples: `name: Ahmedabad Infra Survey`, `type: DRONE_PHOTOGRAMMETRY`, `project: Metro Corridor`.")]
      });
      return;
    }

    switch (current.missingFields[0]) {
      case "name":
        appendAssistantMessage({ role: "assistant", content: current.intent === "CREATE_PROJECT" ? "Please provide the project name." : "Please provide the job name." });
        return;
      case "project":
        appendAssistantMessage({
          role: "assistant",
          content: "Which project should this job belong to?",
          blocks: recentProjects.length > 0
            ? [buildAssistantText(`Available projects: ${recentProjects.slice(0, 5).map((project) => project.name).join(", ")}.`)]
            : [buildErrorBlock("Project required", "No projects are available yet. Create a project first or ask me to create the project and job together.")]
        });
        return;
      case "type":
        appendAssistantMessage({
          role: "assistant",
          content: "What survey type should I use for this job?",
          blocks: [buildAssistantText("Supported types: DRONE_PHOTOGRAMMETRY, LIDAR, GNSS_TRAVERSE, TOTAL_STATION, HYBRID.")]
        });
        return;
      case "job":
        appendAssistantMessage({
          role: "assistant",
          content: current.intent === "START_JOB_PROCESSING" ? "Which job should I start processing?" : "Which job should I analyze?",
          blocks: recentJobs.length > 0 ? [buildAssistantText(`Recent jobs: ${recentJobs.slice(0, 5).map((job) => job.name).join(", ")}.`)] : [buildErrorBlock("Job required", "No recent jobs are available to choose from. Open a job first or create one.")]
        });
        return;
      default:
        appendAssistantMessage({ role: "assistant", content: "Please provide the missing details." });
    }
  }

  function showPendingSummary(current: PendingActionState) {
    setPendingAction({ ...current, phase: "confirming", missingFields: [] });
    appendAssistantMessage({
      role: "assistant",
      content: "Review the details below before I run this action.",
      blocks: [buildConfirmationCard("Confirm when everything looks right.", "Confirm", "Cancel", { title: "Action summary", summary: buildPendingSummary(current), showEdit: true, editLabel: "Edit" })]
    });
  }

  function beginPendingAction(parsed: ReturnType<typeof parseAiIntent>, input: string) {
    if (parsed.intent === "CREATE_PROJECT") {
      const name = extractNamedValue(input);
      const nextPending: PendingActionState = {
        intent: parsed.intent,
        collectedData: name ? { name } : {},
        missingFields: name ? [] : ["name"],
        requiresConfirmation: true,
        phase: name ? "optional_description" : "collecting"
      };
      setPendingAction(nextPending);
      showPendingPrompt(nextPending);
      return true;
    }

    if (parsed.intent === "CREATE_JOB") {
      const name = extractNamedValue(input);
      const type = detectSurveyType(input);
      const nextPending: PendingActionState = {
        intent: parsed.intent,
        collectedData: {
          ...(ai.appContext.currentProjectId ? { projectId: ai.appContext.currentProjectId, projectName: ai.appContext.currentProjectName } : {}),
          ...(name ? { name } : {}),
          ...(type ? { type } : {})
        },
        missingFields: [
          ...(ai.appContext.currentProjectId ? [] : ["project"]),
          ...(name ? [] : ["name"]),
          ...(type ? [] : ["type"])
        ],
        requiresConfirmation: true,
        phase: "collecting"
      };
      setPendingAction(nextPending);
      showPendingPrompt(nextPending);
      return true;
    }

    if ((parsed.intent === "START_JOB_PROCESSING" || parsed.intent === "RUN_JOB_AI_ANALYSIS") && !ai.appContext.currentJobId) {
      const nextPending: PendingActionState = {
        intent: parsed.intent,
        collectedData: {},
        missingFields: ["job"],
        requiresConfirmation: true,
        phase: "collecting"
      };
      setPendingAction(nextPending);
      showPendingPrompt(nextPending);
      return true;
    }

    return false;
  }

  function updatePendingField(current: PendingActionState, field: string, rawValue: string) {
    const value = rawValue.trim();
    if (!value) {
      return { ok: false, message: "Please provide a value before I continue." };
    }

    if (field === "project") {
      const project = matchProject(value);
      if (project.kind === "none") {
        return { ok: false, message: "I couldn't match that project. Reply with an exact project name or open the project first." };
      }
      if (project.kind === "ambiguous") {
        return { ok: false, message: `I found multiple matching projects: ${project.items.map((item) => item.name).join(", ")}. Reply with the exact project name.` };
      }
      return {
        ok: true,
        pending: {
          ...current,
          collectedData: { ...current.collectedData, projectId: project.item.id, projectName: project.item.name },
          missingFields: current.missingFields.filter((item) => item !== "project")
        }
      };
    }

    if (field === "job") {
      const job = matchJob(value);
      if (job.kind === "none") {
        return { ok: false, message: "I couldn't match that job. Reply with an exact recent job name or open the job first." };
      }
      if (job.kind === "ambiguous") {
        return { ok: false, message: `I found multiple matching jobs: ${job.items.map((item) => item.name).join(", ")}. Reply with the exact job name.` };
      }
      return {
        ok: true,
        pending: {
          ...current,
          collectedData: { ...current.collectedData, jobId: job.item.id, jobName: job.item.name },
          missingFields: current.missingFields.filter((item) => item !== "job")
        }
      };
    }

    if (field === "type") {
      const type = detectSurveyType(value) ?? (["DRONE_PHOTOGRAMMETRY", "LIDAR", "GNSS_TRAVERSE", "TOTAL_STATION", "HYBRID"].includes(value.toUpperCase()) ? value.toUpperCase() as SurveyType : null);
      if (!type) {
        return { ok: false, message: "I need a valid survey type. Use DRONE_PHOTOGRAMMETRY, LIDAR, GNSS_TRAVERSE, TOTAL_STATION, or HYBRID." };
      }
      return {
        ok: true,
        pending: {
          ...current,
          collectedData: { ...current.collectedData, type },
          missingFields: current.missingFields.filter((item) => item !== "type")
        }
      };
    }

    return {
      ok: true,
      pending: {
        ...current,
        collectedData: { ...current.collectedData, [field]: value },
        missingFields: current.missingFields.filter((item) => item !== field)
      }
    };
  }

  async function executePendingAction(current: PendingActionState) {
    setCommandBusy(true);
    const result = await executeAiIntent({ intent: current.intent, confidence: 1, requiresConfirmation: false, payload: current.collectedData }, ai.appContext, { queryClient, navigate });
    setPendingAction(null);
    appendAssistantMessage({ role: "assistant", content: result.message, blocks: result.blocks });
    setCommandBusy(false);
  }

  async function handlePendingActionInput(input: string) {
    if (!pendingAction) {
      return;
    }

    if (isCancelIntent(input)) {
      setPendingAction(null);
      appendAssistantMessage({ role: "assistant", content: "Pending action cancelled.", blocks: [buildAssistantText("No changes were made.")] });
      return;
    }

    if (pendingAction.phase === "confirming") {
      if (/^(confirm|yes|run|go ahead)$/i.test(input.trim())) {
        await executePendingAction(pendingAction);
        return;
      }
      if (isEditIntent(input)) {
        const nextPending = { ...pendingAction, phase: "editing" as const };
        setPendingAction(nextPending);
        showPendingPrompt(nextPending);
        return;
      }
      appendAssistantMessage({ role: "assistant", content: "Use Confirm, Edit, or Cancel to continue this action." });
      return;
    }

    if (pendingAction.phase === "editing") {
      const match = /^\s*([a-zA-Z ]+)\s*:\s*(.+)\s*$/.exec(input);
      if (!match) {
        appendAssistantMessage({ role: "assistant", content: "Use the format `field: value` so I can update the pending action." });
        return;
      }
      const alias = match[1].trim().toLowerCase().replace(/\s+/g, "");
      const field = alias === "project" || alias === "projectname" ? "project" : alias === "job" || alias === "jobname" ? "job" : alias;
      const result = updatePendingField(pendingAction, field, match[2]);
      if (!result.ok || !result.pending) {
        appendAssistantMessage({ role: "assistant", content: result.message ?? "I couldn't update that field." });
        return;
      }
      showPendingSummary(result.pending);
      return;
    }

    if (pendingAction.phase === "optional_description") {
      const nextPending = {
        ...pendingAction,
        collectedData: isSkipIntent(input) ? pendingAction.collectedData : { ...pendingAction.collectedData, description: input.trim() }
      };
      showPendingSummary(nextPending);
      return;
    }

    const nextField = pendingAction.missingFields[0];
    const result = updatePendingField(pendingAction, nextField, input);
    if (!result.ok || !result.pending) {
      appendAssistantMessage({ role: "assistant", content: result.message ?? "I couldn't use that value yet." });
      return;
    }
    if (result.pending.missingFields.length > 0) {
      setPendingAction(result.pending);
      showPendingPrompt(result.pending);
      return;
    }
    if (result.pending.intent === "CREATE_PROJECT" && !("description" in result.pending.collectedData)) {
      const nextPending = { ...result.pending, phase: "optional_description" as const };
      setPendingAction(nextPending);
      showPendingPrompt(nextPending);
      return;
    }
    showPendingSummary(result.pending);
  }

  async function runParsedIntent(input: string, mode?: "confirm") {
    const parsed = parseAiIntent(input, ai.appContext);
    await executeParsedIntent(parsed, input, mode);
  }

  async function executeParsedIntent(parsed: ReturnType<typeof parseAiIntent>, input: string, mode?: "confirm") {
    if (beginPendingAction(parsed, input)) {
      return;
    }

    if (parsed.intent !== "HELP" && parsed.confidence < 0.75) {
      appendAssistantMessage({
        role: "assistant",
        content: parsed.explanation ?? "I couldn't safely run that command.",
        blocks: [
          buildErrorBlock("Command needs more context", parsed.explanation ?? "Try opening a job or project first."),
          buildQuickActions([{ id: "help", label: "Show examples", variant: "secondary" }])
        ]
      });
      return;
    }

    if (parsed.requiresConfirmation && mode !== "confirm") {
      appendAssistantMessage({
        role: "assistant",
        content: parsed.explanation ?? "Please confirm this action before I run it.",
        pendingConfirmation: {
          intent: parsed.intent,
          payload: parsed.payload,
          message: parsed.explanation ?? "Retry the failed job and move it back to PENDING?"
        },
        blocks: [buildConfirmationCard(parsed.explanation ?? "Retry the failed job and move it back to PENDING?", "Retry Job", "Cancel")]
      });
      return;
    }

    if (parsed.intent === "HELP" && parsed.confidence === 1) {
      appendAssistantMessage({
        role: "assistant",
        content: "I can help with project creation, job creation, processing, AI analysis, status checks, failed jobs, and reports.",
        blocks: [
          buildAssistantText('Examples: "Create project called Ahmedabad Infra", "Create a drone survey job", "Start processing this job", "Show failed jobs", "Open reports".'),
          buildQuickActions([
            { id: "list_failed_jobs", label: "Show Failed Jobs", variant: "secondary" },
            { id: "open_reports", label: "Open Reports", variant: "secondary" }
          ])
        ]
      });
      return;
    }

    if (parsed.intent === "HELP" && unavailable) {
      appendAssistantMessage({
        role: "assistant",
        content: "AI chat is unavailable right now, but app commands still work.",
        blocks: [
          buildAssistantText(parsed.explanation ?? "Try a supported command such as creating a project, creating a job, starting processing, or showing failed jobs."),
          buildQuickActions([
            { id: "list_failed_jobs", label: "Show Failed Jobs", variant: "secondary" },
            { id: "open_reports", label: "Open Reports", variant: "secondary" }
          ])
        ]
      });
      return;
    }

    if (parsed.intent === "HELP") {
      await streamConversation(input);
      return;
    }

    setCommandBusy(true);
    const result = await executeAiIntent(parsed, ai.appContext, { queryClient, navigate });
    appendAssistantMessage({
      role: "assistant",
      content: result.message,
      blocks: result.blocks
    });
    setCommandBusy(false);
  }

  async function streamConversation(content: string) {
    const trimmed = content.trim();
    if (!trimmed || streaming) {
      return;
    }

    const history = messages.filter((message) => message.role === "user" || message.role === "assistant").map((message) => ({ role: message.role, content: message.content }));
    setError(null);
    setThread(ai.threadKey, (current) => [...current, { role: "assistant", content: "" }]);
    setStreaming(true);

    try {
      const token = await getToken();
      const endpoint = ai.jobAware && ai.jobId ? apiUrl(`/api/jobs/${ai.jobId}/ai-chat`) : apiUrl("/api/ai/chat");
      const payload = ai.jobAware
        ? { message: trimmed, history }
        : { message: trimmed, history, context: { route: ai.route, page: ai.page } };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null) as { error?: string; message?: string } | null;
        throw new Error(body?.message ?? body?.error ?? "Unable to reach the AI service right now.");
      }
      if (!response.body) {
        throw new Error("The AI service returned an empty response.");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value: chunk } = await reader.read();
        if (done) {
          break;
        }

        buffer += decoder.decode(chunk, { stream: true });
        const packets = buffer.split("\n\n");
        buffer = packets.pop() ?? "";

        for (const packet of packets) {
          const line = packet.replace(/^data:\s*/, "");
          if (!line || line === "[DONE]") {
            continue;
          }

          const parsed = JSON.parse(line) as { token?: string };
          if (parsed.token) {
            setThread(ai.threadKey, (current) => {
              const next = [...current];
              const last = next[next.length - 1];
              if (last && last.role === "assistant") {
                next[next.length - 1] = { ...last, content: `${last.content}${parsed.token}` };
              }
              return next;
            });
          }
        }
      }
    } catch (err) {
      setThread(ai.threadKey, (current) => current.slice(0, -1));
      setError(err instanceof Error ? err.message : "Unable to reach the AI service right now.");
      appendAssistantMessage({
        role: "assistant",
        content: "AI chat is unavailable right now, but app commands still work.",
        blocks: [buildAssistantText("Try a supported command like creating a project, creating a job, starting processing, or showing failed jobs.")]
      });
    } finally {
      setStreaming(false);
    }
  }

  async function handleSubmit(rawValue: string) {
    const trimmed = rawValue.trim();
    if (!trimmed || commandBusy || streaming) {
      return;
    }

    setValue("");
    setThread(ai.threadKey, (current) => [...current, { role: "user", content: trimmed }]);
    if (pendingAction) {
      await handlePendingActionInput(trimmed);
      return;
    }
    await runParsedIntent(trimmed);
  }

  async function handleQuickAction(action: { id: string; payload?: Record<string, unknown> }) {
    switch (action.id) {
      case "open_project":
        navigate(`/jobs?projectId=${String(action.payload?.projectId ?? ai.appContext.currentProjectId ?? "")}`);
        return;
      case "upload_files_tab":
        navigate(`/jobs/${String(action.payload?.jobId ?? ai.appContext.currentJobId ?? "")}?tab=Upload`);
        return;
      case "open_job":
        navigate(`/jobs/${String(action.payload?.jobId ?? ai.appContext.currentJobId ?? "")}`);
        return;
      case "open_reports":
        navigate("/reports");
        return;
      case "start_job_processing":
        await executeParsedIntent({ intent: "START_JOB_PROCESSING", confidence: 1, requiresConfirmation: false, payload: { jobId: action.payload?.jobId ?? ai.appContext.currentJobId ?? null } }, "start processing this job", "confirm");
        return;
      case "run_job_ai_analysis":
        await executeParsedIntent({ intent: "RUN_JOB_AI_ANALYSIS", confidence: 1, requiresConfirmation: false, payload: { jobId: action.payload?.jobId ?? ai.appContext.currentJobId ?? null } }, "analyze this job", "confirm");
        return;
      case "retry_failed_job":
        setThread(ai.threadKey, (current) => [
          ...current,
          {
            role: "assistant",
            content: "Please confirm that you want to retry this failed job.",
            pendingConfirmation: {
              intent: "RETRY_FAILED_JOB",
              payload: { jobId: action.payload?.jobId ?? ai.appContext.currentJobId ?? null },
              message: "Retry the failed job and move it back to PENDING?"
            },
            blocks: [buildConfirmationCard("Retry the failed job and move it back to PENDING?", "Retry Job", "Cancel")]
          }
        ]);
        return;
      case "create_job_for_project":
        setPendingAction({
          intent: "CREATE_JOB",
          collectedData: {
            projectId: action.payload?.projectId ?? ai.appContext.currentProjectId ?? null,
            projectName: recentProjects.find((project) => project.id === String(action.payload?.projectId ?? ai.appContext.currentProjectId ?? ""))?.name ?? ai.appContext.currentProjectName ?? null
          },
          missingFields: ["name", "type"],
          requiresConfirmation: true,
          phase: "collecting"
        });
        appendAssistantMessage({
          role: "assistant",
          content: "Let's create the job for this project."
        });
        appendAssistantMessage({ role: "assistant", content: "Please provide the job name." });
        return;
      case "list_failed_jobs":
        await executeParsedIntent({ intent: "LIST_FAILED_JOBS", confidence: 1, requiresConfirmation: false, payload: {} }, "show failed jobs", "confirm");
        return;
      case "help":
      default:
        appendAssistantMessage({
          role: "assistant",
          content: "Try one of these supported commands.",
          blocks: [buildAssistantText("Create project called Ahmedabad Infra. Create a drone survey job. Start processing this job. Analyze this job. Show failed jobs. Open reports.")]
        });
    }
  }

  async function handleConfirm(message: AiMessage) {
    if (pendingAction?.phase === "confirming") {
      await executePendingAction(pendingAction);
      return;
    }
    if (!message.pendingConfirmation) {
      return;
    }
    setThread(ai.threadKey, (current) => current.map((entry) => entry === message ? { ...entry, pendingConfirmation: null, blocks: [buildAssistantText("Running confirmed action...")] } : entry));
    setCommandBusy(true);
    const result = await executeAiIntent({ intent: message.pendingConfirmation.intent, confidence: 1, requiresConfirmation: false, payload: message.pendingConfirmation.payload }, ai.appContext, { queryClient, navigate });
    appendAssistantMessage({ role: "assistant", content: result.message, blocks: result.blocks });
    setCommandBusy(false);
  }

  function handleEditConfirmation() {
    if (!pendingAction) {
      return;
    }
    const nextPending = { ...pendingAction, phase: "editing" as const };
    setPendingAction(nextPending);
    showPendingPrompt(nextPending);
  }

  function handleCancelConfirmation(message: AiMessage) {
    if (pendingAction) {
      setPendingAction(null);
      appendAssistantMessage({ role: "assistant", content: "Pending action cancelled.", blocks: [buildAssistantText("No changes were made.")] });
      return;
    }
    setThread(ai.threadKey, (current) => current.map((entry) => entry === message ? { ...entry, pendingConfirmation: null, blocks: [buildAssistantText("Action cancelled.")] } : entry));
  }

  return (
    <section className={`ai-panel-inner fixed-ai-panel${mobile ? " fixed-ai-panel-mobile" : ""}`}>
      <AiPanelHeader title={ai.title} subtitle={ai.subtitle} onClear={() => clearThread(ai.threadKey)} onClose={onClose} />

      <div className="fixed-ai-panel-body">
        <AiContextCard jobAware={ai.jobAware} job={jobQuery.data ?? null} helperText={helperText} />

        {unavailable ? (
          <div className="inline-note inline-note-danger">
            <strong>AI chat is unavailable right now, but app commands still work.</strong>
            <span>Add NVIDIA_API_KEY in .env and restart the server to re-enable conversational replies.</span>
          </div>
        ) : null}

        {error ? <div className="inline-note inline-note-danger">{error}</div> : null}

        {messages.length === 0 ? (
          <AiPromptChips prompts={commandPrompts.length > 0 ? commandPrompts : ai.prompts} disabled={streaming || commandBusy} onSelect={(prompt) => void handleSubmit(prompt)} />
        ) : null}

        <AiMessageList
          messages={messages}
          streaming={streaming}
          commandBusy={commandBusy}
          onQuickAction={handleQuickAction}
          onConfirm={handleConfirm}
          onEditConfirmation={() => handleEditConfirmation()}
          onCancelConfirmation={handleCancelConfirmation}
        />
      </div>

      <AiInputBar
        value={value}
        disabled={streaming || commandBusy}
        onChange={setValue}
        onSend={() => void handleSubmit(value)}
      />
    </section>
  );
}
