import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { Card } from "../../components/ui/Card";
import { getButtonClass } from "../../components/ui/Button";
import { Reveal } from "../../components/animation/Reveal";
import { StaggerGroup } from "../../components/animation/StaggerGroup";
import { CTASection } from "../components/CTASection";
import { FaqSection } from "../components/FaqSection";
import { FeatureCard } from "../components/FeatureCard";
import { HeroSection } from "../components/HeroSection";
import { Seo } from "../components/Seo";
import { SectionContainer } from "../components/SectionContainer";
import { TestimonialCard } from "../components/TestimonialCard";
import { VisualCluster } from "../components/VisualCluster";
import { aiInsightBullets, coreFeatures, faqItems, pricingTiers, testimonials, useCases, whyChooseUs } from "../data";
import { PricingCard } from "../components/PricingCard";
import { fadeUp } from "../../lib/motion";
import { AICommandBlock } from "../components/AICommandBlock";
import { commandExamples, featurePages, useCasePages } from "../siteContent";

export function HomePage() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "GeoSurvey AI",
    applicationCategory: "BusinessApplication",
    operatingSystem: "Web",
    description:
      "GeoSurvey AI helps survey teams upload data, automate processing, review work on maps, surface AI insights, and generate reports and outputs.",
    offers: {
      "@type": "Offer",
      priceCurrency: "USD"
    },
    provider: {
      "@type": "Organization",
      name: "GeoSurvey AI",
      url: "https://geosurvey.ai"
    }
  };

  return (
    <>
      <Seo
        title="GeoSurvey AI | AI Survey Software for GNSS, Mapping, and Workflow Review"
        description="GeoSurvey AI helps survey teams upload data, automate processing, review work on maps, surface AI insights, and generate reports and outputs."
        keywords="AI survey software, survey automation software, GNSS processing software, map-based survey review, geospatial workflow platform"
        schema={schema}
      />

      <HeroSection />

      <SectionContainer eyebrow="AI Command Demo" title="Give one instruction. Let AI handle the setup." description="This is the clearest explanation of the product: the user describes the job and GeoSurvey AI handles the operational work.">
        <div className="marketing-two-column">
          <AICommandBlock example={commandExamples[0]} title="Type the instruction" />
          <Card className="marketing-panel-card">
            <span className="marketing-panel-card__label">Why this converts</span>
            <ul className="marketing-list marketing-list--spacious">
              <li>Visitors instantly understand the AI-first value proposition.</li>
              <li>Operators see less manual setup work.</li>
              <li>Buyers see workflow automation instead of just "AI" messaging.</li>
            </ul>
            <div className="marketing-inline-links">
              <Link to="/ai-command-center">Open AI Command Center</Link>
              <Link to="/demo">Try AI Demo</Link>
            </div>
          </Card>
        </div>
      </SectionContainer>

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
        <div className="marketing-problem-solution marketing-problem-solution--enhanced">
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
          <VisualCluster variant="workflow" />
        </div>
      </SectionContainer>

      <SectionContainer eyebrow="Product preview" title="A premium workspace for survey teams, not another pile of tools." description="Every interaction is designed to reduce cognitive load, increase confidence, and keep buyers focused on outcomes.">
        <div className="marketing-two-column marketing-two-column--visual">
          <VisualCluster variant="platform" />
          <StaggerGroup className="marketing-signal-stack">
            <Card className="marketing-preview-panel">
              <span className="marketing-preview-panel__label">AI command</span>
              <strong>One input moves the whole workflow</strong>
              <p>Create projects, assign context, launch processing, and prepare outputs without manual setup loops.</p>
            </Card>
            <Card className="marketing-preview-panel">
              <span className="marketing-preview-panel__label">Operational view</span>
              <strong>Managers and operators stay aligned</strong>
              <p>Jobs, QA status, map review, and reporting live in one workspace instead of scattered tools.</p>
            </Card>
          </StaggerGroup>
        </div>
      </SectionContainer>

      <SectionContainer eyebrow="Core features" title="Everything buyers need to understand the platform in one scan." description="Shorter copy, clearer grouping, and stronger visual rhythm keep the page easy to navigate while still covering the product breadth.">
        <StaggerGroup className="marketing-feature-grid">
          {coreFeatures.map((feature) => {
            const detail = featurePages.find((item) => item.title === feature.title);
            return detail ? (
              <Link key={feature.title} to={`/features/${detail.slug}`} className="marketing-card-link">
                <FeatureCard {...feature} />
              </Link>
            ) : (
              <FeatureCard key={feature.title} {...feature} />
            );
          })}
        </StaggerGroup>
      </SectionContainer>

      <SectionContainer eyebrow="How it works" title="Three steps from raw survey data to usable outputs." align="center">
        <div className="marketing-steps marketing-steps--connected">
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
        <StaggerGroup className="marketing-use-case-grid">
          {useCases.map((useCase) => {
            const detail = useCasePages.find((item) => item.title === useCase.title);
            return (
            <Link key={useCase.title} to={detail ? `/use-cases/${detail.slug}` : "/solutions"} className="marketing-card-link">
            <Card className="marketing-use-case-card">
              <h3>{useCase.title}</h3>
              <p>{useCase.description}</p>
            </Card>
            </Link>
          );
          })}
        </StaggerGroup>
      </SectionContainer>

      <SectionContainer eyebrow="Why GeoSurvey AI" title="Clearer operations, better review signals, and less workflow drag." description="This section exists to remove the final layer of uncertainty for buyers comparing GeoSurvey AI to fragmented stacks or generic tools.">
        <StaggerGroup className="marketing-why-grid">
          {whyChooseUs.map((item) => (
            <Card key={item} className="marketing-why-card">
              <strong>{item}</strong>
            </Card>
          ))}
        </StaggerGroup>
      </SectionContainer>

      <SectionContainer eyebrow="Workflow intelligence" title="AI that supports review quality and delivery confidence." description="The AI story is strongest when it is grounded in practical operational outcomes rather than hype.">
        <div className="marketing-two-column">
          <Reveal>
            <Card className="marketing-panel-card">
              <span className="marketing-panel-card__label">What the AI helps with</span>
              <StaggerGroup className="marketing-list marketing-list--spacious">
                {aiInsightBullets.map((item) => (
                  <motion.li key={item} variants={fadeUp(8)}>
                    {item}
                  </motion.li>
                ))}
              </StaggerGroup>
            </Card>
          </Reveal>
          <Reveal>
            <div className="marketing-signal-stack">
              <Card className="marketing-panel-card">
                <span className="marketing-panel-card__label">How it builds trust</span>
                <p>The system helps teams prioritize likely issues earlier, but operators still control review, decisions, and final delivery. That keeps the product credible for serious survey work.</p>
              </Card>
              <VisualCluster variant="signals" />
            </div>
          </Reveal>
        </div>
      </SectionContainer>

      <SectionContainer eyebrow="Built visually" title="Users should be able to understand the product in a quick scan." description="This section compresses the product story into UI-style blocks instead of making the visitor read every detail first.">
        <div className="marketing-three-grid">
          <Card className="marketing-panel-card marketing-mini-visual-card">
            <span className="marketing-panel-card__label">Command in</span>
            <strong>Create a land survey workflow for Block 12</strong>
            <div className="marketing-mini-visual-card__track">
              <span />
            </div>
          </Card>
          <Card className="marketing-panel-card marketing-mini-visual-card">
            <span className="marketing-panel-card__label">AI orchestration</span>
            <strong>Project, job, processing, and review staged</strong>
            <div className="marketing-mini-visual-card__bars">
              <span />
              <span />
              <span />
            </div>
          </Card>
          <Card className="marketing-panel-card marketing-mini-visual-card">
            <span className="marketing-panel-card__label">Result out</span>
            <strong>Map context, issues, and outputs ready</strong>
            <div className="marketing-mini-visual-card__pill-row">
              <span>Map</span>
              <span>QA</span>
              <span>Report</span>
            </div>
          </Card>
        </div>
      </SectionContainer>

      <SectionContainer eyebrow="Customer proof" title="Teams adopt GeoSurvey AI because it makes complex work easier to trust." description="Social proof is placed after the workflow sections so buyers have context before reading the outcomes.">
        <StaggerGroup className="marketing-testimonial-grid">
          {testimonials.map((testimonial) => (
            <TestimonialCard key={testimonial.name} {...testimonial} />
          ))}
        </StaggerGroup>
      </SectionContainer>

      <SectionContainer
        eyebrow="Pricing preview"
        title="Simple packaging for evaluation, rollout, and enterprise buying."
        description="Reduce friction by showing a clear entry path while preserving a demo-led motion for larger teams."
        actions={<Link className={getButtonClass("secondary")} to="/pricing">View full pricing</Link>}
      >
        <StaggerGroup className="marketing-pricing-grid">
          {pricingTiers.map((tier) => (
            <PricingCard key={tier.name} {...tier} />
          ))}
        </StaggerGroup>
      </SectionContainer>

      <FaqSection items={faqItems} />
      <CTASection />
    </>
  );
}

