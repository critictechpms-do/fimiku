/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        fimiku: {
          primary: "#7F5CF9",
          cta: "#8044F0",
          deep: "#48288C",
          light: "#B09AEF",
          veryLightLavender: "#F4F0FE",
          softLavender: "#FAF7FD",
          lavenderCard: "#F0E8FC",
          extraLightPurple: "#ECE8FC",
          white: "#FFFFFF",
          offWhite: "#FAFAF8",
          softWarmWhite: "#FDF8F6",
          lightBorder: "#E7E5E8",
          mediumBorder: "#D7D3D8",
          darkText: "#131212",
          secondaryText: "#4B4A69",
          grayText: "#6C7170",
          lightBlue: "#DEEEFD",
          softBlue: "#DCF0FC",
          paleAqua: "#BBE1E5",
          aquaAccent: "#A0E4E4",
          softGreen: "#C8F0E0",
          cream: "#FCEFD4",
          lightCream: "#FCF0D0",
          softPink: "#F4D8C8",
          warmBeige: "#E0C5B3",
          brownAccent: "#A97D5D",
          // Backward compatibility mappings
          blush: "#FAF7FD",
          peach: "#F0E8FC",
          sage: "#7F5CF9",
          sand: "#E7E5E8",
          charcoal: "#131212",
          terracotta: "#8044F0",
          softgray: "#FAFAF8",
        }
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        serif: ['Georgia', 'Cambria', 'serif'],
      },
      screens: {
        'xs': '480px',
        'sm': '640px',
        'md': '768px',
        'lg': '1024px',
        'xl': '1280px',
        '2xl': '1536px',
        '3xl': '1920px',
      },
      maxWidth: {
        '8xl': '1440px',
        '9xl': '1600px',
        'fhd': '1920px',
      },
      boxShadow: {
        'soft': '0 4px 20px -2px rgba(127, 92, 249, 0.08)',
        'card': '0 10px 30px -4px rgba(72, 40, 140, 0.06)',
        'floating': '0 20px 40px -6px rgba(128, 68, 240, 0.12)',
      }
    },
  },
  plugins: [],
};
