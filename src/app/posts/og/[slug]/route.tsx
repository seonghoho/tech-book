import { ImageResponse } from "@vercel/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } }
) {
  const { slug } = params;

  // 예시: slug를 공백으로 바꿔서 제목 표시
  const title = decodeURIComponent(slug).replace(/-/g, " ");

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          height: "100%",
          width: "100%",
          background: "#ffffff",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          fontSize: 60,
          fontWeight: "bold",
        }}
      >
        <h1>{title}</h1>
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
