import { NextResponse, type NextRequest } from "next/server";
import { AdminAuthError, requireAdmin } from "@/lib/admin/auth";
import { getRepoEnv } from "@/lib/admin/env";
import { commitFiles } from "@/lib/admin/github";
import { imagePath, isValidSlug, publicUrlFromPath, toPreviewImageSrc } from "@/lib/admin/paths";

const MAX_BYTES = 4 * 1024 * 1024; // Vercel 함수 요청 본문 한도(4.5MB) 안쪽
const EXTENSIONS: Record<string, string> = {
  "image/webp": "webp",
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/gif": "gif",
};

// 이미지만 커밋되면 vercel-ignore-build 가 배포를 생략한다. 글이 발행될 때 함께 배포된다.
export async function POST(request: NextRequest) {
  try {
    await requireAdmin();
  } catch (error) {
    if (error instanceof AdminAuthError) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
    throw error;
  }

  const form = await request.formData();
  const file = form.get("file");
  const category = String(form.get("category") ?? "");
  const slug = String(form.get("slug") ?? "");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "파일이 없습니다." }, { status: 400 });
  }
  if (!isValidSlug(category) || !isValidSlug(slug)) {
    return NextResponse.json(
      { error: "이미지를 올리기 전에 카테고리와 slug 를 먼저 입력하세요." },
      { status: 400 },
    );
  }
  const extension = EXTENSIONS[file.type];
  if (!extension) {
    return NextResponse.json({ error: "webp, png, jpg, gif 만 올릴 수 있습니다." }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "이미지는 4MB 이하만 올릴 수 있습니다." }, { status: 413 });
  }

  const stamp = new Date().toISOString().replace(/\D/g, "").slice(0, 14);
  const random = Math.random().toString(36).slice(2, 6);
  const path = imagePath(category, slug, `img-${stamp}-${random}.${extension}`);

  try {
    await commitFiles({
      message: `content(asset): ${category}/${slug}`,
      upserts: [{ path, content: Buffer.from(await file.arrayBuffer()) }],
      expectedShas: { [path]: null },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "업로드에 실패했습니다." },
      { status: 500 },
    );
  }

  const src = publicUrlFromPath(path);
  return NextResponse.json({ src, previewSrc: toPreviewImageSrc(src, getRepoEnv()) });
}
