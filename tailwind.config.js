import autoprefixer from 'autoprefixer';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./views/**/*.{html,js,ejs}"
], 
  theme: {
    extend: {
      fontFamily: {
        sans:["Inter"],
      },
    },
  },
  plugins: [],
}

