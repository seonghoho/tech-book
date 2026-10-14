import Link from "next/link";

const Footer = () => {
  return (
    <footer className="bg-[color:var(--color-bg-muted)]/85 w-full border-t border-[color:var(--color-border)]">
      <div className="mx-auto flex max-w-[1360px] flex-col gap-6 px-4 py-10 sm:px-6 lg:flex-row lg:items-end lg:justify-between lg:px-8">
        {/* <div className="max-w-xl space-y-3">
          <p className="eyebrow-label">Contact</p>
          <div className="text-2xl font-semibold text-[color:var(--color-text-primary)]">
            프론트엔드 관련 문의는 메일로 받습니다.
          </div>
          <p className="body-copy">
            SVG UI, Three.js 시각화, 컴포넌트 설계 작업을 정리합니다.
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
            <Link href="/privacy" className="accent-link">
              Privacy
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
            © {new Date().getFullYear()} Seonghoho. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
