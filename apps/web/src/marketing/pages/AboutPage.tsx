import { Card } from "../../components/ui/Card";
import { CTASection } from "../components/CTASection";
import { Seo } from "../components/Seo";
import { SectionContainer } from "../components/SectionContainer";
import { VisualCluster } from "../components/VisualCluster";

export function AboutPage() {
  return (
    <>
      <Seo
        title="About | GeoSurvey AI"
        description="Learn why GeoSurvey AI is focused on modernizing survey workflows from data intake to map review, reporting, and delivery."
      />
      <SectionContainer eyebrow="About" title="Built to modernize the way survey teams move from field capture to final output." description="GeoSurvey AI is designed for operators who need trust, speed, and fewer handoffs across the survey lifecycle.">
        <div className="marketing-problem-solution marketing-problem-solution--enhanced">
          <Card className="marketing-panel-card">
            <h3>Why we exist</h3>
            <p>
              Survey operations still lose time to fragmented systems, repetitive QA work, and limited project visibility.
              GeoSurvey AI brings those workflows into one product that feels calm enough for daily use and robust enough for enterprise teams.
            </p>
          </Card>
          <Card className="marketing-panel-card">
            <h3>What we believe</h3>
            <p>
              Technical software should not feel chaotic. The best geospatial tools combine operational rigor, excellent UX, and clear decision support so teams can move faster with more confidence.
            </p>
          </Card>
          <VisualCluster variant="compare" />
        </div>
      </SectionContainer>
      <SectionContainer
        eyebrow="Product philosophy"
        title="The product direction is simple: reduce operational drag without reducing control."
        description="This page should still feel product-led, so the visual system reinforces how the company thinks about workflow design."
      >
        <div className="marketing-two-column marketing-two-column--visual">
          <VisualCluster variant="platform" />
          <div className="marketing-feature-detail-list">
            <Card className="marketing-panel-card">
              <span className="marketing-panel-card__label">Calm by design</span>
              <h3>Serious software should feel clear under pressure.</h3>
              <p>We design for teams handling real jobs, deadlines, QA decisions, and client delivery, not abstract demo flows.</p>
            </Card>
            <Card className="marketing-panel-card">
              <span className="marketing-panel-card__label">AI with responsibility</span>
              <h3>Automation should accelerate judgment, not replace it blindly.</h3>
              <p>GeoSurvey AI helps create, process, review, and prepare outputs while still keeping teams in control of the final decision path.</p>
            </Card>
          </div>
        </div>
      </SectionContainer>
      <CTASection />
    </>
  );
}
