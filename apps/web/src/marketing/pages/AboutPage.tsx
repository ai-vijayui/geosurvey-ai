import { Card } from "../../components/ui/Card";
import { CTASection } from "../components/CTASection";
import { Seo } from "../components/Seo";
import { SectionContainer } from "../components/SectionContainer";

export function AboutPage() {
  return (
    <>
      <Seo
        title="About | GeoSurvey AI"
        description="Learn why GeoSurvey AI is focused on modernizing survey workflows from data intake to map review, reporting, and delivery."
      />
      <SectionContainer eyebrow="About" title="Built to modernize the way survey teams move from field capture to final output." description="GeoSurvey AI is designed for operators who need trust, speed, and fewer handoffs across the survey lifecycle.">
        <div className="marketing-two-column">
          <Card>
            <h3>Why we exist</h3>
            <p>
              Survey operations still lose time to fragmented systems, repetitive QA work, and limited project visibility.
              GeoSurvey AI brings those workflows into one product that feels calm enough for daily use and robust enough for enterprise teams.
            </p>
          </Card>
          <Card>
            <h3>What we believe</h3>
            <p>
              Technical software should not feel chaotic. The best geospatial tools combine operational rigor, excellent UX, and clear decision support so teams can move faster with more confidence.
            </p>
          </Card>
        </div>
      </SectionContainer>
      <CTASection />
    </>
  );
}
