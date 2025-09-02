"use client";

import { useRef, useEffect } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

interface AnimatedSectionProps {
  children: React.ReactNode;
  className?: string;
}

const AnimatedSection = ({ children, className }: AnimatedSectionProps) => {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = sectionRef.current;
    if (element) {
      gsap.fromTo(
        element.children,
        {
          y: 50,
          opacity: 0,
        },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          stagger: 0.2,
          ease: "power3.out",
          scrollTrigger: {
            trigger: element,
            start: "top 80%",
            end: "bottom 20%",
            toggleActions: "play none none none",
          },
        }
      );
    }
  }, []);

  return (
    <div ref={sectionRef} className={className}>
      {children}
    </div>
  );
};

export default AnimatedSection;
