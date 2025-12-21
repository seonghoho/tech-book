"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";
import { PMREMGenerator } from "three";

export default function UXLabClient() {
  const containerRef = useRef<HTMLDivElement>(null);
  const cubeRef = useRef<THREE.Object3D | null>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const container = containerRef.current;
    if (!container) return;

    /** 1) three 기본 세팅 */
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      55,
      container.clientWidth / container.clientHeight,
      0.1,
      100
    );
    camera.position.set(0, 0, 6);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    container.appendChild(renderer.domElement);

    // 조명(유리여도 약간 두는 게 좋아요)
    scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const dir = new THREE.DirectionalLight(0xffffff, 0.8);
    dir.position.set(3, 5, 7);
    scene.add(dir);

    // (옵션) HDR 환경맵 – 유리 반사/굴절 느낌 강화
    let pmrem: PMREMGenerator | null = null;
    const hdrLoader = new RGBELoader();
    pmrem = new PMREMGenerator(renderer);
    hdrLoader.load("/hdr/royal_esplanade_1k.hdr", (hdr) => {
      const envMap = pmrem!.fromEquirectangular(hdr).texture;
      scene.environment = envMap;
      hdr.dispose();
    });

    /** 2) 렌더 루프 */
    let raf = 0;
    const animate = () => {
      renderer.render(scene, camera);
      raf = requestAnimationFrame(animate);
    };
    animate();

    /** 3) 주사위 GLB 로드 */
    const loader = new GLTFLoader();
    loader.load(
      // 네가 방금 export한 파일을 public/models/dice.glb 로 두세요.
      "/models/dice.glb",
      (gltf) => {
        const model = gltf.scene;
        // 필요 시 초기 스케일/정렬
        model.scale.set(1, 1, 1);
        model.position.set(-3, 2, 0);
        // Z가 반대로 보이면 model.rotation.set(?, ?, Math.PI) 같이 조정
        scene.add(model);

        cubeRef.current = model;

        // 드래그/스와이프 회전
        const onPointerMove = (event: PointerEvent) => {
          if (!cubeRef.current) return;
          const { clientX, clientY } = event;
          cubeRef.current.rotation.y = clientX * 0.005;
          cubeRef.current.rotation.x = clientY * 0.005;
        };
        renderer.domElement.addEventListener("pointermove", onPointerMove);
      }
    );

    return () => {
      cancelAnimationFrame(raf);
      renderer.dispose();
      pmrem?.dispose();
      container.removeChild(renderer.domElement);
    };
  }, []);

  return (
    <div className="w-full">
      <div className="flex h-[60vh] items-center justify-center">
        <div ref={containerRef} className="h-full w-full" />
      </div>
    </div>
  );
}
