// Global config: preflight + forms base styles once, plus utilities for the screen index.
// Each screen has its own scoped config in src/pages/*.tailwind.cjs, which only scans that screen's file.
// Shared components (src/components) and screens without a Stitch config (NotFound) are scanned here instead,
// otherwise their classes are never generated (#33).
module.exports = {
  content: ['./src/App.tsx', './src/components/**/*.{ts,tsx}', './src/pages/NotFound.tsx'],
  plugins: [require('@tailwindcss/forms')],
}
