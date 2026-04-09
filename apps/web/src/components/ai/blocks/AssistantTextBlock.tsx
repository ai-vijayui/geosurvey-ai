type Props = {
  text: string;
};

export function AssistantTextBlock({ text }: Props) {
  return <div className="text-sm leading-6 text-slate-600">{text}</div>;
}
