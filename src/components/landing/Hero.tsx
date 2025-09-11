"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { Suspense } from "react";

const Dice = dynamic(() => import("@/components/landing/Dice"), {
  ssr: false,
});

const Hero = () => {
  return (
    <section className="relative w-full h-[calc(100vh-80px)] flex flex-col items-center justify-center text-center p-8 overflow-hidden">
      <div className="absolute inset-0 w-full h-full z-0">
        <Suspense
          fallback={
            <div className="w-full h-full bg-gray-200 dark:bg-gray-800" />
          }
        >
          <Dice />
        </Suspense>
        <div className="absolute inset-0 w-full h-full bg-black/30 z-10" />
      </div>
      <div className="relative z-20 flex flex-col items-center justify-center">
        <h1 className="text-5xl md:text-7xl font-bold mb-4 text-white tracking-tighter">
          Dive into the world of Interactive Development
        </h1>
        <p className="text-lg md:text-xl text-gray-200 mb-8 max-w-2xl">
          I&apos;m a developer who loves to create interactive and fun web
          experiences. This is my playground to share what I&apos;ve learned and
          created.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link href="/posts">
            <div className="px-8 py-4 bg-white/10 text-white rounded-lg backdrop-blur-sm hover:bg-white/20 transition-colors border border-white/20">
              Explore My Works
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Hero;
