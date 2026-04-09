import { Link } from "react-router-dom";
import { getButtonClass } from "../../components/ui/Button";
import { SectionContainer } from "./SectionContainer";

export function CTASection() {
  return (
    <SectionContainer className="marketing-section marketing-section--compact">
      <div className="marketing-cta-panel">
        <div className="marketing-cta-panel__copy">
          <span className="marketing-eyebrow">Ready to see it live</span>
          <h2>Start your first AI survey today</h2>
          <p>Bring uploads, processing, review, and reporting into one calm operational system built for modern survey teams.</p>
        </div>
        <div className="marketing-cta-panel__actions">
          <Link className={getButtonClass("primary")} to="/sign-up">
            Get Started
          </Link>
          <Link className={getButtonClass("secondary")} to="/contact">
            Book Demo
          </Link>
        </div>
      </div>
    </SectionContainer>
  );
}
