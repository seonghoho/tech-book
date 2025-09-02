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
        <Suspense fallback={<div className="w-full h-full bg-gray-200 dark:bg-gray-800" />}>
          <Dice />
        </Suspense>
      </div>
      <div className="relative z-10 flex flex-col items-center justify-center">
        <h1 className="text-5xl md:text-7xl font-bold mb-4 text-white dark:text-gray-100 tracking-tighter">
          Welcome to TechBook
        </h1>
        <p className="text-lg md:text-xl text-gray-200 dark:text-gray-300 mb-8 max-w-2xl">
          Explore the latest in web development, 3D graphics, and interactive
          experiences. A space for learning and sharing knowledge.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link href="/posts">
            <div className="px-8 py-4 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors border border-gray-600">
              Explore Tech Docs
            </div>
          </Link>
          <Link href="/games">
            <div className="px-8 py-4 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors border border-gray-600">
              Explore Game Docs
            </div>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Hero;
