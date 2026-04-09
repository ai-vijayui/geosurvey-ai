import { Link } from "react-router-dom";
import { Card } from "../../components/ui/Card";
import { getButtonClass } from "../../components/ui/Button";
import { CTASection } from "../components/CTASection";
import { Seo } from "../components/Seo";
import { SectionContainer } from "../components/SectionContainer";
import { useCases } from "../data";
import { useCasePages } from "../siteContent";

export function SolutionsPage() {
  return (
    <>
      <Seo
        title="Solutions | GeoSurvey AI for Survey Firms, GIS Teams, and Drone Mapping Workflows"
        description="See how GeoSurvey AI supports land survey companies, GIS analysts, infrastructure teams, drone mapping workflows, and boundary review operations."
      />

      <SectionContainer
        eyebrow="Solutions"
        title="GeoSurvey AI adapts to the workflows serious survey teams already run."
        description="Use-case pages help buyers self-qualify by role, workflow, and operational complexity instead of making them translate generic software claims."
        actions={
          <>
            <Link className={getButtonClass("primary")} to="/contact">
              Book Demo
            </Link>
            <Link className={getButtonClass("secondary")} to="/pricing">
              View Pricing
            </Link>
          </>
        }
      >
        <div className="marketing-use-case-grid">
          {useCases.map((useCase) => {
            const detail = useCasePages.find((item) => item.title === useCase.title);
            return (
            <Card key={useCase.title} className="marketing-use-case-card">
              <h3>{useCase.title}</h3>
              <p>{useCase.description}</p>
              <Link className="marketing-inline-link" to={detail ? `/use-cases/${detail.slug}` : "/contact"}>
                Start with AI
              </Link>
            </Card>
          );
          })}
        </div>
      </SectionContainer>

      <SectionContainer
        eyebrow="Operational fit"
        title="The same platform serves operators, project leads, and decision makers."
        description="That matters in B2B buying because the team evaluating the product is usually cross-functional."
      >
        <div className="marketing-two-column">
          <Card className="marketing-panel-card">
            <span className="marketing-panel-card__label">For operators</span>
            <h3>Less switching, clearer review, faster handoff.</h3>
            <p>Operators need cleaner intake, faster map review, and clearer next actions inside the same workflow they already use every day.</p>
          </Card>
          <Card className="marketing-panel-card">
            <span className="marketing-panel-card__label">For managers</span>
            <h3>More visibility into progress, risk, and delivery readiness.</h3>
            <p>Project and operations leads need a reliable view into what is queued, blocked, processing, and ready for issue.</p>
          </Card>
        </div>
      </SectionContainer>

      <CTASection />
    </>
  );
}
