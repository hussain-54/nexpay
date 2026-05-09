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
        bgDark: "#0F0F13",
        bgLight: "#F9FAFB",
        card: "#1A1A24",
        borderDark: "rgba(255,255,255,0.08)",
        textPrimary: "#F9FAFB",
        textMuted: "#9CA3AF"
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
