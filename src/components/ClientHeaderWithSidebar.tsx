"use client";

import { useEffect, useState } from "react";
import Header from "./Header";

type Props = {
  Sidebar: React.ReactNode;
};

export default function ClientHeaderWithSidebar({ Sidebar }: Props) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <>
      <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

      {/* 모바일 드로어용 Sidebar */}
      {mounted && (
        <aside
          id="sidebar-drawer"
          className={`lg:hidden fixed top-[66px] rounded-r-xl h-[calc(100vh-65px)] left-0 w-64 z-40 bg-white dark:bg-dark border-r p-4  transform transition-transform duration-300 ease-in-out ${
            sidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {Sidebar}
        </aside>
      )}
    </>
  );
}
