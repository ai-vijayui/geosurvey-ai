import { Link, Navigate, useParams } from "react-router-dom";
import { Card } from "../../components/ui/Card";
import { getButtonClass } from "../../components/ui/Button";
import { AICommandBlock } from "../components/AICommandBlock";
import { CTASection } from "../components/CTASection";
import { Seo } from "../components/Seo";
import { SectionContainer } from "../components/SectionContainer";
import { VisualCluster } from "../components/VisualCluster";
import { blogArticles, featurePages } from "../siteContent";

export function BlogDetailPage() {
  const { slug = "" } = useParams();
  const index = blogArticles.findIndex((item) => item.slug === slug);

  if (index === -1) {
    return <Navigate to="/blog" replace />;
  }

  const article = blogArticles[index];
  const relatedFeature = featurePages.find((item) => item.slug === article.relatedFeatureSlug);
  const relatedArticles = blogArticles.filter((item) => article.relatedArticleSlugs.includes(item.slug));
  const previousArticle = index > 0 ? blogArticles[index - 1] : null;
  const nextArticle = index < blogArticles.length - 1 ? blogArticles[index + 1] : null;

  return (
    <>
      <Seo title={`${article.title} | GeoSurvey AI Blog`} description={article.excerpt} />

      <SectionContainer
        eyebrow={article.categoryLabel}
        title={article.title}
        description={article.excerpt}
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
          <div className="marketing-article">
            {article.body.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
          <VisualCluster variant="resources" />
        </div>
      </SectionContainer>

      <SectionContainer eyebrow="Inline CTA" title="See the AI workflow behind the article." description="Blog content should always bridge into product understanding and action.">
        <div className="marketing-two-column marketing-two-column--visual">
          <AICommandBlock example={article.command} title="AI command example" />
          <VisualCluster variant="platform" />
        </div>
      </SectionContainer>

      <SectionContainer eyebrow="Keep exploring" title="Related content and product links" description="This section prevents the article from becoming a dead-end content page.">
        <div className="marketing-three-grid">
          <Card className="marketing-panel-card">
            <span className="marketing-panel-card__label">Related articles</span>
            <div className="marketing-inline-links">
              {relatedArticles.map((item) => (
                <Link key={item.slug} to={`/blog/${item.slug}`}>
                  {item.title}
                </Link>
              ))}
            </div>
          </Card>
          <Card className="marketing-panel-card">
            <span className="marketing-panel-card__label">Related feature</span>
            <div className="marketing-inline-links">
              {relatedFeature ? <Link to={`/features/${relatedFeature.slug}`}>{relatedFeature.title}</Link> : <Link to="/features">Explore features</Link>}
              <Link to="/ai-command-center">AI Command Center</Link>
            </div>
          </Card>
          <Card className="marketing-panel-card">
            <span className="marketing-panel-card__label">Next steps</span>
            <div className="marketing-inline-links">
              {previousArticle ? <Link to={`/blog/${previousArticle.slug}`}>Previous article</Link> : null}
              {nextArticle ? <Link to={`/blog/${nextArticle.slug}`}>Next article</Link> : null}
              <Link to="/sign-up">Start Free</Link>
            </div>
          </Card>
        </div>
      </SectionContainer>

      <CTASection />
    </>
  );
}
