import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";
import AboutPage from "@/components/about/AboutPage";

export const metadata: Metadata = buildPageMetadata({
  title: "About",
  description:
    "SVG 기반 에디터와 Three.js 시각화 경험을 가진 프론트엔드 엔지니어 최성호의 소개와 프로젝트 모음.",
  path: "/about",
});

export const dynamic = "force-static";

const page = () => {
  return (
    <div className="stable-screen-min w-full">
      <AboutPage />
    </div>
  );
};

export default page;
