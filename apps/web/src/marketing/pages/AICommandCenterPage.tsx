import { Link } from "react-router-dom";
import { Card } from "../../components/ui/Card";
import { getButtonClass } from "../../components/ui/Button";
import { AICommandBlock } from "../components/AICommandBlock";
import { CTASection } from "../components/CTASection";
import { Seo } from "../components/Seo";
import { SectionContainer } from "../components/SectionContainer";
import { VisualCluster } from "../components/VisualCluster";
import { commandExamples } from "../siteContent";

export function AICommandCenterPage() {
  return (
    <>
      <Seo
        title="AI Command Center | Run GeoSurvey AI with Natural Instructions"
        description="Type an instruction, let GeoSurvey AI create projects, set up jobs, process data, and generate outputs automatically."
        keywords="AI command center, survey AI commands, AI survey assistant, AI-first survey software"
      />

      <SectionContainer
        eyebrow="AI Command Center"
        title="Type the instruction. GeoSurvey AI runs the workflow."
        description="This is the core product story: the user gives direction, and the platform handles project creation, job setup, processing, and output preparation."
        actions={
          <>
            <Link className={getButtonClass("primary")} to="/sign-up">
              Start Free
            </Link>
            <Link className={getButtonClass("secondary")} to="/demo">
              Try AI Demo
            </Link>
          </>
        }
      >
        <AICommandBlock example={commandExamples[0]} title="Command center live pattern" />
      </SectionContainer>

      <SectionContainer
        eyebrow="How it works"
        title="One command can replace several manual setup steps."
        description="Instead of navigating the platform screen by screen, teams direct the workflow in plain language."
      >
        <div className="marketing-problem-solution marketing-problem-solution--enhanced">
          <Card className="marketing-panel-card">
            <span className="marketing-panel-card__label">Command path</span>
            <ul className="marketing-list marketing-list--spacious">
              <li>Type what needs to happen</li>
              <li>AI creates the project and job context</li>
              <li>AI starts the correct workflow</li>
              <li>Outputs and next actions are returned clearly</li>
            </ul>
          </Card>
          <Card className="marketing-panel-card">
            <span className="marketing-panel-card__label">Why it matters</span>
            <ul className="marketing-list marketing-list--spacious">
              <li>No technical navigation burden for routine actions</li>
              <li>Faster setup for recurring survey workflows</li>
              <li>Better visibility into what the platform did and what comes next</li>
            </ul>
          </Card>
          <VisualCluster variant="platform" />
        </div>
      </SectionContainer>

      <SectionContainer
        eyebrow="Example commands"
        title="Command examples the user can understand in one scan."
        description="These examples reinforce the AI-first experience across project creation, processing, and reporting."
      >
        <div className="marketing-three-grid">
          {commandExamples.map((example) => (
            <AICommandBlock key={example.prompt} example={example} compact title="Command example" />
          ))}
        </div>
      </SectionContainer>

      <SectionContainer
        eyebrow="Why it feels different"
        title="This is a command-driven product, not a chat widget pasted onto a dashboard."
        description="The AI layer is tied directly to project creation, job setup, processing, review, and outputs."
      >
        <VisualCluster variant="compare" />
      </SectionContainer>

      <CTASection />
    </>
  );
}
