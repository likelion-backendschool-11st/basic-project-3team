// Global config: preflight + forms base styles once, plus utilities for the screen index.
// Each screen has its own scoped config in src/pages/*.tailwind.cjs, which only scans that screen's file.
// Shared components (src/components) and screens without a Stitch config (NotFound, Ranking) are scanned here instead,
// otherwise their classes are never generated (#33).
module.exports = {
  content: ['./src/App.tsx', './src/components/**/*.{ts,tsx}', './src/pages/NotFound.tsx', './src/pages/Ranking.tsx'],
  theme: { extend: { fontFamily: { sans: ['"Noto Sans KR"', 'sans-serif'] } } },
  plugins: [require('@tailwindcss/forms')],
}
