"use client";

import { useEffect } from "react";

function getPreferredTheme() {
  const storedTheme = window.localStorage.getItem("theme");

  if (storedTheme === "light" || storedTheme === "dark") {
    return storedTheme;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export default function ThemeInitializer() {
  useEffect(() => {
    const nextTheme = getPreferredTheme();
    document.documentElement.classList.toggle("dark", nextTheme === "dark");
    document.documentElement.style.colorScheme = nextTheme;
  }, []);

  return null;
}
