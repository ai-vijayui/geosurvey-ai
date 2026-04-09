import { Link } from "react-router-dom";
import { getButtonClass } from "../../components/ui/Button";
import { SectionContainer } from "../components/SectionContainer";

export function NotFoundPage() {
  return (
    <SectionContainer eyebrow="404" title="This page could not be found." description="The route may have moved, but the main conversion paths are still right here." align="center">
      <div className="marketing-404-actions">
        <Link className={getButtonClass("primary")} to="/">
          Back to home
        </Link>
        <Link className={getButtonClass("secondary")} to="/contact">
          Book Demo
        </Link>
      </div>
    </SectionContainer>
  );
}
