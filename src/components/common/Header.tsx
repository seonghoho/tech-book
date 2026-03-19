"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { CloseIcon, MenuIcon, MoonIcon, SunIcon, LogoSvgIcon } from "@/assets/svg";

type HeaderProps = {
  onToggleMobileNav?: () => void;
  isMobileNavOpen?: boolean;
  buttonRef?: React.RefObject<HTMLButtonElement | null>;
};

export type HeaderNavLink = {
  label: string;
  href: string;
  external?: boolean;
};

export const headerNavLinks = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Projects", href: "/projects" },
  { label: "Writing", href: "/posts" },
] satisfies HeaderNavLink[];

const headerSecondaryLink = {
  label: "GitHub",
  href: "https://github.com/seonghoho",
  external: true,
} satisfies HeaderNavLink;

export default function Header({
  onToggleMobileNav,
  isMobileNavOpen = false,
  buttonRef,
}: HeaderProps) {
  const [isDark, setIsDark] = useState(false);

  const toggleTheme = () => {
    const nextTheme = !isDark;
    setIsDark(nextTheme);
    document.documentElement.classList.toggle("dark", nextTheme);
    window.localStorage.setItem("theme", nextTheme ? "dark" : "light");
    document.documentElement.style.colorScheme = nextTheme ? "dark" : "light";
  };

  useEffect(() => {
    const storedTheme = window.localStorage.getItem("theme");
    const preferredTheme =
      storedTheme === "light" || storedTheme === "dark"
        ? storedTheme
        : window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light";

    setIsDark(preferredTheme === "dark");
  }, []);

  return (
    <header className="bg-[color:var(--color-bg)]/92 sticky top-0 z-30 w-full border-b border-[color:var(--color-border)] backdrop-blur-xl">
      <div className="mx-auto max-w-[1360px] px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-surface)] text-[color:var(--color-accent)] shadow-sm">
                <LogoSvgIcon className="h-5 w-5" />
              </span>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-[color:var(--color-text-primary)] sm:text-base">
                  Seonghoho
                </span>
                <span className="hidden text-xs text-[color:var(--color-text-muted)] sm:block">
                  Frontend Engineer
                </span>
              </div>
            </Link>
          </div>
          <div className="flex items-center gap-3 sm:gap-4">
            <nav className="hidden items-center gap-5 lg:flex">
              {headerNavLinks.map((link) => (
                <Link key={link.href} href={link.href} className="nav-link">
                  {link.label}
                </Link>
              ))}
              <a
                href={headerSecondaryLink.href}
                target="_blank"
                rel="noopener noreferrer"
                className="nav-link"
              >
                {headerSecondaryLink.label}
              </a>
            </nav>
            <button
              type="button"
              ref={buttonRef}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-surface)] text-[color:var(--color-text-secondary)] transition hover:text-[color:var(--color-text-primary)] lg:hidden"
              aria-controls="mobile-site-nav"
              aria-expanded={isMobileNavOpen}
              aria-label={isMobileNavOpen ? "메뉴 닫기" : "메뉴 열기"}
              onClick={onToggleMobileNav}
            >
              {isMobileNavOpen ? (
                <CloseIcon className="h-5 w-5" />
              ) : (
                <MenuIcon className="h-5 w-5" />
              )}
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
              {/* <span className="hidden sm:block">{isDark ? "Dark" : "Light"}</span> */}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
