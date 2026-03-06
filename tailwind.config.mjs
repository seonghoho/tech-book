import typography from "@tailwindcss/typography";
import scrollbarHide from "tailwind-scrollbar-hide";

const config = {
  darkMode: "class",
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      fontFamily: {
        press: ['"PressStart2P"', "cursive"],
      },
      colors: {
        border: "var(--color-border)",
        gray: "#868e96",
        dark: "#0F0F0F",
        bright: "#FFFFFF",
      },
      boxShadow: {
        "bg-glow": "inset 0 0 30px rgba(0,0,0,0.1)",
      },
      typography: (theme) => ({
        DEFAULT: {
          css: {
            maxWidth: "72ch",
            color: "var(--color-text-secondary)",
            "code::before": { content: "none" },
            "code::after": { content: "none" },
            a: {
              color: "var(--color-link)",
              fontWeight: "500",
              textDecoration: "none",
              "&:hover": {
                color: "var(--color-accent-hover)",
              },
            },
            h1: {
              fontSize: theme("fontSize.4xl")[0],
              fontWeight: "700",
              color: "var(--color-text-primary)",
              lineHeight: "1.15",
              letterSpacing: "-0.03em",
            },
            h2: {
              fontSize: theme("fontSize.3xl")[0],
              fontWeight: "600",
              color: "var(--color-text-primary)",
              marginTop: "3rem",
              marginBottom: "1.2rem",
              letterSpacing: "-0.02em",
            },
            h3: {
              color: "var(--color-text-primary)",
              letterSpacing: "-0.01em",
            },
            p: {
              color: "var(--color-text-secondary)",
              lineHeight: "1.9",
              marginTop: "1.1em",
              marginBottom: "1.1em",
            },
            code: {
              backgroundColor: "var(--color-code)",
              padding: "0.18rem 0.45rem",
              borderRadius: "0.4rem",
              fontFamily: theme("fontFamily.mono"),
              color: "var(--color-text-primary)",
            },

            pre: {
              backgroundColor: "var(--color-code)",
              color: "var(--color-text-primary)",
              padding: "1.6rem",
              border: "1px solid var(--color-border)",
              borderRadius: "1rem",
              overflowX: "auto",
              code: {
                backgroundColor: "transparent", // prism 테마가 덮어씌움
                padding: "0",
                color: "inherit",
              },
            },
            blockquote: {
              borderLeftColor: "var(--color-border-strong)",
              color: "var(--color-text-secondary)",
              fontStyle: "normal",
              backgroundColor: "var(--color-surface-elevated)",
              borderRadius: "0.9rem",
              padding: "1rem 1.25rem",
            },
            ul: {
              listStyleType: "disc",
              paddingLeft: "1.2em",
            },
            "ul > li::marker": {
              color: "var(--color-accent)",
              fontSize: "1em",
            },
            ol: {
              listStyleType: "decimal",
            },
            "ol > li::marker": {
              color: "var(--color-accent)",
              fontWeight: "bold",
            },
            hr: {
              borderColor: "var(--color-border)",
            },
          },
        },
        dark: {
          css: {
            maxWidth: "72ch",
            color: "var(--color-text-secondary)",
            h1: { color: "var(--color-text-primary)" },
            h2: { color: "var(--color-text-primary)" },
            h3: { color: "var(--color-text-primary)" },
            p: { color: "var(--color-text-secondary)" },
            a: { color: "var(--color-link)" },
            code: {
              backgroundColor: "var(--color-code)",
              color: "var(--color-text-primary)",
            },
            pre: {
              backgroundColor: "var(--color-code)",
              color: "var(--color-text-primary)",
              padding: "1.6rem",
              border: "1px solid var(--color-border)",
              borderRadius: "1rem",
              overflowX: "auto",
            },
            blockquote: {
              borderLeftColor: "var(--color-border-strong)",
              color: "var(--color-text-secondary)",
            },
          },
        },
      }),
    },
  },
  plugins: [typography, scrollbarHide],
};

export default config;
