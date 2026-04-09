import { CTASection } from "../components/CTASection";
import { FeatureCard } from "../components/FeatureCard";
import { SectionContainer } from "../components/SectionContainer";
import { coreFeatures } from "../data";

export function FeaturesPage() {
  return (
    <>
      <SectionContainer eyebrow="Features" title="A clearer operating system for modern survey delivery." description="Every feature is organized around speed, visibility, and trust so buyers can understand where the value shows up.">
        <div className="marketing-feature-grid">
          {coreFeatures.map((feature) => (
            <FeatureCard key={feature.title} {...feature} />
          ))}
        </div>
      </SectionContainer>
      <CTASection />
    </>
  );
}
