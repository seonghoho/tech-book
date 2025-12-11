"use client";

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, Environment } from "@react-three/drei";
import { useSpring, a } from "@react-spring/three";
import { useDrag } from "@use-gesture/react";
import { Group, MathUtils } from "three";
import {
  EffectComposer,
  Bloom,
  DepthOfField,
  Noise,
  Vignette,
} from "@react-three/postprocessing";

const DiceModel = () => {
  const { scene } = useGLTF("/models/dice.glb");
  return <primitive object={scene} scale={1.5} position={[0, -1.5, 0]} />;
};

const Scene = ({
  dragTarget,
}: {
  dragTarget: React.MutableRefObject<HTMLDivElement | null>;
}) => {
  const group = useRef<Group>(null);
  const isDraggingRef = useRef(false);

  const [spring, api] = useSpring(() => ({
    rotation: [8, 0, 0] as [number, number, number],
    config: { friction: 50, tension: 180 },
  }));

  useDrag(
    ({ active, xy: [x, y] }) => {
      isDraggingRef.current = active;
      const rect = dragTarget.current?.getBoundingClientRect();
      if (!rect) return active;
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const deltaX = x - centerX;
      const deltaY = y - centerY;
      api.start({
        rotation: [deltaY / 120, deltaX / 120, 0],
      });
      return active;
    },
    { target: dragTarget }
  );

  useFrame((state) => {
    if (group.current && !isDraggingRef.current) {
      const t = state.clock.getElapsedTime();
      group.current.rotation.x = MathUtils.lerp(
        group.current.rotation.x,
        Math.cos(t / 2) / 20,
        0.1
      );
      group.current.rotation.y = MathUtils.lerp(
        group.current.rotation.y,
        Math.sin(t / 1) / 20,
        0.1
      );
      group.current.rotation.z = MathUtils.lerp(
        group.current.rotation.z,
        Math.sin(t / 1.5) / 20,
        0.1
      );
      group.current.position.y = MathUtils.lerp(
        group.current.position.y,
        (-2 + Math.sin(t)) / 2,
        0.1
      );
    }
  });

  return (
    <>
      <ambientLight intensity={1} />
      <spotLight
        position={[10, 10, 10]}
        angle={0.15}
        penumbra={1}
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        castShadow
      />
      <group ref={group}>
        <a.group
          rotation={spring.rotation as unknown as [number, number, number]}
        >
          <DiceModel />
        </a.group>
      </group>
      <Environment preset="city" />
      <EffectComposer>
        <Bloom luminanceThreshold={0.3} luminanceSmoothing={0.9} height={300} />
        <DepthOfField
          focusDistance={0}
          focalLength={0.02}
          bokehScale={2}
          height={480}
        />
        <Noise opacity={0.02} />
        <Vignette eskil={false} offset={0.1} darkness={0} />
      </EffectComposer>
    </>
  );
};

export default function Dice() {
  const dragSurfaceRef = useRef<HTMLDivElement>(null);

  return (
    <div className="relative h-full w-full">
      <Canvas
        shadows
        dpr={[1, 2]}
        gl={{ alpha: true, antialias: true }}
        camera={{ position: [0, 0, 8], fov: 40 }}
        onCreated={({ gl }) => {
          gl.setClearColor("#000000", 0);
        }}
        style={{
          width: "100%",
          height: "100%",
          touchAction: "none",
          cursor: "grab",
          background: "transparent",
        }}
      >
        <Scene dragTarget={dragSurfaceRef} />
      </Canvas>
      <div
        ref={dragSurfaceRef}
        className="absolute inset-0 rounded-2xl cursor-grab active:cursor-grabbing"
        aria-hidden
      />
    </div>
  );
}

useGLTF.preload("/models/dice.glb");
