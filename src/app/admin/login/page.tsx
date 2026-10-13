import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin/auth";
import { GithubIcon } from "@/assets/svg";

const ERROR_MESSAGES: Record<string, string> = {
  state: "로그인 요청이 만료되었거나 올바르지 않습니다. 다시 시도해 주세요.",
  token: "GitHub 인증 토큰을 받지 못했습니다.",
  user: "GitHub 사용자 정보를 불러오지 못했습니다.",
  forbidden: "이 계정은 관리자 권한이 없습니다.",
};

type PageProps = {
  searchParams: Promise<{ error?: string }>;
};

export default async function AdminLoginPage({ searchParams }: PageProps) {
  const { error } = await searchParams;
  const session = await getAdminSession().catch(() => null);
  if (session) redirect("/admin");

  return (
    <section className="surface-panel mx-auto max-w-md space-y-5 p-6 sm:p-8">
      <div className="space-y-2">
        <p className="eyebrow-label">Admin</p>
        <h1 className="section-title">글쓰기 관리자</h1>
        <p className="muted-copy">허용된 GitHub 계정으로만 로그인할 수 있습니다.</p>
      </div>
      {error ? (
        <p className="surface-subtle px-4 py-3 text-sm text-[color:var(--color-text-secondary)]" role="alert">
          {ERROR_MESSAGES[error] ?? "로그인에 실패했습니다."}
        </p>
      ) : null}
      <a href="/api/admin/auth/login" className="button-primary inline-flex w-full items-center justify-center gap-2">
        <GithubIcon className="h-4 w-4" />
        GitHub로 로그인
      </a>
    </section>
  );
}
