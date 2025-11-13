/** @type {import('tailwindcss').Config} */
module.exports = {
  corePlugins: {
    preflight: false,
  },
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2255FF',
        },
        warning: '',
        grey: {
          100: '#F2F2F2',
          300: '#B4B4B4',
          600: '#626262',
          800: '#212121'
        }
      },
      backgroundImage: {
        'primary-gradient': 'linear-gradient(to right, rgb(0, 0, 139), rgb(0, 0, 255))',
        'warning-gradient': 'linear-gradient(to right, rgb(255, 215, 0), rgb(0, 0, 0))',
      }
    },
  },
  plugins: [],
};
