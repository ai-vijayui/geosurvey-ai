import { Link } from "react-router-dom";
import { Card } from "../../components/ui/Card";
import { Seo } from "../components/Seo";
import { AICommandBlock } from "../components/AICommandBlock";
import { SectionContainer } from "../components/SectionContainer";
import { StaggerGroup } from "../../components/animation/StaggerGroup";
import { blogArticles, commandExamples } from "../siteContent";

export function BlogPage() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "GeoSurvey AI Blog",
    description: "Practical content on survey automation, GNSS workflows, map review, and geospatial operations.",
    publisher: {
      "@type": "Organization",
      name: "GeoSurvey AI"
    }
  };

  return (
    <>
      <Seo
        title="Blog | GeoSurvey AI Resources for Survey Automation and Geospatial Workflows"
        description="Read practical content on AI survey software, GNSS processing, map review, geospatial workflow management, and reporting."
        keywords="survey automation blog, GNSS processing guides, geospatial workflow articles, map review best practices"
        schema={schema}
      />
      <SectionContainer eyebrow="Blog" title="Thoughtful content for teams modernizing survey operations." description="The blog should attract search traffic and then move readers into features, AI Command Center, and signup.">
      <div className="marketing-blog-categories">
        <Link to="/blog/category/industry-insights">Industry Insights</Link>
        <Link to="/blog/category/tutorials">Tutorials</Link>
        <Link to="/blog/category/product-updates">Product Updates</Link>
      </div>
      <StaggerGroup className="marketing-blog-list">
        {blogArticles.map((post) => (
          <Card key={post.slug} className="marketing-blog-card">
            <div className="marketing-blog-card__meta">
              <span>{post.categoryLabel}</span>
              <span>{post.readTime}</span>
            </div>
            <h3>{post.title}</h3>
            <p>{post.excerpt}</p>
            <Link className="marketing-inline-link" to={`/blog/${post.slug}`}>Read article</Link>
          </Card>
        ))}
      </StaggerGroup>
      </SectionContainer>
      <SectionContainer eyebrow="Blog CTA" title="Each article should lead into the AI-first product path." description="This keeps the blog from becoming a dead-end traffic sink.">
        <div className="marketing-two-column">
          <AICommandBlock example={commandExamples[2]} title="Try the AI command path" />
          <Card className="marketing-panel-card">
            <span className="marketing-panel-card__label">Where the blog should send users</span>
            <div className="marketing-inline-links">
              <Link to="/ai-command-center">AI Command Center</Link>
              <Link to="/features">Explore Features</Link>
              <Link to="/sign-up">Start Free</Link>
            </div>
          </Card>
        </div>
      </SectionContainer>
    </>
  );
}
