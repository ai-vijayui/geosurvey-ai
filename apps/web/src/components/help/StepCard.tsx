type Props = {
  step: string;
  title: string;
  whatYouDo: string;
  whatAppDoes: string;
  whatYouSee: string;
  whatNext: string;
};

export function StepCard({ step, title, whatYouDo, whatAppDoes, whatYouSee, whatNext }: Props) {
  return (
    <article className="step-card">
      <span className="step-card__step">Step {step}</span>
      <strong>{title}</strong>
      <div className="step-card__rows">
        <p><span>You do:</span> {whatYouDo}</p>
        <p><span>App does:</span> {whatAppDoes}</p>
        <p><span>You will see:</span> {whatYouSee}</p>
        <p><span>Do next:</span> {whatNext}</p>
      </div>
    </article>
  );
}
