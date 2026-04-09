import { CTASection } from "../components/CTASection";
import { PricingCard } from "../components/PricingCard";
import { SectionContainer } from "../components/SectionContainer";
import { pricingTiers } from "../data";

export function PricingPage() {
  return (
    <>
      <SectionContainer eyebrow="Pricing" title="Choose the rollout path that matches your team." description="Pricing keeps the self-serve entry obvious while making it easy for larger organizations to start a sales conversation.">
        <div className="marketing-pricing-grid">
          {pricingTiers.map((tier) => (
            <PricingCard key={tier.name} {...tier} />
          ))}
        </div>
      </SectionContainer>
      <CTASection />
    </>
  );
}
