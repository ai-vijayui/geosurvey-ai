import { motion } from "motion/react";
import { motionTokens } from "../../lib/motion";
import { useReducedMotionPreference } from "../../hooks/useReducedMotionPreference";

type VisualClusterProps = {
  variant: "workflow" | "signals";
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
