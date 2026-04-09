import { Card } from "../../components/ui/Card";
import { CTASection } from "../components/CTASection";
import { LeadCaptureForm } from "../components/LeadCaptureForm";
import { Seo } from "../components/Seo";
import { SectionContainer } from "../components/SectionContainer";
import { VisualCluster } from "../components/VisualCluster";

export function ContactPage() {
  return (
    <>
      <Seo
        title="Contact | Book a GeoSurvey AI Demo"
        description="Talk to the GeoSurvey AI team about survey workflows, pricing, demos, enterprise rollout, and implementation support."
      />
      <SectionContainer eyebrow="Contact" title="Talk to the team behind GeoSurvey AI." description="Use this page as the conversion point for buyers who want a guided walkthrough, enterprise pricing, or rollout support.">
      <div className="marketing-problem-solution marketing-problem-solution--enhanced">
        <Card className="marketing-panel-card">
          <h3>Book a demo</h3>
          <p>See how GeoSurvey AI handles uploads, job tracking, AI review, and reporting for real survey operations.</p>
          <div className="marketing-contact-list">
            <span>hello@geosurvey.ai</span>
            <span>Sales response within 1 business day</span>
            <span>Support for survey firms, civil teams, and public sector buyers</span>
          </div>
        </Card>
        <LeadCaptureForm interest="contact" sourcePage="contact-page" submitLabel="Request Demo" successTitle="Demo request received" />
        <VisualCluster variant="platform" />
      </div>
      </SectionContainer>
      <SectionContainer
        eyebrow="What happens next"
        title="The contact flow should reduce uncertainty, not create more of it."
        description="Show buyers what kind of response and evaluation path they can expect after submitting the form."
      >
        <div className="marketing-three-grid">
          <Card className="marketing-panel-card">
            <span className="marketing-panel-card__label">Step 1</span>
            <strong>We review your workflow context.</strong>
            <p>We look at the team type, job volume, and workflow needs you described.</p>
          </Card>
          <Card className="marketing-panel-card">
            <span className="marketing-panel-card__label">Step 2</span>
            <strong>We tailor the walkthrough.</strong>
            <p>The demo focuses on the parts of GeoSurvey AI most relevant to your survey or geospatial process.</p>
          </Card>
          <Card className="marketing-panel-card">
            <span className="marketing-panel-card__label">Step 3</span>
            <strong>You get a clear next step.</strong>
            <p>That may be a trial, a deeper technical evaluation, or an enterprise rollout conversation.</p>
          </Card>
        </div>
      </SectionContainer>
      <CTASection />
    </>
  );
}
