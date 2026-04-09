import { Link } from "react-router-dom";
import { Card } from "../../components/ui/Card";
import { getButtonClass } from "../../components/ui/Button";
import { CTASection } from "../components/CTASection";
import { FeatureCard } from "../components/FeatureCard";
import { HeroSection } from "../components/HeroSection";
import { SectionContainer } from "../components/SectionContainer";
import { TestimonialCard } from "../components/TestimonialCard";
import { coreFeatures, pricingTiers, testimonials, useCases } from "../data";
import { PricingCard } from "../components/PricingCard";

export function HomePage() {
  return (
    <>
      <HeroSection />

      <SectionContainer eyebrow="Used by modern survey teams" title="Designed to create trust before your buyer has to ask." description="Clear visibility, premium workflow design, and enterprise-ready structure help teams understand the value quickly.">
        <div className="marketing-logo-cloud">
          <span>Northline Geomatics</span>
          <span>Atlas Civil</span>
          <span>Civic Terrain</span>
          <span>TerraGrid</span>
          <span>Metro Land</span>
        </div>
      </SectionContainer>

      <SectionContainer eyebrow="Problem to solution" title="Replace fragmented survey operations with one AI-powered workflow." description="The conversion goal here is simple: make a complex product feel immediately understandable and operationally credible.">
        <div className="marketing-problem-solution">
          <Card className="marketing-problem-card">
            <span className="marketing-pill marketing-pill--soft">Without GeoSurvey AI</span>
            <ul className="marketing-list marketing-list--spacious">
              <li>Manual processing slows down delivery and increases rework.</li>
              <li>Field data, QA checks, maps, and reports live across disconnected tools.</li>
              <li>Project leads wait too long to spot quality issues and blockers.</li>
            </ul>
          </Card>
          <Card className="marketing-solution-card ui-card--accent">
            <span className="marketing-pill">With GeoSurvey AI</span>
            <ul className="marketing-list marketing-list--spacious">
              <li>Upload once and trigger automated AI processing workflows.</li>
              <li>Track jobs, outputs, boundaries, and reports from one calm workspace.</li>
              <li>Use real-time insights to catch issues earlier and deliver with confidence.</li>
            </ul>
          </Card>
        </div>
      </SectionContainer>

      <SectionContainer eyebrow="Product preview" title="A premium workspace for survey teams, not another pile of tools." description="Every interaction is designed to reduce cognitive load, increase confidence, and keep buyers focused on outcomes.">
        <div className="marketing-preview-panels">
          <Card className="marketing-preview-panel">
            <span className="marketing-preview-panel__label">Dashboard</span>
            <strong>Portfolio visibility across active jobs</strong>
            <p>See queued work, processing state, upcoming reports, and AI findings without chasing updates.</p>
          </Card>
          <Card className="marketing-preview-panel">
            <span className="marketing-preview-panel__label">Job processing</span>
            <strong>From upload to review in one flow</strong>
            <p>Validate source files, monitor AI processing, and keep operators aligned on the next action.</p>
          </Card>
          <Card className="marketing-preview-panel">
            <span className="marketing-preview-panel__label">Map view</span>
            <strong>Boundary context where decisions happen</strong>
            <p>Review spatial outputs, compare extents, and inspect problem areas without leaving the job workspace.</p>
          </Card>
          <Card className="marketing-preview-panel">
            <span className="marketing-preview-panel__label">AI insights</span>
            <strong>Recommendations that shorten QA cycles</strong>
            <p>Surface anomalies, overlaps, and processing risks before they turn into downstream delivery issues.</p>
          </Card>
        </div>
      </SectionContainer>

      <SectionContainer eyebrow="Core features" title="Everything buyers need to understand the platform in one scan." description="Shorter copy, clearer grouping, and stronger visual rhythm keep the page easy to navigate while still covering the product breadth.">
        <div className="marketing-feature-grid">
          {coreFeatures.map((feature) => (
            <FeatureCard key={feature.title} {...feature} />
          ))}
        </div>
      </SectionContainer>

      <SectionContainer eyebrow="How it works" title="Three steps from raw survey data to usable outputs." align="center">
        <div className="marketing-steps">
          <Card className="marketing-step-card">
            <span className="marketing-step-card__index">1</span>
            <strong>Upload data</strong>
            <p>Bring in GNSS, drone, LiDAR, and project files from the field.</p>
          </Card>
          <Card className="marketing-step-card">
            <span className="marketing-step-card__index">2</span>
            <strong>AI processes it</strong>
            <p>Automate analysis, validation, issue detection, and output preparation.</p>
          </Card>
          <Card className="marketing-step-card">
            <span className="marketing-step-card__index">3</span>
            <strong>Get insights and outputs</strong>
            <p>Review maps, reports, and boundaries with clearer QA visibility.</p>
          </Card>
        </div>
      </SectionContainer>

      <SectionContainer eyebrow="Use cases" title="Made for the teams that manage real survey complexity." description="The page speaks directly to the buying groups most likely to convert.">
        <div className="marketing-use-case-grid">
          {useCases.map((useCase) => (
            <Card key={useCase.title} className="marketing-use-case-card">
              <h3>{useCase.title}</h3>
              <p>{useCase.description}</p>
            </Card>
          ))}
        </div>
      </SectionContainer>

      <SectionContainer eyebrow="Customer proof" title="Teams adopt GeoSurvey AI because it makes complex work easier to trust." description="Social proof is placed after the workflow sections so buyers have context before reading the outcomes.">
        <div className="marketing-testimonial-grid">
          {testimonials.map((testimonial) => (
            <TestimonialCard key={testimonial.name} {...testimonial} />
          ))}
        </div>
      </SectionContainer>

      <SectionContainer
        eyebrow="Pricing preview"
        title="Simple packaging for evaluation, rollout, and enterprise buying."
        description="Reduce friction by showing a clear entry path while preserving a demo-led motion for larger teams."
        actions={<Link className={getButtonClass("secondary")} to="/pricing">View full pricing</Link>}
      >
        <div className="marketing-pricing-grid">
          {pricingTiers.map((tier) => (
            <PricingCard key={tier.name} {...tier} />
          ))}
        </div>
      </SectionContainer>

      <CTASection />
    </>
  );
}
