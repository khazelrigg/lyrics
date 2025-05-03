// tailwind.config.ts
import { type Config } from "tailwindcss"
import defaultTheme from "tailwindcss/defaultTheme";

const config: Config = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"], // adjust to your setup
  theme: {
    extend: {
      colors: {
        accent: "hsl(var(--ui-accent))",
        "ui-accent-foreground": "hsl(var(--ui-accent-foreground))",
      },
      fontFamily: {
        sans: ['var(--font-sans)', ...defaultTheme.fontFamily.sans],
        serif: ['var(--font-serif)', ...defaultTheme.fontFamily.serif],
        mono: ['var(--font-mono)', ...defaultTheme.fontFamily.mono],
        rounded: ['var(--font-rounded)', ...defaultTheme.fontFamily.sans],
      },
      
    },
  },
  plugins: [],
}

export default config
