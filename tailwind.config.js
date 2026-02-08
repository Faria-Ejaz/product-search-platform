/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#111827', // gray-900
          hover: '#1f2937', // gray-800
          light: '#374151', // gray-700
        },
        secondary: {
          DEFAULT: '#6b7280', // gray-500
          light: '#9ca3af', // gray-400
          lighter: '#d1d5db', // gray-300
        },
        background: {
          DEFAULT: '#f9fafb', // gray-50
          card: '#ffffff',
          hover: '#f3f4f6', // gray-100
        },
        border: {
          DEFAULT: '#e5e7eb', // gray-200
          focus: '#9ca3af', // gray-400
        },
        text: {
          primary: '#111827', // gray-900
          secondary: '#6b7280', // gray-500
          disabled: '#9ca3af', // gray-400
        },
      },
      fontFamily: {
        sans: ['"Avenir Next"', '"Avenir"', '-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'sans-serif'],
      },
      spacing: {
        'card': '1rem', // p-4
        'card-lg': '1.5rem', // p-6
        'section': '1.5rem', // mb-6
      },
      borderRadius: {
        'card': '0.5rem', // rounded-lg
      },
      boxShadow: {
        'card': '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        'card-hover': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
      },
      transitionDuration: {
        'default': '200ms',
      },
    },
  },
  plugins: [],
}
