import { Link, Navigate, useParams } from "react-router-dom";
import { Card } from "../../components/ui/Card";
import { getButtonClass } from "../../components/ui/Button";
import { CTASection } from "../components/CTASection";
import { Seo } from "../components/Seo";
import { SectionContainer } from "../components/SectionContainer";
import { blogArticles } from "../siteContent";

export function BlogCategoryPage() {
  const { slug = "" } = useParams();
  const filtered = blogArticles.filter((item) => item.category === slug);

  if (filtered.length === 0) {
    return <Navigate to="/blog" replace />;
  }

  return (
    <>
      <Seo title={`${filtered[0].categoryLabel} | GeoSurvey AI Blog`} description={`Browse ${filtered[0].categoryLabel.toLowerCase()} articles from GeoSurvey AI.`} />

      <SectionContainer
        eyebrow="Blog category"
        title={filtered[0].categoryLabel}
        description="Category pages should still be part of the CRO path, not just archive pages."
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
        <div className="marketing-blog-list">
          {filtered.map((post) => (
            <Card key={post.slug} className="marketing-blog-card">
              <div className="marketing-blog-card__meta">
                <span>{post.categoryLabel}</span>
                <span>{post.readTime}</span>
              </div>
              <h3>{post.title}</h3>
              <p>{post.excerpt}</p>
              <Link className="marketing-inline-link" to={`/blog/${post.slug}`}>
                Read article
              </Link>
            </Card>
          ))}
        </div>
      </SectionContainer>

      <CTASection />
    </>
  );
}
