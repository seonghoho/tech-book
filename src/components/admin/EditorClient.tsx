"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  deleteDraft,
  publishPost,
  renderPreview,
  saveDraft,
  type SaveInput,
  type SaveResult,
} from "@/app/admin/actions";
import { POST_BODY_CLASS_NAME } from "@/components/posts/postBodyClassName";
import type { PostFrontmatter } from "@/lib/admin/frontmatter";
import { runQualityChecks } from "@/lib/admin/quality";

export type EditorInitial = {
  path: string | null;
  sha: string | null;
  kind: "new" | "drafts" | "posts";
  category: string;
  slug: string;
  frontmatter: PostFrontmatter;
  body: string;
};

type Props = {
  initial: EditorInitial;
  categories: string[];
  categoryLabels: Record<string, string>;
  today: string;
};

type Tab = "write" | "preview" | "meta";

type Backup = {
  category: string;
  slug: string;
  frontmatter: PostFrontmatter;
  tagsText: string;
  body: string;
  savedAt: string;
};

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const backupKey = (path: string | null) => `tech-book-admin:${path ?? "new"}`;

const readBackup = (key: string): Backup | null => {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as Backup) : null;
  } catch {
    return null;
  }
};

const writeBackup = (key: string, backup: Backup | null) => {
  try {
    if (backup) window.localStorage.setItem(key, JSON.stringify(backup));
    else window.localStorage.removeItem(key);
  } catch {
    // 저장소 접근이 막힌 환경(사파리 프라이빗 등)에서는 백업 없이 동작한다.
  }
};

// 긴 변 1600px, webp(미지원 브라우저는 jpeg)로 줄여 커밋 크기를 작게 유지한다.
async function prepareImage(file: File): Promise<Blob> {
  if (file.type === "image/gif") return file;
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 1600 / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  const toBlob = (type: string) =>
    new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, 0.85));
  const webp = await toBlob("image/webp");
  if (webp && webp.type === "image/webp") return webp;
  const jpeg = await toBlob("image/jpeg");
  if (!jpeg) throw new Error("이미지를 변환하지 못했습니다.");
  return jpeg;
}

const fieldClass =
  "w-full rounded-[12px] border border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-3 py-2.5 text-base text-[color:var(--color-text-primary)] outline-none transition duration-200 focus:border-[color:var(--color-accent)] focus:ring-2 focus:ring-[color:var(--color-accent-soft)] disabled:opacity-60";
const labelClass = "text-sm font-medium text-[color:var(--color-text-secondary)]";
const toolButtonClass =
  "shrink-0 rounded-full border border-[color:var(--color-border)] bg-[color:var(--color-surface-elevated)] px-3 py-1.5 text-sm font-medium text-[color:var(--color-text-secondary)] transition duration-200 hover:border-[color:var(--color-accent)] hover:text-[color:var(--color-accent)]";

export default function EditorClient({ initial, categories, categoryLabels, today }: Props) {
  const router = useRouter();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadTargetRef = useRef<"body" | "cover">("body");

  const [path, setPath] = useState(initial.path);
  const [sha, setSha] = useState(initial.sha);
  const [kind, setKind] = useState(initial.kind);
  const [category, setCategory] = useState(initial.category);
  const [slug, setSlug] = useState(initial.slug);
  const [frontmatter, setFrontmatter] = useState<PostFrontmatter>(initial.frontmatter);
  const [tagsText, setTagsText] = useState((initial.frontmatter.tags ?? []).join(", "));
  const [body, setBody] = useState(initial.body);

  const [tab, setTab] = useState<Tab>(initial.kind === "new" ? "meta" : "write");
  const [previewHtml, setPreviewHtml] = useState("");
  const [localImages, setLocalImages] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<null | "draft" | "publish" | "upload" | "delete">(null);
  const [message, setMessage] = useState<{ tone: "info" | "error"; text: string } | null>(null);
  const [dirty, setDirty] = useState(false);
  const [restorable, setRestorable] = useState<Backup | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const isPublished = kind === "posts";
  const isScheduled = frontmatter.date > today;
  const tags = useMemo(
    () =>
      tagsText
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
    [tagsText],
  );

  const checks = useMemo(
    () =>
      runQualityChecks({
        title: frontmatter.title,
        description: frontmatter.description,
        image: frontmatter.image,
        body,
      }),
    [frontmatter.title, frontmatter.description, frontmatter.image, body],
  );
  const failedChecks = checks.filter((check) => !check.ok).length;

  const bodyImages = useMemo(
    () => Array.from(new Set(Array.from(body.matchAll(/!\[[^\]]*\]\(([^)\s]+)\)/g), (m) => m[1]))),
    [body],
  );

  const markDirty = () => setDirty(true);
  const updateFrontmatter = (patch: Partial<PostFrontmatter>) => {
    setFrontmatter((prev) => ({ ...prev, ...patch }));
    markDirty();
  };

  // 브라우저 백업 복원 제안
  useEffect(() => {
    const backup = readBackup(backupKey(initial.path));
    if (backup && backup.body !== initial.body) setRestorable(backup);
  }, [initial.path, initial.body]);

  // 변경 사항을 브라우저에 1초 간격으로 백업
  useEffect(() => {
    if (!dirty) return;
    const timer = window.setTimeout(() => {
      writeBackup(backupKey(path), {
        category,
        slug,
        frontmatter,
        tagsText,
        body,
        savedAt: new Date().toISOString(),
      });
    }, 1000);
    return () => window.clearTimeout(timer);
  }, [dirty, path, category, slug, frontmatter, tagsText, body]);

  // 저장하지 않은 변경이 있으면 이탈 경고
  useEffect(() => {
    if (!dirty) return;
    const handler = (event: BeforeUnloadEvent) => {
      event.preventDefault();
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [dirty]);

  // 실제 글과 같은 파이프라인으로 미리보기 렌더링 (500ms 디바운스)
  useEffect(() => {
    const timer = window.setTimeout(async () => {
      try {
        setPreviewHtml(await renderPreview(body));
      } catch {
        setPreviewHtml("<p>미리보기를 불러오지 못했습니다.</p>");
      }
    }, 500);
    return () => window.clearTimeout(timer);
  }, [body]);

  // 방금 올린 이미지는 raw URL 반영 전이라도 로컬 Object URL 로 보여준다. (key: raw 미리보기 URL)
  const previewWithLocalImages = useMemo(
    () =>
      Object.entries(localImages).reduce(
        (html, [previewSrc, objectUrl]) => html.replaceAll(`src="${previewSrc}"`, `src="${objectUrl}"`),
        previewHtml,
      ),
    [previewHtml, localImages],
  );

  const restoreBackup = () => {
    if (!restorable) return;
    setCategory(restorable.category);
    setSlug(restorable.slug);
    setFrontmatter(restorable.frontmatter);
    setTagsText(restorable.tagsText);
    setBody(restorable.body);
    setRestorable(null);
    setDirty(true);
  };

  const discardBackup = () => {
    writeBackup(backupKey(initial.path), null);
    setRestorable(null);
  };

  // ---- 툴바 ----
  const wrapSelection = useCallback(
    (before: string, after = "", placeholder = "") => {
      const textarea = textareaRef.current;
      if (!textarea) return;
      const { selectionStart: start, selectionEnd: end } = textarea;
      const selected = body.slice(start, end) || placeholder;
      setBody(body.slice(0, start) + before + selected + after + body.slice(end));
      markDirty();
      requestAnimationFrame(() => {
        textarea.focus();
        textarea.setSelectionRange(start + before.length, start + before.length + selected.length);
      });
    },
    [body],
  );

  const prefixLine = useCallback(
    (prefix: string, placeholder: string) => {
      const textarea = textareaRef.current;
      if (!textarea) return;
      const { selectionStart: start } = textarea;
      const lineStart = body.lastIndexOf("\n", start - 1) + 1;
      const needsBreak = lineStart !== start && body.slice(lineStart, start).trim() !== "";
      if (needsBreak) {
        wrapSelection(`\n\n${prefix}`, "", placeholder);
        return;
      }
      setBody(body.slice(0, lineStart) + prefix + body.slice(lineStart));
      markDirty();
      requestAnimationFrame(() => {
        textarea.focus();
        textarea.setSelectionRange(start + prefix.length, start + prefix.length);
      });
    },
    [body, wrapSelection],
  );

  // ---- 이미지 ----
  const openImagePicker = (target: "body" | "cover") => {
    if (!SLUG_PATTERN.test(category) || !SLUG_PATTERN.test(slug)) {
      setMessage({ tone: "error", text: "이미지를 올리기 전에 정보 탭에서 카테고리와 slug 를 입력하세요." });
      setTab("meta");
      return;
    }
    uploadTargetRef.current = target;
    fileInputRef.current?.click();
  };

  const handleImageFile = async (file: File | undefined) => {
    if (!file) return;
    setBusy("upload");
    setMessage({ tone: "info", text: "이미지를 줄이고 업로드하는 중…" });
    try {
      const blob = await prepareImage(file);
      const form = new FormData();
      form.append("file", blob, file.name);
      form.append("category", category);
      form.append("slug", slug);
      const response = await fetch("/api/admin/images", { method: "POST", body: form });
      const json = (await response.json()) as { src?: string; previewSrc?: string; error?: string };
      if (!response.ok || !json.src) throw new Error(json.error ?? "업로드에 실패했습니다.");

      if (json.previewSrc) {
        setLocalImages((prev) => ({ ...prev, [json.previewSrc!]: URL.createObjectURL(blob) }));
      }
      if (uploadTargetRef.current === "cover") {
        updateFrontmatter({ image: json.src });
      } else {
        wrapSelection("![", `](${json.src})`, "이미지 설명");
      }
      setMessage({ tone: "info", text: "이미지를 저장소에 올렸습니다. 설명(alt)을 꼭 적어 주세요." });
    } catch (error) {
      setMessage({ tone: "error", text: error instanceof Error ? error.message : "업로드 실패" });
    } finally {
      setBusy(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // ---- 저장 / 발행 ----
  const buildInput = (): SaveInput => ({
    originalPath: path,
    originalSha: sha,
    category,
    slug,
    frontmatter: { ...frontmatter, tags },
    body,
  });

  const applyResult = (result: SaveResult, successText: string) => {
    if (!result.ok) {
      setMessage({ tone: "error", text: result.error });
      return false;
    }
    writeBackup(backupKey(path), null);
    writeBackup(backupKey(result.path), null);
    setPath(result.path);
    setSha(result.sha);
    setDirty(false);
    setMessage({ tone: "info", text: successText });
    window.history.replaceState(null, "", `/admin/edit?path=${encodeURIComponent(result.path)}`);
    return true;
  };

  const handleSaveDraft = async () => {
    setBusy("draft");
    const result = await saveDraft(buildInput());
    if (applyResult(result, "초안을 저장소에 커밋했습니다. (배포는 생략됩니다)")) setKind("drafts");
    setBusy(null);
  };

  const handlePublish = async () => {
    setConfirmOpen(false);
    setBusy("publish");
    const result = await publishPost(buildInput());
    const text = isPublished
      ? "수정 사항을 반영했습니다. 1~2분 뒤 배포됩니다."
      : isScheduled
        ? `${frontmatter.date} 에 공개되도록 예약했습니다.`
        : "발행했습니다. 1~2분 뒤 사이트에 반영됩니다.";
    if (applyResult(result, text)) {
      setKind("posts");
      router.refresh();
    }
    setBusy(null);
  };

  const handleDelete = async () => {
    if (!path || !sha || kind !== "drafts") return;
    if (!window.confirm("이 초안을 삭제할까요? (git 이력에는 남습니다)")) return;
    setBusy("delete");
    const result = await deleteDraft(path, sha);
    setBusy(null);
    if (!result.ok) {
      setMessage({ tone: "error", text: result.error });
      return;
    }
    writeBackup(backupKey(path), null);
    setDirty(false);
    router.push("/admin");
  };

  const primaryLabel = isPublished ? "수정 반영" : isScheduled ? "예약 발행" : "발행";

  const actionButtons = (
    <>
      {!isPublished ? (
        <button
          type="button"
          className="button-secondary flex-1 lg:flex-none"
          onClick={handleSaveDraft}
          disabled={busy !== null}
        >
          {busy === "draft" ? "저장 중…" : "초안 저장"}
        </button>
      ) : null}
      <button
        type="button"
        className="button-primary flex-1 lg:flex-none"
        onClick={() => setConfirmOpen(true)}
        disabled={busy !== null}
      >
        {busy === "publish" ? "커밋 중…" : primaryLabel}
      </button>
    </>
  );

  return (
    <div className="pb-28 lg:pb-0">
      {/* 상단: 목록 이동, 상태, 데스크톱 액션 */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link href="/admin" className="nav-link text-sm">
            ← 목록
          </Link>
          <span className="tag-chip">
            {isPublished ? (isScheduled ? "예약됨" : "발행됨") : kind === "drafts" ? "초안" : "새 글"}
          </span>
          {dirty ? (
            <span className="text-xs text-[color:var(--color-text-muted)]">저장 안 된 변경 있음</span>
          ) : null}
        </div>
        <div className="hidden gap-2 lg:flex">{actionButtons}</div>
      </div>

      {restorable ? (
        <div className="surface-subtle mt-4 flex flex-col gap-2 px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
          <span className="text-[color:var(--color-text-secondary)]">
            이 브라우저에 저장되지 않은 작업이 있습니다 ({new Date(restorable.savedAt).toLocaleString("ko-KR")}).
          </span>
          <span className="flex gap-2">
            <button type="button" className="button-secondary px-4 py-2" onClick={restoreBackup}>
              복원
            </button>
            <button type="button" className="nav-link px-2 text-sm" onClick={discardBackup}>
              버리기
            </button>
          </span>
        </div>
      ) : null}

      {message ? (
        <p
          role={message.tone === "error" ? "alert" : "status"}
          className={`mt-4 rounded-[12px] px-4 py-3 text-sm ${
            message.tone === "error"
              ? "border border-[color:var(--color-accent)] bg-[color:var(--color-accent-soft)] text-[color:var(--color-text-primary)]"
              : "surface-subtle text-[color:var(--color-text-secondary)]"
          }`}
        >
          {message.text}
        </p>
      ) : null}

      {/* 모바일 탭 */}
      <div
        role="tablist"
        className="sticky top-[65px] z-20 -mx-4 mt-4 flex gap-1 border-b border-[color:var(--color-border)] bg-[color:var(--color-bg)] px-4 py-2 lg:hidden"
      >
        {(
          [
            ["write", "작성"],
            ["preview", "미리보기"],
            ["meta", `정보${failedChecks ? ` · ${failedChecks}` : ""}`],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            role="tab"
            aria-selected={tab === value}
            onClick={() => setTab(value)}
            className={`flex-1 rounded-full px-3 py-2 text-sm font-semibold transition duration-200 ${
              tab === value
                ? "bg-[color:var(--color-accent-soft)] text-[color:var(--color-accent)]"
                : "text-[color:var(--color-text-secondary)]"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* 정보 패널: 모바일은 탭, 데스크톱은 접이식 */}
      <details
        open={initial.kind === "new"}
        className={`surface-panel mt-4 p-5 sm:p-6 lg:block ${tab === "meta" ? "block" : "hidden"}`}
      >
        <summary className="cursor-pointer list-none text-lg font-semibold lg:list-item">
          글 정보
          <span className="ml-2 text-sm font-normal text-[color:var(--color-text-muted)]">
            {frontmatter.title || "제목 없음"} · {category}/{slug || "slug"}
          </span>
        </summary>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <label className="flex flex-col gap-1.5 sm:col-span-2">
            <span className={labelClass}>제목</span>
            <input
              className={fieldClass}
              value={frontmatter.title}
              onChange={(event) => updateFrontmatter({ title: event.target.value })}
              placeholder="검색 의도가 드러나는 구체적인 제목"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className={labelClass}>카테고리</span>
            <input
              className={fieldClass}
              list="admin-categories"
              value={category}
              disabled={isPublished}
              onChange={(event) => {
                setCategory(event.target.value.trim());
                markDirty();
              }}
              placeholder="svg-editor 또는 새 카테고리"
              autoCapitalize="none"
              autoCorrect="off"
            />
            <datalist id="admin-categories">
              {categories.map((value) => (
                <option key={value} value={value}>
                  {categoryLabels[value] ?? value}
                </option>
              ))}
            </datalist>
          </label>

          <label className="flex flex-col gap-1.5">
            <span className={labelClass}>slug (URL)</span>
            <input
              className={fieldClass}
              value={slug}
              disabled={isPublished}
              onChange={(event) => {
                setSlug(event.target.value.trim().toLowerCase());
                markDirty();
              }}
              placeholder="nextjs-cache-pitfalls"
              autoCapitalize="none"
              autoCorrect="off"
            />
            <span className="text-xs text-[color:var(--color-text-muted)]">
              {slug && !SLUG_PATTERN.test(slug)
                ? "영문 소문자, 숫자, 하이픈만 사용할 수 있습니다."
                : `/posts/${category || "category"}/${slug || "slug"}`}
            </span>
          </label>

          <label className="flex flex-col gap-1.5 sm:col-span-2">
            <span className={labelClass}>
              설명 (description) · {frontmatter.description?.length ?? 0}자
            </span>
            <textarea
              className={`${fieldClass} min-h-[88px]`}
              value={frontmatter.description ?? ""}
              onChange={(event) => updateFrontmatter({ description: event.target.value })}
              placeholder="검색 결과와 공유 카드에 그대로 노출됩니다. 80~160자 권장"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className={labelClass}>태그 (쉼표로 구분)</span>
            <input
              className={fieldClass}
              value={tagsText}
              onChange={(event) => {
                setTagsText(event.target.value);
                markDirty();
              }}
              placeholder="Next.js, Cache, Performance"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className={labelClass}>발행일 {isScheduled ? "· 예약" : ""}</span>
            <input
              type="date"
              className={fieldClass}
              value={frontmatter.date}
              disabled={isPublished}
              onChange={(event) => updateFrontmatter({ date: event.target.value })}
            />
            <span className="text-xs text-[color:var(--color-text-muted)]">
              {isPublished
                ? "발행된 글의 날짜는 바꾸지 않습니다. 수정 시 '마지막 수정일'이 갱신됩니다."
                : "미래 날짜를 고르면 그날 0시(KST) 이후 자동 공개됩니다."}
            </span>
          </label>

          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <span className={labelClass}>대표 이미지</span>
            <div className="flex flex-col gap-2 sm:flex-row">
              <select
                className={fieldClass}
                value={frontmatter.image ?? ""}
                onChange={(event) => updateFrontmatter({ image: event.target.value || undefined })}
              >
                <option value="">없음 (자동 OG 이미지)</option>
                {Array.from(new Set([frontmatter.image, ...bodyImages].filter(Boolean))).map((src) => (
                  <option key={src} value={src}>
                    {src}
                  </option>
                ))}
              </select>
              <button
                type="button"
                className="button-secondary shrink-0"
                onClick={() => openImagePicker("cover")}
                disabled={busy !== null}
              >
                대표 이미지 업로드
              </button>
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm text-[color:var(--color-text-secondary)]">
            <input
              type="checkbox"
              checked={Boolean(frontmatter.featured)}
              onChange={(event) => updateFrontmatter({ featured: event.target.checked || undefined })}
            />
            홈 대표 글로 노출 (featured)
          </label>
        </div>

        <div className="mt-6 space-y-2">
          <p className={labelClass}>발행 전 체크</p>
          <ul className="space-y-1.5">
            {checks.map((check) => (
              <li key={check.id} className="flex gap-2 text-sm text-[color:var(--color-text-secondary)]">
                <span aria-hidden className={check.ok ? "text-[color:var(--color-accent)]" : ""}>
                  {check.ok ? "✓" : "!"}
                </span>
                <span>{check.message}</span>
              </li>
            ))}
          </ul>
        </div>

        {kind === "drafts" ? (
          <button
            type="button"
            className="nav-link mt-6 text-sm"
            onClick={handleDelete}
            disabled={busy !== null}
          >
            {busy === "delete" ? "삭제 중…" : "초안 삭제"}
          </button>
        ) : null}
      </details>

      {/* 작성 / 미리보기 */}
      <div className="mt-4 grid gap-6 lg:grid-cols-2">
        <section className={`${tab === "write" ? "block" : "hidden"} lg:block`}>
          <div className="mb-2 flex gap-2 overflow-x-auto pb-1">
            <button type="button" className={toolButtonClass} onClick={() => prefixLine("## ", "소제목")}>
              H2
            </button>
            <button type="button" className={toolButtonClass} onClick={() => prefixLine("### ", "소제목")}>
              H3
            </button>
            <button type="button" className={toolButtonClass} onClick={() => wrapSelection("**", "**", "강조")}>
              굵게
            </button>
            <button type="button" className={toolButtonClass} onClick={() => wrapSelection("`", "`", "code")}>
              `코드`
            </button>
            <button
              type="button"
              className={toolButtonClass}
              onClick={() => wrapSelection("\n```ts\n", "\n```\n", "// code")}
            >
              코드블록
            </button>
            <button type="button" className={toolButtonClass} onClick={() => wrapSelection("[", "](/posts/)", "링크 텍스트")}>
              링크
            </button>
            <button type="button" className={toolButtonClass} onClick={() => prefixLine("> ", "인용")}>
              인용
            </button>
            <button
              type="button"
              className={toolButtonClass}
              onClick={() => openImagePicker("body")}
              disabled={busy !== null}
            >
              {busy === "upload" ? "업로드 중…" : "이미지"}
            </button>
          </div>
          <textarea
            ref={textareaRef}
            value={body}
            onChange={(event) => {
              setBody(event.target.value);
              markDirty();
            }}
            spellCheck={false}
            placeholder={"## 문제 상황\n\n직접 겪은 상황, 재현 방법, 측정값부터 적어 보세요."}
            className={`${fieldClass} min-h-[65vh] font-mono leading-7 lg:min-h-[calc(100vh-220px)]`}
          />
          <p className="mt-1 text-right text-xs text-[color:var(--color-text-muted)]">
            {checks.find((check) => check.id === "length")?.message}
          </p>
        </section>

        <section
          className={`${tab === "preview" ? "block" : "hidden"} surface-panel min-w-0 p-5 sm:p-6 lg:block lg:max-h-[calc(100vh-160px)] lg:overflow-y-auto`}
        >
          <h1 className="text-[1.8rem] font-semibold leading-tight text-[color:var(--color-text-primary)]">
            {frontmatter.title || "제목 없음"}
          </h1>
          {frontmatter.description ? <p className="body-copy mt-3">{frontmatter.description}</p> : null}
          <div
            className={`${POST_BODY_CLASS_NAME} mt-6`}
            dangerouslySetInnerHTML={{ __html: previewWithLocalImages }}
          />
        </section>
      </div>

      {/* 모바일 하단 고정 액션 */}
      <div className="fixed inset-x-0 bottom-0 z-30 flex gap-2 border-t border-[color:var(--color-border)] bg-[color:var(--color-surface)] px-4 pb-[calc(env(safe-area-inset-bottom)+12px)] pt-3 lg:hidden">
        {actionButtons}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(event) => handleImageFile(event.target.files?.[0])}
      />

      {confirmOpen ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="publish-confirm-title"
          className="fixed inset-0 z-50 flex items-end justify-center bg-[color:var(--color-bg)]/80 p-4 backdrop-blur-sm sm:items-center"
        >
          <div className="surface-panel-strong w-full max-w-md space-y-4 p-6">
            <h2 id="publish-confirm-title" className="text-lg font-semibold">
              {isPublished
                ? "수정 사항을 반영할까요?"
                : isScheduled
                  ? `${frontmatter.date} 에 공개되도록 예약할까요?`
                  : "지금 발행할까요?"}
            </h2>
            <p className="muted-copy">
              /posts/{category}/{slug} · master 브랜치에 커밋되고 Vercel 배포가 시작됩니다.
            </p>
            {failedChecks > 0 ? (
              <ul className="surface-subtle space-y-1 px-4 py-3 text-sm text-[color:var(--color-text-secondary)]">
                {checks
                  .filter((check) => !check.ok)
                  .map((check) => (
                    <li key={check.id}>! {check.message}</li>
                  ))}
              </ul>
            ) : (
              <p className="text-sm text-[color:var(--color-accent)]">발행 전 체크를 모두 통과했습니다.</p>
            )}
            <div className="flex gap-2">
              <button type="button" className="button-secondary flex-1" onClick={() => setConfirmOpen(false)}>
                취소
              </button>
              <button type="button" className="button-primary flex-1" onClick={handlePublish}>
                {primaryLabel}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
