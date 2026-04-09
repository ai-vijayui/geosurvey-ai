import { Link } from "react-router-dom";
import { getButtonClass } from "../../components/ui/Button";

export function SectionFlowLinks() {
  return (
    <div className="marketing-section-flow">
      <div className="marketing-section-flow__actions">
        <Link className={getButtonClass("primary")} to="/sign-up">
          Start Free
        </Link>
        <Link className={getButtonClass("secondary")} to="/demo">
          Try AI Demo
        </Link>
      </div>
      <div className="marketing-section-flow__links">
        <Link to="/ai-command-center">AI Command Center</Link>
        <Link to="/features">Features</Link>
        <Link to="/pricing">Pricing</Link>
      </div>
    </div>
  );
}
