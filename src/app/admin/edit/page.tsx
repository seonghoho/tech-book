import { notFound } from "next/navigation";
import EditorClient, { type EditorInitial } from "@/components/admin/EditorClient";
import { requireAdminPage } from "@/lib/admin/auth";
import { parsePostFile } from "@/lib/admin/frontmatter";
import { listContent, readFile } from "@/lib/admin/github";
import { parseContentPath } from "@/lib/admin/paths";
import { categoryMap } from "@/lib/categoryMap";
import { todayInKst } from "@/lib/publishing";

type PageProps = {
  searchParams: Promise<{ path?: string }>;
};

export default async function AdminEditPage({ searchParams }: PageProps) {
  await requireAdminPage();
  const { path } = await searchParams;
  const today = todayInKst();

  const entries = await listContent().catch(() => []);
  const categories = Array.from(
    new Set([...Object.keys(categoryMap), ...entries.map((entry) => entry.category)]),
  ).sort();

  let initial: EditorInitial;
  if (path) {
    const parsedPath = parseContentPath(path);
    const file = parsedPath ? await readFile(path) : null;
    if (!parsedPath || !file) notFound();
    const { frontmatter, body } = parsePostFile(file.content);
    initial = {
      path,
      sha: file.sha,
      kind: parsedPath.kind,
      category: parsedPath.category,
      slug: parsedPath.slug,
      frontmatter: { ...frontmatter, date: frontmatter.date || today },
      body,
    };
  } else {
    initial = {
      path: null,
      sha: null,
      kind: "new",
      category: "",
      slug: "",
      frontmatter: { title: "", date: today, tags: [] },
      body: "",
    };
  }

  return (
    <EditorClient
      initial={initial}
      categories={categories}
      categoryLabels={categoryMap}
      today={today}
    />
  );
}
