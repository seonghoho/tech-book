import Link from "next/link";
import Image from "next/image";
import { games } from "@/lib/gamesData";

export default function GameCardList() {
  return (
    <>
      <div className="flex-1 container">
        <h1 className="text-4xl font-bold mb-8 text-center">Games</h1>
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {games.map((game) => (
            <div
              key={game.slug}
              className="group flex h-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-lg transition hover:-translate-y-2 hover:shadow-2xl dark:border-gray-800 dark:bg-gray-900"
            >
              <div className="relative h-48 w-full overflow-hidden">
                {game.image ? (
                  <Image
                    src={game.image}
                    alt={game.title}
                    className="object-cover transition duration-700 group-hover:scale-105"
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center bg-gray-200 text-gray-500 dark:bg-zinc-700 dark:text-zinc-400">
                    No Image
                  </div>
                )}
              </div>

              <div className="flex flex-1 flex-col gap-3 p-6">
                <div className="text-xs uppercase tracking-[0.18em] text-indigo-500">
                  {game.techStack.slice(0, 2).join(" · ")}
                </div>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                  {game.title}
                </h2>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  {game.summary ?? game.description}
                </p>
                <div className="flex flex-wrap gap-2">
                  {game.techStack.map((stack) => (
                    <span
                      key={stack}
                      className="rounded-full border border-gray-200 px-3 py-1 text-xs text-gray-700 dark:border-gray-700 dark:text-gray-200"
                    >
                      {stack}
                    </span>
                  ))}
                </div>
                {game.highlights?.length ? (
                  <ul className="list-disc space-y-1 pl-5 text-xs text-gray-600 dark:text-gray-400">
                    {game.highlights.slice(0, 2).map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                ) : null}
                <div className="mt-auto flex items-center gap-3">
                  <Link
                    href={`/play/${game.playSlug ?? game.slug}`}
                    className="flex-1 rounded-lg bg-gray-900 px-4 py-2 text-center text-sm font-semibold text-white transition hover:-translate-y-[1px] hover:shadow-lg dark:bg-white dark:text-gray-900"
                  >
                    Play Demo
                  </Link>
                  {game.devlogSlug ? (
                    <Link
                      href={`/games/${game.devlogSlug}`}
                      className="flex-1 rounded-lg border border-gray-200 px-4 py-2 text-center text-sm font-semibold text-gray-800 transition hover:border-indigo-400 hover:text-indigo-600 dark:border-gray-700 dark:text-gray-100"
                    >
                      Devlog
                    </Link>
                  ) : null}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
