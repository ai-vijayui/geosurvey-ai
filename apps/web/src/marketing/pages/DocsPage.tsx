import { Card } from "../../components/ui/Card";
import { CTASection } from "../components/CTASection";
import { Seo } from "../components/Seo";
import { SectionContainer } from "../components/SectionContainer";
import { docsSections } from "../data";

export function DocsPage() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    headline: "GeoSurvey AI Documentation",
    description: "Documentation for getting started, file uploads, GNSS CSV imports, map review, AI-assisted QA, and report generation."
  };

  return (
    <>
      <Seo
        title="Documentation | GeoSurvey AI Help for Uploads, GNSS Import, Review, and Reporting"
        description="Browse GeoSurvey AI documentation for getting started, file uploads, GNSS CSV imports, map review, AI-assisted QA, and report generation."
        keywords="GeoSurvey AI docs, GNSS CSV import guide, survey upload help, map review documentation"
        schema={schema}
      />

      <SectionContainer
        eyebrow="Documentation"
        title="Help and product depth that support evaluation, onboarding, and daily use."
        description="A strong docs presence improves both SEO and trust because buyers can see the workflow is real and supported."
      >
        <div className="marketing-docs-grid">
          {docsSections.map((section) => (
            <Card key={section.title} className="marketing-panel-card">
              <span className="marketing-panel-card__label">{section.title}</span>
              <ul className="marketing-list">
                {section.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      </SectionContainer>

      <CTASection />
    </>
  );
}
