import Link from "next/link";
import Image from "next/image";
import { games } from "@/lib/gamesData";

export default function GameCardList() {
  return (
    <>
      <div className="flex-1 container">
        <h1 className="text-4xl font-bold mb-8 text-center">Games</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {games.map((game) => (
            <Link key={game.slug} href={`/play/${game.slug}`}>
              <div
                className="bg-white dark:bg-zinc-800 rounded-lg border-4 border-[#f9f9f9] dark:border-[#797979] overflow-hidden 
                            shadow-lg dark:shadow-sm hover:shadow-xl dark:hover:shadow-[0_4px_24px_rgba(255,255,255,0.25)] 
                            transition-shadow duration-300 cursor-pointer"
              >
                <div className="relative w-full h-48">
                  {game.image ? (
                    <Image
                      src={game.image}
                      alt={game.title}
                      layout="fill"
                      objectFit="cover"
                      className="w-full h-auto rounded-t-sm object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 dark:bg-zinc-700 flex items-center justify-center rounded-t-lg">
                      <span className="text-gray-500 dark:text-zinc-400 text-lg font-semibold">
                        No Image
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-6">
                  <h2 className="text-2xl font-semibold mb-2 text-gray-900 dark:text-white">
                    {game.title}
                  </h2>
                  <p className="text-gray-700 dark:text-gray-300">
                    {game.description}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </>
  );
}
