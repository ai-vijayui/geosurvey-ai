import { Card } from "../../components/ui/Card";
import { Seo } from "../components/Seo";
import { SectionContainer } from "../components/SectionContainer";
import { StaggerGroup } from "../../components/animation/StaggerGroup";
import { blogPosts } from "../data";

export function BlogPage() {
  return (
    <>
      <Seo
        title="Blog | GeoSurvey AI Resources for Survey Automation and Geospatial Workflows"
        description="Read practical content on AI survey software, GNSS processing, map review, geospatial workflow management, and reporting."
      />
      <SectionContainer eyebrow="Blog" title="Thoughtful content for teams modernizing survey operations." description="A simple content index keeps the blog useful without distracting from the core conversion path.">
      <StaggerGroup className="marketing-blog-list">
        {blogPosts.map((post) => (
          <Card key={post.title} className="marketing-blog-card">
            <div className="marketing-blog-card__meta">
              <span>{post.category}</span>
              <span>{post.readTime}</span>
            </div>
            <h3>{post.title}</h3>
            <p>{post.excerpt}</p>
          </Card>
        ))}
      </StaggerGroup>
      </SectionContainer>
    </>
  );
}
