import { Link } from "react-router-dom";
import { Card } from "../../components/ui/Card";
import { getButtonClass } from "../../components/ui/Button";
import { AICommandBlock } from "../components/AICommandBlock";
import { CTASection } from "../components/CTASection";
import { Seo } from "../components/Seo";
import { SectionContainer } from "../components/SectionContainer";
import { commandExamples } from "../siteContent";

export function DemoPage() {
  return (
    <>
      <Seo
        title="Try AI Demo | GeoSurvey AI"
        description="See how GeoSurvey AI turns simple instructions into projects, jobs, processing steps, and output-ready workflows."
      />

      <SectionContainer
        eyebrow="AI Demo"
        title="See the AI-first workflow before you create an account."
        description="The demo page should remove friction by showing the command experience, the operational UI pattern, and the outputs users can expect."
        actions={
          <>
            <Link className={getButtonClass("primary")} to="/sign-up">
              Start Free
            </Link>
            <Link className={getButtonClass("secondary")} to="/ai-command-center">
              Explore AI Command
            </Link>
          </>
        }
      >
        <AICommandBlock example={commandExamples[1]} title="AI demo interaction" />
      </SectionContainer>

      <SectionContainer
        eyebrow="What the demo proves"
        title="The assistant is part of the product workflow, not a separate gimmick."
        description="Users should understand that GeoSurvey AI is a command center layered into project, job, review, and reporting workflows."
      >
        <div className="marketing-three-grid">
          <Card className="marketing-panel-card">
            <span className="marketing-panel-card__label">Project setup</span>
            <p>AI creates the project and job context automatically.</p>
          </Card>
          <Card className="marketing-panel-card">
            <span className="marketing-panel-card__label">Processing</span>
            <p>AI launches the correct workflow and keeps progress visible.</p>
          </Card>
          <Card className="marketing-panel-card">
            <span className="marketing-panel-card__label">Outputs</span>
            <p>AI helps move the team toward maps, reports, and review-ready deliverables.</p>
          </Card>
        </div>
      </SectionContainer>

      <CTASection />
    </>
  );
}
