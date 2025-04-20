/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#1db954',
          dark: '#169e45',
          light: '#3dd772',
        },
        background: {
          DEFAULT: '#ffffff',
          light: '#f5f5f5',
          dark: '#e5e5e5',
        },
        text: {
          DEFAULT: '#212121',
          secondary: '#666666',
        },
        dark: {
          background: {
            DEFAULT: '#121212',
            light: '#212121',
            dark: '#0a0a0a',
          },
          text: {
            DEFAULT: '#ffffff',
            secondary: '#b3b3b3',
          },
        },
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', 'system-ui', 'sans-serif'],
      },
      spacing: {
        '18': '4.5rem',
      },
    },
  },
  plugins: [],
} 