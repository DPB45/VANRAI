/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // This line is important
  ],
  theme: {
    extend: {
      fontFamily: {
        // Used only for the header wordmark — see index.html for why.
        display: ['Fraunces', 'serif'],
      },
      keyframes: {
        // Small reveal for the mobile nav panel opening — motion that
        // responds directly to the person tapping the menu button, not a
        // scripted page-load effect.
        'fade-in-down': {
          '0%': { opacity: '0', transform: 'translateY(-6px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'fade-in-down': 'fade-in-down 0.18s ease-out',
      },
    },
  },
  plugins: [],
}