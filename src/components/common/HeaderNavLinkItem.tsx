"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

type HeaderNavLinkItemProps = {
  href: string;
  className?: string;
  children: React.ReactNode;
  onNavigate?: () => void;
};

function getScrollBehavior() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth";
}

export default function HeaderNavLinkItem({
  href,
  className,
  children,
  onNavigate,
}: HeaderNavLinkItemProps) {
  const router = useRouter();

  const handleClick = (event: React.MouseEvent<HTMLAnchorElement>) => {
    const currentPath = window.location.pathname;
    const currentSearch = window.location.search;
    const currentHash = window.location.hash;
    const isSamePath = currentPath === href;

    if (isSamePath && !currentSearch && !currentHash) {
      event.preventDefault();
      onNavigate?.();
      window.scrollTo({ top: 0, left: 0, behavior: getScrollBehavior() });
      return;
    }

    if (isSamePath && (currentSearch || currentHash)) {
      event.preventDefault();
      onNavigate?.();
      router.push(href, { scroll: true });
      return;
    }

    onNavigate?.();
  };

  return (
    <Link href={href} scroll className={className} onClick={handleClick}>
      {children}
    </Link>
  );
}
