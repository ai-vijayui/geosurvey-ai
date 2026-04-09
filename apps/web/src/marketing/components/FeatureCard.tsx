import { Card } from "../../components/ui/Card";
import type { MarketingFeature } from "../data";

function FeatureIcon({ icon }: Pick<MarketingFeature, "icon">) {
  switch (icon) {
    case "spark":
      return <path d="M12 2l2.8 6.2L21 11l-6.2 2.8L12 20l-2.8-6.2L3 11l6.2-2.8L12 2z" />;
    case "layers":
      return <path d="M12 3l8 4.5-8 4.5-8-4.5L12 3zm-8 8l8 4.5 8-4.5M4 14.5l8 4.5 8-4.5" />;
    case "pulse":
      return <path d="M3 12h4l2-4 4 8 2-4h6" />;
    case "radar":
      return <path d="M12 4a8 8 0 108 8M12 12l4-4M12 7a5 5 0 015 5" />;
    case "map":
      return <path d="M3 6.5l5-2 4 2 5-2v13l-5 2-4-2-5 2v-13zm5-2v13m4-11v13" />;
    case "report":
      return <path d="M7 3h7l4 4v14H7V3zm7 0v4h4M10 12h5M10 16h5M10 8h2" />;
  }
}

export function FeatureCard({ icon, title, description }: MarketingFeature) {
  return (
    <Card className="marketing-feature-card">
      <div className="marketing-feature-card__icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <FeatureIcon icon={icon} />
        </svg>
      </div>
      <div className="marketing-feature-card__copy">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </Card>
  );
}
