// 에디터 조작 종류 → 힌트 바 문장과 관련 글 slug.
// 글 제목은 여기 하드코딩하지 않고 서버에서 실제 글 목록으로 찾는다(resolveHintPosts).

export type HintKind = "idle" | "select" | "move" | "resize" | "rotate" | "undo";

export type EditorHint = { message: string; postSlug?: string };

export const editorHints: Record<HintKind, EditorHint> = {
  idle: { message: "도형을 클릭하고 끌어 보세요. 핸들로 크기와 회전도 바꿀 수 있습니다." },
  select: {
    message: "선택 여부를 도형에 저장하지 않고 렌더링할 때 계산합니다",
    postSlug: "svg-editor/svg-editor-state-boundary",
  },
  move: {
    message: "화면 좌표를 SVG 좌표로 바꿔야 커서와 도형이 어긋나지 않습니다",
    postSlug: "svg-editor/svg-pointer-coordinate-transform",
  },
  resize: {
    message: "반대쪽 모서리를 고정한 채 최소 크기를 지키며 늘립니다",
    postSlug: "svg-editor/svg-resize-handle-constraint",
  },
  rotate: {
    message: "회전 중에도 핸들과 박스가 도형과 함께 돌아갑니다",
    postSlug: "svg-editor/svg-editor-interaction-debugging",
  },
  undo: {
    message: "조작이 끝날 때마다 스냅샷을 남겨 되돌립니다",
    postSlug: "svg-editor/svg-history-snapshot-undo-redo",
  },
};

export type HintPostLink = { title: string; href: string };
export type HintPostLinks = Partial<Record<HintKind, HintPostLink>>;

// 글이 목록에 없으면(삭제·비공개) 그 힌트는 링크 없이 문장만 보이게 한다.
export function resolveHintPosts(posts: Array<{ slug: string; title: string }>): HintPostLinks {
  const titleBySlug = new Map(posts.map((post) => [post.slug, post.title]));
  const links: HintPostLinks = {};
  for (const [kind, hint] of Object.entries(editorHints) as Array<[HintKind, EditorHint]>) {
    const title = hint.postSlug ? titleBySlug.get(hint.postSlug) : undefined;
    if (hint.postSlug && title) links[kind] = { title, href: `/posts/${hint.postSlug}` };
  }
  return links;
}
