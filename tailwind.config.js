/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      keyframes: {
        'snow-fall': {
          '0%': { transform: 'translateY(-10vh)' },
          '100%': { transform: 'translateY(110vh)' },
        },
        'snow-sway': {
          '0%': { transform: 'translateX(-10px)' },
          '50%': { transform: 'translateX(10px)' },
          '100%': { transform: 'translateX(-10px)' },
        },
      },
      animation: {
        'snow-fall': 'snow-fall 10s linear infinite',
        'snow-sway': 'snow-sway 4s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}
