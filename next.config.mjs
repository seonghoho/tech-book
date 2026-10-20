// 2026-10 콘텐츠 정리(AdSense 재심사 Week 0): 겹치는 글을 통합하고 이전 URL은 통합된 글로 영구 이동한다.
// 책 요약(Deep Dive) 카테고리는 저작권/원본성 문제로 내리고 글 목록으로 보낸다.
const mergedPosts = {
  "voca-study/week-progress-ui": "voca-study/study-session-state",
  "voca-study/definition-example-flow": "voca-study/study-session-state",
  "voca-study/synonym-antonym-ui": "voca-study/study-session-state",
  "voca-study/blank-quiz-state": "voca-study/study-session-state",
  "svg-editor/three-js-depth-render-order": "svg-editor/three-js-rendering-priority-debugging",
  "svg-editor/three-js-object-selection-debugging": "svg-editor/three-js-raycaster-hit-area",
  "svg-editor/svg-selection-render-state": "svg-editor/svg-editor-state-boundary",
  "svg-editor/math-tool-store-selection-flow": "svg-editor/math-tool-interaction-rules",
  "svg-editor/pointer-keyboard-event-flow": "svg-editor/math-tool-interaction-rules",
  // 2026-10-20: 1,500자 미만 글을 같은 주제의 글에 합쳤다.
  "svg-editor/three-js-camera-state": "svg-editor/svg-history-snapshot-undo-redo",
  "svg-editor/svg-threejs-canvas-experience": "svg-editor/digital-math-element-architecture",
};

const contentRedirects = [
  ...Object.entries(mergedPosts).map(([from, to]) => ({
    source: `/posts/${from}`,
    destination: `/posts/${to}`,
    permanent: true,
  })),
  { source: "/posts/mordern-js-deep-dive/:path*", destination: "/posts", permanent: true },
  { source: "/categories/mordern-js-deep-dive", destination: "/posts", permanent: true },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  productionBrowserSourceMaps: true,
  async redirects() {
    const primary = process.env.PRIMARY_DOMAIN; // e.g., example.com
    const legacy = process.env.OLD_HOST; // e.g., old-subdomain.vercel.app
    const hostRedirects =
      primary && legacy
        ? [
            {
              source: "/:path*",
              has: [{ type: "host", value: legacy }],
              destination: `https://${primary}/:path*`,
              permanent: true,
            },
          ]
        : [];
    return [...contentRedirects, ...hostRedirects];
  },
};

export default nextConfig;
