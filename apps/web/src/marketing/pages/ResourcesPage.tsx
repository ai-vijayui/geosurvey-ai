import { Link } from "react-router-dom";
import { Card } from "../../components/ui/Card";
import { AICommandBlock } from "../components/AICommandBlock";
import { CTASection } from "../components/CTASection";
import { Seo } from "../components/Seo";
import { SectionContainer } from "../components/SectionContainer";
import { VisualCluster } from "../components/VisualCluster";
import { resourcePages } from "../siteContent";

export function ResourcesPage() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "GeoSurvey AI Resources",
    description: "Guides, case studies, sample files, and AI prompt examples for modern survey workflows."
  };

  return (
    <>
      <Seo
        title="Resources | GeoSurvey AI Guides, Case Studies, Sample Files, and Prompt Library"
        description="Explore GeoSurvey AI guides, case studies, sample files, and prompt examples designed to turn AI-first survey evaluation into action."
        keywords="survey automation resources, AI survey guides, GNSS workflow guides, AI prompt library, geospatial case studies"
        schema={schema}
      />

      <SectionContainer
        eyebrow="Resources"
        title="Everything a serious evaluation team needs to keep moving."
        description="Resources should support discovery, qualification, and conversion. They should never strand the user away from the product path."
      >
        <div className="marketing-two-column marketing-two-column--visual">
          <VisualCluster variant="resources" />
          <div className="marketing-feature-detail-list">
            {resourcePages.slice(0, 2).map((resource) => (
              <Card key={resource.slug} className="marketing-panel-card">
                <span className="marketing-panel-card__label">{resource.eyebrow}</span>
                <h3>{resource.title}</h3>
                <p>{resource.summary}</p>
                <Link className="marketing-inline-link" to={`/resources/${resource.slug}`}>
                  Explore {resource.eyebrow}
                </Link>
              </Card>
            ))}
          </div>
        </div>
      </SectionContainer>

      <SectionContainer
        eyebrow="Browse resource types"
        title="Different visitors need different proof."
        description="Some want guides, some want examples, and some want prompt patterns. This keeps the content architecture visible and easy to scan."
      >
        <div className="marketing-feature-grid">
          {resourcePages.map((resource) => (
            <Card key={resource.slug} className="marketing-panel-card">
              <span className="marketing-panel-card__label">{resource.eyebrow}</span>
              <h3>{resource.title}</h3>
              <p>{resource.summary}</p>
              <Link className="marketing-inline-link" to={`/resources/${resource.slug}`}>
                Explore {resource.eyebrow}
              </Link>
            </Card>
          ))}
        </div>
      </SectionContainer>

      <SectionContainer
        eyebrow="AI-first evaluation"
        title="Use resources to show what the AI actually does."
        description="The best resource content for this category demonstrates the pattern directly: instruction, AI action, result."
      >
        <div className="marketing-two-column marketing-two-column--visual">
          <AICommandBlock example={resourcePages[3].command ?? resourcePages[0].command!} title="Prompt library preview" />
          <VisualCluster variant="resources" />
        </div>
      </SectionContainer>

      <CTASection />
    </>
  );
}
