"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { CloseIcon, MenuIcon, MoonIcon, SunIcon } from "@/assets/svg";
import { headerNavLinks, type HeaderNavLink } from "../common/Header";

const mobileHeaderNavLinks: HeaderNavLink[] = [
  ...headerNavLinks,
  {
    label: "GitHub",
    href: "https://github.com/seonghoho",
    external: true,
  },
];

export default function ClientHeaderWithSidebar() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const mobileNavRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    setMobileNavOpen(false);
  }, [pathname]);

  useEffect(() => {
    const storedTheme = window.localStorage.getItem("theme");
    const nextTheme = storedTheme === "dark" || storedTheme === "light" ? storedTheme : "light";

    setIsDark(nextTheme === "dark");
  }, []);

  useEffect(() => {
    if (!mobileNavOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        mobileNavRef.current &&
        !mobileNavRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setMobileNavOpen(false);
      }
    };

    const handleKeydown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobileNavOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeydown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeydown);
    };
  }, [mobileNavOpen]);

  const toggleTheme = () => {
    const nextTheme = !isDark;
    setIsDark(nextTheme);
    document.documentElement.classList.toggle("dark", nextTheme);
    window.localStorage.setItem("theme", nextTheme ? "dark" : "light");
    document.documentElement.style.colorScheme = nextTheme ? "dark" : "light";
  };

  return (
    <>
      <button
        type="button"
        ref={buttonRef}
        className="flex h-10 w-10 items-center justify-center rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-surface)] text-[color:var(--color-text-secondary)] transition hover:text-[color:var(--color-text-primary)] lg:hidden"
        aria-controls="mobile-site-nav"
        aria-expanded={mobileNavOpen}
        aria-label={mobileNavOpen ? "메뉴 닫기" : "메뉴 열기"}
        onClick={() => setMobileNavOpen((prev) => !prev)}
      >
        {mobileNavOpen ? <CloseIcon className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
      </button>
      <button
        type="button"
        onClick={toggleTheme}
        className="flex h-10 items-center gap-2 rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-1.5 text-sm font-medium text-[color:var(--color-text-secondary)] transition hover:-translate-y-0.5 hover:text-[color:var(--color-text-primary)]"
        aria-label={isDark ? "라이트 모드로 전환" : "다크 모드로 전환"}
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[color:var(--color-surface-elevated)] text-[color:var(--color-accent)]">
          {isDark ? (
            <MoonIcon id="theme-icon" className="h-8 w-8" />
          ) : (
            <SunIcon id="theme-icon" className="h-8 w-8" />
          )}
        </span>
      </button>
      <div
        className={`fixed inset-x-0 top-[65px] z-20 transition-all duration-200 lg:hidden ${
          mobileNavOpen
            ? "pointer-events-auto translate-y-0 opacity-100"
            : "pointer-events-none -translate-y-2 opacity-0"
        }`}
      >
        <div className="mx-auto max-w-[1360px] px-4 sm:px-6 lg:px-8">
          <div
            ref={mobileNavRef}
            id="mobile-site-nav"
            className="mt-3 rounded-[28px] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] p-3 shadow-[0_24px_60px_rgba(15,23,42,0.12)]"
          >
            <nav className="flex flex-col gap-1" aria-label="모바일 전역 네비게이션">
              {mobileHeaderNavLinks.map((link) =>
                link.external ? (
                  <a
                    key={link.href}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="rounded-2xl px-4 py-3 text-sm font-medium text-[color:var(--color-text-secondary)] transition hover:bg-[color:var(--color-surface-elevated)] hover:text-[color:var(--color-text-primary)]"
                    onClick={() => setMobileNavOpen(false)}
                  >
                    {link.label}
                  </a>
                ) : (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="rounded-2xl px-4 py-3 text-sm font-medium text-[color:var(--color-text-secondary)] transition hover:bg-[color:var(--color-surface-elevated)] hover:text-[color:var(--color-text-primary)]"
                    onClick={() => setMobileNavOpen(false)}
                  >
                    {link.label}
                  </Link>
                ),
              )}
            </nav>
          </div>
        </div>
      </div>
    </>
  );
}
