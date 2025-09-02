"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";
import { PMREMGenerator } from "three";

export default function UXLabPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const cubeRef = useRef<THREE.Object3D | null>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    if (!containerRef.current) return;

    /** 1) three 기본 세팅 */
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      55,
      containerRef.current.clientWidth / containerRef.current.clientHeight,
      0.1,
      100
    );
    camera.position.set(0, 0, 6);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(
      containerRef.current.clientWidth,
      containerRef.current.clientHeight
    );
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    containerRef.current.appendChild(renderer.domElement);

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
      },
      undefined,
      (err) => console.error("GLB load error:", err)
    );

    /** 4) GSAP + ScrollTrigger */
    const cubePos = { x: -3, y: 2, z: 0 };
    const cubeRot = { x: Math.PI / 5, y: Math.PI / 4, z: 0 };
    const cubeScale = { x: 1, y: 1, z: 1 };

    // 로드된 모델에 매 프레임 적용
    const ticker = () => {
      const m = cubeRef.current;
      if (m) {
        m.position.set(cubePos.x, cubePos.y, cubePos.z);
        m.rotation.set(cubeRot.x, cubeRot.y, cubeRot.z);
        m.scale.set(cubeScale.x, cubeScale.y, cubeScale.z);
      }
    };
    gsap.ticker.add(ticker);

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: "#ux-lab-trigger",
        start: "top top",
        end: "+=2500",
        scrub: true,
        pin: "#ux-lab-canvas-wrapper",
        // markers: true,
      },
      defaults: { ease: "power2.inOut" },
    });

    tl.to(cubePos, { x: 0, y: 0, z: 0, duration: 1 }, 0)
      .to(
        cubeRot,
        {
          x: "+=" + Math.PI * 2,
          y: "+=" + Math.PI * 1,
          z: "+=" + Math.PI * 0.5,
          duration: 1,
        },
        0
      )
      .to(
        cubeRot,
        { x: "+=" + Math.PI * 2, y: "+=" + Math.PI * 2, duration: 1 },
        1
      )
      .to(cubeScale, { x: 2, y: 2, z: 2, duration: 0.8 }, 2)
      .to(
        cubePos,
        { x: 3, y: -2, z: 0, duration: 0.8, ease: "back.inOut(2)" },
        2
      )
      .to(cubePos, { y: 5, duration: 0.8, ease: "power1.in" }, 2.8);

    ScrollTrigger.refresh();

    /** 5) 리사이즈 대응 */
    const onResize = () => {
      if (!containerRef.current) return;
      const w = containerRef.current.clientWidth;
      const h = containerRef.current.clientHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    window.addEventListener("resize", onResize);

    /** 6) 정리 */
    return () => {
      window.removeEventListener("resize", onResize);
      gsap.ticker.remove(ticker);
      ScrollTrigger.getAll().forEach((t) => t.kill());
      cancelAnimationFrame(raf);
      renderer.dispose();
      pmrem?.dispose();
      scene.traverse((obj: THREE.Object3D) => {
        if ((obj as THREE.Mesh).isMesh) {
          const mesh = obj as THREE.Mesh;
          mesh.geometry?.dispose?.();
          if (Array.isArray(mesh.material)) {
            mesh.material.forEach((m: THREE.Material) => m.dispose?.());
          } else {
            (mesh.material as THREE.Material)?.dispose?.();
          }
        }
      });
    };
  }, []);

  return (
    <div
      id="ux-lab-trigger"
      style={{
        minHeight: "3500px",
        background: "linear-gradient(180deg, #fafbff 0%, #d7e0fa 100%)",
      }}
    >
      <div
        id="ux-lab-canvas-wrapper"
        ref={containerRef}
        style={{
          width: "100%",
          height: "100vh",
          position: "sticky",
          top: 0,
          zIndex: 2,
        }}
      />
    </div>
  );
}
