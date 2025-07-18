"use client";

import { useEffect } from "react";

export default function ThemeInitializer() {
  useEffect(() => {
    if (window.localStorage.theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  return null;
}
