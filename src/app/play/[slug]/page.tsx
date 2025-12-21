import { games } from "@/lib/gamesData";
import { notFound } from "next/navigation";
import GameComponent from "@/components/games/GameComponent";
import { buildPageMetadata, buildProjectJsonLd } from "@/lib/seo";
import { absoluteUrl } from "@/lib/site";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

// SSG: 데모 플레이 페이지는 정적 생성하되 검색엔진 인덱싱은 제한.
export const dynamic = "force-static";
export const revalidate = 86400;

export function generateStaticParams() {
  return games.map((game) => ({
    slug: game.playSlug,
  }));
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const game = games.find((g) => g.playSlug === slug);

  if (!game) {
    return {};
  }

  return buildPageMetadata({
    title: `${game.title} 플레이 — TechBook`,
    description: game.summary ?? `Play the ${game.title} game.`,
    path: `/play/${game.playSlug}`,
    images: [
      {
        url: absoluteUrl(game.image),
        width: 1200,
        height: 630,
      },
    ],
    robots: {
      index: false,
      follow: true,
    },
  });
}

export default async function GamePlayPage({ params }: PageProps) {
  const { slug } = await params;
  const game = games.find((g) => g.playSlug === slug);

  if (!game) {
    notFound();
  }

  const projectJsonLd = buildProjectJsonLd({
    title: game.title,
    description: game.summary ?? game.description,
    path: `/play/${game.playSlug}`,
    image: game.image,
    technologies: game.techStack,
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(projectJsonLd) }}
      />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8 text-center">
          Playing {game.title}
        </h1>
        <div className="bg-white dark:bg-zinc-800 rounded-lg shadow-lg p-4 sm:p-6">
          <GameComponent gameName={game.playSlug} />
        </div>
      </div>
    </>
  );
}
