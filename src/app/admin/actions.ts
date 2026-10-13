"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin/auth";
import { getRepoEnv } from "@/lib/admin/env";
import { serializePostFile, type PostFrontmatter } from "@/lib/admin/frontmatter";
import { commitFiles, GitHubConflictError } from "@/lib/admin/github";
import { contentPath, parseContentPath, toPreviewImageSrc } from "@/lib/admin/paths";
import { renderMarkdownToHtml } from "@/lib/markdown";
import { todayInKst } from "@/lib/publishing";

export type SaveInput = {
  // 편집을 시작한 파일 (새 글이면 null) 과 그때의 blob sha
  originalPath: string | null;
  originalSha: string | null;
  category: string;
  slug: string;
  frontmatter: PostFrontmatter;
  body: string;
};

export type SaveResult =
  | { ok: true; path: string; sha: string }
  | { ok: false; error: string; conflict?: boolean };

const toFailure = (error: unknown): SaveResult => {
  if (error instanceof GitHubConflictError) {
    return {
      ok: false,
      conflict: true,
      error: `${error.path} 이(가) 이미 존재하거나 다른 곳에서 수정되었습니다. 목록에서 다시 열어 주세요.`,
    };
  }
  const status = (error as { status?: number }).status;
  if (status === 401 || status === 403) {
    return {
      ok: false,
      error: "GitHub 토큰이 유효하지 않거나 권한이 없습니다. GITHUB_CONTENT_TOKEN(만료, Contents 쓰기 권한)을 확인하세요.",
    };
  }
  return { ok: false, error: error instanceof Error ? error.message : String(error) };
};

const validate = (input: SaveInput) => {
  if (!input.frontmatter.title.trim()) throw new Error("제목을 입력하세요.");
  if (!input.body.trim()) throw new Error("본문을 입력하세요.");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.frontmatter.date)) {
    throw new Error("발행일 형식은 YYYY-MM-DD 입니다.");
  }
};

// 원래 파일과 대상 파일이 다르면 (slug/category 변경, 초안→발행) 대상은 비어 있어야 하고 원본은 삭제한다.
const buildCommitPlan = (input: SaveInput, targetPath: string) => {
  const expectedShas: Record<string, string | null> = {};
  const deletes: string[] = [];

  if (input.originalPath && input.originalSha) {
    expectedShas[input.originalPath] = input.originalSha;
    if (input.originalPath !== targetPath) deletes.push(input.originalPath);
  }
  if (input.originalPath !== targetPath) expectedShas[targetPath] = null;

  return { expectedShas, deletes };
};

export async function renderPreview(markdown: string) {
  await requireAdmin();
  const html = await renderMarkdownToHtml(markdown, { stripLeadingH1: true });
  const repo = getRepoEnv();
  return html.replace(/(<img[^>]*\ssrc=")([^"]+)"/g, (_, prefix: string, src: string) => {
    return `${prefix}${toPreviewImageSrc(src, repo)}"`;
  });
}

export async function saveDraft(input: SaveInput): Promise<SaveResult> {
  await requireAdmin();
  try {
    validate(input);
    const original = input.originalPath ? parseContentPath(input.originalPath) : null;
    if (original?.kind === "posts") {
      throw new Error("이미 발행된 글은 초안으로 되돌릴 수 없습니다. '수정 반영'을 사용하세요.");
    }

    const targetPath = contentPath("drafts", input.category, input.slug);
    const { expectedShas, deletes } = buildCommitPlan(input, targetPath);
    const file = serializePostFile({ ...input.frontmatter, draft: true }, input.body);

    const result = await commitFiles({
      message: `content(draft): ${input.category}/${input.slug}`,
      upserts: [{ path: targetPath, content: file }],
      deletes,
      expectedShas,
    });
    revalidatePath("/admin");
    return { ok: true, path: targetPath, sha: result.blobShas[targetPath] };
  } catch (error) {
    return toFailure(error);
  }
}

// 새 글/초안은 posts 로 옮겨 발행하고, 이미 발행된 글은 같은 경로에 수정 반영한다.
export async function publishPost(input: SaveInput): Promise<SaveResult> {
  await requireAdmin();
  try {
    validate(input);
    const original = input.originalPath ? parseContentPath(input.originalPath) : null;
    const isUpdate = original?.kind === "posts";
    const targetPath = contentPath("posts", input.category, input.slug);
    if (isUpdate && targetPath !== input.originalPath) {
      // 발행된 URL 이 바뀌면 검색 색인과 외부 링크가 깨지므로 막는다.
      throw new Error("발행된 글의 카테고리/slug 는 바꿀 수 없습니다.");
    }
    const { expectedShas, deletes } = buildCommitPlan(input, targetPath);

    const frontmatter: PostFrontmatter = {
      ...input.frontmatter,
      draft: undefined,
      // 게시일 정책: 발행 후 date 는 고정하고, 수정 시 updated 만 갱신한다.
      updated: isUpdate ? todayInKst() : input.frontmatter.updated,
    };
    const file = serializePostFile(frontmatter, input.body);
    const scheduled = frontmatter.date > todayInKst();

    const result = await commitFiles({
      message: `content(${isUpdate ? "update" : scheduled ? "schedule" : "publish"}): ${input.category}/${input.slug}`,
      upserts: [{ path: targetPath, content: file }],
      deletes,
      expectedShas,
    });
    revalidatePath("/admin");
    return { ok: true, path: targetPath, sha: result.blobShas[targetPath] };
  } catch (error) {
    return toFailure(error);
  }
}

export async function deleteDraft(path: string, sha: string): Promise<SaveResult> {
  await requireAdmin();
  try {
    if (parseContentPath(path)?.kind !== "drafts") {
      throw new Error("초안만 삭제할 수 있습니다.");
    }
    await commitFiles({
      message: `content(draft): delete ${path.replace(/^src\/content\/drafts\//, "")}`,
      deletes: [path],
      expectedShas: { [path]: sha },
    });
    revalidatePath("/admin");
    return { ok: true, path, sha: "" };
  } catch (error) {
    return toFailure(error);
  }
}
