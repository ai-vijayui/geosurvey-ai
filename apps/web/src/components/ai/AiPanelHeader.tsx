type Props = {
  title: string;
  subtitle: string;
  onClear: () => void;
  onClose?: () => void;
};

export function AiPanelHeader({ title, subtitle, onClear, onClose }: Props) {
  return (
    <div className="ai-panel-header">
      <div className="stack ai-panel-header-copy" style={{ gap: "0.2rem" }}>
        <div className="ai-panel-header__meta">
          <strong className="ai-panel-header__title">{title}</strong>
          <span className="ai-panel-status">Live</span>
        </div>
        <span className="text-muted">{subtitle}</span>
      </div>
      <div className="row ai-panel-header-actions">
        <button type="button" className="icon-button icon-button-ghost" onClick={onClear} aria-label="Clear AI conversation" title="Clear">
          <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true">
            <path d="M9 3h6l1 2h4v2H4V5h4l1-2Zm1 6h2v8h-2V9Zm4 0h2v8h-2V9ZM7 9h2v8H7V9Zm-1 11V8h12v12a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2Z" />
          </svg>
        </button>
        {onClose ? (
          <button type="button" className="icon-button icon-button-ghost ai-panel-close" onClick={onClose} aria-label="Close AI panel" title="Close">
            <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true">
              <path d="M6.7 5.3 12 10.6l5.3-5.3 1.4 1.4L13.4 12l5.3 5.3-1.4 1.4L12 13.4l-5.3 5.3-1.4-1.4L10.6 12 5.3 6.7l1.4-1.4Z" />
            </svg>
          </button>
        ) : null}
      </div>
    </div>
  );
}
