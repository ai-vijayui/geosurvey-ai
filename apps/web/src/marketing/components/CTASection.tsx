import { Link } from "react-router-dom";
import { getButtonClass } from "../../components/ui/Button";
import { Reveal } from "../../components/animation/Reveal";
import { SectionContainer } from "./SectionContainer";

export function CTASection() {
  return (
    <SectionContainer className="marketing-section marketing-section--compact" showFlowLinks={false}>
      <Reveal className="marketing-cta-panel">
        <div className="marketing-cta-panel__copy">
          <span className="marketing-eyebrow">Ready to see it live</span>
          <h2>Let AI handle your survey workflow</h2>
          <p>Give GeoSurvey AI the instruction, let it create the project and workflow, and move from data intake to outputs faster.</p>
        </div>
        <div className="marketing-cta-panel__actions">
          <Link className={getButtonClass("primary")} to="/sign-up">
            Start Free
          </Link>
          <Link className={getButtonClass("secondary")} to="/demo">
            Try AI Demo
          </Link>
        </div>
      </Reveal>
    </SectionContainer>
  );
}
