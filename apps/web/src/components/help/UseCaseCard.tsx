type Props = {
  title: string;
  uploads: string[];
  appDoes: string;
  output: string;
};

export function UseCaseCard({ title, uploads, appDoes, output }: Props) {
  return (
    <article className="use-case-card">
      <span className="use-case-card__tag">Real example</span>
      <strong>{title}</strong>
      <div className="use-case-card__rows">
        <p><span>You upload:</span> {uploads.join(", ")}</p>
        <p><span>App does:</span> {appDoes}</p>
        <p><span>You get:</span> {output}</p>
      </div>
    </article>
  );
}
