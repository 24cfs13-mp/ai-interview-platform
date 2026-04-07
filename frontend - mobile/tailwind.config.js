/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        electric: '#FF4A00',
        toxic: '#CCFF00',
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        mono: ['Space Mono', 'monospace'],
      },
      boxShadow: {
        'brutal': '4px 4px 0px 0px rgba(255, 74, 0, 1)',
        'brutal-white': '4px 4px 0px 0px rgba(255, 255, 255, 1)',
        'brutal-zinc': '4px 4px 0px 0px rgba(39, 39, 42, 1)',
      }
    },
  },
  plugins: [],
}
