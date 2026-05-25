"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useRef, useState, Suspense } from "react";
import * as THREE from "three";

// ──────────────────────────────────────────────────────────────
//  RecordPlayerR3F
//  Default state: perfectly straight (rotation 0,0). Deterministic
//  reset — drag uses an absolute baseline so rotations never
//  accumulate. Tonearm rests on the body off-vinyl, eases onto the
//  groove on play. Vinyl ramps/decays speed (no snap). Neon glow +
//  audio-reactive pulse while playing.
// ──────────────────────────────────────────────────────────────

const ARM_REST = -0.5;  // parked on the body, clear of the vinyl
const ARM_PLAY = 0.56;  // swung onto the groove
const MAX_SPIN = 0.06;  // ~33rpm feel

type Props = {
  accent: string;
  isPlaying: boolean;
};

export default function RecordPlayerR3F({ accent, isPlaying }: Props) {
  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ position: [0, 2.6, 5.2], fov: 42 }}
      shadows
      gl={{ antialias: true, alpha: true }}
      style={{ width: "100%", height: "100%", touchAction: "none" }}
    >
      <Suspense fallback={null}>
        <Lights accent={accent} isPlaying={isPlaying} />
        <Deck accent={accent} isPlaying={isPlaying} />
        <ShadowFloor />
      </Suspense>
    </Canvas>
  );
}

function Lights({ accent, isPlaying }: Props) {
  const center = useRef<THREE.PointLight>(null);
  const rim = useRef<THREE.PointLight>(null);
  const pulse = useRef(0);

  useFrame(() => {
    pulse.current += 0.08;
    const amt = isPlaying ? Math.sin(pulse.current) * 0.5 + 0.5 : 0;
    if (center.current) center.current.intensity = 0.8 + amt * 0.9;
    if (rim.current) rim.current.intensity = 0.8 + amt * 0.4;
  });

  return (
    <>
      <ambientLight intensity={0.45} />
      <directionalLight
        position={[3, 6, 4]}
        intensity={1.1}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <directionalLight position={[-4, 2, -2]} intensity={0.25} color="#4488ff" />
      <pointLight ref={center} position={[-0.4, 0.4, 0.1]} color={accent} intensity={1.1} distance={4} />
      <pointLight ref={rim} position={[-2, 1, 2]} color={accent} intensity={0.9} distance={8} />
    </>
  );
}

function Deck({ accent, isPlaying }: Props) {
  const group = useRef<THREE.Group>(null);
  const vinyl = useRef<THREE.Group>(null);
  const armPivot = useRef<THREE.Group>(null);
  const labelMat = useRef<THREE.MeshStandardMaterial>(null);
  const glowRing = useRef<THREE.Mesh>(null);

  const { size } = useThree();

  // Interaction state — refs so we never trigger re-renders
  const target = useRef({ x: 0, y: 0 });   // where we want to be
  const current = useRef({ x: 0, y: 0 });   // where we are
  const dragging = useRef(false);
  const dragStart = useRef({ mx: 0, my: 0, bx: 0, by: 0 });

  const spin = useRef(0);     // current angular speed
  const angle = useRef(0);    // accumulated vinyl angle
  const arm = useRef(ARM_REST);
  const pulse = useRef(0);

  useFrame(() => {
    // ── Vinyl: ramp speed up / decay down (no snap) ──
    const targetSpin = isPlaying ? MAX_SPIN : 0;
    spin.current += (targetSpin - spin.current) * 0.04;
    angle.current -= spin.current;
    if (vinyl.current) vinyl.current.rotation.y = angle.current;

    // ── Tonearm: eased inertia onto / off the record ──
    const targetArm = isPlaying ? ARM_PLAY : ARM_REST;
    arm.current += (targetArm - arm.current) * 0.045;
    if (armPivot.current) armPivot.current.rotation.y = arm.current;

    // ── Audio-reactive pulse ──
    pulse.current += 0.08;
    const amt = isPlaying ? Math.sin(pulse.current) * 0.5 + 0.5 : 0;
    if (labelMat.current) {
      labelMat.current.emissiveIntensity = 0.2 + amt * 0.35;
    }
    if (glowRing.current) {
      const s = 1 + amt * 0.07;
      glowRing.current.scale.set(s, s, s);
    }

    // ── Group rotation: smooth toward target, deterministic ──
    current.current.x += (target.current.x - current.current.x) * 0.1;
    current.current.y += (target.current.y - current.current.y) * 0.1;
    if (group.current) {
      group.current.rotation.x = current.current.x;
      group.current.rotation.y = current.current.y;
    }
  });

  // Pointer handlers operate on the canvas group
  function onPointerMove(e: any) {
    if (dragging.current) {
      const dx = (e.clientX - dragStart.current.mx) * 0.006;
      const dy = (e.clientY - dragStart.current.my) * 0.005;
      target.current.y = dragStart.current.by + dx;
      target.current.x = dragStart.current.bx - dy;
    } else {
      // hover tilt around the straight default
      const nx = (e.clientX / size.width - 0.5) * 2;
      const ny = (e.clientY / size.height - 0.5) * 2;
      target.current.x = ny * 0.18;
      target.current.y = nx * 0.30;
    }
  }
  function onPointerDown(e: any) {
    dragging.current = true;
    dragStart.current = {
      mx: e.clientX,
      my: e.clientY,
      bx: current.current.x,
      by: current.current.y,
    };
  }
  function onPointerUp() {
    dragging.current = false;
    // deterministic reset to perfectly straight
    target.current.x = 0;
    target.current.y = 0;
  }
  function onPointerLeave() {
    if (!dragging.current) {
      target.current.x = 0;
      target.current.y = 0;
    }
  }

  return (
    <group
      ref={group}
      onPointerMove={onPointerMove}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerLeave}
    >
      {/* invisible hit plane so pointer events fire across the whole area */}
      <mesh position={[0, 0, 0]} visible={false}>
        <planeGeometry args={[8, 6]} />
        <meshBasicMaterial />
      </mesh>

      {/* Plinth */}
      <mesh position={[0, -0.6, 0]} castShadow receiveShadow>
        <boxGeometry args={[3.8, 0.35, 2.6]} />
        <meshStandardMaterial color="#3a2010" roughness={0.85} metalness={0.05} />
      </mesh>
      <mesh position={[0, -0.415, 0]}>
        <boxGeometry args={[3.78, 0.02, 2.58]} />
        <meshStandardMaterial color="#4a2a14" roughness={0.75} metalness={0.05} />
      </mesh>

      {/* Deck plate */}
      <mesh position={[0, -0.365, 0]} castShadow>
        <boxGeometry args={[3.4, 0.12, 2.2]} />
        <meshStandardMaterial color="#1c1c1c" roughness={0.4} metalness={0.6} />
      </mesh>

      {/* Vinyl */}
      <group ref={vinyl} position={[-0.4, -0.26, 0.1]}>
        <mesh castShadow>
          <cylinderGeometry args={[0.88, 0.88, 0.035, 64]} />
          <meshStandardMaterial color="#080808" roughness={0.15} metalness={0.4} />
        </mesh>
        {/* grooves */}
        {Array.from({ length: 10 }).map((_, i) => {
          const r = 0.25 + i * 0.057;
          return (
            <mesh key={i} rotation={[Math.PI / 2, 0, 0]} position={[0, 0.019, 0]}>
              <torusGeometry args={[r, 0.004, 6, 80]} />
              <meshStandardMaterial color="#111111" roughness={0.9} metalness={0.1} />
            </mesh>
          );
        })}
        {/* neon glow ring */}
        <mesh ref={glowRing} rotation={[Math.PI / 2, 0, 0]} position={[0, 0.021, 0]}>
          <torusGeometry args={[0.26, 0.012, 8, 60]} />
          <meshBasicMaterial color={accent} />
        </mesh>
        {/* center label */}
        <mesh position={[0, 0.001, 0]}>
          <cylinderGeometry args={[0.22, 0.22, 0.04, 40]} />
          <meshStandardMaterial
            ref={labelMat}
            color={accent}
            emissive={accent}
            emissiveIntensity={0.25}
            roughness={0.6}
            metalness={0.1}
          />
        </mesh>
        {/* spindle */}
        <mesh position={[0, 0.005, 0]}>
          <cylinderGeometry args={[0.025, 0.025, 0.06, 20]} />
          <meshStandardMaterial color="#cccccc" metalness={0.9} roughness={0.1} />
        </mesh>
      </group>

      {/* Tonearm */}
      <group position={[1.15, -0.22, -0.5]}>
        {/* pivot base */}
        <mesh position={[0, 0.05, 0]}>
          <cylinderGeometry args={[0.1, 0.12, 0.18, 24]} />
          <meshStandardMaterial color="#555" roughness={0.3} metalness={0.8} />
        </mesh>
        {/* counterweight */}
        <mesh position={[0, 0.15, 0.34]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.07, 0.07, 0.14, 20]} />
          <meshStandardMaterial color="#555" roughness={0.3} metalness={0.8} />
        </mesh>
        {/* rotating arm */}
        <group ref={armPivot} position={[0, 0.14, 0]} rotation={[0, ARM_REST, 0]}>
          <mesh rotation={[0, 0, Math.PI / 2]} position={[-0.65, 0, 0]}>
            <cylinderGeometry args={[0.025, 0.02, 1.5, 12]} />
            <meshStandardMaterial color="#555" roughness={0.3} metalness={0.8} />
          </mesh>
          <mesh position={[-1.38, -0.04, 0.06]}>
            <boxGeometry args={[0.12, 0.04, 0.2]} />
            <meshStandardMaterial color="#222" roughness={0.5} metalness={0.7} />
          </mesh>
          <mesh position={[-1.38, -0.1, 0.06]} rotation={[0, 0, 0.15]}>
            <cylinderGeometry args={[0.005, 0.002, 0.12, 6]} />
            <meshStandardMaterial color="#aaa" metalness={0.9} roughness={0.1} />
          </mesh>
        </group>
      </group>
    </group>
  );
}

function ShadowFloor() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.78, 0]} receiveShadow>
      <planeGeometry args={[10, 10]} />
      <shadowMaterial opacity={0.4} />
    </mesh>
  );
}
