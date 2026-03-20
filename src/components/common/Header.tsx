import Link from "next/link";
import Image from "next/image";

type HeaderProps = {
  actions?: React.ReactNode;
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

export default function Header({ actions }: HeaderProps) {
  return (
    <header className="bg-[color:var(--color-bg)]/92 sticky top-0 z-30 w-full border-b border-[color:var(--color-border)] backdrop-blur-xl">
      <div className="mx-auto max-w-[1360px] px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2">
              <span className="flex h-10 w-10 items-center justify-center rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-surface)] text-[color:var(--color-accent)] shadow-sm">
                <Image
                  src="/logo.png"
                  alt=""
                  width={24}
                  height={24}
                  sizes="24px"
                  className="h-6 w-6 rounded-[6px]"
                />
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
            {actions}
          </div>
        </div>
      </div>
    </header>
  );
}
