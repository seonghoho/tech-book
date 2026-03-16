import type { Metadata } from "next";
import { permanentRedirect } from "next/navigation";
import { aboutProjects } from "@/lib/aboutData";

export const dynamic = "force-static";
export const dynamicParams = false;

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  return {
    alternates: {
      canonical: `/projects/${slug}`,
    },
    robots: {
      index: false,
      follow: true,
    },
  };
}

export function generateStaticParams() {
  return aboutProjects.map((project) => ({ slug: project.slug }));
}

export default async function AboutProjectPage({ params }: PageProps) {
  const { slug } = await params;
  permanentRedirect(`/projects/${slug}`);
}
