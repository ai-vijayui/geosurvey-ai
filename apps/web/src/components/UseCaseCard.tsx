type Props = {
  title: string;
  summary: string;
  tag: string;
  outcomes: string[];
};

export function UseCaseCard({ title, summary, tag, outcomes }: Props) {
  return (
    <article className="use-case-card">
      <span className="use-case-card__tag">{tag}</span>
      <strong>{title}</strong>
      <p>{summary}</p>
      <div className="use-case-card__list">
        {outcomes.map((outcome) => (
          <span key={outcome} className="use-case-card__item">
            {outcome}
          </span>
        ))}
      </div>
    </article>
  );
}
