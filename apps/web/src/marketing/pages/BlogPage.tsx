import { Card } from "../../components/ui/Card";
import { SectionContainer } from "../components/SectionContainer";
import { blogPosts } from "../data";

export function BlogPage() {
  return (
    <SectionContainer eyebrow="Blog" title="Thoughtful content for teams modernizing survey operations." description="A simple content index keeps the blog useful without distracting from the core conversion path.">
      <div className="marketing-blog-list">
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
      </div>
    </SectionContainer>
  );
}
