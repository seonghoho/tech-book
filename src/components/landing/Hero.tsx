"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
import { Suspense, useEffect, useRef, useState } from "react";
import { useSpring, animated, useTrail } from "@react-spring/web";

const Dice = dynamic(() => import("@/components/landing/Dice"), {
  ssr: false,
});

// Calculates the transform values based on mouse position
const calc = (x: number, y: number, rect: DOMRect) => [
  -(y - rect.top - rect.height / 2) / 30, // RotateX
  (x - rect.left - rect.width / 2) / 30, // RotateY
  1.05, // Scale
];

// Applies the transform
const trans = (x: number, y: number, s: number) =>
  `perspective(600px) rotateX(${x}deg) rotateY(${y}deg) scale(${s})`;

const Hero = () => {
  const ref = useRef<HTMLElement>(null);
  const [shouldRenderDice, setShouldRenderDice] = useState(false);
  const [{ xys }, api] = useSpring(() => ({
    xys: [0, 0, 1],
    config: { mass: 5, tension: 350, friction: 40 },
  }));

  // Only mount the heavy 3D canvas when the section is near the viewport.
  useEffect(() => {
    if (!ref.current || shouldRenderDice) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldRenderDice(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [shouldRenderDice]);

  // Trail animation for the text and button
  const items = [
    <h1
      key="hero-title"
      className="text-5xl md:text-7xl font-bold mb-4 text-[#777777] tracking-tighter"
    >
      Dive into the world of Interactive Development
    </h1>,
    <p
      key="hero-desc"
      className="text-lg md:text-xl text-gray-200 mb-8 max-w-2xl"
    >
      I&apos;m a developer who loves to create interactive and fun web
      experiences. This is my playground to share what I&apos;ve learned and
      created.
    </p>,
    <div key="hero-cta" className="flex flex-col sm:flex-row gap-4">
      <Link href="/posts">
        <div className="px-8 py-4 bg-black/50 text-white rounded-lg backdrop-blur-sm hover:bg-black/70 transition-all duration-300 border border-gray/20 transform hover:scale-105 hover:shadow-lg">
          Explore My Works
        </div>
      </Link>
    </div>,
  ];

  const trail = useTrail(items.length, {
    from: { opacity: 0, transform: "translateY(30px)" },
    to: { opacity: 1, transform: "translateY(0px)" },
    config: { mass: 1, tension: 280, friction: 60 },
    delay: 300,
  });

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();
      api.start({ xys: calc(e.clientX, e.clientY, rect) });
    }
  };

  const handleMouseLeave = () => {
    api.start({ xys: [0, 0, 1] });
  };

  return (
    <section
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-full h-screen flex flex-col items-center justify-center text-center p-8 overflow-hidden"
    >
      <div className="absolute inset-0 w-full h-full z-0">
        {shouldRenderDice ? (
          <Suspense
            fallback={
              <div className="w-full h-full bg-gray-200 dark:bg-gray-800" />
            }
          >
            <Dice />
          </Suspense>
        ) : (
          <div className="w-full h-full bg-gradient-to-b from-gray-100 via-white to-gray-100 dark:from-[#0b0b0b] dark:via-[#0f0f0f] dark:to-[#0b0b0b]" />
        )}
        <div className="absolute inset-0 w-full h-full  z-10" />
        <div className="absolute inset-0 w-full h-full z-10" />
      </div>
      <animated.div
        style={{ transform: xys.to(trans) }}
        className="relative z-20 flex flex-col items-center justify-center"
      >
        {trail.map((style, index) => (
          <animated.div key={index} style={style}>
            {items[index]}
          </animated.div>
        ))}
      </animated.div>
    </section>
  );
};

export default Hero;
