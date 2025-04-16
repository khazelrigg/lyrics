/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Poppins', 'Noto Sans JP', 'Arial', 'sans-serif'],
        lyrics: ['Noto Sans JP', 'Arial', 'sans-serif']
      }
    },
  },
  plugins: [],
}

