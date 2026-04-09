type Props = {
  title: string;
  subtitle: string;
  onClear: () => void;
  onCloseMobile?: () => void;
};

export function AiPanelHeader({ title, subtitle, onClear, onCloseMobile }: Props) {
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
        <button type="button" className="button-ghost" onClick={onClear}>
          Clear
        </button>
        {onCloseMobile ? (
          <button type="button" className="button-ghost ai-mobile-close" onClick={onCloseMobile}>
            Close
          </button>
        ) : null}
      </div>
    </div>
  );
}
