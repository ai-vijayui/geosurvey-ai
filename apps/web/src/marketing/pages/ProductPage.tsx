import { Link } from "react-router-dom";
import { Card } from "../../components/ui/Card";
import { getButtonClass } from "../../components/ui/Button";
import { CTASection } from "../components/CTASection";
import { FaqSection } from "../components/FaqSection";
import { SectionContainer } from "../components/SectionContainer";
import { Seo } from "../components/Seo";
import { faqItems, featureComparisonRows, platformModules, supportedDataTypes, whyChooseUs } from "../data";

export function ProductPage() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "GeoSurvey AI Platform",
    description: "Explore the GeoSurvey AI platform for survey jobs, GNSS imports, map review, AI insights, workflow tracking, and output generation.",
    about: {
      "@type": "SoftwareApplication",
      name: "GeoSurvey AI"
    }
  };

  return (
    <>
      <Seo
        title="GeoSurvey AI Platform | Survey Workflow Software for GNSS, Review, and Reporting"
        description="Explore the GeoSurvey AI platform for survey jobs, GNSS imports, map review, AI insights, workflow tracking, and output generation."
        keywords="survey workflow software, survey operations platform, GNSS workflow platform, survey reporting software"
        schema={schema}
      />

      <SectionContainer
        eyebrow="Product platform"
        title="A workflow platform built for real survey operations."
        description="GeoSurvey AI gives teams one place to move from upload and validation to map review, AI insights, reports, and final outputs."
        actions={
          <>
            <Link className={getButtonClass("primary")} to="/contact">
              Book Demo
            </Link>
            <Link className={getButtonClass("secondary")} to="/features">
              Explore Features
            </Link>
          </>
        }
      >
        <div className="marketing-two-column">
          <Card className="marketing-panel-card">
            <span className="marketing-panel-card__label">Platform coverage</span>
            <h3>From intake to delivery in one operational system.</h3>
            <p>Instead of stitching together file intake, QA, map review, reporting, and project tracking, teams can manage the whole process in one place.</p>
          </Card>
          <Card className="marketing-panel-card">
            <span className="marketing-panel-card__label">Supported workflow inputs</span>
            <div className="marketing-chip-grid">
              {supportedDataTypes.map((item) => (
                <span key={item} className="marketing-chip">
                  {item}
                </span>
              ))}
            </div>
          </Card>
        </div>
      </SectionContainer>

      <SectionContainer
        eyebrow="Workflow view"
        title="Each module supports the next operational step."
        description="The website should show the platform as a connected system, not a random list of features."
      >
        <div className="marketing-module-grid">
          {platformModules.map((module) => (
            <Card key={module.title} className="marketing-panel-card">
              <span className="marketing-panel-card__label">{module.label}</span>
              <h3>{module.title}</h3>
              <p>{module.description}</p>
            </Card>
          ))}
        </div>
      </SectionContainer>

      <SectionContainer
        eyebrow="Why teams choose it"
        title="Built for survey workflow reality, not generic project software."
        description="This section helps serious buyers understand why GeoSurvey AI fits the category better than generic data tools."
      >
        <div className="marketing-why-grid">
          {whyChooseUs.map((item) => (
            <Card key={item} className="marketing-why-card">
              <strong>{item}</strong>
            </Card>
          ))}
        </div>
      </SectionContainer>

      <SectionContainer
        eyebrow="Comparison"
        title="What changes when the workflow is operationally connected."
        description="A comparison table helps buyers quantify the difference between GeoSurvey AI and fragmented survey delivery."
      >
        <div className="marketing-comparison-table">
          <div className="marketing-comparison-table__header">
            <span>Capability</span>
            <span>GeoSurvey AI</span>
            <span>Fragmented workflow</span>
          </div>
          {featureComparisonRows.map((row) => (
            <div key={row.capability} className="marketing-comparison-table__row">
              <strong>{row.capability}</strong>
              <span>{row.geoSurvey}</span>
              <span>{row.fragmented}</span>
            </div>
          ))}
        </div>
      </SectionContainer>

      <FaqSection items={faqItems.slice(0, 4)} />
      <CTASection />
    </>
  );
}
