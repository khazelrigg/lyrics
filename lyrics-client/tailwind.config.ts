// tailwind.config.ts
import { type Config } from "tailwindcss"

const config: Config = {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"], // adjust to your setup
  theme: {
    extend: {
      colors: {
        accent: "hsl(var(--ui-accent))",
        "ui-accent-foreground": "hsl(var(--ui-accent-foreground))",
      },
    },
  },
  plugins: [],
}

export default config
