"use client";

// ──────────────────────────────────────────────────────────────
//  AsciiAvatar.tsx  (rewrite)
//
//  Key fixes over v1:
//  1. Character aspect ratio — monospace chars are ~0.5 as wide
//     as tall, so camera.aspect = (cols * 0.5) / rows. Without
//     this the model appears squished/distorted in the output.
//  2. High-contrast lighting — very dim ambient, strong key
//     light creates clear bright/dark areas that map to ASCII.
//  3. preserveDrawingBuffer:true — required so getImageData
//     reads the frame we just rendered (not a cleared buffer).
//  4. Sobel edge pass in asciiRenderer for crisp silhouette.
// ──────────────────────────────────────────────────────────────


import { useEffect, useRef, useState } from "react";
import { pixelsToAscii } from "@/utils/asciiRenderer";
import { loadAvatar, MODEL_PATH } from "@/utils/avatarLoader";

// Correct aspect for JetBrains Mono 7px / line-height 8.5px:
//   char_width ≈ 7 * 0.6 = 4.2px   char_height = 8.5px
//   CHAR_ASPECT = 4.2 / 8.5 = 0.494 ≈ 0.50
const CHAR_ASPECT = 0.50;

type Props = {
  cols?: number;
  rows?: number;
  color?: string;
  className?: string;
};

export default function AsciiAvatar({
  cols: colsProp = 65,
  rows: rowsProp = 44,
  color = "#00ff41",
  className = "",
}: Props) {
  const [ascii, setAscii]   = useState<string>("");
  const [loaded, setLoaded] = useState(false);
  const cleanupRef = useRef<() => void>(() => {});

  useEffect(() => {
    let disposed = false;
    let rafId    = 0;

    async function init() {
      const THREE = await import("three");
      if (disposed) return;

      // Mobile: reduce resolution by ~40% to stay performant
      const isMobile = window.innerWidth < 640;
      const cols = isMobile ? Math.round(colsProp * 0.60) : colsProp;
      const rows = isMobile ? Math.round(rowsProp * 0.60) : rowsProp;

      // ── Offscreen GL canvas (1 px per char cell) ──────────
      const glCanvas = document.createElement("canvas");
      glCanvas.width  = cols;
      glCanvas.height = rows;

      const renderer = new THREE.WebGLRenderer({
        canvas: glCanvas,
        antialias: false,
        alpha: true,
        premultipliedAlpha: false,
        preserveDrawingBuffer: true, // required for ctx2d readback
        powerPreference: "low-power",
      });
      renderer.setSize(cols, rows, false);
      renderer.setClearColor(0x000000, 0);
      renderer.outputColorSpace = THREE.SRGBColorSpace;

      // ── 2-D readback canvas ───────────────────────────────
      const readCanvas = document.createElement("canvas");
      readCanvas.width  = cols;
      readCanvas.height = rows;
      const ctx2d = readCanvas.getContext("2d", { willReadFrequently: true })!;

      // ── Scene ─────────────────────────────────────────────
      const scene = new THREE.Scene();

      // Camera: portrait telephoto — 35° FOV, correct aspect
      const camera = new THREE.PerspectiveCamera(
        35,
        (cols * CHAR_ASPECT) / rows,
        0.1,
        50,
      );
      camera.position.set(0, 0, 5);
      camera.lookAt(0, 0, 0);

      // ── Lighting (tuned for textured models) ───────────────
      // Moderate ambient — textures carry the detail, light
      // should fill in shadows not obliterate them.
      scene.add(new THREE.AmbientLight(0xffffff, 0.55));

      // Key light: front-left, slightly elevated
      // Lower intensity than before — textures don't need blasting
      const key = new THREE.DirectionalLight(0xffffff, 1.1);
      key.position.set(1.8, 2.2, 3.0);
      scene.add(key);

      // Fill light: front-right, ground level, soft blue tint
      const fill = new THREE.DirectionalLight(0x99aaff, 0.35);
      fill.position.set(-2.0, 0.2, 2.0);
      scene.add(fill);

      // Back/rim: separates subject from background
      const rim = new THREE.DirectionalLight(0xffffff, 0.28);
      rim.position.set(-1.0, 0.5, -3.0);
      scene.add(rim);

      // Pulsing neon accent point light (subtle, matches accent color)
      const neon = new THREE.PointLight(new THREE.Color(color), 0.22, 10);
      neon.position.set(-2.5, 0.5, 1.0);
      scene.add(neon);

      // ── Load model ────────────────────────────────────────
      const model = await loadAvatar(THREE, MODEL_PATH);
      if (disposed) { renderer.dispose(); return; }
      scene.add(model);

      // ── Auto-fit camera to model bounding sphere ──────────
      // Gives correct framing regardless of model size.
      // Uses FOV to calculate exact distance so model fills frame
      // with ~20% padding on all sides (no clipping during rotation).
      const box    = new THREE.Box3().setFromObject(model);
      const sphere = new THREE.Sphere();
      box.getBoundingSphere(sphere);

      const halfFovRad = (camera.fov * Math.PI) / 360; // fov/2 in radians
      const fitDist    = (sphere.radius / Math.sin(halfFovRad)) * 1.20;
      camera.position.set(sphere.center.x, sphere.center.y, fitDist);
      camera.lookAt(sphere.center.x, sphere.center.y, sphere.center.z);

      setLoaded(true);

      // ── Animation loop ────────────────────────────────────
      let t = 0;

      function tick() {
        if (disposed) return;

        if (document.hidden) {
          rafId = requestAnimationFrame(tick);
          return;
        }

        t += 0.012;

        // FIX: single assignment — previous code had two lines for
        // rotation.y and the second always overwrote the first.
        // Slow ±30° oscillation (0.524 rad) over ~17 seconds.
        model.rotation.y = t;
        // Very gentle vertical tilt — adds life without hiding face
        model.rotation.x = Math.sin(t * 0.24) * 0.05;

        // Subtle neon pulse
        neon.intensity = 0.15 + Math.sin(t * 1.3) * 0.08;

        // Render
        renderer.render(scene, camera);

        // Read back via 2D canvas
        ctx2d.clearRect(0, 0, cols, rows);
        ctx2d.drawImage(glCanvas, 0, 0);
        const imageData = ctx2d.getImageData(0, 0, cols, rows);

        setAscii(pixelsToAscii(imageData, cols, rows));
        rafId = requestAnimationFrame(tick);
      }

      rafId = requestAnimationFrame(tick);

      cleanupRef.current = () => {
        disposed = true;
        cancelAnimationFrame(rafId);
        scene.traverse((obj: any) => {
          obj.geometry?.dispose();
          if (obj.material) {
            (Array.isArray(obj.material) ? obj.material : [obj.material])
              .forEach((m: any) => m.dispose());
          }
        });
        renderer.dispose();
      };
    }

    init().catch(console.error);
    return () => cleanupRef.current();
  }, [colsProp, rowsProp, color]);

  return (
    <div className={`relative inline-block ${className}`} aria-hidden="true">
      {!loaded && (
        <div className="font-mono text-[9px] animate-pulse" style={{ color }}>
          {"// loading avatar..."}
        </div>
      )}

      <pre
        style={{
          fontFamily: "'JetBrains Mono', 'Courier New', Courier, monospace",
          // 7px font / 8.5px line-height → CHAR_ASPECT = 0.50
          fontSize:      "7px",
          lineHeight:    "8.5px",
          color,
          margin:        0,
          padding:       0,
          whiteSpace:    "pre",
          letterSpacing: "0.1px",
          userSelect:    "none",
          textShadow:    `0 0 3px ${color}aa, 0 0 8px ${color}33`,
          opacity:       loaded ? 1 : 0,
          transition:    "opacity 0.7s ease",
        }}
      >
        {ascii}
      </pre>

      {/* CRT scanlines */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 1px, rgba(0,0,0,0.14) 1px, rgba(0,0,0,0.14) 2px)",
      }} />

      {/* Edge vignette */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none",
        background: `radial-gradient(ellipse at center, transparent 58%, ${color}09 100%)`,
      }} />

      <style jsx>{`
        @keyframes crtFlicker {
          0%, 95%, 100% { opacity: 1; }
          96% { opacity: 0.87; }
          98% { opacity: 0.95; }
        }
        pre { animation: crtFlicker 11s infinite; }
      `}</style>
    </div>
  );
}
