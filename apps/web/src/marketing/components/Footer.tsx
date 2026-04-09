import { Link } from "react-router-dom";
import { Reveal } from "../../components/animation/Reveal";

export function Footer() {
  return (
    <footer className="marketing-footer">
      <Reveal className="marketing-shell marketing-footer__grid">
        <div className="marketing-footer__brand">
          <Link to="/" className="marketing-logo">
            <span className="marketing-logo__mark">GS</span>
            <span className="marketing-logo__text">
              <strong>GeoSurvey AI</strong>
              <span>AI-powered surveying and geo-mapping</span>
            </span>
          </Link>
        </div>

        <div className="marketing-footer__links">
          <div>
            <span className="marketing-footer__heading">Product</span>
            <Link to="/product">Platform</Link>
            <Link to="/features">Features</Link>
            <Link to="/solutions">Solutions</Link>
            <Link to="/pricing">Pricing</Link>
            <Link to="/blog">Blog</Link>
          </div>
          <div>
            <span className="marketing-footer__heading">Company</span>
            <Link to="/about">About</Link>
            <Link to="/contact">Contact</Link>
            <Link to="/sign-in">Sign In</Link>
            <Link to="/sign-up">Get Started</Link>
          </div>
          <div>
            <span className="marketing-footer__heading">Legal</span>
            <Link to="/privacy">Privacy</Link>
            <Link to="/terms">Terms</Link>
            <Link to="/security">Security</Link>
            <a href="mailto:hello@geosurvey.ai">hello@geosurvey.ai</a>
          </div>
        </div>
      </Reveal>
    </footer>
  );
}
