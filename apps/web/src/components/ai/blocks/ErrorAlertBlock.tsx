import type { ErrorAlertData } from "../../../features/ai-command/types";

type Props = {
  error: ErrorAlertData;
};

export function ErrorAlertBlock({ error }: Props) {
  return (
    <div className="rounded-2xl border border-[var(--error-border)] bg-[var(--error-soft)] px-4 py-3 text-sm leading-6 text-[var(--error)]">
      <strong className="block font-semibold">{error.title}</strong>
      <span className="mt-1 block">{error.description}</span>
    </div>
  );
}
