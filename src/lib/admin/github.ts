import "server-only";
import { getRepoEnv } from "@/lib/admin/env";
import { parsePostFile, type PostFrontmatter } from "@/lib/admin/frontmatter";
import { isWritablePath, parseContentPath, type ContentKind } from "@/lib/admin/paths";

// 저장소가 글의 원본이다. 배포본의 파일시스템은 마지막 배포 시점에 멈춰 있으므로
// 관리자 화면은 항상 GitHub API 로 최신 상태를 읽고 쓴다.

export class GitHubConflictError extends Error {
  constructor(public readonly path: string) {
    super(`다른 곳에서 먼저 수정된 파일입니다: ${path}`);
  }
}

type RequestInitWithJson = Omit<RequestInit, "body"> & { json?: unknown };

async function github<T>(path: string, init: RequestInitWithJson = {}): Promise<T> {
  const { token } = getRepoEnv();
  const { json, ...rest } = init;
  const response = await fetch(`https://api.github.com${path}`, {
    ...rest,
    cache: "no-store",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      ...(json !== undefined ? { "Content-Type": "application/json" } : {}),
      ...rest.headers,
    },
    body: json !== undefined ? JSON.stringify(json) : undefined,
  });

  if (!response.ok) {
    const error = new Error(`GitHub API ${response.status} ${path}: ${await response.text()}`);
    (error as Error & { status?: number }).status = response.status;
    throw error;
  }
  return (await response.json()) as T;
}

const repoPath = () => {
  const { owner, repo } = getRepoEnv();
  return `/repos/${owner}/${repo}`;
};

export type ContentEntry = {
  path: string;
  sha: string;
  kind: ContentKind;
  category: string;
  slug: string;
  frontmatter: PostFrontmatter;
};

type GraphQLTree = {
  entries?: {
    name: string;
    type: string;
    object?: { entries?: { name: string; oid: string; object?: { text?: string | null } }[] };
  }[];
} | null;

// posts / drafts 디렉터리의 모든 글을 GraphQL 한 번으로 읽는다 (카테고리/파일 2단 구조).
export async function listContent(): Promise<ContentEntry[]> {
  const { owner, repo, branch } = getRepoEnv();
  const treeFragment = `
    ... on Tree {
      entries {
        name
        type
        object {
          ... on Tree { entries { name oid object { ... on Blob { text } } } }
        }
      }
    }`;
  const result = await github<{
    data?: { repository: { posts: GraphQLTree; drafts: GraphQLTree } };
    errors?: unknown;
  }>("/graphql", {
    method: "POST",
    json: {
      query: `query($owner: String!, $repo: String!, $posts: String!, $drafts: String!) {
        repository(owner: $owner, name: $repo) {
          posts: object(expression: $posts) { ${treeFragment} }
          drafts: object(expression: $drafts) { ${treeFragment} }
        }
      }`,
      variables: {
        owner,
        repo,
        posts: `${branch}:src/content/posts`,
        drafts: `${branch}:src/content/drafts`,
      },
    },
  });
  if (!result.data) throw new Error(`GitHub GraphQL 오류: ${JSON.stringify(result.errors)}`);

  const entries: ContentEntry[] = [];
  (["posts", "drafts"] as const).forEach((kind) => {
    result.data!.repository[kind]?.entries?.forEach((categoryEntry) => {
      if (categoryEntry.type !== "tree") return;
      categoryEntry.object?.entries?.forEach((file) => {
        const path = `src/content/${kind}/${categoryEntry.name}/${file.name}`;
        const parsed = parseContentPath(path);
        if (!parsed || typeof file.object?.text !== "string") return;
        entries.push({
          path,
          sha: file.oid,
          ...parsed,
          frontmatter: parsePostFile(file.object.text).frontmatter,
        });
      });
    });
  });
  return entries;
}

export async function readFile(path: string): Promise<{ content: string; sha: string } | null> {
  const { branch } = getRepoEnv();
  try {
    const file = await github<{ content: string; sha: string; encoding: string }>(
      `${repoPath()}/contents/${path}?ref=${encodeURIComponent(branch)}`,
    );
    return { content: Buffer.from(file.content, "base64").toString("utf8"), sha: file.sha };
  } catch (error) {
    if ((error as { status?: number }).status === 404) return null;
    throw error;
  }
}

export type FileUpsert = {
  path: string;
  content: string | Buffer; // string = utf-8 텍스트, Buffer = 바이너리
};

export type CommitInput = {
  message: string;
  upserts?: FileUpsert[];
  deletes?: string[];
  // path -> 기대하는 현재 blob sha. null 은 "아직 존재하지 않아야 함"(덮어쓰기 방지).
  expectedShas?: Record<string, string | null>;
};

async function currentBlobSha(path: string, ref: string) {
  try {
    const file = await github<{ sha: string }>(
      `${repoPath()}/contents/${path}?ref=${encodeURIComponent(ref)}`,
    );
    return file.sha;
  } catch (error) {
    if ((error as { status?: number }).status === 404) return null;
    throw error;
  }
}

// 여러 파일 추가/삭제를 커밋 하나로 원자적으로 반영한다 (Git Data API).
export async function commitFiles(input: CommitInput, attempt = 0): Promise<{
  commitSha: string;
  blobShas: Record<string, string>;
}> {
  const { branch } = getRepoEnv();
  const upserts = input.upserts ?? [];
  const deletes = input.deletes ?? [];

  [...upserts.map((file) => file.path), ...deletes].forEach((path) => {
    if (!isWritablePath(path)) throw new Error(`쓰기가 허용되지 않은 경로입니다: ${path}`);
  });

  const ref = await github<{ object: { sha: string } }>(`${repoPath()}/git/ref/heads/${branch}`);
  const headSha = ref.object.sha;

  for (const [path, expected] of Object.entries(input.expectedShas ?? {})) {
    const actual = await currentBlobSha(path, headSha);
    if (actual !== expected) throw new GitHubConflictError(path);
  }

  const headCommit = await github<{ tree: { sha: string } }>(
    `${repoPath()}/git/commits/${headSha}`,
  );

  const blobShas: Record<string, string> = {};
  const treeEntries = await Promise.all(
    upserts.map(async (file) => {
      const blob = await github<{ sha: string }>(`${repoPath()}/git/blobs`, {
        method: "POST",
        json:
          typeof file.content === "string"
            ? { content: file.content, encoding: "utf-8" }
            : { content: file.content.toString("base64"), encoding: "base64" },
      });
      blobShas[file.path] = blob.sha;
      return { path: file.path, mode: "100644", type: "blob", sha: blob.sha };
    }),
  );
  deletes.forEach((path) => {
    treeEntries.push({ path, mode: "100644", type: "blob", sha: null as unknown as string });
  });

  const tree = await github<{ sha: string }>(`${repoPath()}/git/trees`, {
    method: "POST",
    json: { base_tree: headCommit.tree.sha, tree: treeEntries },
  });
  const commit = await github<{ sha: string }>(`${repoPath()}/git/commits`, {
    method: "POST",
    json: { message: input.message, tree: tree.sha, parents: [headSha] },
  });

  try {
    await github(`${repoPath()}/git/refs/heads/${branch}`, {
      method: "PATCH",
      json: { sha: commit.sha, force: false },
    });
  } catch (error) {
    // 그사이 다른 커밋이 올라와 fast-forward 가 실패하면 최신 HEAD 기준으로 한 번 다시 시도한다.
    if ((error as { status?: number }).status === 422 && attempt === 0) {
      return commitFiles(input, attempt + 1);
    }
    throw error;
  }

  return { commitSha: commit.sha, blobShas };
}
