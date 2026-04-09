import { Link, Navigate, useParams } from "react-router-dom";
import { Card } from "../../components/ui/Card";
import { getButtonClass } from "../../components/ui/Button";
import { AICommandBlock } from "../components/AICommandBlock";
import { CTASection } from "../components/CTASection";
import { Seo } from "../components/Seo";
import { SectionContainer } from "../components/SectionContainer";
import { VisualCluster } from "../components/VisualCluster";
import { featurePages, resourcePages, useCasePages } from "../siteContent";

export function ResourceDetailPage() {
  const { slug = "" } = useParams();
  const resource = resourcePages.find((item) => item.slug === slug);

  if (!resource) {
    return <Navigate to="/resources" replace />;
  }

  const relatedFeature = featurePages.find((item) => item.slug === resource.relatedFeatureSlug);
  const relatedUseCase = useCasePages.find((item) => item.slug === resource.relatedUseCaseSlug);

  return (
    <>
      <Seo title={`${resource.title} | GeoSurvey AI Resources`} description={resource.summary} />

      <SectionContainer
        eyebrow={resource.eyebrow}
        title={resource.title}
        description={resource.description}
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
        <div className="marketing-two-column marketing-two-column--visual">
          <AICommandBlock example={resource.command ?? featurePages[0].command} title={`${resource.eyebrow} AI example`} />
          <VisualCluster variant="resources" />
        </div>
      </SectionContainer>

      <SectionContainer
        eyebrow="Resource content"
        title="Use this section to keep education tied to action."
        description="Each resource should teach something practical and then route the visitor toward the most relevant next step."
      >
        <div className="marketing-feature-detail-list">
          {resource.items.map((item) => (
            <Card key={item.title} className="marketing-panel-card">
              <span className="marketing-panel-card__label">{resource.eyebrow} item</span>
              <h3>{item.title}</h3>
              <p>{item.description}</p>
              <Link className="marketing-inline-link" to={item.ctaHref}>
                {item.ctaLabel}
              </Link>
            </Card>
          ))}
        </div>
      </SectionContainer>

      <SectionContainer
        eyebrow="Related paths"
        title="Keep the visitor moving through the product funnel."
        description="No resource page should end without links back into the product, the relevant workflow, and conversion CTAs."
      >
        <div className="marketing-three-grid">
          <Card className="marketing-panel-card">
            <span className="marketing-panel-card__label">Related feature</span>
            <div className="marketing-inline-links">
              {relatedFeature ? <Link to={`/features/${relatedFeature.slug}`}>{relatedFeature.title}</Link> : <Link to="/features">Explore Features</Link>}
              <Link to="/ai-command-center">Open AI Command Center</Link>
            </div>
          </Card>
          <Card className="marketing-panel-card">
            <span className="marketing-panel-card__label">Related workflow</span>
            <div className="marketing-inline-links">
              {relatedUseCase ? <Link to={`/use-cases/${relatedUseCase.slug}`}>{relatedUseCase.title}</Link> : <Link to="/solutions">Explore use cases</Link>}
              <Link to="/demo">Try AI Demo</Link>
            </div>
          </Card>
          <Card className="marketing-panel-card">
            <span className="marketing-panel-card__label">Primary action</span>
            <div className="marketing-inline-links">
              <Link to="/sign-up">Start Free</Link>
              <Link to="/pricing">View Pricing</Link>
            </div>
          </Card>
        </div>
      </SectionContainer>

      <CTASection />
    </>
  );
}
