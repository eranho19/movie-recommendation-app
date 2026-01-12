import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        imdb: {
          bg: '#121212',
          surface: '#1F1F1F',
          yellow: '#F5C518',
          border: '#404040',
          text: {
            primary: '#FFFFFF',
            secondary: '#AAAAAA',
          }
        }
      },
      fontFamily: {
        sans: ['Roboto', 'Arial', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
export default config








