"use client";

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, Environment } from "@react-three/drei";
import { useSpring, a } from "@react-spring/three";
import { useDrag } from "@use-gesture/react";
import { Group } from "three";

const DiceModel = () => {
  const { scene } = useGLTF("/models/dice.glb");
  return <primitive object={scene} scale={1.5} position={[0, -1.5, 0]} />;
};

const Scene = () => {
  const autoRotateGroup = useRef<Group>(null);
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

  useFrame((state, delta) => {
    if (autoRotateGroup.current && !isDraggingRef.current) {
      autoRotateGroup.current.rotation.y += delta * 0.2;
    }
  });

  return (
    <>
      <ambientLight intensity={0.5} />
      <spotLight
        position={[10, 10, 10]}
        angle={0.15}
        penumbra={1}
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        castShadow
      />
      <group ref={autoRotateGroup}>
        <a.group
          {...bind()}
          rotation={spring.rotation as unknown as [number, number, number]}
        >
          <DiceModel />
        </a.group>
      </group>
      <Environment preset="city" />
    </>
  );
};

export default function Dice() {
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      camera={{ position: [0, 0, 8], fov: 50 }}
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
