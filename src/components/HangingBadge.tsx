"use client";

import Image, { type StaticImageData } from "next/image";
import { useEffect, useRef } from "react";
import HookMetal from "@/components/HookMetal";

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value));

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

type HangingBadgeProps = {
  photo?: StaticImageData | string;
  name: string;
  title: string;
};

const HangingBadge = ({ photo, name, title }: HangingBadgeProps) => {
  const strapPathRef = useRef<SVGPathElement>(null);
  const strapHighlightRef = useRef<SVGPathElement>(null);
  const swingRef = useRef<HTMLDivElement>(null);
  const specularRef = useRef<SVGGElement>(null);
  const draggingRef = useRef(false);
  const pointerIdRef = useRef<number | null>(null);
  const startXRef = useRef(0);
  const lastXRef = useRef(0);
  const lastTRef = useRef(0);
  const vxRef = useRef(0);
  const targetAngleRef = useRef(0);
  const targetXRef = useRef(0);
  const thetaRef = useRef(0);
  const omegaRef = useRef(0);
  const xRef = useRef(0);
  const animRef = useRef<number | null>(null);
  const lastTimeRef = useRef(0);
  const reducedMotionRef = useRef(false);
  const reduceTimerRef = useRef<number | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => {
      reducedMotionRef.current = media.matches;
    };
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  const updateStrap = (theta: number, x: number) => {
    const path = strapPathRef.current;
    const highlight = strapHighlightRef.current;
    if (!path || !highlight) return;
    const offset = clamp(x * 0.7 + theta * 140, -48, 48);
    const startX = 100;
    const startY = 0;
    const endX = 100 + offset;
    const endY = 180;
    const c1X = 100 + offset * 0.35;
    const c1Y = 120;
    const c2X = 100 + offset * 0.45;
    const c2Y = 170;
    const d = `M ${startX} ${startY} C ${c1X} ${c1Y}, ${c2X} ${c2Y}, ${endX} ${endY}`;
    path.setAttribute("d", d);
    highlight.setAttribute("d", d);
  };

  const updateSpecular = (theta: number, x: number) => {
    const layer = specularRef.current;
    if (!layer) return;
    const angleDeg = (theta * 180) / Math.PI;
    const hx = x * 0.55 + angleDeg * 3.2;
    const hr = angleDeg * 0.35;
    const hs = 1 + Math.min(0.06, Math.abs(angleDeg) * 0.002);
    const specOpacity = clamp(0.55 + Math.abs(angleDeg) / 18, 0.55, 1);
    layer.style.transform = `translateX(${hx.toFixed(2)}px) rotate(${hr.toFixed(
      2,
    )}deg) scale(${hs.toFixed(3)})`;
    layer.style.opacity = reducedMotionRef.current ? "0.6" : `${specOpacity}`;
  };

  const applyTransform = (theta: number, x: number) => {
    const el = swingRef.current;
    if (!el) return;
    el.style.transform = `translateX(${x.toFixed(2)}px) rotate(${theta.toFixed(
      4,
    )}rad)`;
    updateStrap(theta, x);
    updateSpecular(theta, x);
  };

  const stopAnimation = () => {
    if (animRef.current) cancelAnimationFrame(animRef.current);
    animRef.current = null;
  };

  const tick = (now: number) => {
    const dt = Math.min(0.033, Math.max(0, (now - lastTimeRef.current) / 1000));
    lastTimeRef.current = now;

    if (draggingRef.current) {
      const theta = lerp(thetaRef.current, targetAngleRef.current, 0.32);
      const x = lerp(xRef.current, targetXRef.current, 0.3);
      thetaRef.current = theta;
      xRef.current = x;
      applyTransform(theta, x);
      animRef.current = requestAnimationFrame(tick);
      return;
    }

    const k = 18;
    const c = 6;
    const theta = thetaRef.current;
    let omega = omegaRef.current;
    const acceleration = -k * theta - c * omega;
    omega += acceleration * dt;
    const nextTheta = theta + omega * dt;
    omegaRef.current = omega;
    thetaRef.current = nextTheta;
    xRef.current = xRef.current * (1 - Math.min(1, dt * 6));

    applyTransform(nextTheta, xRef.current);

    if (
      Math.abs(nextTheta) < 0.002 &&
      Math.abs(omega) < 0.01 &&
      Math.abs(xRef.current) < 0.2
    ) {
      thetaRef.current = 0;
      omegaRef.current = 0;
      xRef.current = 0;
      applyTransform(0, 0);
      stopAnimation();
      return;
    }

    animRef.current = requestAnimationFrame(tick);
  };

  const startAnimation = () => {
    if (animRef.current) return;
    lastTimeRef.current = performance.now();
    animRef.current = requestAnimationFrame(tick);
  };

  const stopWindowListeners = () => {
    window.removeEventListener("pointermove", handleWindowPointerMove);
    window.removeEventListener("pointerup", handleWindowPointerUp);
    window.removeEventListener("pointercancel", handleWindowPointerUp);
  };

  const handleDragMove = (clientX: number, timeStamp: number) => {
    const dx = clientX - startXRef.current;
    const reduced = reducedMotionRef.current;
    const maxAngle = reduced ? 6 : 16;
    const targetAngleDeg = clamp(dx * 0.06, -maxAngle, maxAngle);
    const targetTranslateX = clamp(dx * 0.35, -60, 60);

    targetAngleRef.current = (targetAngleDeg * Math.PI) / 180;
    targetXRef.current = targetTranslateX;

    const dt = Math.max(1, timeStamp - lastTRef.current);
    vxRef.current = (clientX - lastXRef.current) / dt;
    lastXRef.current = clientX;
    lastTRef.current = timeStamp;

    if (reduced) {
      thetaRef.current = targetAngleRef.current;
      xRef.current = targetXRef.current;
      applyTransform(thetaRef.current, xRef.current);
    }
  };

  const handleDragEnd = () => {
    draggingRef.current = false;
    pointerIdRef.current = null;
    stopWindowListeners();

    if (reducedMotionRef.current) {
      const swingEl = swingRef.current;
      if (swingEl) swingEl.style.transition = "transform 200ms ease-out";
      thetaRef.current = 0;
      xRef.current = 0;
      applyTransform(0, 0);
      reduceTimerRef.current = window.setTimeout(() => {
        const el = swingRef.current;
        if (el) el.style.transition = "";
      }, 220);
      stopAnimation();
      return;
    }

    omegaRef.current = clamp(vxRef.current * 0.002, -2.2, 2.2);
    startAnimation();
  };

  const handleWindowPointerMove = (event: PointerEvent) => {
    if (!draggingRef.current) return;
    if (
      pointerIdRef.current !== null &&
      event.pointerId !== pointerIdRef.current
    )
      return;
    handleDragMove(event.clientX, event.timeStamp);
  };

  const handleWindowPointerUp = (event: PointerEvent) => {
    if (!draggingRef.current) return;
    if (
      pointerIdRef.current !== null &&
      event.pointerId !== pointerIdRef.current
    )
      return;
    handleDragEnd();
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    const el = event.currentTarget;
    el.setPointerCapture(event.pointerId);
    draggingRef.current = true;
    pointerIdRef.current = event.pointerId;
    startXRef.current = event.clientX;
    lastXRef.current = event.clientX;
    lastTRef.current = event.timeStamp;
    if (reduceTimerRef.current) {
      window.clearTimeout(reduceTimerRef.current);
      reduceTimerRef.current = null;
    }
    const swingEl = swingRef.current;
    if (swingEl) swingEl.style.transition = "none";
    startAnimation();
    window.addEventListener("pointermove", handleWindowPointerMove);
    window.addEventListener("pointerup", handleWindowPointerUp);
    window.addEventListener("pointercancel", handleWindowPointerUp);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    handleDragMove(event.clientX, event.timeStamp);
  };

  const handlePointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    event.currentTarget.releasePointerCapture(event.pointerId);
    handleDragEnd();
  };

  return (
    <div className="relative flex h-[620px] w-[360px] items-start justify-center">
      <svg
        className="absolute left-1/2 top-0 h-[220px] w-[200px] -translate-x-1/2"
        viewBox="0 0 200 220"
        fill="none"
      >
        <path
          ref={strapPathRef}
          d="M 100 0 C 100 120, 100 170, 100 180"
          stroke="rgba(163,230,53,0.9)"
          strokeWidth="28"
          strokeLinecap="round"
        />
        <path
          ref={strapHighlightRef}
          d="M 100 0 C 100 120, 100 170, 100 180"
          stroke="rgba(255,255,255,0.2)"
          strokeWidth="6"
          strokeLinecap="round"
        />
      </svg>

      <div
        ref={swingRef}
        className="absolute top-[192px] -translate-x-1/2 origin-top will-change-transform"
        style={{ transform: "translateX(0px) rotate(0rad)" }}
      >
        <div className="flex flex-col items-center">
          <div className="relative z-20 flex h-[150px] w-[180px] items-start justify-center">
            <HookMetal
              className="h-[150px] w-[150px] drop-shadow-[0_18px_28px_rgba(0,0,0,0.45)]"
              ref={specularRef}
            />
          </div>

          <div
            className="touch-none select-none"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            onDragStart={(event) => event.preventDefault()}
          >
            <div className="-mt-8 w-[280px] overflow-hidden rounded-[30px] border border-black/10 bg-white shadow-[0_30px_60px_rgba(0,0,0,0.45)]">
              <div className="relative h-[240px] w-full bg-neutral-100">
                {photo ? (
                  <Image
                    src={photo}
                    alt={`${name} profile`}
                    fill
                    className="object-cover"
                    priority
                    draggable={false}
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <div className="h-24 w-24 rounded-full bg-lime-400/70" />
                  </div>
                )}
              </div>
              <div
                className="relative space-y-2 px-6 pb-6 pt-5 text-neutral-900"
                style={{
                  backgroundImage:
                    "radial-gradient(rgba(0,0,0,0.12) 1px, transparent 0)",
                  backgroundSize: "14px 14px",
                }}
              >
                <div className="inline-flex items-center rounded-full bg-lime-300 px-3 py-1 text-[15px] font-semibold text-neutral-900 shadow-[0_6px_14px_rgba(132,204,22,0.35)]">
                  {name}
                </div>
                <div className="text-[18px] font-semibold tracking-tight">
                  {title}
                </div>
                <div className="pt-4 text-xs font-semibold uppercase tracking-[0.3em] text-neutral-400">
                  Codnut
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HangingBadge;
