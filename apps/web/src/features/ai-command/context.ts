import { buildAiViewContext, type AiViewContext } from "../../hooks/useAiContext";
import type { AiCommandContext } from "./types";

export type AiCommandViewContext = AiViewContext & {
  appContext: AiCommandContext;
};

export function buildAiCommandViewContext(context: AiCommandContext & { route: string; page: string }): AiCommandViewContext {
  const aiView = buildAiViewContext({
    route: context.route,
    page: context.page,
    jobId: context.currentJobId ?? null,
    projectId: context.currentProjectId ?? null,
    currentProjectName: context.currentProjectName ?? null,
    currentJobName: context.currentJobName ?? null
  });

  return {
    ...aiView,
    appContext: {
      currentRoute: context.route,
      currentProjectId: context.currentProjectId ?? null,
      currentProjectName: context.currentProjectName ?? null,
      currentJobId: context.currentJobId ?? null,
      currentJobName: context.currentJobName ?? null
    }
  };
}
