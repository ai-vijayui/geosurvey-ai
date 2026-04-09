import type { QuickAction } from "../../../features/ai-command/types";

type Props = {
  actions: QuickAction[];
  disabled?: boolean;
  onAction: (action: QuickAction) => void;
};

export function QuickActionsBlock({ actions, disabled, onAction }: Props) {
  return (
    <div className="ai-panel-actions">
      {actions.map((action) => (
        <button
          key={`${action.id}-${action.label}`}
          type="button"
          className={`ai-panel-action${action.variant === "primary" ? " ai-panel-action-primary" : action.variant === "danger" ? " ai-panel-action-danger" : action.variant === "ghost" ? " ai-panel-action-ghost" : ""}`}
          disabled={disabled}
          onClick={() => onAction(action)}
        >
          {action.label}
        </button>
      ))}
    </div>
  );
}
