import { PrimaryButton } from "../ui/Button";

type Props = {
  value: string;
  disabled?: boolean;
  onChange: (value: string) => void;
  onSend: () => void;
};

export function AiInputBar({ value, disabled, onChange, onSend }: Props) {
  return (
    <div className="ai-input ai-input-bar">
      <div className="ai-input-shell">
        <textarea
          value={value}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
              event.preventDefault();
              onSend();
            }
          }}
          placeholder={disabled ? "AI is unavailable right now." : "Ask GeoSurvey AI what to do next..."}
          rows={3}
        />
        <div className="ai-input-actions">
          <span className="text-muted">Commands and chat both work here</span>
          <PrimaryButton type="button" disabled={disabled || !value.trim()} onClick={onSend}>
            Send
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}
