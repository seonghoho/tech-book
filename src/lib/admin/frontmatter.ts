import matter from "gray-matter";
import { normalizeDateString } from "../publishing.ts";

export type PostFrontmatter = {
  title: string;
  date: string;
  updated?: string;
  description?: string;
  image?: string;
  tags?: string[];
  featured?: boolean;
  draft?: boolean;
};

const normalizeTags = (tags: unknown): string[] => {
  if (Array.isArray(tags)) return tags.map((tag) => String(tag).trim()).filter(Boolean);
  if (typeof tags === "string") {
    return tags
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);
  }
  return [];
};

export function parsePostFile(raw: string): { frontmatter: PostFrontmatter; body: string } {
  const { data, content } = matter(raw);
  return {
    frontmatter: {
      title: typeof data.title === "string" ? data.title : "",
      date: normalizeDateString(data.date) ?? "",
      updated: normalizeDateString(data.updated) ?? undefined,
      description: typeof data.description === "string" ? data.description : undefined,
      image: typeof data.image === "string" ? data.image : undefined,
      tags: normalizeTags(data.tags),
      featured: data.featured === true ? true : undefined,
      draft: data.draft === true ? true : undefined,
    },
    body: content.replace(/^\n+/, ""),
  };
}

// 기존 글과 같은 형태(키 순서, 큰따옴표 문자열, 인라인 배열)로 직렬화한다.
// JSON 문자열/배열 표기는 그대로 유효한 YAML 이다.
export function serializePostFile(frontmatter: PostFrontmatter, body: string) {
  const lines: string[] = [];
  const pushString = (key: string, value: string | undefined) => {
    if (value !== undefined && value !== "") lines.push(`${key}: ${JSON.stringify(value)}`);
  };

  pushString("title", frontmatter.title);
  pushString("date", frontmatter.date);
  pushString("updated", frontmatter.updated);
  pushString("description", frontmatter.description);
  pushString("image", frontmatter.image);
  if (frontmatter.tags && frontmatter.tags.length > 0) {
    lines.push(`tags: ${JSON.stringify(frontmatter.tags)}`);
  }
  if (frontmatter.featured) lines.push("featured: true");
  if (frontmatter.draft) lines.push("draft: true");

  const normalizedBody = body.replace(/\r\n/g, "\n").replace(/^\n+/, "").replace(/\s*$/, "\n");
  return `---\n${lines.join("\n")}\n---\n\n${normalizedBody}`;
}
