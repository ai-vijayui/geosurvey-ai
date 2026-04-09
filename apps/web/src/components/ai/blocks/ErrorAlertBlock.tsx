import type { ErrorAlertData } from "../../../features/ai-command/types";

type Props = {
  error: ErrorAlertData;
};

export function ErrorAlertBlock({ error }: Props) {
  return (
    <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm leading-6 text-rose-700">
      <strong className="block font-semibold">{error.title}</strong>
      <span className="mt-1 block">{error.description}</span>
    </div>
  );
}
