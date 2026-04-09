type Props = {
  step: string;
  title: string;
  description: string;
};

export function StepCard({ step, title, description }: Props) {
  return (
    <article className="step-card">
      <span className="step-card__step">{step}</span>
      <strong>{title}</strong>
      <p>{description}</p>
    </article>
  );
}
