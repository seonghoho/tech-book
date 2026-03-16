"use client";

import { useLayoutEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface AnimatedSectionProps {
  children: React.ReactNode;
  className?: string;
  selector?: string;
}

const AnimatedSection = ({
  children,
  className,
  selector = "[data-reveal-item]",
}: AnimatedSectionProps) => {
  const sectionRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const element = sectionRef.current;
    if (!element) {
      return;
    }

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const context = gsap.context(() => {
      const revealTargets = element.querySelectorAll(selector);
      const targets = revealTargets.length ? revealTargets : [element];

      gsap.fromTo(
        targets,
        {
          y: 28,
          opacity: 0,
        },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.12,
          ease: "power2.out",
          scrollTrigger: {
            trigger: element,
            start: "top 82%",
            once: true,
          },
        }
      );
    }, sectionRef);

    return () => context.revert();
  }, []);

  return (
    <div ref={sectionRef} className={className} data-scroll-section>
      {children}
    </div>
  );
};

export default AnimatedSection;
