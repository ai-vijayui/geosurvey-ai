import { AnimatePresence, motion, useMotionTemplate, useScroll, useTransform } from "motion/react";
import { useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { getButtonClass } from "../../components/ui/Button";
import { motionTokens, navReveal } from "../../lib/motion";

const links = [
  { to: "/product", label: "Platform" },
  { to: "/features", label: "Features" },
  { to: "/solutions", label: "Solutions" },
  { to: "/pricing", label: "Pricing" },
  { to: "/docs", label: "Docs" },
  { to: "/blog", label: "Blog" },
  { to: "/about", label: "About" }
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { scrollY } = useScroll();
  const navBackground = useTransform(scrollY, [0, 64], [0.76, 0.94]);
  const borderOpacity = useTransform(scrollY, [0, 64], [0.45, 0.9]);
  const background = useMotionTemplate`rgba(251, 248, 247, ${navBackground})`;
  const borderColor = useMotionTemplate`rgba(231, 223, 220, ${borderOpacity})`;

  return (
    <motion.header
      className="marketing-navbar"
      variants={navReveal}
      initial="hidden"
      animate="visible"
      style={{ backgroundColor: background, borderBottomColor: borderColor }}
    >
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
          <motion.button
            type="button"
            className="marketing-navbar__toggle"
            onClick={() => setMobileOpen((value) => !value)}
            whileTap={{ scale: motionTokens.scale.press }}
            aria-label="Toggle navigation menu"
            aria-expanded={mobileOpen}
          >
            <span />
            <span />
          </motion.button>
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

      <AnimatePresence>
        {mobileOpen ? (
          <motion.div
            className="marketing-mobile-nav"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: motionTokens.duration.fast }}
          >
            <div className="marketing-shell marketing-mobile-nav__inner">
              {links.map((link) => (
                <NavLink key={link.to} to={link.to} className="marketing-mobile-nav__link" onClick={() => setMobileOpen(false)}>
                  {link.label}
                </NavLink>
              ))}
              <div className="marketing-mobile-nav__actions">
                <Link className={getButtonClass("secondary", true)} to="/sign-in" onClick={() => setMobileOpen(false)}>
                  Sign In
                </Link>
                <Link className={getButtonClass("primary", true)} to="/contact" onClick={() => setMobileOpen(false)}>
                  Book Demo
                </Link>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.header>
  );
}
