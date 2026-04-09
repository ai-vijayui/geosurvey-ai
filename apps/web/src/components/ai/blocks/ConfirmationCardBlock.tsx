type Props = {
  title?: string;
  message: string;
  summary?: Array<{ label: string; value: string }>;
  confirmLabel?: string;
  cancelLabel?: string;
  editLabel?: string;
  showEdit?: boolean;
  disabled?: boolean;
  onConfirm: () => void;
  onEdit?: () => void;
  onCancel: () => void;
};

export function ConfirmationCardBlock({ title, message, summary, confirmLabel = "Confirm", cancelLabel = "Cancel", editLabel = "Edit", showEdit, disabled, onConfirm, onEdit, onCancel }: Props) {
  return (
    <div className="ai-panel-card ai-panel-card-warning">
      <strong className="block text-slate-900">{title ?? "Confirmation required"}</strong>
      <span className="mt-2 block leading-6 text-slate-600">{message}</span>
      {summary?.length ? (
        <div className="ai-panel-summary">
          {summary.map((item) => (
            <div key={item.label} className="flex items-start justify-between gap-3">
              <span className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{item.label}</span>
              <span className="text-right text-sm text-slate-700">{item.value}</span>
            </div>
          ))}
        </div>
      ) : null}
      <div className="ai-panel-actions mt-4">
        <button type="button" className="ai-panel-action ai-panel-action-primary" disabled={disabled} onClick={onConfirm}>
          {confirmLabel}
        </button>
        {showEdit ? (
          <button type="button" className="ai-panel-action" disabled={disabled} onClick={onEdit}>
            {editLabel}
          </button>
        ) : null}
        <button type="button" className="ai-panel-action ai-panel-action-ghost" disabled={disabled} onClick={onCancel}>
          {cancelLabel}
        </button>
      </div>
    </div>
  );
}
