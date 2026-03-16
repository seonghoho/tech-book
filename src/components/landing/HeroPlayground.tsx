"use client";

import Link from "next/link";
import { IBM_Plex_Mono, Syne } from "next/font/google";
import { useEffect, useRef, useState } from "react";
import { homeHeroContent } from "@/lib/homeContent";
import styles from "./HeroPlayground.module.css";

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const syne = Syne({
  subsets: ["latin"],
  weight: ["500", "700", "800"],
});

type NodeLabel = "Interaction" | "Structure" | "Rendering" | "Writing" | "Three.js";

type NodeBlueprint = {
  id: string;
  label: NodeLabel;
  subLabel: string;
  subLines: string[];
  color: string;
  restLength: number;
  angle: number;
};

type TrailPoint = {
  x: number;
  y: number;
  alpha: number;
  size?: number;
};

type PhysicsNode = NodeBlueprint & {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  scale: number;
  hovered: boolean;
  active: boolean;
  dragging: boolean;
  trail: TrailPoint[];
};

type AnimationState = {
  width: number;
  height: number;
  dpr: number;
  lastFrameTime: number;
  time: number;
  isMobile: boolean;
  pointer: {
    x: number;
    y: number;
    inside: boolean;
    down: boolean;
  };
  press: {
    nodeId: string | null;
    startedAt: number;
    originX: number;
    originY: number;
  };
  hoverNodeId: string | null;
  activeNodeId: string | null;
  draggingNodeId: string | null;
  dragSamples: Array<{ x: number; y: number; time: number }>;
  anchor: {
    x: number;
    y: number;
    radius: number;
  };
  config: {
    trailLength: number;
    springStrength: number;
    repulsionStrength: number;
    mouseRadius: number;
    mouseRepulsion: number;
    mouseInnerRadiusFactor: number;
    mouseVelocityCap: number;
    damping: number;
    bounce: number;
    dragEase: number;
    throwStrength: number;
    pulseRadius: number;
    settleVelocity: number;
    settleDistance: number;
  };
  nodes: PhysicsNode[];
};

type ThemePalette = {
  accentRgb: string;
  gridDot: string;
  vignetteStart: string;
  vignetteMid: string;
  vignetteEnd: string;
  lineBase: string;
  lineActive: string;
  lineGlow: string;
  centerFill: string;
  centerStroke: string;
  centerText: string;
  nodeFill: string;
  nodeText: string;
  nodeSubtle: string;
  nodeSubtleActive: string;
  orbit: string;
};

const nodeBlueprints: NodeBlueprint[] = [
  {
    id: "interaction",
    label: "Interaction",
    subLabel: "hover / drag / gesture",
    subLines: ["hover / drag", "gesture"],
    color: "#6ea8fe",
    restLength: 158,
    angle: -1.46,
  },
  {
    id: "structure",
    label: "Structure",
    subLabel: "component / state",
    subLines: ["component / state"],
    color: "#4dd4ac",
    restLength: 174,
    angle: -0.28,
  },
  {
    id: "rendering",
    label: "Rendering",
    subLabel: "SSR / CSR / perf",
    subLines: ["SSR / CSR", "perf"],
    color: "#c792ea",
    restLength: 168,
    angle: 0.96,
  },
  {
    id: "writing",
    label: "Writing",
    subLabel: "docs / blog / guide",
    subLines: ["docs / blog", "guide"],
    color: "#ffd166",
    restLength: 176,
    angle: 2.08,
  },
  {
    id: "threejs",
    label: "Three.js",
    subLabel: "spatial UI / motion",
    subLines: ["spatial UI", "motion"],
    color: "#ff8fab",
    restLength: 164,
    angle: 3.14,
  },
];

const activeDescriptions: Record<NodeLabel, string> = {
  Interaction: "Complex UI behaviors built with intent",
  Structure: "Systems first, components second",
  Rendering: "Trade-offs between SSR, CSR and performance",
  Writing: "Turning implementation into reusable knowledge",
  "Three.js": "Spatial interfaces and motion experiments",
};

function hexToRgba(hex: string, alpha: number) {
  const value = hex.replace("#", "");
  const bigint = Number.parseInt(value, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

function readThemePalette(element: HTMLElement): ThemePalette {
  const computedStyle = window.getComputedStyle(element);

  return {
    accentRgb: computedStyle.getPropertyValue("--hero-accent-rgb").trim() || "61, 142, 240",
    gridDot:
      computedStyle.getPropertyValue("--hero-grid-dot").trim() || "rgba(226, 236, 255, 0.08)",
    vignetteStart:
      computedStyle.getPropertyValue("--hero-vignette-start").trim() || "rgba(8, 9, 11, 0.78)",
    vignetteMid:
      computedStyle.getPropertyValue("--hero-vignette-mid").trim() || "rgba(8, 9, 11, 0.14)",
    vignetteEnd:
      computedStyle.getPropertyValue("--hero-vignette-end").trim() || "rgba(8, 9, 11, 0.04)",
    lineBase:
      computedStyle.getPropertyValue("--hero-line-base").trim() || "rgba(110, 168, 254, 0.18)",
    lineActive:
      computedStyle.getPropertyValue("--hero-line-active").trim() || "rgba(61, 142, 240, 0.82)",
    lineGlow:
      computedStyle.getPropertyValue("--hero-line-glow").trim() || "rgba(61, 142, 240, 0.56)",
    centerFill:
      computedStyle.getPropertyValue("--hero-center-fill").trim() || "rgba(11, 17, 26, 0.95)",
    centerStroke:
      computedStyle.getPropertyValue("--hero-center-stroke").trim() || "rgba(226, 236, 255, 0.18)",
    centerText: computedStyle.getPropertyValue("--hero-center-text").trim() || "#e2ecff",
    nodeFill: computedStyle.getPropertyValue("--hero-node-fill").trim() || "rgba(11, 15, 23, 0.94)",
    nodeText: computedStyle.getPropertyValue("--hero-node-text").trim() || "#e2ecff",
    nodeSubtle: computedStyle.getPropertyValue("--hero-node-subtle").trim() || "#4a6a8a",
    nodeSubtleActive:
      computedStyle.getPropertyValue("--hero-node-subtle-active").trim() ||
      "rgba(226, 236, 255, 0.76)",
    orbit: computedStyle.getPropertyValue("--hero-orbit").trim() || "rgba(226, 236, 255, 0.4)",
  };
}

function getEventPoint(event: MouseEvent | TouchEvent, element: HTMLElement) {
  const source = "touches" in event ? (event.touches[0] ?? event.changedTouches[0]) : event;
  const rect = element.getBoundingClientRect();

  return {
    x: source.clientX - rect.left,
    y: source.clientY - rect.top,
  };
}

export default function HeroPlayground() {
  const rootRef = useRef<HTMLDivElement>(null);
  const playgroundRef = useRef<HTMLDivElement>(null);
  const bgCanvasRef = useRef<HTMLCanvasElement>(null);
  const fxCanvasRef = useRef<HTMLCanvasElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const activeCardRef = useRef<HTMLDivElement>(null);
  const [isReducedMotion, setIsReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncReducedMotion = () => setIsReducedMotion(mediaQuery.matches);

    syncReducedMotion();
    mediaQuery.addEventListener("change", syncReducedMotion);

    return () => {
      mediaQuery.removeEventListener("change", syncReducedMotion);
    };
  }, []);

  useEffect(() => {
    if (isReducedMotion) {
      return;
    }

    const playgroundElement = playgroundRef.current;
    const rootElement = rootRef.current;
    const bgCanvasElement = bgCanvasRef.current;
    const fxCanvasElement = fxCanvasRef.current;
    const tooltipElement = tooltipRef.current;
    const activeCardElement = activeCardRef.current;

    if (
      !playgroundElement ||
      !rootElement ||
      !bgCanvasElement ||
      !fxCanvasElement ||
      !tooltipElement ||
      !activeCardElement
    ) {
      return;
    }

    const bgCtxSafe = bgCanvasElement.getContext("2d");
    const fxCtxSafe = fxCanvasElement.getContext("2d");

    if (!bgCtxSafe || !fxCtxSafe) {
      return;
    }

    const playground = playgroundElement;
    const root = rootElement;
    const bgCanvas = bgCanvasElement;
    const fxCanvas = fxCanvasElement;
    const tooltip = tooltipElement;
    const activeCard = activeCardElement;
    const bgCtx = bgCtxSafe;
    const fxCtx = fxCtxSafe;
    let themePalette = readThemePalette(root);

    const animationState: AnimationState = {
      width: 0,
      height: 0,
      dpr: Math.min(window.devicePixelRatio || 1, 2),
      lastFrameTime: 0,
      time: 0,
      isMobile: false,
      pointer: {
        x: 0,
        y: 0,
        inside: false,
        down: false,
      },
      press: {
        nodeId: null,
        startedAt: 0,
        originX: 0,
        originY: 0,
      },
      hoverNodeId: null,
      activeNodeId: null,
      draggingNodeId: null,
      dragSamples: [],
      anchor: {
        x: 0,
        y: 0,
        radius: 56,
      },
      config: {
        trailLength: 18,
        springStrength: 0.00155,
        repulsionStrength: 7600,
        mouseRadius: 146,
        mouseRepulsion: 0.68,
        mouseInnerRadiusFactor: 1.18,
        mouseVelocityCap: 2.8,
        damping: 0.955,
        bounce: 0.78,
        dragEase: 0.18,
        throwStrength: 0.22,
        pulseRadius: 24,
        settleVelocity: 0.06,
        settleDistance: 1.4,
      },
      nodes: [],
    };

    let animationFrameId = 0;

    function applyResponsiveConfig() {
      animationState.isMobile = window.innerWidth <= 920;

      animationState.config = animationState.isMobile
        ? {
            trailLength: 10,
            springStrength: 0.00145,
            repulsionStrength: 5200,
            mouseRadius: 96,
            mouseRepulsion: 0.14,
            mouseInnerRadiusFactor: 1.12,
            mouseVelocityCap: 1.8,
            damping: 0.972,
            bounce: 0.72,
            dragEase: 0.16,
            throwStrength: 0.12,
            pulseRadius: 16,
            settleVelocity: 0.05,
            settleDistance: 1.2,
          }
        : {
            trailLength: 18,
            springStrength: 0.00155,
            repulsionStrength: 7600,
            mouseRadius: 118,
            mouseRepulsion: 0.22,
            mouseInnerRadiusFactor: 1.18,
            mouseVelocityCap: 2.8,
            damping: 0.968,
            bounce: 0.78,
            dragEase: 0.18,
            throwStrength: 0.22,
            pulseRadius: 24,
            settleVelocity: 0.06,
            settleDistance: 1.4,
          };
    }

    function syncActiveCard() {
      const activeNode = animationState.nodes.find(
        (node) => node.id === animationState.activeNodeId,
      );

      if (!activeNode) {
        activeCard.classList.remove(styles.visible);
        activeCard.innerHTML = "";
        return;
      }

      activeCard.innerHTML = `<h3 class="${syne.className}">${activeNode.label}</h3><p>${activeDescriptions[activeNode.label]}</p>`;
      activeCard.classList.add(styles.visible);
    }

    function buildNodes() {
      const blueprints = animationState.isMobile ? nodeBlueprints.slice(0, 3) : nodeBlueprints;
      const nodeRadius = animationState.isMobile ? 46 : 60;
      const orbitOffset = animationState.isMobile ? 24 : 34;

      animationState.nodes = blueprints.map((blueprint) => {
        const restLength = blueprint.restLength + orbitOffset;
        const x = animationState.anchor.x + Math.cos(blueprint.angle) * restLength;
        const y = animationState.anchor.y + Math.sin(blueprint.angle) * restLength;

        return {
          ...blueprint,
          restLength,
          x,
          y,
          vx: 0,
          vy: 0,
          radius: nodeRadius,
          scale: 1,
          hovered: false,
          active: false,
          dragging: false,
          trail: [],
        };
      });

      if (
        animationState.activeNodeId &&
        !animationState.nodes.some((node) => node.id === animationState.activeNodeId)
      ) {
        animationState.activeNodeId = null;
      }
    }

    function drawBackgroundGrid() {
      bgCtx.clearRect(0, 0, animationState.width, animationState.height);

      const spacing = 32;
      const offsetX = 8;
      const offsetY = 8;

      for (let y = offsetY; y < animationState.height; y += spacing) {
        for (let x = offsetX; x < animationState.width; x += spacing) {
          bgCtx.beginPath();
          bgCtx.fillStyle = themePalette.gridDot;
          bgCtx.arc(x, y, 1.15, 0, Math.PI * 2);
          bgCtx.fill();
        }
      }

      const vignette = bgCtx.createLinearGradient(0, 0, animationState.width, 0);
      vignette.addColorStop(0, themePalette.vignetteStart);
      vignette.addColorStop(0.32, themePalette.vignetteMid);
      vignette.addColorStop(1, themePalette.vignetteEnd);
      bgCtx.fillStyle = vignette;
      bgCtx.fillRect(0, 0, animationState.width, animationState.height);
    }

    function resizeStage() {
      animationState.dpr = Math.min(window.devicePixelRatio || 1, 2);
      animationState.width = playground.clientWidth;
      animationState.height = playground.clientHeight;
      animationState.anchor.x = animationState.width * (animationState.isMobile ? 0.56 : 0.54);
      animationState.anchor.y = animationState.height * (animationState.isMobile ? 0.54 : 0.5);
      animationState.anchor.radius = animationState.isMobile ? 56 : 66;

      [bgCanvas, fxCanvas].forEach((canvas) => {
        canvas.width = Math.round(animationState.width * animationState.dpr);
        canvas.height = Math.round(animationState.height * animationState.dpr);
        canvas.style.width = `${animationState.width}px`;
        canvas.style.height = `${animationState.height}px`;
      });

      bgCtx.setTransform(animationState.dpr, 0, 0, animationState.dpr, 0, 0);
      fxCtx.setTransform(animationState.dpr, 0, 0, animationState.dpr, 0, 0);

      drawBackgroundGrid();
      buildNodes();
      syncActiveCard();
    }

    function getBounds() {
      return {
        minX: animationState.width * 0.08,
        maxX: animationState.width - 26,
        minY: 24,
        maxY: animationState.height - 24,
      };
    }

    function findNodeAt(x: number, y: number) {
      for (let index = animationState.nodes.length - 1; index >= 0; index -= 1) {
        const node = animationState.nodes[index];
        const radius = node.radius * Math.max(node.scale, 1.08);
        const dx = x - node.x;
        const dy = y - node.y;

        if (dx * dx + dy * dy <= radius * radius) {
          return node;
        }
      }

      return null;
    }

    function updateHoverState() {
      const hoveredNode = animationState.pointer.inside
        ? findNodeAt(animationState.pointer.x, animationState.pointer.y)
        : null;

      animationState.hoverNodeId = hoveredNode ? hoveredNode.id : null;

      animationState.nodes.forEach((node) => {
        node.hovered = node.id === animationState.hoverNodeId;
      });
    }

    function addTrailPoint(node: PhysicsNode) {
      const trailStrength = node.dragging ? 1.12 : 1;

      node.trail.unshift({
        x: node.x,
        y: node.y,
        alpha: 0.9 * trailStrength,
      });

      if (node.trail.length > animationState.config.trailLength) {
        node.trail.length = animationState.config.trailLength;
      }

      node.trail.forEach((point, index) => {
        point.alpha *= node.dragging ? 0.88 : 0.86;
        point.size = (1 - index / animationState.config.trailLength) * node.radius * 0.55;
      });
    }

    function applyNodeRepulsion(dt: number) {
      for (let i = 0; i < animationState.nodes.length; i += 1) {
        for (let j = i + 1; j < animationState.nodes.length; j += 1) {
          const a = animationState.nodes[i];
          const b = animationState.nodes[j];
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const distance = Math.hypot(dx, dy) || 0.001;
          const minDistance = (a.radius + b.radius) * 2.3;

          if (distance > minDistance * 1.5) {
            continue;
          }

          const force =
            animationState.config.repulsionStrength / Math.max(distance * distance, 2000);
          const fx = (dx / distance) * force * dt * 60;
          const fy = (dy / distance) * force * dt * 60;

          if (!a.dragging) {
            a.vx -= fx;
            a.vy -= fy;
          }

          if (!b.dragging) {
            b.vx += fx;
            b.vy += fy;
          }
        }
      }
    }

    function applyMouseRepulsion(node: PhysicsNode, dt: number) {
      if (!animationState.pointer.inside) {
        return;
      }

      const dx = node.x - animationState.pointer.x;
      const dy = node.y - animationState.pointer.y;
      const distance = Math.hypot(dx, dy) || 0.001;

      const innerRadius = node.radius * animationState.config.mouseInnerRadiusFactor;
      const influenceRadius = Math.min(animationState.config.mouseRadius, node.radius * 2.2 + 28);

      if (distance <= innerRadius || distance > influenceRadius) {
        return;
      }

      const strength = (1 - distance / influenceRadius) ** 2 * animationState.config.mouseRepulsion;
      const impulse = strength * dt * 60 * 1.35;

      node.vx += (dx / distance) * impulse;
      node.vy += (dy / distance) * impulse;
      node.vx = Math.max(
        -animationState.config.mouseVelocityCap,
        Math.min(animationState.config.mouseVelocityCap, node.vx),
      );
      node.vy = Math.max(
        -animationState.config.mouseVelocityCap,
        Math.min(animationState.config.mouseVelocityCap, node.vy),
      );
    }

    function applyBoundary(node: PhysicsNode) {
      const bounds = getBounds();
      const radius = node.radius * node.scale;

      if (node.x < bounds.minX + radius) {
        node.x = bounds.minX + radius;
        node.vx *= -animationState.config.bounce;
      } else if (node.x > bounds.maxX - radius) {
        node.x = bounds.maxX - radius;
        node.vx *= -animationState.config.bounce;
      }

      if (node.y < bounds.minY + radius) {
        node.y = bounds.minY + radius;
        node.vy *= -animationState.config.bounce;
      } else if (node.y > bounds.maxY - radius) {
        node.y = bounds.maxY - radius;
        node.vy *= -animationState.config.bounce;
      }
    }

    function updatePhysics(dt: number) {
      updateHoverState();
      applyNodeRepulsion(dt);

      animationState.nodes.forEach((node) => {
        const isDragging = node.id === animationState.draggingNodeId;
        node.dragging = isDragging;
        node.active = node.id === animationState.activeNodeId;

        const dx = animationState.anchor.x - node.x;
        const dy = animationState.anchor.y - node.y;
        const distance = Math.hypot(dx, dy) || 0.001;
        const springForce = (distance - node.restLength) * animationState.config.springStrength;

        if (!isDragging) {
          node.vx += (dx / distance) * springForce * dt * 60;
          node.vy += (dy / distance) * springForce * dt * 60;
          applyMouseRepulsion(node, dt);
        } else {
          const pointerDx = animationState.pointer.x - node.x;
          const pointerDy = animationState.pointer.y - node.y;
          node.vx = node.vx * 0.78 + pointerDx * animationState.config.dragEase;
          node.vy = node.vy * 0.78 + pointerDy * animationState.config.dragEase;
        }

        node.vx *= animationState.config.damping;
        node.vy *= animationState.config.damping;

        const speed = Math.hypot(node.vx, node.vy);
        const restDelta = Math.abs(distance - node.restLength);

        if (
          !isDragging &&
          !node.hovered &&
          !node.active &&
          speed < animationState.config.settleVelocity &&
          restDelta < animationState.config.settleDistance
        ) {
          node.vx = 0;
          node.vy = 0;
        }

        node.x += node.vx;
        node.y += node.vy;

        applyBoundary(node);

        const scaleTarget = isDragging ? 1.22 : node.active ? 1.18 : node.hovered ? 1.1 : 1;
        node.scale += (scaleTarget - node.scale) * 0.16;

        addTrailPoint(node);
      });
    }

    function drawConnections() {
      animationState.nodes.forEach((node) => {
        const isEmphasized = node.hovered || node.active || node.dragging;
        const dx = node.x - animationState.anchor.x;
        const dy = node.y - animationState.anchor.y;
        const distance = Math.hypot(dx, dy) || 0.001;
        const nx = dx / distance;
        const ny = dy / distance;
        const curveOffset = isEmphasized ? 26 : 18;
        const midX = (animationState.anchor.x + node.x) * 0.5;
        const midY = (animationState.anchor.y + node.y) * 0.5;
        const controlX = midX - ny * curveOffset;
        const controlY = midY + nx * curveOffset;

        fxCtx.save();
        fxCtx.beginPath();
        fxCtx.moveTo(animationState.anchor.x, animationState.anchor.y);
        fxCtx.quadraticCurveTo(controlX, controlY, node.x, node.y);
        fxCtx.lineWidth = isEmphasized ? 2.4 : 1.4;
        fxCtx.strokeStyle = isEmphasized ? themePalette.lineActive : themePalette.lineBase;
        fxCtx.shadowBlur = isEmphasized ? 18 : 0;
        fxCtx.shadowColor = isEmphasized ? themePalette.lineGlow : "transparent";
        fxCtx.stroke();
        fxCtx.restore();
      });
    }

    function drawTrails() {
      animationState.nodes.forEach((node) => {
        node.trail.forEach((point, index) => {
          const alpha = point.alpha * (1 - index / animationState.config.trailLength);
          if (alpha < 0.04) {
            return;
          }

          fxCtx.beginPath();
          fxCtx.fillStyle = hexToRgba(node.color, alpha * 0.28);
          fxCtx.arc(point.x, point.y, Math.max(point.size ?? 2, 1.5), 0, Math.PI * 2);
          fxCtx.fill();
        });
      });
    }

    function drawPulseRings() {
      const phases = [0, 2.1, 4.2];
      const baseRadius = animationState.anchor.radius + animationState.config.pulseRadius;

      phases.forEach((phase, index) => {
        const pulse = 0.5 + 0.5 * Math.sin(animationState.time * 1.25 + phase);
        const radius = baseRadius + pulse * 18 + index * 6;
        const alpha = 0.11 + pulse * 0.12;

        fxCtx.beginPath();
        fxCtx.strokeStyle = `rgba(${themePalette.accentRgb}, ${alpha.toFixed(3)})`;
        fxCtx.lineWidth = 1.2;
        fxCtx.arc(animationState.anchor.x, animationState.anchor.y, radius, 0, Math.PI * 2);
        fxCtx.stroke();
      });
    }

    function drawCenterNode() {
      const drawX = Math.round(animationState.anchor.x);
      const drawY = Math.round(animationState.anchor.y);
      const gradient = fxCtx.createRadialGradient(
        drawX,
        drawY,
        12,
        drawX,
        drawY,
        animationState.anchor.radius * 1.8,
      );
      gradient.addColorStop(0, `rgba(${themePalette.accentRgb}, 0.42)`);
      gradient.addColorStop(1, `rgba(${themePalette.accentRgb}, 0)`);

      fxCtx.beginPath();
      fxCtx.fillStyle = gradient;
      fxCtx.arc(drawX, drawY, animationState.anchor.radius * 1.8, 0, Math.PI * 2);
      fxCtx.fill();

      fxCtx.beginPath();
      fxCtx.fillStyle = themePalette.centerFill;
      fxCtx.arc(drawX, drawY, animationState.anchor.radius, 0, Math.PI * 2);
      fxCtx.fill();

      fxCtx.lineWidth = 1.5;
      fxCtx.strokeStyle = themePalette.centerStroke;
      fxCtx.stroke();

      fxCtx.fillStyle = themePalette.centerText;
      fxCtx.textAlign = "center";
      fxCtx.textBaseline = "middle";
      fxCtx.font = `700 ${animationState.isMobile ? 18 : 23}px Syne, sans-serif`;
      fxCtx.fillText("Interaction", drawX, drawY - 10);
      fxCtx.fillText("System", drawX, drawY + 16);
    }

    function drawNode(node: PhysicsNode) {
      const drawX = Math.round(node.x);
      const drawY = Math.round(node.y);
      const radius = node.radius * node.scale;
      const haloRadius = radius * (node.hovered || node.dragging ? 2.6 : 1.9);
      const haloAlpha = node.hovered || node.dragging ? 0.22 : node.active ? 0.16 : 0.1;
      const halo = fxCtx.createRadialGradient(drawX, drawY, radius * 0.3, drawX, drawY, haloRadius);
      halo.addColorStop(0, hexToRgba(node.color, haloAlpha));
      halo.addColorStop(1, hexToRgba(node.color, 0));

      fxCtx.beginPath();
      fxCtx.fillStyle = halo;
      fxCtx.arc(drawX, drawY, haloRadius, 0, Math.PI * 2);
      fxCtx.fill();

      if (node.active) {
        fxCtx.save();
        fxCtx.beginPath();
        fxCtx.setLineDash([8, 6]);
        fxCtx.lineDashOffset = -animationState.time * 70;
        fxCtx.strokeStyle = themePalette.orbit;
        fxCtx.lineWidth = 1.2;
        fxCtx.arc(drawX, drawY, radius + 11, 0, Math.PI * 2);
        fxCtx.stroke();
        fxCtx.restore();
      }

      fxCtx.beginPath();
      fxCtx.fillStyle = themePalette.nodeFill;
      fxCtx.arc(drawX, drawY, radius, 0, Math.PI * 2);
      fxCtx.fill();

      fxCtx.strokeStyle = hexToRgba(node.color, node.hovered || node.active ? 0.92 : 0.6);
      fxCtx.lineWidth = node.hovered || node.active ? 2.4 : 1.6;
      fxCtx.shadowBlur = node.hovered || node.active ? 16 : 0;
      fxCtx.shadowColor = hexToRgba(node.color, 0.42);
      fxCtx.stroke();
      fxCtx.shadowBlur = 0;

      fxCtx.fillStyle = node.color;
      fxCtx.beginPath();
      fxCtx.arc(drawX, drawY - radius * 0.44, 4.8, 0, Math.PI * 2);
      fxCtx.fill();

      fxCtx.fillStyle = themePalette.nodeText;
      fxCtx.textAlign = "center";
      fxCtx.textBaseline = "middle";
      fxCtx.font = `700 ${animationState.isMobile ? 16 : 20}px Syne, sans-serif`;
      fxCtx.fillText(node.label, drawX, drawY - (node.subLines.length > 1 ? 10 : 7));

      fxCtx.fillStyle =
        node.hovered || node.active ? themePalette.nodeSubtleActive : themePalette.nodeSubtle;
      fxCtx.font = `500 ${animationState.isMobile ? 10 : 11}px "IBM Plex Mono", monospace`;

      const subLineStartY = drawY + (node.subLines.length > 1 ? 10 : 16);

      node.subLines.forEach((line, lineIndex) => {
        fxCtx.fillText(line, drawX, subLineStartY + lineIndex * 13);
      });
    }

    function renderScene() {
      fxCtx.clearRect(0, 0, animationState.width, animationState.height);
      drawConnections();
      drawTrails();
      drawPulseRings();
      drawCenterNode();
      animationState.nodes.forEach(drawNode);
    }

    function syncTooltip() {
      const hoveredNode = animationState.nodes.find(
        (node) => node.id === animationState.hoverNodeId,
      );

      if (!hoveredNode || animationState.draggingNodeId) {
        tooltip.classList.remove(styles.visible);
        return;
      }

      tooltip.textContent = hoveredNode.subLabel;
      tooltip.classList.add(styles.visible);
      tooltip.style.transform = `translate3d(${Math.min(
        animationState.pointer.x + 18,
        animationState.width - 180,
      )}px, ${Math.max(18, animationState.pointer.y - 28)}px, 0)`;
    }

    function onPointerEnter() {
      animationState.pointer.inside = true;
    }

    function onPointerLeave() {
      if (animationState.pointer.down) {
        return;
      }

      animationState.pointer.inside = false;
      animationState.hoverNodeId = null;
      tooltip.classList.remove(styles.visible);
    }

    function beginDrag(nodeId: string) {
      animationState.draggingNodeId = nodeId;
      animationState.activeNodeId = nodeId;
      animationState.dragSamples.length = 0;
      syncActiveCard();
    }

    function recordDragSample(x: number, y: number) {
      animationState.dragSamples.push({
        x,
        y,
        time: performance.now(),
      });

      if (animationState.dragSamples.length > 5) {
        animationState.dragSamples.shift();
      }
    }

    function applyThrowVelocity(node: PhysicsNode) {
      if (animationState.dragSamples.length < 2) {
        return;
      }

      const last = animationState.dragSamples[animationState.dragSamples.length - 1];
      const first = animationState.dragSamples[Math.max(0, animationState.dragSamples.length - 4)];
      const elapsed = Math.max(16, last.time - first.time);
      const velocityScale = animationState.config.throwStrength * (1000 / elapsed);

      node.vx += (last.x - first.x) * velocityScale;
      node.vy += (last.y - first.y) * velocityScale;
    }

    function onPointerDown(event: MouseEvent | TouchEvent) {
      const point = getEventPoint(event, playground);
      const hitNode = findNodeAt(point.x, point.y);

      animationState.pointer.down = true;
      animationState.pointer.inside = true;
      animationState.pointer.x = point.x;
      animationState.pointer.y = point.y;
      animationState.press.nodeId = hitNode ? hitNode.id : null;
      animationState.press.startedAt = performance.now();
      animationState.press.originX = point.x;
      animationState.press.originY = point.y;
      animationState.dragSamples = [];

      if (event.cancelable) {
        event.preventDefault();
      }
    }

    function onPointerMove(event: MouseEvent | TouchEvent) {
      const point = getEventPoint(event, playground);
      animationState.pointer.x = point.x;
      animationState.pointer.y = point.y;
      animationState.pointer.inside = true;

      if (!animationState.pointer.down || !animationState.press.nodeId) {
        return;
      }

      const moved = Math.hypot(
        point.x - animationState.press.originX,
        point.y - animationState.press.originY,
      );

      if (!animationState.draggingNodeId && moved > 6) {
        beginDrag(animationState.press.nodeId);
      }

      if (animationState.draggingNodeId) {
        recordDragSample(point.x, point.y);
      }

      if (event.cancelable) {
        event.preventDefault();
      }
    }

    function onPointerUp(event: MouseEvent | TouchEvent) {
      const point = getEventPoint(event, playground);
      const hitNode = findNodeAt(point.x, point.y);

      if (animationState.draggingNodeId) {
        const draggedNode = animationState.nodes.find(
          (node) => node.id === animationState.draggingNodeId,
        );

        if (draggedNode) {
          applyThrowVelocity(draggedNode);
        }
      } else if (
        animationState.press.nodeId &&
        hitNode &&
        hitNode.id === animationState.press.nodeId
      ) {
        animationState.activeNodeId =
          animationState.activeNodeId === hitNode.id ? null : hitNode.id;
        syncActiveCard();
      }

      animationState.pointer.down = false;
      animationState.draggingNodeId = null;
      animationState.press.nodeId = null;
      animationState.dragSamples.length = 0;
    }

    function loop(now: number) {
      animationFrameId = window.requestAnimationFrame(loop);

      if (now - animationState.lastFrameTime < 14) {
        return;
      }

      const dt = Math.min((now - animationState.lastFrameTime || 16) / 1000, 0.022);
      animationState.lastFrameTime = now;
      animationState.time = now * 0.001;

      updatePhysics(dt);
      renderScene();
      syncTooltip();
    }

    const resizeObserver = new ResizeObserver(() => {
      applyResponsiveConfig();
      resizeStage();
    });
    const themeObserver = new MutationObserver(() => {
      themePalette = readThemePalette(root);
      drawBackgroundGrid();
    });

    applyResponsiveConfig();
    themePalette = readThemePalette(root);
    resizeStage();
    animationState.lastFrameTime = performance.now();

    resizeObserver.observe(playground);
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    playground.addEventListener("mouseenter", onPointerEnter);
    playground.addEventListener("mouseleave", onPointerLeave);
    playground.addEventListener("mousedown", onPointerDown);
    window.addEventListener("mousemove", onPointerMove);
    window.addEventListener("mouseup", onPointerUp);
    playground.addEventListener("touchstart", onPointerDown, { passive: false });
    window.addEventListener("touchmove", onPointerMove, { passive: false });
    window.addEventListener("touchend", onPointerUp, { passive: false });
    animationFrameId = window.requestAnimationFrame(loop);

    return () => {
      resizeObserver.disconnect();
      themeObserver.disconnect();
      window.cancelAnimationFrame(animationFrameId);
      playground.removeEventListener("mouseenter", onPointerEnter);
      playground.removeEventListener("mouseleave", onPointerLeave);
      playground.removeEventListener("mousedown", onPointerDown);
      window.removeEventListener("mousemove", onPointerMove);
      window.removeEventListener("mouseup", onPointerUp);
      playground.removeEventListener("touchstart", onPointerDown);
      window.removeEventListener("touchmove", onPointerMove);
      window.removeEventListener("touchend", onPointerUp);
    };
  }, [isReducedMotion]);

  return (
    <div
      ref={rootRef}
      className={`${styles.heroWidget} ${isReducedMotion ? styles.reducedMotion : ""}`}
      data-reveal-item
    >
      <div className={`${styles.statusBar} ${mono.className}`}>
        <span className={styles.statusDot}></span>
        <span>AVAILABLE</span>
      </div>

      <div className={styles.heroCopy}>
        <div className={styles.copyStack}>
          <p className={`${styles.eyebrow} ${mono.className}`}>Frontend Engineer · Tech Writing</p>
          <div>
            <h2 className={`${styles.name} ${syne.className}`}>Choi Seongho</h2>
            <p className={`${styles.role} ${mono.className}`}>Frontend Engineer · Tech Writing</p>
          </div>
          <p className={`${styles.headline} ${syne.className}`}>{homeHeroContent.headline}</p>
          <p className={`${styles.subcopy} ${mono.className}`}>{homeHeroContent.description}</p>
        </div>

        <div className={styles.ctaRow}>
          <Link
            href={homeHeroContent.primaryAction.href}
            className={`${styles.cta} ${styles.ctaPrimary} ${mono.className}`}
          >
            {homeHeroContent.primaryAction.label}
          </Link>
          <Link
            href={homeHeroContent.secondaryAction.href}
            className={`${styles.cta} ${mono.className}`}
          >
            {homeHeroContent.secondaryAction.label}
          </Link>
        </div>
      </div>

      <div ref={playgroundRef} className={styles.playground}>
        <canvas ref={bgCanvasRef} className={styles.playgroundCanvas}></canvas>
        <canvas ref={fxCanvasRef} className={styles.playgroundCanvas}></canvas>

        <div className={styles.overlayUi}>
          <div ref={tooltipRef} className={`${styles.tooltip} ${mono.className}`}></div>
          <div ref={activeCardRef} className={`${styles.activeCard} ${mono.className}`}></div>
          <div className={`${styles.hint} ${mono.className}`}>drag · hover · click nodes</div>
        </div>

        <div className={styles.fallback}>
          <h2 className={syne.className}>Interaction System</h2>
          <p className={mono.className}>
            모션 감소 환경에서는 실시간 피직스 대신 구조적 키워드와 기술 글쓰기 브랜딩을 정적인
            카드로 보여줍니다.
          </p>
        </div>
      </div>
    </div>
  );
}
