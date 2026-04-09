import { Seo } from "../components/Seo";
import { CTASection } from "../components/CTASection";
import { PricingCard } from "../components/PricingCard";
import { SectionContainer } from "../components/SectionContainer";
import { StaggerGroup } from "../../components/animation/StaggerGroup";
import { pricingTiers } from "../data";

export function PricingPage() {
  return (
    <>
      <Seo
        title="Pricing | GeoSurvey AI Plans for Survey Teams and Enterprise Evaluation"
        description="View GeoSurvey AI pricing tiers for smaller teams, growing operations, and enterprise survey organizations."
      />
      <SectionContainer eyebrow="Pricing" title="Choose the rollout path that matches your team." description="Pricing keeps the self-serve entry obvious while making it easy for larger organizations to start a sales conversation.">
        <StaggerGroup className="marketing-pricing-grid">
          {pricingTiers.map((tier) => (
            <PricingCard key={tier.name} {...tier} />
          ))}
        </StaggerGroup>
      </SectionContainer>
      <CTASection />
    </>
  );
}
