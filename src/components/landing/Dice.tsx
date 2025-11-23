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

const Scene = () => {
  const group = useRef<Group>(null);
  const isDraggingRef = useRef(false);

  const [spring, api] = useSpring(() => ({
    rotation: [0, 0, 0] as [number, number, number],
    config: { friction: 25, tension: 180 },
  }));

  const bind = useDrag(({ active, offset: [oy, ox] }) => {
    isDraggingRef.current = active;
    api.start({
      rotation: [ox / 100, oy / 100, 0],
    });
    return active;
  });

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
          {...bind()}
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
        <Vignette eskil={false} offset={0.1} darkness={1.1} />
      </EffectComposer>
    </>
  );
};

export default function Dice() {
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      camera={{ position: [0, 0, 8], fov: 40 }}
      style={{
        width: "100%",
        height: "100%",
        touchAction: "none",
        cursor: "grab",
      }}
    >
      <Scene />
    </Canvas>
  );
}

useGLTF.preload("/models/dice.glb");
