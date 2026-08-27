// Two palettes sharing one key set, so every component can read the same
// token name and get the right value for the active color scheme.
//
// Do NOT import `lightColors`/`darkColors` directly in components — use
// `useTheme()` from `@/components/theme/ThemeProvider`, which picks the
// palette that matches the phone's setting.
//
// Naming: surfaces go bg → surface → surfaceRaised → surfaceSunken (furthest
// back to closest to the reader). Text goes text → textStrong → textMuted →
// textFaint → textWhisper (most to least emphasis).

export type ThemeColors = {
  // Surfaces
  bg: string;
  surface: string;
  surfaceRaised: string;
  surfaceSunken: string;

  // Text
  text: string;
  textStrong: string;
  textMuted: string;
  textFaint: string;
  textWhisper: string;

  // Hairlines
  line: string;
  lineStrong: string;

  // Brand
  ember: string;
  emberInk: string;
  emberDeep: string;
  emberTint: string;
  emberChip: string;
  emberWash: string;
  onEmber: string;

  // Illustration ramp (warm oranges, used by the SVG art)
  emberWarm: string;
  emberMid: string;
  emberSoft: string;
  emberPale: string;

  // Decorative background arc rings
  arcLight: string;
  arcMid: string;
  arcStrong: string;

  // Always-dark surfaces (floating tab bar, avatar chips) and the content on
  // them. These deliberately do NOT flip with the scheme — the component is
  // dark in both themes by design.
  inverse: string;
  onInverse: string;
  onInverseMuted: string;

  // Maximum contrast against the page background, and the content that sits
  // on it. Unlike `inverse` these DO flip: near-black in light, near-white in
  // dark. Used by the Sign in with Apple button, whose own guidelines require
  // it to invert with the surrounding appearance.
  contrast: string;
  onContrast: string;

  // Shadow tint. Dark themes need a much heavier, blacker shadow than a
  // light one for the same perceived lift.
  shadow: string;
  shadowStrong: string;

  // Misc
  trackIdle: string;
  success: string;
};

export const lightColors: ThemeColors = {
  bg: "#F5F3EF",
  surface: "#FFFFFF",
  surfaceRaised: "#FBFAF8",
  surfaceSunken: "#F1EEE7",

  text: "#2A2521",
  textStrong: "#332E29",
  textMuted: "#8B8378",
  textFaint: "#B8B0A0",
  textWhisper: "#C4BDB3",

  line: "#E7E2DA",
  lineStrong: "#DCD5CA",

  ember: "#EA5A17",
  emberInk: "#C1550F",
  emberDeep: "#A4551F",
  emberTint: "#FAEFDF",
  emberChip: "#FBE9D6",
  emberWash: "#FCEEE0",
  onEmber: "#FBFAF8",

  emberWarm: "#D68352",
  emberMid: "#EE9A5F",
  emberSoft: "#F3BE92",
  emberPale: "#FBCDA6",

  arcLight: "#F3DCC8",
  arcMid: "#E9BE9C",
  arcStrong: "#D99566",

  inverse: "#2A2521",
  onInverse: "#FBFAF8",
  onInverseMuted: "rgba(251,250,248,0.55)",

  contrast: "#000000",
  onContrast: "#FFFFFF",

  shadow: "rgba(42,37,33,0.06)",
  shadowStrong: "rgba(42,37,33,0.16)",

  trackIdle: "#E9DDD2",
  success: "#5FA05A",
};

// Neutral greys, not warm ones. The light theme is warm paper because that IS
// the material; carrying the same hue into the darks just reads as brown. So
// surfaces and text here sit on a neutral black-to-white ramp and let the
// ember accent supply all the warmth.
//
// `ember` stays close to its light value because it is a FILL — brightening a
// fill just makes it glare, and white content on it has to stay legible. Only
// `emberInk`/`emberDeep`, which are used as TEXT against dark surfaces, get
// lifted for contrast. The illustration ramp is muted instead of lightened,
// since those pale peach tones would otherwise blow out against near-black.
export const darkColors: ThemeColors = {
  bg: "#1A1A1A",
  surface: "#262626",
  surfaceRaised: "#2E2E2E",
  surfaceSunken: "#383838",

  text: "#FAFAFA",
  textStrong: "#F0F0F0",
  textMuted: "#A3A3A3",
  textFaint: "#7A7A7A",
  textWhisper: "#666666",

  line: "#363636",
  lineStrong: "#454545",

  ember: "#E85F22",
  emberInk: "#FF9159",
  emberDeep: "#FFA877",
  // Brand-tinted surfaces keep only a trace of warmth — enough to read as
  // "ember surface" next to the neutral greys, not enough to look brown.
  emberTint: "#2E2622",
  emberChip: "#362A24",
  emberWash: "#312722",
  onEmber: "#FBFAF8",

  emberWarm: "#C97A4B",
  emberMid: "#D98A50",
  emberSoft: "#B87A4E",
  emberPale: "#8A5636",

  arcLight: "#332A25",
  arcMid: "#42342C",
  arcStrong: "#553F33",

  // Lifted off the page background so the bar still reads as a floating
  // element rather than melting into the page.
  inverse: "#303030",
  onInverse: "#FBFAF8",
  onInverseMuted: "rgba(250,250,250,0.55)",

  contrast: "#FFFFFF",
  onContrast: "#000000",

  shadow: "rgba(0,0,0,0.40)",
  shadowStrong: "rgba(0,0,0,0.60)",

  trackIdle: "#3D3D3D",
  success: "#6FB56A",
};

// Brand marks that must never be recolored by the theme.
export const brandColors = {
  googleBlue: "#4285F4",
  googleGreen: "#34A853",
  googleYellow: "#FBBC05",
  googleRed: "#EA4335",
} as const;

// Single typeface (Inter) across the whole app. The "archivo"/"manrope" keys
// are kept as the semantic display/body split AppText's `family` prop uses
// everywhere — only the underlying font files changed.
export const fonts = {
  archivo: {
    medium: "Inter_500Medium",
    bold: "Inter_700Bold",
    extraBold: "Inter_800ExtraBold",
    black: "Inter_900Black",
    blackItalic: "Inter_900Black_Italic",
  },
  manrope: {
    regular: "Inter_400Regular",
    medium: "Inter_500Medium",
    semiBold: "Inter_600SemiBold",
    bold: "Inter_700Bold",
    extraBold: "Inter_800ExtraBold",
  },
} as const;
