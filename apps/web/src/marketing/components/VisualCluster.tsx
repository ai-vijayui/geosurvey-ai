import { motion } from "motion/react";
import { motionTokens } from "../../lib/motion";
import { useReducedMotionPreference } from "../../hooks/useReducedMotionPreference";

type VisualClusterProps = {
  variant: "workflow" | "signals" | "platform" | "compare" | "pricing" | "resources";
};

export function VisualCluster({ variant }: VisualClusterProps) {
  const reduceMotion = useReducedMotionPreference();

  if (variant === "workflow") {
    return (
      <div className="marketing-visual marketing-visual--workflow" aria-hidden="true">
        <motion.div
          className="marketing-visual__glow marketing-visual__glow--one"
          animate={reduceMotion ? undefined : { x: [0, 18, 0], y: [0, -10, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="marketing-visual__glow marketing-visual__glow--two"
          animate={reduceMotion ? undefined : { x: [0, -14, 0], y: [0, 12, 0] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        />
        <div className="marketing-workflow">
          <div className="marketing-workflow__rail" />
          {["Upload", "Process", "Review", "Deliver"].map((label, index) => (
            <motion.div
              key={label}
              className={`marketing-workflow__node marketing-workflow__node--${index + 1}`}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ delay: index * 0.08, duration: motionTokens.duration.base }}
            >
              <span className="marketing-workflow__step">0{index + 1}</span>
              <strong>{label}</strong>
              <span>{index === 0 ? "GNSS, drone, LiDAR" : index === 1 ? "AI workflow engine" : index === 2 ? "Map and QA context" : "Reports and outputs"}</span>
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  if (variant === "platform") {
    return (
      <div className="marketing-visual marketing-visual--platform" aria-hidden="true">
        <div className="marketing-platform">
          <div className="marketing-platform__header">
            <div className="marketing-platform__title">
              <span className="marketing-signal__label">Live platform view</span>
              <strong>AI command center + operational workspace</strong>
            </div>
            <div className="marketing-platform__status">3 jobs updating</div>
          </div>

          <div className="marketing-platform__layout">
            <div className="marketing-platform__rail">
              <span className="is-active">AI</span>
              <span>Jobs</span>
              <span>Maps</span>
              <span>Reports</span>
            </div>

            <div className="marketing-platform__body">
              <motion.div
                className="marketing-platform__command"
                animate={reduceMotion ? undefined : { y: [0, -4, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
              >
                <span className="marketing-signal__label">User instruction</span>
                <strong>Create a corridor survey workflow for Sector 8</strong>
              </motion.div>

              <div className="marketing-platform__main-grid">
                <div className="marketing-platform__map">
                  <div className="marketing-platform__map-grid" />
                  <span className="marketing-platform__map-route marketing-platform__map-route--one" />
                  <span className="marketing-platform__map-route marketing-platform__map-route--two" />
                  <div className="marketing-platform__map-tag">Map review ready</div>
                </div>

                <div className="marketing-platform__stack">
                  <motion.div
                    className="marketing-platform__info"
                    animate={reduceMotion ? undefined : { x: [0, 4, 0] }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                  >
                    <span className="marketing-signal__label">AI action</span>
                    <strong>Project and job created</strong>
                    <p>Files mapped, processing started, owners assigned.</p>
                  </motion.div>
                  <div className="marketing-platform__info">
                    <span className="marketing-signal__label">Workflow state</span>
                    <strong>QA review next</strong>
                    <div className="marketing-platform__mini-bars">
                      <span />
                      <span />
                      <span />
                    </div>
                  </div>
                </div>
              </div>

              <div className="marketing-platform__footer">
                <div className="marketing-platform__footer-card">
                  <span className="marketing-signal__label">Outputs</span>
                  <strong>Boundary package queued</strong>
                </div>
                <div className="marketing-platform__footer-card">
                  <span className="marketing-signal__label">Insight</span>
                  <strong>1 anomaly flagged early</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (variant === "compare") {
    return (
      <div className="marketing-visual marketing-visual--compare" aria-hidden="true">
        <div className="marketing-compare">
          <div className="marketing-compare__column">
            <span className="marketing-signal__label">Traditional flow</span>
            <div className="marketing-compare__stack">
              <div className="marketing-compare__step">Manual project setup</div>
              <div className="marketing-compare__step">Separate processing tools</div>
              <div className="marketing-compare__step">Delayed review visibility</div>
              <div className="marketing-compare__step">Reports built later</div>
            </div>
          </div>
          <div className="marketing-compare__divider">vs</div>
          <div className="marketing-compare__column marketing-compare__column--accent">
            <span className="marketing-signal__label">AI-first flow</span>
            <div className="marketing-compare__stack">
              <div className="marketing-compare__step">Instruction creates project</div>
              <div className="marketing-compare__step">AI launches processing</div>
              <div className="marketing-compare__step">Review appears in context</div>
              <div className="marketing-compare__step">Outputs prepared automatically</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (variant === "pricing") {
    return (
      <div className="marketing-visual marketing-visual--pricing" aria-hidden="true">
        <div className="marketing-pricing-visual">
          <div className="marketing-pricing-visual__cards">
            {[
              { name: "Basic", state: "Entry team", active: false },
              { name: "Pro", state: "Most selected", active: true },
              { name: "Enterprise", state: "Multi-team rollout", active: false }
            ].map((plan) => (
              <motion.div
                key={plan.name}
                className={`marketing-pricing-visual__plan${plan.active ? " is-active" : ""}`}
                animate={reduceMotion || !plan.active ? undefined : { y: [0, -6, 0] }}
                transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
              >
                <span className="marketing-signal__label">{plan.state}</span>
                <strong>{plan.name}</strong>
                <div className="marketing-pricing-visual__dots">
                  <span />
                  <span />
                  <span />
                </div>
              </motion.div>
            ))}
          </div>
          <div className="marketing-pricing-visual__meter">
            <span className="marketing-signal__label">AI usage scale</span>
            <div className="marketing-pricing-visual__bar">
              <span />
            </div>
          </div>
          <div className="marketing-pricing-visual__footer">
            <div className="marketing-pricing-visual__note">
              <span className="marketing-signal__label">Ops fit</span>
              <strong>Clear path from trial to rollout</strong>
            </div>
            <div className="marketing-pricing-visual__note">
              <span className="marketing-signal__label">Buyer signal</span>
              <strong>Enterprise support when needed</strong>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (variant === "resources") {
    return (
      <div className="marketing-visual marketing-visual--resources" aria-hidden="true">
        <div className="marketing-resources-visual">
          <div className="marketing-resources-visual__shelf">
            {["Guides", "Case Studies", "Sample Files", "Prompt Library"].map((item, index) => (
              <motion.div
                key={item}
                className="marketing-resources-visual__item"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ delay: index * 0.08, duration: motionTokens.duration.base }}
              >
                <span className="marketing-signal__label">Resource</span>
                <strong>{item}</strong>
                <div className="marketing-resources-visual__lines">
                  <span />
                  <span />
                  <span />
                </div>
              </motion.div>
            ))}
          </div>
          <div className="marketing-resources-visual__rail">
            <div className="marketing-resources-visual__rail-card">
              <span className="marketing-signal__label">User path</span>
              <strong>Learn, validate, try, convert</strong>
            </div>
            <div className="marketing-resources-visual__rail-pills">
              <span>AI</span>
              <span>Feature</span>
              <span>Demo</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="marketing-visual marketing-visual--signals" aria-hidden="true">
      <motion.div
        className="marketing-signal marketing-signal--primary"
        animate={reduceMotion ? undefined : { y: [0, -8, 0] }}
        transition={{ duration: 5.5, repeat: Infinity, ease: "easeInOut" }}
      >
        <span className="marketing-signal__label">Coverage risk</span>
        <strong>Missing segment flagged</strong>
        <div className="marketing-signal__meter">
          <motion.span
            animate={reduceMotion ? undefined : { scaleX: [0.76, 0.92, 0.76] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
      </motion.div>

      <motion.div
        className="marketing-signal marketing-signal--secondary"
        animate={reduceMotion ? undefined : { y: [0, 10, 0] }}
        transition={{ duration: 6.5, repeat: Infinity, ease: "easeInOut" }}
      >
        <span className="marketing-signal__label">Boundary review</span>
        <strong>Overlap likely on eastern edge</strong>
        <div className="marketing-signal__mini-map">
          <span />
          <span />
        </div>
      </motion.div>

      <motion.div
        className="marketing-signal marketing-signal--tertiary"
        animate={reduceMotion ? undefined : { x: [0, 10, 0] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      >
        <span className="marketing-signal__label">Report readiness</span>
        <strong>3 outputs ready for issue</strong>
        <div className="marketing-signal__bars">
          <span />
          <span />
          <span />
        </div>
      </motion.div>
    </div>
  );
}
