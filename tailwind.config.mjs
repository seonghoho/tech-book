import typography from "@tailwindcss/typography";
import scrollbarHide from "tailwind-scrollbar-hide";

const config = {
  darkMode: "class",
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        border: "#e0e0e0",
        gray: "#868e96",
        dark: "#0F0F0F",
        bright: "#FFFFFF",
      },
      typography: (theme) => ({
        DEFAULT: {
          css: {
            maxWidth: "100%",
            "code::before": { content: "none" },
            "code::after": { content: "none" },
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
              color: theme("colors.green.700"),
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
            ul: {
              listStyleType: "disc",
              paddingLeft: "1em", // 들여쓰기 조정
            },
            "ul > li::marker": {
              color: theme("colors.gray"),
              fontSize: "1em", // 크기 조정
            },
            ol: {
              listStyleType: "decimal", // 숫자 목록
            },
            "ol > li::marker": {
              color: theme("colors.green.400"),
              fontWeight: "bold",
            },
          },
        },
        dark: {
          css: {
            maxWidth: "100%",
            color: theme("colors.gray.200"),
            h1: { color: theme("colors.bright") },
            h2: { color: theme("colors.gray.100") },
            p: { color: theme("colors.gray.300") },
            code: {
              backgroundColor: theme("colors.zinc.200"),
              color: theme("colors.green.400"),
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
  plugins: [typography, scrollbarHide],
};

export default config;
