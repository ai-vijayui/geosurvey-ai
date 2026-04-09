import { Card } from "../../components/ui/Card";

type TestimonialCardProps = {
  quote: string;
  name: string;
  role: string;
  company: string;
};

export function TestimonialCard({ quote, name, role, company }: TestimonialCardProps) {
  return (
    <Card className="marketing-testimonial-card">
      <p className="marketing-testimonial-card__quote">"{quote}"</p>
      <div className="marketing-testimonial-card__author">
        <strong>{name}</strong>
        <span>
          {role} · {company}
        </span>
      </div>
    </Card>
  );
}
