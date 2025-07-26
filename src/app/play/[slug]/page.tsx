import { games } from "@/lib/gamesData";
import { notFound } from "next/navigation";
import GameComponent from "@/components/games/GameComponent";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

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

  return {
    title: `Play ${game.title}`,
    description: `Play the ${game.title} game.`,
  };
}

export default async function GamePlayPage({ params }: PageProps) {
  const { slug } = await params;
  const game = games.find((g) => g.playSlug === slug);

  if (!game) {
    notFound();
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-center">
        Playing {game.title}
      </h1>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 sm:p-6">
        <GameComponent gameName={game.playSlug} />
      </div>
    </div>
  );
}
