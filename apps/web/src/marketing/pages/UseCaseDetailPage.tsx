import { Link, Navigate, useParams } from "react-router-dom";
import { Card } from "../../components/ui/Card";
import { getButtonClass } from "../../components/ui/Button";
import { CTASection } from "../components/CTASection";
import { Seo } from "../components/Seo";
import { SectionContainer } from "../components/SectionContainer";
import { VisualCluster } from "../components/VisualCluster";
import { featurePages, useCasePages } from "../siteContent";

export function UseCaseDetailPage() {
  const { slug = "" } = useParams();
  const useCase = useCasePages.find((item) => item.slug === slug);

  if (!useCase) {
    return <Navigate to="/solutions" replace />;
  }

  const relatedFeatures = featurePages.filter((item) => useCase.featureSlugs.includes(item.slug));

  return (
    <>
      <Seo title={`${useCase.title} | GeoSurvey AI`} description={useCase.result} />

      <SectionContainer
        eyebrow="Use case detail"
        title={useCase.title}
        description={useCase.result}
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
        <div className="marketing-two-column">
          <Card className="marketing-panel-card">
            <span className="marketing-panel-card__label">Pain points</span>
            <ul className="marketing-list">
              {useCase.painPoints.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </Card>
          <Card className="marketing-panel-card">
            <span className="marketing-panel-card__label">AI-powered result</span>
            <p>{useCase.result}</p>
          </Card>
        </div>
      </SectionContainer>

      <SectionContainer eyebrow="Workflow comparison" title="Traditional workflow vs AI-first workflow" description="This comparison is one of the clearest CRO moments on use-case pages.">
        <div className="marketing-problem-solution marketing-problem-solution--enhanced">
          <Card className="marketing-panel-card">
            <span className="marketing-panel-card__label">Traditional workflow</span>
            <ul className="marketing-list">
              {useCase.traditionalWorkflow.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </Card>
          <Card className="marketing-panel-card">
            <span className="marketing-panel-card__label">AI-powered workflow</span>
            <ul className="marketing-list">
              {useCase.aiWorkflow.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </Card>
          <VisualCluster variant="compare" />
        </div>
      </SectionContainer>

      <SectionContainer eyebrow="Next actions" title="Move from this use case into the product flow." description="Use-case pages must link back to features and the demo experience to keep visitors moving.">
        <div className="marketing-two-column">
          <Card className="marketing-panel-card">
            <span className="marketing-panel-card__label">Related features</span>
            <div className="marketing-inline-links">
              {relatedFeatures.map((item) => (
                <Link key={item.slug} to={`/features/${item.slug}`}>
                  {item.title}
                </Link>
              ))}
            </div>
          </Card>
          <Card className="marketing-panel-card">
            <span className="marketing-panel-card__label">Demo path</span>
            <div className="marketing-inline-links">
              <Link to="/demo">Try AI Demo</Link>
              <Link to="/ai-command-center">AI Command Center</Link>
              <Link to="/pricing">View Pricing</Link>
            </div>
          </Card>
        </div>
      </SectionContainer>

      <CTASection />
    </>
  );
}
