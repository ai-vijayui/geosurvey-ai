import { Link } from "react-router-dom";

type Props = {
  title?: string;
  description?: string;
};

export function DemoProjectBanner({
  title = "Need a safe place to practice?",
  description = "Start with a demo task and sample files first. You do not need real survey data to learn the app."
}: Props) {
  return (
    <section className="demo-project-banner">
      <div className="space-y-2">
        <span className="reference-chip">Try demo project</span>
        <strong>{title}</strong>
        <p>{description}</p>
      </div>
      <div className="demo-project-banner__actions">
        <Link className="button-primary" to="/jobs?createJob=1&demoType=GNSS_TRAVERSE&demoName=Demo%20GNSS%20Land%20Survey">Start Demo</Link>
        <Link className="button-secondary" to="/help#sample-files">Open Demo Help</Link>
      </div>
    </section>
  );
}
