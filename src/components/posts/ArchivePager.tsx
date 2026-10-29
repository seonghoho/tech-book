import Link from "next/link";

type Props = {
  currentPage: number;
  totalPages: number;
  getHref: (page: number) => string;
};

const pagerLinkClass =
  "inline-flex h-9 min-w-9 items-center justify-center rounded-md px-2 text-sm tabular-nums transition-colors duration-200 ease-out";

export default function ArchivePager({ currentPage, totalPages, getHref }: Props) {
  if (totalPages <= 1) return null;

  return (
    <nav aria-label="페이지" className="mt-7 flex items-center justify-center gap-1">
      {currentPage > 1 ? (
        <Link
          href={getHref(currentPage - 1)}
          rel="prev"
          className={`${pagerLinkClass} text-[color:var(--color-text-secondary)] hover:bg-[color:var(--color-surface)]`}
        >
          이전
        </Link>
      ) : (
        <span className={`${pagerLinkClass} text-[color:var(--color-border-strong)]`}>이전</span>
      )}
      {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
        <Link
          key={page}
          href={getHref(page)}
          aria-current={page === currentPage ? "page" : undefined}
          className={`${pagerLinkClass} ${
            page === currentPage
              ? "bg-[color:var(--color-surface)] font-bold text-[color:var(--color-text-primary)] shadow-[inset_0_0_0_1px_var(--color-border)]"
              : "text-[color:var(--color-text-secondary)] hover:bg-[color:var(--color-surface)]"
          }`}
        >
          {page}
        </Link>
      ))}
      {currentPage < totalPages ? (
        <Link
          href={getHref(currentPage + 1)}
          rel="next"
          className={`${pagerLinkClass} text-[color:var(--color-text-secondary)] hover:bg-[color:var(--color-surface)]`}
        >
          다음
        </Link>
      ) : (
        <span className={`${pagerLinkClass} text-[color:var(--color-border-strong)]`}>다음</span>
      )}
    </nav>
  );
}
