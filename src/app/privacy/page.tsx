import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Privacy Policy",
  description:
    "Seonghoho 사이트의 개인정보 처리와 Google AdSense, Google Analytics 사용에 대한 안내입니다.",
  path: "/privacy",
});

export const dynamic = "force-static";

const sectionClass = "space-y-3";
const paragraphClass = "text-sm leading-7 text-[color:var(--color-text-secondary)]";
const listClass =
  "list-disc space-y-2 pl-5 text-sm leading-7 text-[color:var(--color-text-secondary)]";

export default function PrivacyPage() {
  return (
    <div className="page-shell">
      <section className="mx-auto max-w-3xl space-y-10">
        <div className="space-y-4">
          <p className="eyebrow-label">Privacy</p>
          <h1 className="text-4xl font-semibold tracking-[-0.04em] text-[color:var(--color-text-primary)] sm:text-5xl">
            Privacy Policy
          </h1>
          <p className="body-copy">
            Seonghoho는 사이트 운영, 방문 통계 확인, 광고 제공을 위해 필요한 범위에서 쿠키와
            익명화된 이용 정보를 사용할 수 있습니다.
          </p>
          <p className="text-sm text-[color:var(--color-text-muted)]">Last updated: 2026-07-02</p>
        </div>

        <div className="space-y-8">
          <section className={sectionClass}>
            <h2 className="text-xl font-semibold text-[color:var(--color-text-primary)]">
              수집하는 정보
            </h2>
            <p className={paragraphClass}>
              이 사이트는 별도의 회원가입이나 댓글 기능을 제공하지 않습니다. 다만 서비스 운영과 품질
              개선을 위해 브라우저, 기기, 접속 페이지, 유입 경로, 대략적인 지역, 방문 시간 같은
              비식별 이용 정보가 분석 도구를 통해 수집될 수 있습니다.
            </p>
          </section>

          <section className={sectionClass}>
            <h2 className="text-xl font-semibold text-[color:var(--color-text-primary)]">
              Google AdSense 및 광고 쿠키
            </h2>
            <p className={paragraphClass}>
              이 사이트는 Google AdSense를 사용할 수 있습니다. Google을 포함한 제3자 광고 제공업체는
              사용자의 이전 방문 기록을 바탕으로 광고를 게재하기 위해 쿠키를 사용할 수 있습니다.
            </p>
            <ul className={listClass}>
              <li>
                Google은 광고 쿠키를 사용해 사용자가 이 사이트 또는 다른 사이트를 방문한 기록을
                바탕으로 광고를 게재할 수 있습니다.
              </li>
              <li>
                사용자는{" "}
                <a
                  href="https://adssettings.google.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="accent-link"
                >
                  Google 광고 설정
                </a>
                에서 개인 맞춤 광고를 관리하거나 비활성화할 수 있습니다.
              </li>
              <li>
                Google이 파트너 사이트의 데이터를 사용하는 방식은{" "}
                <a
                  href="https://policies.google.com/technologies/partner-sites"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="accent-link"
                >
                  Google 파트너 사이트 데이터 사용 안내
                </a>
                에서 확인할 수 있습니다.
              </li>
            </ul>
          </section>

          <section className={sectionClass}>
            <h2 className="text-xl font-semibold text-[color:var(--color-text-primary)]">
              Google Analytics
            </h2>
            <p className={paragraphClass}>
              사이트 이용 흐름과 콘텐츠 품질을 파악하기 위해 Google Analytics 또는 Vercel Analytics
              같은 분석 도구를 사용할 수 있습니다. 이 정보는 개인을 직접 식별하기 위한 목적이 아니라
              사이트 개선과 오류 파악을 위해 사용됩니다.
            </p>
          </section>

          <section className={sectionClass}>
            <h2 className="text-xl font-semibold text-[color:var(--color-text-primary)]">
              댓글 기능
            </h2>
            <p className={paragraphClass}>
              게시글 댓글은 Giscus와 GitHub Discussions를 통해 제공됩니다. 댓글을 작성하려면 GitHub
              계정으로 인증해야 하며, 작성한 댓글과 반응은 GitHub Discussions에 공개적으로 저장될 수
              있습니다. 댓글 기능 사용 시 GitHub 및 Giscus의 정책이 함께 적용됩니다.
            </p>
          </section>

          <section className={sectionClass}>
            <h2 className="text-xl font-semibold text-[color:var(--color-text-primary)]">
              외부 링크
            </h2>
            <p className={paragraphClass}>
              이 사이트에는 GitHub, 프로젝트 데모, 참고 문서 등 외부 사이트로 이동하는 링크가 포함될
              수 있습니다. 외부 사이트의 개인정보 처리 방식은 해당 사이트의 정책을 따릅니다.
            </p>
          </section>

          <section className={sectionClass}>
            <h2 className="text-xl font-semibold text-[color:var(--color-text-primary)]">문의</h2>
            <p className={paragraphClass}>
              개인정보 처리와 관련한 문의는{" "}
              <a href="mailto:chltjdgh3@naver.com" className="accent-link">
                chltjdgh3@naver.com
              </a>
              으로 연락할 수 있습니다.
            </p>
          </section>
        </div>
      </section>
    </div>
  );
}
