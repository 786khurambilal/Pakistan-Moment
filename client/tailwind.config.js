/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        pak: {
          green: '#01411C',
          dark: '#022c17',
          light: '#0a5d2c',
        },
        paper: '#f4ecd8',
        ink: '#1c1a15',
      },
      fontFamily: {
        display: ['Inter', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
        serifBody: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
