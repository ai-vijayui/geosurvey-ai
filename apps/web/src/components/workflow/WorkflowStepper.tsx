import { AppIcon, type AppIconName } from "../ui/AppIcon";

type WorkflowStep = {
  key: string;
  label: string;
  status: "complete" | "current" | "upcoming";
};

type WorkflowStepperProps = {
  steps: WorkflowStep[];
  compact?: boolean;
};

export function WorkflowStepper({ steps, compact = false }: WorkflowStepperProps) {
  return (
    <div className={`flex items-stretch gap-3 overflow-x-auto pb-1 ${compact ? "" : ""}`} aria-label="Workflow">
      {steps.map((step, index) => (
        <div
          key={step.key}
          className={`relative min-w-[150px] rounded-[22px] border px-4 py-4 ${
            step.status === "complete"
              ? "border-[#f7c8c4] bg-[#fff1ef]"
              : step.status === "current"
                ? "border-[#f0c4c0] bg-white shadow-[inset_0_0_0_1px_rgba(244,91,85,0.18)]"
                : "border-[#e9e1d9] bg-white"
          }`}
        >
          <span
            className={`grid h-9 w-9 place-items-center rounded-full border ${
              step.status === "complete" || step.status === "current"
                ? "border-[#f45b55] bg-[#f45b55] text-white"
                : "border-slate-300 bg-slate-100 text-slate-500"
            }`}
          >
            <AppIcon
              name={step.status === "complete" ? "check" : getWorkflowIcon(step.key, index)}
              className="h-4 w-4"
            />
          </span>
          <div className="mt-3 space-y-1">
            <strong className="block text-sm font-semibold text-slate-900">{step.label}</strong>
            <span className="text-xs text-slate-500">
              {step.status === "complete" ? "Completed" : step.status === "current" ? "Active" : "Upcoming"}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

function getWorkflowIcon(key: string, index: number): AppIconName {
  const icons: Record<string, AppIconName> = {
    project: "projects",
    job: "jobs",
    upload: "upload",
    process: "processing",
    review: "review",
    export: "download"
  };

  return icons[key] ?? (index % 2 === 0 ? "spark" : "check");
}
