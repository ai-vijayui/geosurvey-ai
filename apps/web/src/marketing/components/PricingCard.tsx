import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { Card } from "../../components/ui/Card";
import { getButtonClass } from "../../components/ui/Button";
import { motionTokens } from "../../lib/motion";

type PricingCardProps = {
  name: string;
  price: string;
  description: string;
  cta: string;
  highlighted?: boolean;
  features: string[];
};

export function PricingCard({ name, price, description, cta, highlighted, features }: PricingCardProps) {
  return (
    <motion.div whileHover={{ y: -6, scale: highlighted ? 1.01 : motionTokens.scale.hover }} transition={{ duration: motionTokens.duration.fast }}>
      <Card className={`marketing-pricing-card${highlighted ? " marketing-pricing-card--highlighted" : ""}`}>
      <div className="marketing-pricing-card__header">
        <div>
          <h3>{name}</h3>
          <p>{description}</p>
        </div>
        {highlighted ? <span className="marketing-pill">Most popular</span> : null}
      </div>
      <div className="marketing-pricing-card__price">
        <strong>{price}</strong>
        <span>{price === "Custom" ? "tailored to procurement" : "per month"}</span>
      </div>
      <ul className="marketing-list">
        {features.map((feature) => (
          <li key={feature}>{feature}</li>
        ))}
      </ul>
      <Link className={getButtonClass(highlighted ? "primary" : "secondary", true)} to={cta === "Book Demo" ? "/contact" : "/sign-up"}>
        {cta}
      </Link>
      </Card>
    </motion.div>
  );
}
