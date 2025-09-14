/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ["class"],
    content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
    theme: {
      extend: {
        colors: {
          border: "hsl(var(--border))",
          bg: "hsl(var(--background))",
          fg: "hsl(var(--foreground))",
          brand: { DEFAULT: "hsl(var(--brand))", fg: "hsl(var(--brand-foreground))" },
          accent: "#3b5ca4",
        },
        borderRadius: { xl: "1rem", "2xl": "1.25rem" },
      },
    },
    plugins: [require("tailwindcss-animate")],
  };
  