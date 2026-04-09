import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { getButtonClass } from "../../components/ui/Button";
import { StaggerGroup } from "../../components/animation/StaggerGroup";
import { trustMetrics } from "../data";
import { AICommandBlock } from "./AICommandBlock";
import { commandExamples } from "../siteContent";
import { fadeUp, motionTokens } from "../../lib/motion";

export function HeroSection() {
  return (
    <section className="marketing-hero">
      <div className="marketing-shell marketing-hero__grid">
        <StaggerGroup className="marketing-hero__content" stagger={0.09}>
          <motion.span variants={fadeUp(12)} className="marketing-eyebrow">
            Built for modern survey operations
          </motion.span>
          <motion.h1 variants={fadeUp(16)}>Run your entire survey workflow with AI.</motion.h1>
          <motion.p variants={fadeUp(18)}>
            Just tell GeoSurvey AI what you need. It creates projects, sets up jobs, processes data, and delivers outputs automatically.
          </motion.p>
          <motion.div variants={fadeUp(14)} className="marketing-hero__actions">
            <motion.div whileHover={{ y: -2 }} whileTap={{ scale: motionTokens.scale.press }}>
              <Link className={getButtonClass("primary")} to="/sign-up">
              Start Free
              </Link>
            </motion.div>
            <motion.div whileHover={{ y: -2 }} whileTap={{ scale: motionTokens.scale.press }}>
              <Link className={getButtonClass("secondary")} to="/demo">
              Try AI Demo
              </Link>
            </motion.div>
          </motion.div>
          <motion.div variants={fadeUp(12)}>
            <AICommandBlock example={commandExamples[0]} compact title="AI Command Example" />
          </motion.div>
          <motion.div variants={fadeUp(12)} className="marketing-hero__proof">
            <span>Trusted by survey firms, engineers, GIS leaders, and infrastructure teams.</span>
            <div className="marketing-metric-row">
              {trustMetrics.map((metric) => (
                <motion.div
                  key={metric.label}
                  className="marketing-metric-row__item"
                  variants={fadeUp(10)}
                  whileHover={{ y: -3 }}
                >
                  <strong>{metric.value}</strong>
                  <span>{metric.label}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </StaggerGroup>

        <motion.div
          className="marketing-preview"
          aria-label="Product preview"
          initial={{ opacity: 0, y: 24, scale: 0.985 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: motionTokens.duration.slow, ease: motionTokens.easing.standard, delay: 0.12 }}
        >
          <motion.div className="marketing-preview__window" whileHover={{ y: -4 }}>
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
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
