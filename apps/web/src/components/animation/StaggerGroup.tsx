import type { CSSProperties, PropsWithChildren } from "react";
import { motion } from "motion/react";
import { staggerParent } from "../../lib/motion";
import { useReducedMotionPreference } from "../../hooks/useReducedMotionPreference";

type StaggerGroupProps = PropsWithChildren<
  {
    className?: string;
    style?: CSSProperties;
    stagger?: number;
    delayChildren?: number;
  }
>;

export function StaggerGroup({
  children,
  stagger = 0.08,
  delayChildren = 0,
  ...props
}: StaggerGroupProps) {
  const reduceMotion = useReducedMotionPreference();

  if (reduceMotion) {
    return <div {...props}>{children}</div>;
  }

  return (
    <motion.div
      variants={staggerParent(stagger, delayChildren)}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.15 }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
