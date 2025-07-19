"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import Header from "../common/Header";

type Props = {
  Sidebar: React.ReactNode;
};

export default function ClientHeaderWithSidebar({ Sidebar }: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();

  useEffect(() => setMounted(true), []);

  // 라우터 변경 시 사이드바 닫기
  useEffect(() => {
    setSidebarOpen(false); // 경로 변경될 때 사이드바 닫기
  }, [pathname]);

  // 외부 클릭 감지
  useEffect(() => {
    if (!sidebarOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setSidebarOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [sidebarOpen]);

  return (
    <>
      <Header
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        buttonRef={buttonRef}
      />

      {/* 모바일 드로어용 Sidebar */}
      {mounted && (
        <aside
          ref={sidebarRef}
          id="sidebar-drawer"
          className={`lg:hidden fixed top-[66px] rounded-r-xl h-[calc(100vh-65px)] left-0 w-64 z-40 bg-white dark:bg-dark border-r border-r-[#d9d9d9] p-4  transform transition-transform duration-300 ease-in-out ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {Sidebar}
        </aside>
      )}
    </>
  );
}
