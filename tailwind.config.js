/** @type {import('tailwindcss').Config} */

module.exports = {
  content: ["./index.{js,jsx,ts,tsx}", "./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    colors: {
      abs: {
        50: "#fdf9ef",
        100: "#faf1da",
        200: "#f4e1b4",
        300: "#efd08f",
        400: "#e5ac52",
        500: "#df9530",
        600: "#d17d25",
        700: "#ad6121",
        800: "#8a4d22",
        900: "#70411e",
        950: "#3c200e",
      },
    },
    extend: {},
  },
  plugins: [],
};
