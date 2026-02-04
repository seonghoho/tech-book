import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";
import HangingBadge from "@/components/HangingBadge";

export const metadata: Metadata = buildPageMetadata({
  title: "About",
  description: "TechBook을 운영하는 FrontEnd 개발자를 소개합니다.",
  path: "/about",
});

export const dynamic = "force-static";

const page = () => {
  return (
    <div className="min-h-screen w-full text-white">
      <div className="flex min-h-screen items-start justify-center px-6">
        <HangingBadge
          photo="/images/Profile.JPG"
          name="최성호"
          title="FrontEnd Developer"
        />
      </div>
    </div>
  );
};

export default page;
