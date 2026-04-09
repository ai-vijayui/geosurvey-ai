import type { CSSProperties, PropsWithChildren } from "react";
import { motion } from "motion/react";
import { fadeUp } from "../../lib/motion";
import { useReducedMotionPreference } from "../../hooks/useReducedMotionPreference";

type FadeUpProps = PropsWithChildren<
  {
    className?: string;
    style?: CSSProperties;
    distance?: number;
    delay?: number;
  }
>;

export function FadeUp({ children, distance, delay = 0, ...props }: FadeUpProps) {
  const reduceMotion = useReducedMotionPreference();

  if (reduceMotion) {
    return <div {...props}>{children}</div>;
  }

  return (
    <motion.div
      variants={fadeUp(distance)}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      transition={{ delay }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
