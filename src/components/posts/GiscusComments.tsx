"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { getGiscusTheme, giscusConfig } from "@/lib/giscus";

const GISCUS_SCRIPT_SRC = "https://giscus.app/client.js";

export default function GiscusComments() {
  const sectionRef = useRef<HTMLElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hasLoadedRef = useRef(false);
  const pathname = usePathname();

  useEffect(() => {
    const container = containerRef.current;
    const section = sectionRef.current;

    if (!container || !section) {
      return;
    }

    container.innerHTML = "";
    hasLoadedRef.current = false;

    const getCurrentTheme = () => {
      return getGiscusTheme(document.documentElement.classList.contains("dark"));
    };

    const updateGiscusTheme = () => {
      const theme = getCurrentTheme();
      const script = container.querySelector<HTMLScriptElement>(`script[src="${GISCUS_SCRIPT_SRC}"]`);
      const iframe = container.querySelector<HTMLIFrameElement>("iframe.giscus-frame, iframe");

      script?.setAttribute("data-theme", theme);
      iframe?.contentWindow?.postMessage({ giscus: { setConfig: { theme } } }, "https://giscus.app");
    };

    const loadGiscus = () => {
      if (hasLoadedRef.current) {
        return;
      }

      hasLoadedRef.current = true;
      container.innerHTML = "";

      const script = document.createElement("script");
      script.src = GISCUS_SCRIPT_SRC;
      script.async = true;
      script.crossOrigin = "anonymous";
      script.setAttribute("data-repo", giscusConfig.repo);
      script.setAttribute("data-repo-id", giscusConfig.repoId);
      script.setAttribute("data-category", giscusConfig.category);
      script.setAttribute("data-category-id", giscusConfig.categoryId);
      script.setAttribute("data-mapping", giscusConfig.mapping);
      script.setAttribute("data-strict", giscusConfig.strict);
      script.setAttribute("data-reactions-enabled", giscusConfig.reactionsEnabled);
      script.setAttribute("data-emit-metadata", giscusConfig.emitMetadata);
      script.setAttribute("data-input-position", giscusConfig.inputPosition);
      script.setAttribute("data-theme", getCurrentTheme());
      script.setAttribute("data-lang", giscusConfig.lang);

      container.appendChild(script);
    };

    if (!("IntersectionObserver" in window)) {
      loadGiscus();

      return () => {
        container.innerHTML = "";
      };
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          loadGiscus();
          observer.disconnect();
        }
      },
      { rootMargin: giscusConfig.loadRootMargin },
    );

    observer.observe(section);

    const themeObserver = new MutationObserver(updateGiscusTheme);
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => {
      observer.disconnect();
      themeObserver.disconnect();
      container.innerHTML = "";
    };
  }, [pathname]);

  return (
    <section
      ref={sectionRef}
      className="surface-panel mt-8 p-5 sm:mt-10 sm:p-6"
      aria-label="댓글"
    >
      <div className="mb-4 space-y-1">
        <h2 className="text-lg font-semibold text-[color:var(--color-text-primary)]">댓글</h2>
        <p className="text-sm leading-6 text-[color:var(--color-text-muted)]">
          GitHub 계정으로 의견을 남길 수 있습니다.
        </p>
      </div>
      <div ref={containerRef} className="min-h-24" />
    </section>
  );
}
