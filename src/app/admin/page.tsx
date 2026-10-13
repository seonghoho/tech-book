import Link from "next/link";
import { requireAdminPage } from "@/lib/admin/auth";
import { listContent, type ContentEntry } from "@/lib/admin/github";
import { categoryMap } from "@/lib/categoryMap";
import { todayInKst } from "@/lib/publishing";

const editHref = (entry: ContentEntry) => `/admin/edit?path=${encodeURIComponent(entry.path)}`;

const byDateDesc = (a: ContentEntry, b: ContentEntry) =>
  (b.frontmatter.updated ?? b.frontmatter.date).localeCompare(a.frontmatter.updated ?? a.frontmatter.date);

function EntryList({ entries, empty }: { entries: ContentEntry[]; empty: string }) {
  if (entries.length === 0) return <p className="muted-copy">{empty}</p>;
  return (
    <ul className="divide-y divide-[color:var(--color-border)]">
      {entries.map((entry) => (
        <li key={entry.path}>
          <Link
            href={editHref(entry)}
            className="flex flex-col gap-1 py-3 transition duration-200 ease-out hover:text-[color:var(--color-accent)] sm:flex-row sm:items-center sm:justify-between sm:gap-4"
          >
            <span className="font-medium text-[color:var(--color-text-primary)]">
              {entry.frontmatter.title || entry.slug}
            </span>
            <span className="shrink-0 text-xs text-[color:var(--color-text-muted)]">
              {categoryMap[entry.category] ?? entry.category} · {entry.frontmatter.date}
              {entry.frontmatter.updated ? ` (수정 ${entry.frontmatter.updated})` : ""}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export default async function AdminHomePage() {
  const session = await requireAdminPage();

  let entries: ContentEntry[] = [];
  let loadError: string | null = null;
  try {
    entries = await listContent();
  } catch (error) {
    loadError = error instanceof Error ? error.message : String(error);
  }

  const today = todayInKst();
  const drafts = entries.filter((entry) => entry.kind === "drafts").sort(byDateDesc);
  const posts = entries.filter((entry) => entry.kind === "posts");
  const scheduled = posts
    .filter((entry) => entry.frontmatter.date > today)
    .sort((a, b) => a.frontmatter.date.localeCompare(b.frontmatter.date));
  const published = posts.filter((entry) => entry.frontmatter.date <= today).sort(byDateDesc);

  return (
    <div className="page-stack">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <p className="eyebrow-label">Admin</p>
          <h1 className="section-title">글 관리</h1>
          <p className="muted-copy">
            {session.login} 로 로그인됨 · 발행 {published.length} · 예약 {scheduled.length} · 초안{" "}
            {drafts.length}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/edit" className="button-primary">
            새 글 쓰기
          </Link>
          <form action="/api/admin/auth/logout" method="post">
            <button type="submit" className="button-secondary">
              로그아웃
            </button>
          </form>
        </div>
      </header>

      {loadError ? (
        <p className="surface-subtle px-4 py-3 text-sm text-[color:var(--color-text-secondary)]" role="alert">
          GitHub 에서 글 목록을 불러오지 못했습니다: {loadError}
        </p>
      ) : null}

      <section className="surface-panel space-y-3 p-5 sm:p-6">
        <h2 className="text-lg font-semibold">초안</h2>
        <EntryList entries={drafts} empty="저장된 초안이 없습니다." />
      </section>

      <section className="surface-panel space-y-3 p-5 sm:p-6">
        <h2 className="text-lg font-semibold">예약 발행</h2>
        <EntryList entries={scheduled} empty="예약된 글이 없습니다." />
      </section>

      <section className="surface-panel space-y-3 p-5 sm:p-6">
        <h2 className="text-lg font-semibold">발행된 글</h2>
        <EntryList entries={published} empty="발행된 글이 없습니다." />
      </section>
    </div>
  );
}
