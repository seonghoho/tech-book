import Link from "next/link";

const Footer = () => {
  return (
    <footer className="w-full border-t border-[color:var(--color-border)] bg-[color:var(--color-bg-muted)]/85">
      <div className="mx-auto flex max-w-[1360px] flex-col gap-6 px-4 py-10 sm:px-6 lg:flex-row lg:items-end lg:justify-between lg:px-8">
        {/* <div className="max-w-xl space-y-3">
          <p className="eyebrow-label">Contact</p>
          <div className="text-2xl font-semibold text-[color:var(--color-text-primary)]">
            프론트엔드와 인터랙션 설계에 대한 대화를 환영합니다.
          </div>
          <p className="body-copy">
            SVG 기반 UI, Three.js 시각화, 유지보수 가능한 컴포넌트 설계와
            관련된 작업을 중심으로 정리하고 있습니다.
          </p>
        </div> */}

        <div className="flex flex-col gap-3 text-sm">
          <div className="flex flex-wrap gap-4 text-[color:var(--color-text-secondary)]">
            <Link href="/" className="accent-link">
              Home
            </Link>
            <Link href="/about" className="accent-link">
              About
            </Link>
            <Link href="/projects" className="accent-link">
              Projects
            </Link>
            <Link href="/posts" className="accent-link">
              Writing
            </Link>
            <Link href="/games" className="accent-link">
              Games
            </Link>
            <Link href="/rss" className="accent-link">
              RSS
            </Link>
            <a
              href="https://github.com/seonghoho"
              target="_blank"
              rel="noopener noreferrer"
              className="accent-link"
            >
              GitHub
            </a>
            <a href="mailto:chltjdgh3@naver.com" className="accent-link">
              Email
            </a>
          </div>
          <div className="text-[color:var(--color-text-muted)]">
            © {new Date().getFullYear()} TechBook. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
