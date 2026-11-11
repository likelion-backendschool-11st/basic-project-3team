// Global config: preflight + forms base styles once, plus utilities for the screen index.
// Each screen has its own scoped config in src/pages/*.tailwind.cjs.
module.exports = {
  content: ['./src/App.tsx'],
  plugins: [require('@tailwindcss/forms')],
}
