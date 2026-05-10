/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#7C3AED",
        accent: "#10B981",
        danger: "#EF4444",
        warning: "#F59E0B",
        bgDark: "#F3F4F6", // renamed visually, but kept variable name to avoid massive code rewrite
        bgLight: "#FFFFFF",
        card: "#FFFFFF",
        borderDark: "#E5E7EB",
        textPrimary: "#111827",
        textMuted: "#6B7280"
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
      },
      borderRadius: {
        'xl': '12px',
        '2xl': '16px',
      }
    },
  },
  plugins: [],
}
