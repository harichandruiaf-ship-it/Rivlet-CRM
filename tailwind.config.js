/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        crm: {
          bg: '#fcfcfd',
          surface: '#ffffff',
          border: '#e4e4e7',
          subtle: '#f4f4f5',
          muted: '#71717a',
          foreground: '#09090b',
          primary: '#18181b',
          accent: '#2563eb',
        },
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      boxShadow: {
        subtle: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
        card: '0 1px 3px 0 rgba(0, 0, 0, 0.07), 0 1px 2px -1px rgba(0, 0, 0, 0.07)',
        drawer: '-4px 0 24px rgba(0, 0, 0, 0.12)',
      },
    },
  },
  plugins: [],
}
