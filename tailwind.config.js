/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}", "./features/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  // Irrelevant to this app's theming — no `dark:` utilities are used; the
  // light/dark palettes are applied at runtime by ThemeProvider instead.
  // Deliberately NOT "media": NativeWind's web runtime installs a
  // MutationObserver that calls colorScheme.set() once the stylesheet loads,
  // and that setter throws when darkMode is "media" — an uncaught error on
  // every page load. See react-native-css-interop/runtime/web/color-scheme.js.
  darkMode: "class",
  theme: {
    extend: {
      // Colors deliberately live in constants/theme.ts, not here: they have to
      // switch with the OS scheme at runtime, which static utility classes
      // can't do. Use `useTheme()` and inline styles for anything colored.
      fontFamily: {
        archivo: ["Inter_700Bold"],
        manrope: ["Inter_500Medium"],
      },
    },
  },
  plugins: [],
};
