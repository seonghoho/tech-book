import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

// 항상 GitHub 의 최신 상태를 보여줘야 하므로 정적 생성하지 않는다.
export const dynamic = "force-dynamic";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto w-full max-w-[1280px] py-6 sm:py-8">{children}</div>;
}
