

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{vue,js,ts,jsx,tsx}"],
  theme: {
    extend: {
      gridTemplateRows: {
        "auto-1fr-auto": "auto 1fr auto",
      },
      gridTemplateColumns: {
        'auto-1fr': 'auto 1fr',
      }
    },
  },
  plugins: [],
};
