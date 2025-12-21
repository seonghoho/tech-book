import React from "react";
import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";
export const revalidate = 3600;
interface PageProps {
  params: Promise<{ slug: string[] }>; // 비동기 타입
}

export async function GET(request: NextRequest, context: PageProps) {
  const { slug } = await context.params;
  const slugString = slug.join("/");
  const queryTitle = request.nextUrl.searchParams.get("title");
  const fallbackTitle = decodeURIComponent(slugString).replace(/-/g, " ");
  const title = queryTitle ? decodeURIComponent(queryTitle) : fallbackTitle;

  return new ImageResponse(
    React.createElement(
      "div",
      {
        style: {
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          width: "100%",
          height: "100%",
          backgroundColor: "#fff",
          fontSize: 60,
          fontWeight: "bold",
          textAlign: "center",
        },
      },
      React.createElement("h1", null, title)
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
