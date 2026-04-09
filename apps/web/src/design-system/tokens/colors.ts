export const palette = {
  white: "#FFFFFF",
  gray: {
    950: "#1C1C1C",
    900: "#5C5C5C",
    800: "#8B877D",
    700: "#A8A49A",
    600: "#C5C2B8",
    500: "#D6D4CD",
    400: "#DCD9CC",
    300: "#E8E6DD",
    200: "#F0EFEA",
    100: "#F8F6F0",
    50: "#FDFBF7"
  },
  green: {
    950: "#0F120E",
    900: "#181E17",
    800: "#232B22",
    700: "#2F3B2F",
    600: "#3D4D39",
    500: "#4A5D45",
    400: "#7B9274",
    300: "#A8B9A3",
    200: "#C8D3C4",
    100: "#E1E6DF",
    50: "#F2F4F1"
  },
  red: {
    950: "#2D140F",
    900: "#451E16",
    800: "#5C281E",
    700: "#733325",
    600: "#8B3E2D",
    500: "#A34A36",
    400: "#D47862",
    300: "#E5A794",
    200: "#F0CCC2",
    100: "#F8E6E1",
    50: "#FCF4F2"
  }
} as const;

export type Palette = typeof palette;

export const paletteColorVariables = {
  white: "var(--color-white)",
  gray: {
    950: "var(--color-gray-950)",
    900: "var(--color-gray-900)",
    800: "var(--color-gray-800)",
    700: "var(--color-gray-700)",
    600: "var(--color-gray-600)",
    500: "var(--color-gray-500)",
    400: "var(--color-gray-400)",
    300: "var(--color-gray-300)",
    200: "var(--color-gray-200)",
    100: "var(--color-gray-100)",
    50: "var(--color-gray-50)"
  },
  green: {
    950: "var(--color-green-950)",
    900: "var(--color-green-900)",
    800: "var(--color-green-800)",
    700: "var(--color-green-700)",
    600: "var(--color-green-600)",
    500: "var(--color-green-500)",
    400: "var(--color-green-400)",
    300: "var(--color-green-300)",
    200: "var(--color-green-200)",
    100: "var(--color-green-100)",
    50: "var(--color-green-50)"
  },
  red: {
    950: "var(--color-red-950)",
    900: "var(--color-red-900)",
    800: "var(--color-red-800)",
    700: "var(--color-red-700)",
    600: "var(--color-red-600)",
    500: "var(--color-red-500)",
    400: "var(--color-red-400)",
    300: "var(--color-red-300)",
    200: "var(--color-red-200)",
    100: "var(--color-red-100)",
    50: "var(--color-red-50)"
  }
} as const;
