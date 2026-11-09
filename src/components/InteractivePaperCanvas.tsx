"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";

interface InteractivePaperCanvasProps {
  step: number;
  findingCount?: number;
}

export const InteractivePaperCanvas: React.FC<InteractivePaperCanvasProps> = ({
  step,
  findingCount = 0,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [useFallback, setUseFallback] = useState(false);
  const stepRef = useRef(step);
  stepRef.current = step;
  const findingCountRef = useRef(findingCount);
  findingCountRef.current = findingCount;

  useEffect(() => {
    setMounted(true);
    // Check for prefers-reduced-motion
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setUseFallback(true);
      return;
    }

    const container = mountRef.current;
    if (!container) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        alpha: true,
        powerPreference: "low-power",
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    } catch {
      setUseFallback(true);
      return;
    }

    const width = container.clientWidth || 320;
    const height = container.clientHeight || 260;
    renderer.setSize(width, height);
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 100);
    camera.position.set(0, 0, 4.2);

    // Soft editorial lighting
    const ambientLight = new THREE.AmbientLight(0xfcfbf9, 1.3);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xfffaed, 0.9);
    dirLight.position.set(2, 4, 3);
    scene.add(dirLight);

    function isDarkTheme() {
      if (typeof document === "undefined") return false;
      const theme = document.documentElement.getAttribute("data-theme");
      if (theme === "ink") return true;
      if (theme === "system") {
        return window.matchMedia("(prefers-color-scheme: dark)").matches;
      }
      return false;
    }

    // Create realistic paper texture with faint question lines and exam header
    function createPaperTexture(mode: "clean" | "annotated" | "key") {
      const canvas = document.createElement("canvas");
      canvas.width = 512;
      canvas.height = 724;
      const ctx = canvas.getContext("2d");
      if (!ctx) return new THREE.CanvasTexture(canvas);

      const dark = isDarkTheme();
      const paperBg = dark ? "#1C1C1A" : "#FBFAF6";
      const inkColor = dark ? "#FBFAF6" : "#1A1A18";
      const inkSec = dark ? "#A8A59B" : "#5C5A54";
      const ruleColor = dark ? "#2E2E2A" : "#ECE7DA";
      const marginColor = dark ? "#522320" : "#EADCD9";
      const redColor = dark ? "#E05347" : "#C8372D";

      // Paper surface
      ctx.fillStyle = paperBg;
      ctx.fillRect(0, 0, 512, 724);

      // Ruled margin on left (1px hairline)
      ctx.strokeStyle = marginColor;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(68, 0);
      ctx.lineTo(68, 724);
      ctx.stroke();

      // Top header line
      ctx.strokeStyle = inkColor;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(85, 60);
      ctx.lineTo(440, 60);
      ctx.stroke();

      // Header text
      ctx.fillStyle = inkColor;
      ctx.font = "bold 13px serif";
      ctx.fillText(
        mode === "key" ? "CONFIDENTIAL ANSWER KEY" : "PRAYAAS ASSESSMENT",
        85,
        52
      );

      // Faint question rules
      ctx.fillStyle = inkSec;
      ctx.font = "10px sans-serif";
      for (let y = 95; y < 660; y += 26) {
        ctx.strokeStyle = ruleColor;
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        ctx.moveTo(85, y);
        ctx.lineTo(445, y);
        ctx.stroke();
      }

      // Sample question text mock lines
      ctx.fillStyle = inkColor;
      ctx.font = "11px monospace";
      ctx.fillText("Q1. Calculate 3/4 + 1/4. [3m]", 85, 115);
      ctx.fillText("Q2. Which is prime? 2,3,4,6", 85, 167);
      ctx.fillText("Q3. Velocity v = u + at [3m]", 85, 219);
      ctx.fillText("Q4. Area of square [3m]", 85, 271);
      ctx.fillText("Q5. Linear equation 5x-7=18", 85, 323);

      // Red pen annotation marks for Step 3
      if (mode === "annotated") {
        ctx.strokeStyle = redColor;
        ctx.lineWidth = 2.2;
        ctx.lineCap = "round";

        // Red circle around Q2 ambiguity
        ctx.beginPath();
        ctx.ellipse(220, 165, 80, 16, -0.05, 0, Math.PI * 2);
        ctx.stroke();

        // Red tick on Q1
        ctx.beginPath();
        ctx.moveTo(420, 110);
        ctx.lineTo(426, 118);
        ctx.lineTo(438, 104);
        ctx.stroke();

        // Red margin note
        ctx.fillStyle = redColor;
        ctx.font = "bold 11px sans-serif";
        ctx.fillText("! 2 primes", 20, 170);
      }

      const texture = new THREE.CanvasTexture(canvas);
      texture.anisotropy = 2;
      return texture;
    }

    let cleanTexture = createPaperTexture("clean");
    let annotatedTexture = createPaperTexture("annotated");
    let keyTexture = createPaperTexture("key");

    // Geometry: Standard paper ratio (1 : 1.414) with slight curl
    const geom = new THREE.PlaneGeometry(1.5, 2.12, 16, 16);
    const pos = geom.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const z = Math.sin((x + 0.75) * 1.8) * 0.02 + Math.cos((y + 1.06) * 1.5) * 0.015;
      pos.setZ(i, z);
    }
    geom.computeVertexNormals();

    const matSheet1 = new THREE.MeshStandardMaterial({
      map: cleanTexture,
      roughness: 0.92,
      metalness: 0.0,
      side: THREE.DoubleSide,
    });

    const matSheet2 = new THREE.MeshStandardMaterial({
      map: cleanTexture,
      roughness: 0.95,
      metalness: 0.0,
      side: THREE.DoubleSide,
    });

    const matSheet3 = new THREE.MeshStandardMaterial({
      map: keyTexture,
      roughness: 0.95,
      metalness: 0.0,
      side: THREE.DoubleSide,
    });

    const sheet1 = new THREE.Mesh(geom, matSheet1);
    const sheet2 = new THREE.Mesh(geom, matSheet2);
    const sheet3 = new THREE.Mesh(geom, matSheet3);

    scene.add(sheet1);
    scene.add(sheet2);
    scene.add(sheet3);

    sheet2.visible = false;
    sheet3.visible = false;

    // React to theme changes
    const handleThemeChange = () => {
      cleanTexture.dispose();
      annotatedTexture.dispose();
      keyTexture.dispose();
      cleanTexture = createPaperTexture("clean");
      annotatedTexture = createPaperTexture("annotated");
      keyTexture = createPaperTexture("key");
      matSheet1.map = stepRef.current === 3 ? annotatedTexture : cleanTexture;
      matSheet2.map = cleanTexture;
      matSheet3.map = keyTexture;
      matSheet1.needsUpdate = true;
      matSheet2.needsUpdate = true;
      matSheet3.needsUpdate = true;
    };

    window.addEventListener("papercheck-theme-change", handleThemeChange);

    // Mouse tracking with damped ~8° maximum tilt
    let targetRotX = 0;
    let targetRotY = 0;
    const maxTiltRad = (8 * Math.PI) / 180;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const y = -(((e.clientY - rect.top) / rect.height) * 2 - 1);
      targetRotY = THREE.MathUtils.clamp(x * 0.15, -maxTiltRad, maxTiltRad);
      targetRotX = THREE.MathUtils.clamp(-y * 0.12, -maxTiltRad, maxTiltRad);
    };

    const handleScroll = () => {
      const scrollY = window.scrollY;
      sheet1.position.y = Math.sin(scrollY * 0.002) * 0.05;
    };

    const handleResize = () => {
      if (!container) return;
      const newWidth = container.clientWidth || 320;
      const newHeight = container.clientHeight || 260;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleResize);

    const observer = new ResizeObserver(handleResize);
    observer.observe(container);

    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);

      // Dampened rotation interpolation (calm mechanical movement)
      sheet1.rotation.x += (targetRotX - sheet1.rotation.x) * 0.08;
      sheet1.rotation.y += (targetRotY - sheet1.rotation.y) * 0.08;

      const currentStep = stepRef.current;

      if (currentStep === 1) {
        // Step 1: Single blank ruled sheet, resting gently
        sheet1.position.x += (0 - sheet1.position.x) * 0.09;
        sheet1.position.z += (0 - sheet1.position.z) * 0.09;
        sheet1.rotation.z += (0 - sheet1.rotation.z) * 0.09;
        matSheet1.map = cleanTexture;

        sheet2.visible = false;
        sheet3.visible = false;
      } else if (currentStep === 2) {
        // Step 2: Confirmation - second sheet peeks behind
        sheet1.position.x += (-0.08 - sheet1.position.x) * 0.09;
        sheet1.position.z += (0 - sheet1.position.z) * 0.09;
        sheet1.rotation.z += (-0.02 - sheet1.rotation.z) * 0.09;
        matSheet1.map = cleanTexture;

        sheet2.visible = true;
        sheet2.position.x += (0.12 - sheet2.position.x) * 0.09;
        sheet2.position.y += (-0.04 - sheet2.position.y) * 0.09;
        sheet2.position.z += (-0.15 - sheet2.position.z) * 0.09;
        sheet2.rotation.set(sheet1.rotation.x, sheet1.rotation.y, 0.04);

        sheet3.visible = false;
      } else if (currentStep === 3) {
        // Step 3: Review Findings - Red-pen markings appear on sheet
        sheet1.position.x += (0 - sheet1.position.x) * 0.09;
        sheet1.position.z += (0.05 - sheet1.position.z) * 0.09;
        sheet1.rotation.z += (0.01 - sheet1.rotation.z) * 0.09;
        matSheet1.map = annotatedTexture;

        sheet2.visible = true;
        sheet2.position.x += (-0.18 - sheet2.position.x) * 0.09;
        sheet2.position.y += (-0.02 - sheet2.position.y) * 0.09;
        sheet2.position.z += (-0.2 - sheet2.position.z) * 0.09;
        sheet2.rotation.set(sheet1.rotation.x, sheet1.rotation.y, -0.05);

        sheet3.visible = false;
      } else if (currentStep === 4) {
        // Step 4: Export - Two clean stacks (Question Paper + Answer Key)
        sheet1.position.x += (-0.48 - sheet1.position.x) * 0.09;
        sheet1.position.y += (0 - sheet1.position.y) * 0.09;
        sheet1.position.z += (0 - sheet1.position.z) * 0.09;
        sheet1.rotation.z += (-0.02 - sheet1.rotation.z) * 0.09;
        matSheet1.map = cleanTexture;

        sheet2.visible = false;

        sheet3.visible = true;
        sheet3.position.x += (0.52 - sheet3.position.x) * 0.09;
        sheet3.position.y += (0 - sheet3.position.y) * 0.09;
        sheet3.position.z += (0 - sheet3.position.z) * 0.09;
        sheet3.rotation.set(sheet1.rotation.x, sheet1.rotation.y, 0.02);
      }

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animId);
      observer.disconnect();
      window.removeEventListener("papercheck-theme-change", handleThemeChange);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
      geom.dispose();
      cleanTexture.dispose();
      annotatedTexture.dispose();
      keyTexture.dispose();
      matSheet1.dispose();
      matSheet2.dispose();
      matSheet3.dispose();
    };
  }, []);

  if (!mounted || useFallback) {
    // Accessible, theme-reactive SVG fallback
    return (
      <div
        aria-hidden="true"
        className="w-full h-56 flex items-center justify-center select-none"
      >
        <svg
          viewBox="0 0 240 310"
          className="w-48 h-64 drop-shadow-[0_2px_8px_rgba(26,26,24,0.06)]"
        >
          <rect
            x="10"
            y="10"
            width="220"
            height="290"
            rx="2"
            fill="var(--paper-surface)"
            stroke="var(--ink-rule)"
            strokeWidth="1.2"
          />
          <line x1="38" y1="10" x2="38" y2="300" stroke="var(--ink-rule)" strokeWidth="1" />
          <line x1="48" y1="36" x2="210" y2="36" stroke="var(--ink)" strokeWidth="1" />
          <text x="48" y="30" fontFamily="serif" fontSize="8" fill="var(--ink)" fontWeight="bold">
            PRAYAAS ASSESSMENT
          </text>
          <line x1="48" y1="60" x2="210" y2="60" stroke="var(--ink-faint)" strokeWidth="0.8" />
          <line x1="48" y1="84" x2="210" y2="84" stroke="var(--ink-faint)" strokeWidth="0.8" />
          <line x1="48" y1="108" x2="210" y2="108" stroke="var(--ink-faint)" strokeWidth="0.8" />
          <text x="48" y="76" fontFamily="monospace" fontSize="7" fill="var(--ink)">
            Q1. Calculate 3/4 + 1/4. [3m]
          </text>
          <text x="48" y="100" fontFamily="monospace" fontSize="7" fill="var(--ink)">
            Q2. Prime numbers: 2, 3, 4, 6
          </text>
          {step >= 3 && (
            <ellipse
              cx="110"
              cy="98"
              rx="45"
              ry="9"
              fill="none"
              stroke="var(--redpen)"
              strokeWidth="1.4"
            />
          )}
        </svg>
      </div>
    );
  }

  return (
    <div
      ref={mountRef}
      aria-hidden="true"
      className="w-full h-56 md:h-64 flex items-center justify-center select-none pointer-events-none"
    />
  );
};
