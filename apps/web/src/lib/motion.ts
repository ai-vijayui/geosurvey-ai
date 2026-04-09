import type { Transition, Variants } from "motion/react";

export const motionTokens = {
  duration: {
    instant: 0.16,
    fast: 0.24,
    base: 0.4,
    slow: 0.58
  },
  easing: {
    standard: [0.22, 1, 0.36, 1] as const,
    exit: [0.4, 0, 1, 1] as const,
    gentle: [0.25, 0.1, 0.25, 1] as const
  },
  distance: {
    xs: 8,
    sm: 14,
    md: 20,
    lg: 28
  },
  scale: {
    hover: 1.02,
    press: 0.985
  }
};

export const transitions = {
  base: {
    duration: motionTokens.duration.base,
    ease: motionTokens.easing.standard
  } satisfies Transition,
  fast: {
    duration: motionTokens.duration.fast,
    ease: motionTokens.easing.standard
  } satisfies Transition,
  slow: {
    duration: motionTokens.duration.slow,
    ease: motionTokens.easing.standard
  } satisfies Transition
};

export const fadeUp = (distance = motionTokens.distance.md): Variants => ({
  hidden: { opacity: 0, y: distance },
  visible: {
    opacity: 1,
    y: 0,
    transition: transitions.base
  }
});

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: transitions.base }
};

export const staggerParent = (stagger = 0.08, delayChildren = 0): Variants => ({
  hidden: {},
  visible: {
    transition: {
      staggerChildren: stagger,
      delayChildren
    }
  }
});

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.98 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: transitions.base
  }
};

export const navReveal: Variants = {
  hidden: { opacity: 0, y: -12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: transitions.fast
  }
};

export const pageTransition: Variants = {
  initial: { opacity: 0, y: 12 },
  animate: {
    opacity: 1,
    y: 0,
    transition: transitions.base
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: {
      duration: motionTokens.duration.fast,
      ease: motionTokens.easing.exit
    }
  }
};
