import type { ProjectCardData } from "../../../features/ai-command/types";

type Props = {
  project: ProjectCardData;
};

export function ProjectCardBlock({ project }: Props) {
  return (
    <div className="ai-panel-card">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <strong className="block text-sm font-semibold text-slate-900">{project.name}</strong>
          <span className="block text-sm text-slate-500">{project.description || "No project description yet."}</span>
        </div>
        <span className="ai-panel-badge">{project.surveyJobCount ?? 0} jobs</span>
      </div>
    </div>
  );
}
