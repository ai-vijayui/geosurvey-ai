import type { CSSProperties, PropsWithChildren } from "react";
import { motion } from "motion/react";
import { fadeUp } from "../../lib/motion";
import { useReducedMotionPreference } from "../../hooks/useReducedMotionPreference";

type RevealProps = PropsWithChildren<
  {
    className?: string;
    style?: CSSProperties;
    amount?: number;
    once?: boolean;
    distance?: number;
    delay?: number;
  }
>;

export function Reveal({
  children,
  amount = 0.2,
  once = true,
  distance,
  delay = 0,
  ...props
}: RevealProps) {
  const reduceMotion = useReducedMotionPreference();

  if (reduceMotion) {
    return <div {...props}>{children}</div>;
  }

  return (
    <motion.div
      variants={fadeUp(distance)}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount }}
      transition={{ delay }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
