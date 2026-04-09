import { Card } from "../../components/ui/Card";
import { Seo } from "../components/Seo";
import { CTASection } from "../components/CTASection";
import { PricingCard } from "../components/PricingCard";
import { SectionContainer } from "../components/SectionContainer";
import { StaggerGroup } from "../../components/animation/StaggerGroup";
import { VisualCluster } from "../components/VisualCluster";
import { pricingTiers } from "../data";

export function PricingPage() {
  return (
    <>
      <Seo
        title="Pricing | GeoSurvey AI Plans for Survey Teams and Enterprise Evaluation"
        description="View GeoSurvey AI pricing tiers for smaller teams, growing operations, and enterprise survey organizations."
      />
      <SectionContainer eyebrow="Pricing" title="Choose the rollout path that matches your team." description="Pricing should feel clear, controlled, and enterprise-ready instead of looking like a generic comparison table.">
        <div className="marketing-two-column marketing-two-column--visual">
          <VisualCluster variant="pricing" />
          <Card className="marketing-panel-card">
            <span className="marketing-panel-card__label">Pricing logic</span>
            <h3>Start simple, then scale AI usage and team structure as your workflow grows.</h3>
            <p>Smaller teams get a low-friction entry. Active survey teams get more automation and workflow visibility. Enterprise buyers get governance, rollout support, and a clear sales path.</p>
          </Card>
        </div>
      </SectionContainer>
      <SectionContainer eyebrow="Plans" title="Keep the comparison easy to scan." description="The plan cards still matter, but they should now sit inside a stronger visual pricing story.">
        <StaggerGroup className="marketing-pricing-grid">
          {pricingTiers.map((tier) => (
            <PricingCard key={tier.name} {...tier} />
          ))}
        </StaggerGroup>
      </SectionContainer>
      <SectionContainer eyebrow="Buying signals" title="Help buyers self-qualify faster." description="This section gives meaning to the plans beyond price alone.">
        <div className="marketing-three-grid">
          <Card className="marketing-panel-card">
            <span className="marketing-panel-card__label">Basic</span>
            <strong>For smaller teams proving the workflow value.</strong>
            <p>Best when the goal is to validate faster setup, cleaner processing, and simpler delivery.</p>
          </Card>
          <Card className="marketing-panel-card">
            <span className="marketing-panel-card__label">Pro</span>
            <strong>For active teams handling recurring survey volume.</strong>
            <p>Best when operators and managers both need more automation, job visibility, and reporting speed.</p>
          </Card>
          <Card className="marketing-panel-card">
            <span className="marketing-panel-card__label">Enterprise</span>
            <strong>For multi-team rollouts and procurement-led evaluation.</strong>
            <p>Best when security, governance, onboarding, and support matter as much as the workflow itself.</p>
          </Card>
        </div>
      </SectionContainer>
      <CTASection />
    </>
  );
}
