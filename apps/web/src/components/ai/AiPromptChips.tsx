type Props = {
  prompts: string[];
  disabled?: boolean;
  onSelect: (prompt: string) => void;
};

export function AiPromptChips({ prompts, disabled, onSelect }: Props) {
  return (
    <div className="ai-prompt-chips">
      {prompts.map((prompt) => (
        <button key={prompt} type="button" className="ai-prompt-chip" disabled={disabled} onClick={() => onSelect(prompt)}>
          {prompt}
        </button>
      ))}
    </div>
  );
}
