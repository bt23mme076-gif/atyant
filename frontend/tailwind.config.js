export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        atyant: {
          bg: "#13121A",
          card: "#1A1823",
          purple: "#7567C9",
          violet: "#8E80DB",
          green: "#3DBE82",
        },
      },
      fontFamily: {
        sans: ["Poppins", "ui-sans-serif", "system-ui"],
      },
    },
  },
  plugins: [],
};
