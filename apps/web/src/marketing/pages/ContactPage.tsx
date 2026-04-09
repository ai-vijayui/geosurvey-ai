import { Card } from "../../components/ui/Card";
import { Seo } from "../components/Seo";
import { SectionContainer } from "../components/SectionContainer";

export function ContactPage() {
  return (
    <>
      <Seo
        title="Contact | Book a GeoSurvey AI Demo"
        description="Talk to the GeoSurvey AI team about survey workflows, pricing, demos, enterprise rollout, and implementation support."
      />
      <SectionContainer eyebrow="Contact" title="Talk to the team behind GeoSurvey AI." description="Use this page as the conversion point for buyers who want a guided walkthrough, enterprise pricing, or rollout support.">
      <div className="marketing-two-column">
        <Card>
          <h3>Book a demo</h3>
          <p>See how GeoSurvey AI handles uploads, job tracking, AI review, and reporting for real survey operations.</p>
          <div className="marketing-contact-list">
            <span>hello@geosurvey.ai</span>
            <span>Sales response within 1 business day</span>
            <span>Support for survey firms, civil teams, and public sector buyers</span>
          </div>
        </Card>
        <Card className="marketing-contact-form">
          <label className="ui-field">
            <span className="ui-field__label">Name</span>
            <input type="text" placeholder="Your name" />
          </label>
          <label className="ui-field">
            <span className="ui-field__label">Work email</span>
            <input type="email" placeholder="you@company.com" />
          </label>
          <label className="ui-field">
            <span className="ui-field__label">Company</span>
            <input type="text" placeholder="Company name" />
          </label>
          <label className="ui-field">
            <span className="ui-field__label">What are you evaluating?</span>
            <textarea rows={5} placeholder="Tell us about your survey workflow, team size, or delivery challenges." />
          </label>
          <button type="button" className="ui-button ui-button--primary ui-button--full">
            Request Demo
          </button>
        </Card>
      </div>
      </SectionContainer>
    </>
  );
}
