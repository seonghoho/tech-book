import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import ProjectKindBadge from "@/components/projects/ProjectKindBadge";
import { personalApps, receiptPhotoboothDetail } from "@/lib/appsData";
import { buildBreadcrumbJsonLd, buildPageMetadata } from "@/lib/seo";
import { absoluteUrl } from "@/lib/site";

const PATH = "/projects/receipt-photobooth";
const app = personalApps.find((item) => item.slug === "receipt-photobooth");

export const dynamic = "force-static";

export const metadata: Metadata = buildPageMetadata({
  title: "영수증 포토부스 작업 기록",
  description: receiptPhotoboothDetail.summary,
  path: PATH,
  images: app ? [{ url: absoluteUrl(app.thumbnail.src) }] : undefined,
});

export default function ReceiptPhotoboothPage() {
  const detail = receiptPhotoboothDetail;
  const breadcrumbJsonLd = buildBreadcrumbJsonLd({
    items: [
      { name: "홈", item: "/" },
      { name: "Projects", item: "/projects" },
      { name: detail.title, item: PATH },
    ],
  });

  return (
    <div className="stable-screen-min w-full">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <article className="page-shell mx-auto max-w-[980px] space-y-10">
        <Link href="/projects" className="nav-link inline-flex text-sm">
          ← Projects
        </Link>

        <header className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <ProjectKindBadge kind="app" />
            <ProjectKindBadge kind="wip" />
          </div>
          <h1 className="text-4xl font-semibold tracking-[-0.05em] text-[color:var(--color-text-primary)] sm:text-5xl">
            {detail.title}
          </h1>
          <p className="body-copy max-w-[72ch] [word-break:keep-all]">{detail.summary}</p>
        </header>

        <div className="grid gap-10 lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)] lg:items-start">
          {app ? (
            <div className="surface-subtle relative mx-auto aspect-[452/656] w-full max-w-[320px] overflow-hidden">
              <Image
                src={app.thumbnail.src}
                alt={app.thumbnail.alt}
                fill
                sizes="320px"
                className="object-contain"
              />
            </div>
          ) : null}

          <div className="max-w-[72ch] space-y-10">
            {detail.sections.map((section) => (
              <section key={section.heading} className="space-y-3">
                <h2 className="section-title">{section.heading}</h2>
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph} className="body-copy [word-break:keep-all]">
                    {paragraph}
                  </p>
                ))}
                {section.points ? (
                  <ul className="body-copy list-disc space-y-1 pl-5 [word-break:keep-all]">
                    {section.points.map((point) => (
                      <li key={point}>{point}</li>
                    ))}
                  </ul>
                ) : null}
              </section>
            ))}
          </div>
        </div>
      </article>
    </div>
  );
}
