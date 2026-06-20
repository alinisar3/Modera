/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,jsx}",
    "./src/components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: "#0f172a",
          primary: "#6366f1",
          accent: "#8b5cf6",
          bg: "#f8fafc"
        }
      }
    },
  },
  plugins: [],
}