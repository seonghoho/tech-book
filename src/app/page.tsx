import GameCardList from "@/components/layout/GameCardList";
import Hero from "@/components/landing/Hero";
import RecentPostsList from "@/components/landing/RecentPostsList";
import { getAllPosts } from "@/lib/getAllPosts";
import AnimatedSection from "@/components/landing/AnimatedSection";

export default function Home() {
  const recentPosts = getAllPosts("posts").slice(0, 3);

  return (
    <main className="flex-1 bg-white dark:bg-gray-900">
      <Hero />
      <div className="py-16 sm:py-24 space-y-24">
        <AnimatedSection className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
              Featured Posts
            </h2>
            <p className="mt-3 text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              My latest thoughts on technology, development, and everything in
              between.
            </p>
          </div>
          <RecentPostsList posts={recentPosts} />
        </AnimatedSection>

        <AnimatedSection className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900 dark:text-white">
              Featured Games
            </h2>
            <p className="mt-3 text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              Check out some of the interactive game development logs.
            </p>
          </div>
          <GameCardList />
        </AnimatedSection>
      </div>
    </main>
  );
}
