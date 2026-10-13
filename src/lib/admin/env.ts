import "server-only";

// 관리자 기능 환경변수. 누락 시 어떤 값을 설정해야 하는지 바로 알 수 있게 실패한다.
// 설정 방법은 docs/admin-editor.md 참고.

const read = (name: string) => {
  const value = process.env[name];
  if (!value) {
    throw new Error(`[admin] 환경변수 ${name} 가 설정되지 않았습니다. docs/admin-editor.md 를 참고하세요.`);
  }
  return value;
};

export const getAuthEnv = () => ({
  clientId: read("GITHUB_OAUTH_CLIENT_ID"),
  clientSecret: read("GITHUB_OAUTH_CLIENT_SECRET"),
  adminGithubId: read("ADMIN_GITHUB_ID"),
  sessionSecret: read("ADMIN_SESSION_SECRET"),
});

export const getRepoEnv = () => {
  const [owner, repo] = (process.env.GITHUB_REPO ?? "seonghoho/tech-book").split("/");
  return {
    token: read("GITHUB_CONTENT_TOKEN"),
    owner,
    repo,
    branch: process.env.GITHUB_BRANCH ?? "master",
  };
};
