import Link from "next/link";
import { SITE_CONFIG } from "@/lib/site";

export default function AuthorBox() {
  return (
    <section className="surface-panel mt-10 p-5 sm:p-6" aria-labelledby="post-author-title">
      <p className="eyebrow-label">Author</p>
      <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <h2
            id="post-author-title"
            className="text-lg font-semibold text-[color:var(--color-text-primary)]"
          >
            작성자: {SITE_CONFIG.author.name}
          </h2>
          <p className="body-copy">{SITE_CONFIG.author.bio}</p>
        </div>
        <Link href="/about" className="button-secondary shrink-0">
          About
        </Link>
      </div>
    </section>
  );
}
