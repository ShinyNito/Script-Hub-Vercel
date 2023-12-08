import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
    animation: {
      "fade-up": "fade-up 0.5s"
    },
    keyframes: {
      "fade-up": {
        "0%": {
          opacity: "0",
          transform: "translateY(10px)",
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
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
export default config