import { matchPath, useLocation } from "react-router-dom";

export type AiViewContext = {
  route: string;
  page: string;
  jobId: string | null;
  projectId: string | null;
  currentProjectName: string | null;
  currentJobName: string | null;
  jobAware: boolean;
  threadKey: string;
  title: string;
  subtitle: string;
  prompts: string[];
};

const generalPrompts = [
  "What should I do next?",
  "What report should I generate?",
  "Explain the current workflow",
  "Help me find the right next step"
];

const jobPrompts = [
  "What should I do next?",
  "Explain the current issues",
  "Summarize this survey",
  "Is this accuracy acceptable?",
  "What report should I generate?"
];

function getPageLabel(pathname: string) {
  if (pathname.startsWith("/jobs/")) {
    return "Job workspace";
  }
  if (pathname.startsWith("/jobs")) {
    return "Jobs";
  }
  if (pathname.startsWith("/dashboard")) {
    return "Dashboard";
  }
  if (pathname.startsWith("/projects")) {
    return "Projects";
  }
  if (pathname.startsWith("/processing")) {
    return "Processing";
  }
  if (pathname.startsWith("/reports")) {
    return "Reports";
  }
  if (pathname.startsWith("/settings")) {
    return "Settings";
  }
  if (pathname.startsWith("/gnss")) {
    return "GNSS";
  }
  return "Workspace";
}

export function buildAiViewContext(params: { route: string; page: string; jobId?: string | null; projectId?: string | null; currentProjectName?: string | null; currentJobName?: string | null }): AiViewContext {
  const jobId = params.jobId ?? null;
  const projectId = params.projectId ?? null;
  const jobAware = Boolean(jobId);

  return {
    route: params.route,
    page: params.page,
    jobId,
    projectId,
    currentProjectName: params.currentProjectName ?? null,
    currentJobName: params.currentJobName ?? null,
    jobAware,
    threadKey: jobId ? `job:${jobId}` : "general",
    title: "AI Command Center",
    subtitle: jobAware ? "Survey job assistant" : "GeoSurvey assistant",
    prompts: jobAware ? jobPrompts : generalPrompts
  };
}

export function useAiContext() {
  const location = useLocation();
  const jobId = matchPath("/jobs/:id", location.pathname)?.params.id ?? null;
  const projectId = new URLSearchParams(location.search).get("projectId");
  const page = getPageLabel(location.pathname);
  return buildAiViewContext({ route: `${location.pathname}${location.search}`, page, jobId, projectId });
}
