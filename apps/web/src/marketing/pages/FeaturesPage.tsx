import { Seo } from "../components/Seo";
import { CTASection } from "../components/CTASection";
import { FeatureCard } from "../components/FeatureCard";
import { SectionContainer } from "../components/SectionContainer";
import { StaggerGroup } from "../../components/animation/StaggerGroup";
import { coreFeatures, detailedFeatures } from "../data";
import { Card } from "../../components/ui/Card";

export function FeaturesPage() {
  return (
    <>
      <Seo
        title="Features | GeoSurvey AI Survey Workflow Features and Operational Capabilities"
        description="Explore survey job management, uploads, GNSS import, map-based review, AI insights, and reports inside GeoSurvey AI."
      />
      <SectionContainer eyebrow="Features" title="A clearer operating system for modern survey delivery." description="Every feature is organized around speed, visibility, and trust so buyers can understand where the value shows up.">
        <StaggerGroup className="marketing-feature-grid">
          {coreFeatures.map((feature) => (
            <FeatureCard key={feature.title} {...feature} />
          ))}
        </StaggerGroup>
      </SectionContainer>
      <SectionContainer eyebrow="Feature depth" title="Each capability removes a specific operational bottleneck." description="Feature detail matters in this category because buyers need to see workflow fit, not just high-level categories.">
        <div className="marketing-feature-detail-list">
          {detailedFeatures.map((feature) => (
            <Card key={feature.title} className="marketing-panel-card">
              <span className="marketing-panel-card__label">{feature.title}</span>
              <p>{feature.description}</p>
              <p><strong>Business value:</strong> {feature.value}</p>
              <p><strong>Objection removed:</strong> {feature.objection}</p>
            </Card>
          ))}
        </div>
      </SectionContainer>
      <CTASection />
    </>
  );
}
