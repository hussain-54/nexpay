/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#6366F1", // Indigo Neon
        accent: "#10B981",
        danger: "#EF4444",
        warning: "#F59E0B",
        bgDark: "#05050A", // Deep Midnight Black
        bgLight: "#13131A", // Slight elevation
        card: "#13131A",    // Card background
        borderDark: "#2A2A35",
        textPrimary: "#F9FAFB", // Crisp White
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
