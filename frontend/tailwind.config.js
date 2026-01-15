/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}"
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: '#003366',
        secondary: '#FFB81C',
        danger: '#D32F2F',
        success: '#2E7D32',
        warning: '#F57C00',
      },
    },
  },
  plugins: [],
}
