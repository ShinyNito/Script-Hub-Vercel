import type { Config } from 'tailwindcss'
import { nextui } from "@nextui-org/react";

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
    animation: {
      "fade-up": "fade-up 0.5s"
    },
    keyframes: {
      "fade-up": {
        "0%": {
          opacity: "0",
        },
        "80%": {
          opacity: "0.6",
        },
        "100%": {
          opacity: "1",
          transform: "translateY(0)",
        },
      },
    },
  },
  
  darkMode: "class",
  plugins: [
    nextui()
  ],
}
export default config
