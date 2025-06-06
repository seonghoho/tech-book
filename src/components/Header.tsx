"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const navLinks = [
  { label: "About", href: "/about" },
  { label: "글 목록", href: "/" },
];

export default function Header() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const userTheme = window.localStorage.getItem("theme");
    const systemPrefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;
    const shouldUseDark =
      userTheme === "dark" || (!userTheme && systemPrefersDark);

    setIsDark(shouldUseDark);
    document.documentElement.classList.toggle("dark", shouldUseDark);
  }, []);

  const toggleTheme = () => {
    const nextTheme = !isDark;
    setIsDark(nextTheme);
    document.documentElement.classList.toggle("dark", nextTheme);
    window.localStorage.setItem("theme", nextTheme ? "dark" : "light");
  };

  return (
    <header className="sticky top-0 z-30 w-full bg-white dark:bg-black shadow border-b">
      <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* 왼쪽: 로고 및 햄버거 메뉴  */}
          <div className="flex items-center gap-4">
            {/* 햄버거 버튼: 1024px 이하에서 표시  */}
            <button className="lg:hidden block" aria-label="Open sidebar">
              <svg
                className="w-6 h-6 text-gray-700 dark:text-white"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                viewBox="0 0 24 24"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
            {/* 로고  */}
            <Link
              href="/"
              className="text-xl font-bold text-black dark:text-white"
            >
              TECH BOOK
            </Link>
          </div>
          {/* 오른쪽: 다크모드 토글  */}
          <div className="flex items-center">
            <div className="flex items-center gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="hover:text-gray-300"
                >
                  {link.label}
                </Link>
              ))}
            </div>
            <button
              onClick={toggleTheme}
              className="text-lg ml-4 hover:opacity-70"
            >
              <span id="theme-icon">🌙</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
