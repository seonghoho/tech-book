"use client";

import { useEffect } from "react";

const COPIED_LABEL_RESET_MS = 1600;

export default function PostCodeCopyEnhancer() {
  useEffect(() => {
    const handleClick = async (event: MouseEvent) => {
      const button = (event.target as Element | null)?.closest<HTMLButtonElement>(
        "[data-code-copy-button]",
      );

      if (!button) {
        return;
      }

      const codeBlock = button.closest(".post-code-block");
      const code = codeBlock?.querySelector("pre code");
      const text = code?.textContent ?? "";

      if (!text) {
        return;
      }

      try {
        await navigator.clipboard.writeText(text);
        button.textContent = "복사됨";
        button.setAttribute("aria-label", "코드 복사 완료");
        window.setTimeout(() => {
          button.textContent = "복사";
          button.setAttribute("aria-label", "코드 복사");
        }, COPIED_LABEL_RESET_MS);
      } catch {
        button.textContent = "실패";
        button.setAttribute("aria-label", "코드 복사 실패");
      }
    };

    document.addEventListener("click", handleClick);

    return () => {
      document.removeEventListener("click", handleClick);
    };
  }, []);

  return null;
}
