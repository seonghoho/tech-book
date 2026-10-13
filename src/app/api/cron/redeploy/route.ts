import { NextResponse, type NextRequest } from "next/server";
import { listContent } from "@/lib/admin/github";
import { todayInKst } from "@/lib/publishing";

// 예약 발행: 매일 00:05 KST(15:05 UTC) Vercel Cron 이 호출한다.
// 오늘 날짜로 공개될 글이 있을 때만 Deploy Hook 으로 재배포해 정적 페이지/사이트맵/RSS 를 갱신한다.
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const hookUrl = process.env.VERCEL_DEPLOY_HOOK_URL;
  if (!hookUrl) {
    return NextResponse.json({ error: "VERCEL_DEPLOY_HOOK_URL is not set" }, { status: 500 });
  }

  const today = todayInKst();
  const due = (await listContent()).filter(
    (entry) => entry.kind === "posts" && entry.frontmatter.date === today,
  );
  if (due.length === 0) {
    return NextResponse.json({ triggered: false, today });
  }

  const response = await fetch(hookUrl, { method: "POST" });
  return NextResponse.json({
    triggered: response.ok,
    today,
    posts: due.map((entry) => `${entry.category}/${entry.slug}`),
  });
}
