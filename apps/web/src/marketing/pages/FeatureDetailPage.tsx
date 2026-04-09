import { Link, Navigate, useParams } from "react-router-dom";
import { Card } from "../../components/ui/Card";
import { getButtonClass } from "../../components/ui/Button";
import { AICommandBlock } from "../components/AICommandBlock";
import { CTASection } from "../components/CTASection";
import { Seo } from "../components/Seo";
import { SectionContainer } from "../components/SectionContainer";
import { VisualCluster } from "../components/VisualCluster";
import { blogArticles, featurePages, useCasePages } from "../siteContent";

export function FeatureDetailPage() {
  const { slug = "" } = useParams();
  const feature = featurePages.find((item) => item.slug === slug);

  if (!feature) {
    return <Navigate to="/features" replace />;
  }

  const relatedUseCases = useCasePages.filter((item) => feature.relatedUseCases.includes(item.slug));
  const relatedArticles = blogArticles.filter((item) => feature.relatedBlogSlugs.includes(item.slug));

  return (
    <>
      <Seo title={`${feature.title} | GeoSurvey AI`} description={feature.summary} />

      <SectionContainer
        eyebrow="Feature detail"
        title={feature.title}
        description={feature.summary}
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
        <AICommandBlock example={feature.command} title="Example AI command" />
      </SectionContainer>

      <SectionContainer eyebrow="Problem" title="What this feature replaces" description={feature.problem}>
        <div className="marketing-two-column">
          <Card className="marketing-panel-card">
            <span className="marketing-panel-card__label">Manual workflow problem</span>
            <p>{feature.problem}</p>
          </Card>
          <Card className="marketing-panel-card">
            <span className="marketing-panel-card__label">AI solution</span>
            <p>{feature.aiSolution}</p>
          </Card>
        </div>
      </SectionContainer>

      <SectionContainer eyebrow="Output preview" title="What the user gets back" description={feature.outputPreview}>
        <div className="marketing-problem-solution marketing-problem-solution--enhanced">
          <Card className="marketing-panel-card">
            <span className="marketing-panel-card__label">Result</span>
            <p>{feature.outputPreview}</p>
          </Card>
          <Card className="marketing-panel-card">
            <span className="marketing-panel-card__label">Next step</span>
            <div className="marketing-inline-links">
              <Link to="/ai-command-center">See AI Command Center</Link>
              <Link to="/pricing">View Pricing</Link>
              <Link to="/demo">Try AI Demo</Link>
            </div>
          </Card>
          <VisualCluster variant="platform" />
        </div>
      </SectionContainer>

      <SectionContainer eyebrow="Related use cases" title="See where this feature matters most." description="Feature pages should never be dead ends. They should lead into role-based workflows and deeper education.">
        <div className="marketing-two-column">
          <Card className="marketing-panel-card">
            <span className="marketing-panel-card__label">Use cases</span>
            <div className="marketing-inline-links">
              {relatedUseCases.map((item) => (
                <Link key={item.slug} to={`/use-cases/${item.slug}`}>
                  {item.title}
                </Link>
              ))}
            </div>
          </Card>
          <Card className="marketing-panel-card">
            <span className="marketing-panel-card__label">Related blog posts</span>
            <div className="marketing-inline-links">
              {relatedArticles.map((item) => (
                <Link key={item.slug} to={`/blog/${item.slug}`}>
                  {item.title}
                </Link>
              ))}
            </div>
          </Card>
        </div>
      </SectionContainer>

      <CTASection />
    </>
  );
}
