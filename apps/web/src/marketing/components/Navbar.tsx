import { Link, NavLink } from "react-router-dom";
import { getButtonClass } from "../../components/ui/Button";

const links = [
  { to: "/features", label: "Features" },
  { to: "/pricing", label: "Pricing" },
  { to: "/blog", label: "Blog" },
  { to: "/about", label: "About" }
];

export function Navbar() {
  return (
    <header className="marketing-navbar">
      <div className="marketing-shell marketing-navbar__inner">
        <Link to="/" className="marketing-logo" aria-label="GeoSurvey AI home">
          <span className="marketing-logo__mark">GS</span>
          <span className="marketing-logo__text">
            <strong>GeoSurvey AI</strong>
            <span>AI-powered surveying platform</span>
          </span>
        </Link>

        <nav className="marketing-navbar__nav" aria-label="Primary">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => `marketing-navbar__link${isActive ? " is-active" : ""}`}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="marketing-navbar__actions">
          <Link className={getButtonClass("ghost")} to="/sign-in">
            Sign In
          </Link>
          <Link className={getButtonClass("secondary")} to="/sign-up">
            Get Started
          </Link>
          <Link className={getButtonClass("primary")} to="/contact">
            Book Demo
          </Link>
        </div>
      </div>
    </header>
  );
}
