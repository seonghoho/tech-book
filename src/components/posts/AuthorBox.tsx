import Link from "next/link";
import { SITE_CONFIG } from "@/lib/site";

export default function AuthorBox() {
  return (
    <section
      className="mt-12 flex flex-col gap-2 border-t border-[color:var(--color-border)] pt-6 sm:flex-row sm:items-start sm:justify-between sm:gap-6"
      aria-label="작성자"
    >
      <div>
        <p className="text-sm font-semibold text-[color:var(--color-text-primary)]">
          {SITE_CONFIG.author.name}
        </p>
        <p className="mt-1 text-sm leading-relaxed text-[color:var(--color-text-secondary)] [word-break:keep-all]">
          {SITE_CONFIG.author.bio}
        </p>
      </div>
      <Link href="/about" className="accent-link shrink-0 text-sm">
        소개 보기
      </Link>
    </section>
  );
}
