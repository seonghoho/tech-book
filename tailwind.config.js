module.exports = {
  darkMode: "class",
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        border: "#e0e0e0",
        gray: "#868e96",
        dark: "#0F0F0F",
        bright: "#F1F1F1",
      },
      typography: (theme) => ({
        DEFAULT: {
          css: {
            h1: {
              fontSize: theme("fontSize.3xl")[0],
              fontWeight: "700",
              color: theme("colors.gray.900"),
            },
            h2: {
              fontSize: theme("fontSize.2xl")[0],
              fontWeight: "600",
              color: theme("colors.gray.800"),
              marginTop: "2rem",
              marginBottom: "1rem",
            },
            p: {
              color: theme("colors.gray.700"),
              lineHeight: "1.8",
            },
            code: {
              backgroundColor: theme("colors.gray.400"),
              padding: "2px 4px",
              borderRadius: "0.25rem",
              color: theme("colors.pink.600"),
            },

            pre: {
              backgroundColor: theme("colors.gray.100"),
              color: theme("colors.gray.900"),
              padding: "2rem",
              border: `1px solid white`,
              borderRadius: "0.5rem",
              overflowX: "auto",
            },
            blockquote: {
              borderLeftColor: theme("colors.gray.200"),
              color: theme("colors.gray.600"),
              fontStyle: "italic",
            },
          },
        },
        dark: {
          css: {
            color: theme("colors.gray.200"),
            h1: { color: theme("colors.bright") },
            h2: { color: theme("colors.gray.100") },
            p: { color: theme("colors.gray.300") },
            code: {
              backgroundColor: theme("colors.zinc.200"),
              color: theme("colors.orange.400"),
            },
            pre: {
              backgroundColor: theme("colors.zinc.900"),
              color: theme("colors.gray.100"),
              padding: "2rem",
              border: "1px solid white",
              borderRadius: "0.5rem",
              overflowX: "auto",
            },
            blockquote: {
              borderLeftColor: theme("colors.zinc.200"),
              color: theme("colors.zinc.300"),
            },
          },
        },
      }),
    },
  },
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  plugins: [require("@tailwindcss/typography")],
};
