import { Link } from "react-router-dom";
import { getButtonClass } from "../../components/ui/Button";
import { trustMetrics } from "../data";

export function HeroSection() {
  return (
    <section className="marketing-hero">
      <div className="marketing-shell marketing-hero__grid">
        <div className="marketing-hero__content">
          <span className="marketing-eyebrow">Built for modern survey operations</span>
          <h1>AI-powered land surveying, from raw data to trusted outputs in minutes.</h1>
          <p>
            GeoSurvey AI helps survey teams upload field data, automate processing, detect issues earlier, and generate maps,
            reports, and boundary outputs from one premium operational platform.
          </p>
          <div className="marketing-hero__actions">
            <Link className={getButtonClass("primary")} to="/sign-up">
              Get Started
            </Link>
            <Link className={getButtonClass("secondary")} to="/contact">
              Book Demo
            </Link>
          </div>
          <div className="marketing-hero__proof">
            <span>Trusted by survey firms, engineers, GIS leaders, and infrastructure teams.</span>
            <div className="marketing-metric-row">
              {trustMetrics.map((metric) => (
                <div key={metric.label} className="marketing-metric-row__item">
                  <strong>{metric.value}</strong>
                  <span>{metric.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="marketing-preview" aria-label="Product preview">
          <div className="marketing-preview__window">
            <div className="marketing-preview__topbar">
              <span className="marketing-preview__badge">Live workspace</span>
              <span className="marketing-preview__status">Job 24B processing</span>
            </div>

            <div className="marketing-preview__body">
              <div className="marketing-preview__sidebar">
                <div className="marketing-preview__logo">GS</div>
                <div className="marketing-preview__nav">
                  <span className="is-active">Dashboard</span>
                  <span>Projects</span>
                  <span>Jobs</span>
                  <span>Reports</span>
                </div>
              </div>

              <div className="marketing-preview__main">
                <div className="marketing-preview__hero-card">
                  <div>
                    <strong>North Parcel Boundary Update</strong>
                    <p>GNSS + drone upload validated. AI review is flagging boundary overlap risk on the eastern edge.</p>
                  </div>
                  <div className="marketing-preview__pill">92% confidence</div>
                </div>

                <div className="marketing-preview__grid">
                  <div className="marketing-preview__map-card">
                    <div className="marketing-preview__map-grid" />
                    <div className="marketing-preview__map-shape marketing-preview__map-shape--primary" />
                    <div className="marketing-preview__map-shape marketing-preview__map-shape--secondary" />
                    <div className="marketing-preview__map-note">Boundary visualization</div>
                  </div>

                  <div className="marketing-preview__stack">
                    <div className="marketing-preview__stat-card">
                      <span>Job progress</span>
                      <strong>73%</strong>
                      <p>Classification, QA, and reporting underway.</p>
                    </div>
                    <div className="marketing-preview__stat-card">
                      <span>AI insight</span>
                      <strong>Overlap detected</strong>
                      <p>Review recommended before export.</p>
                    </div>
                  </div>
                </div>

                <div className="marketing-preview__report-card">
                  <div>
                    <span>Automated outputs</span>
                    <strong>Map sheets, QA report, and boundary files ready next</strong>
                  </div>
                  <div className="marketing-preview__report-lines">
                    <span />
                    <span />
                    <span />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
