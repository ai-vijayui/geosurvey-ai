import { palette } from "./colors";

export const semanticColors = {
  bg: {
    default: palette.gray[100],
    subtle: palette.gray[200],
    surface: palette.white,
    surfaceElevated: palette.gray[50],
    inverse: palette.gray[950]
  },
  text: {
    primary: palette.gray[950],
    secondary: palette.gray[900],
    tertiary: palette.gray[800],
    inverse: palette.gray[50],
    success: palette.green[700],
    danger: palette.red[700]
  },
  border: {
    default: palette.gray[300],
    subtle: palette.gray[200],
    strong: palette.gray[500],
    success: palette.green[300],
    danger: palette.red[300]
  },
  brand: {
    primary: palette.green[600],
    primaryHover: palette.green[700],
    primaryActive: palette.green[800],
    secondary: palette.gray[200],
    secondaryHover: palette.gray[300]
  },
  action: {
    danger: palette.red[600],
    dangerHover: palette.red[700],
    dangerText: palette.red[50]
  },
  success: {
    bg: palette.green[50],
    text: palette.green[700],
    border: palette.green[200]
  },
  warning: {
    bg: palette.gray[200],
    text: palette.red[600],
    border: palette.red[200]
  },
  danger: {
    bg: palette.red[50],
    text: palette.red[700],
    border: palette.red[200]
  },
  surface: {
    success: palette.green[50],
    danger: palette.red[50],
    selected: palette.green[100],
    hover: palette.gray[200]
  }
} as const;

export const cssColorVariables = {
  bg: {
    default: "var(--color-bg-default)",
    subtle: "var(--color-bg-subtle)",
    surface: "var(--color-bg-surface)",
    surfaceElevated: "var(--color-bg-surface-elevated)",
    inverse: "var(--color-bg-inverse)"
  },
  text: {
    primary: "var(--color-text-primary)",
    secondary: "var(--color-text-secondary)",
    tertiary: "var(--color-text-tertiary)",
    inverse: "var(--color-text-inverse)",
    success: "var(--color-text-success)",
    danger: "var(--color-text-danger)"
  },
  border: {
    default: "var(--color-border-default)",
    subtle: "var(--color-border-subtle)",
    strong: "var(--color-border-strong)",
    success: "var(--color-border-success)",
    danger: "var(--color-border-danger)"
  },
  brand: {
    primary: "var(--color-brand-primary)",
    primaryHover: "var(--color-brand-primary-hover)",
    primaryActive: "var(--color-brand-primary-active)",
    secondary: "var(--color-brand-secondary)",
    secondaryHover: "var(--color-brand-secondary-hover)"
  },
  action: {
    danger: "var(--color-action-danger)",
    dangerHover: "var(--color-action-danger-hover)",
    dangerText: "var(--color-action-danger-text)"
  },
  success: {
    bg: "var(--color-success-bg)",
    text: "var(--color-success-text)",
    border: "var(--color-success-border)"
  },
  warning: {
    bg: "var(--color-warning-bg)",
    text: "var(--color-warning-text)",
    border: "var(--color-warning-border)"
  },
  danger: {
    bg: "var(--color-danger-bg)",
    text: "var(--color-danger-text)",
    border: "var(--color-danger-border)"
  },
  surface: {
    success: "var(--color-surface-success)",
    danger: "var(--color-surface-danger)",
    selected: "var(--color-surface-selected)",
    hover: "var(--color-surface-hover)"
  }
} as const;

export type SemanticColors = typeof semanticColors;

export const semanticColorVariableNames = {
  bg: {
    default: "--color-bg-default",
    subtle: "--color-bg-subtle",
    surface: "--color-bg-surface",
    surfaceElevated: "--color-bg-surface-elevated",
    inverse: "--color-bg-inverse"
  },
  text: {
    primary: "--color-text-primary",
    secondary: "--color-text-secondary",
    tertiary: "--color-text-tertiary",
    inverse: "--color-text-inverse",
    success: "--color-text-success",
    danger: "--color-text-danger"
  },
  border: {
    default: "--color-border-default",
    subtle: "--color-border-subtle",
    strong: "--color-border-strong",
    success: "--color-border-success",
    danger: "--color-border-danger"
  },
  brand: {
    primary: "--color-brand-primary",
    primaryHover: "--color-brand-primary-hover",
    primaryActive: "--color-brand-primary-active",
    secondary: "--color-brand-secondary",
    secondaryHover: "--color-brand-secondary-hover"
  },
  action: {
    danger: "--color-action-danger",
    dangerHover: "--color-action-danger-hover",
    dangerText: "--color-action-danger-text"
  },
  success: {
    bg: "--color-success-bg",
    text: "--color-success-text",
    border: "--color-success-border"
  },
  warning: {
    bg: "--color-warning-bg",
    text: "--color-warning-text",
    border: "--color-warning-border"
  },
  danger: {
    bg: "--color-danger-bg",
    text: "--color-danger-text",
    border: "--color-danger-border"
  },
  surface: {
    success: "--color-surface-success",
    danger: "--color-surface-danger",
    selected: "--color-surface-selected",
    hover: "--color-surface-hover"
  }
} as const;
