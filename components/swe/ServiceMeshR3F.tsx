"use client";

import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useRef, useState, Suspense, useMemo } from "react";
import * as THREE from "three";

// ──────────────────────────────────────────────────────────────
//  ServiceMeshR3F
//  A rotating microservice network. Each SWE project is a node;
//  edges show data flow with travelling pulses. Hovering a node
//  lifts + glows it. The whole mesh slowly auto-rotates and
//  responds to mouse with deterministic reset (same pattern as
//  the record player — no transform accumulation).
// ──────────────────────────────────────────────────────────────

export type MeshNode = {
  id: string;
  label: string;
  short: string;     // 2-3 char node glyph
  position: [number, number, number];
};

type Props = {
  accent: string;
  nodes: MeshNode[];
  activeId: string | null;
  onHover: (id: string | null) => void;
  onSelect: (id: string) => void;
};

// Edges: which nodes are connected (by index)
function generateEdges(count: number): [number, number][] {
  const edges: [number, number][] = [];

  // Prevent invalid topology
  if (count < 2) return edges;

  for (let i = 0; i < count; i++) {
    // Ring connection
    const next = (i + 1) % count;

    if (i !== next) {
      edges.push([i, next]);
    }

    // Cross-links for mesh feel
    if (i + 2 < count) {
      edges.push([i, i + 2]);
    }
  }

  return edges;
}

export default function ServiceMeshR3F({ accent, nodes, activeId, onHover, onSelect }: Props) {
  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ position: [0, 1.5, 7], fov: 45 }}
      gl={{ antialias: true, alpha: true }}
      style={{ width: "100%", height: "100%", touchAction: "none" }}
    >
      <Suspense fallback={null}>
        <ambientLight intensity={0.5} />
        <pointLight position={[5, 5, 5]} intensity={1} color={accent} />
        <pointLight position={[-5, -3, 2]} intensity={0.5} color="#3b82f6" />
        <Mesh accent={accent} nodes={nodes} activeId={activeId} onHover={onHover} onSelect={onSelect} />
      </Suspense>
    </Canvas>
  );
}

function Mesh({ accent, nodes, activeId, onHover, onSelect }: Props) {
  const group = useRef<THREE.Group>(null);
  const edges = useMemo(() => generateEdges(nodes.length), [nodes]);
  const { size } = useThree();

  const target = useRef({ x: 0, y: 0 });
  const current = useRef({ x: 0, y: 0 });
  const dragging = useRef(false);
  const dragStart = useRef({ mx: 0, my: 0, bx: 0, by: 0 });
  const autoRot = useRef(0);

  useFrame((_, delta) => {
    // Slow ambient auto-rotation
    autoRot.current += delta * 0.12;

    // Smooth toward interaction target (deterministic)
    current.current.x += (target.current.x - current.current.x) * 0.08;
    current.current.y += (target.current.y - current.current.y) * 0.08;

    if (group.current) {
      group.current.rotation.x = current.current.x;
      group.current.rotation.y = current.current.y + autoRot.current;
    }
  });

  function onPointerMove(e: any) {
    if (dragging.current) {
      const dx = (e.clientX - dragStart.current.mx) * 0.006;
      const dy = (e.clientY - dragStart.current.my) * 0.005;
      target.current.y = dragStart.current.by + dx;
      target.current.x = dragStart.current.bx - dy;
    }
  }
  function onPointerDown(e: any) {
    dragging.current = true;
    dragStart.current = { mx: e.clientX, my: e.clientY, bx: current.current.x, by: current.current.y };
  }
  function onPointerUp() {
    dragging.current = false;
    target.current.x = 0;
    target.current.y = 0;
  }

  return (
    <group
      ref={group}
      position={[0, -0.7, 0]} // shift mesh downward for better centering
      onPointerMove={onPointerMove}
      onPointerDown={onPointerDown}
      onPointerUp={onPointerUp}
    >
      {edges
        .filter(([a, b]) => nodes[a] && nodes[b])
        .map(([a, b], i) => (
          <Edge
            key={i}
            from={nodes[a].position}
            to={nodes[b].position}
            accent={accent}
          />
        ))}

      {/* Nodes */}
      {nodes.map((n) => (
        <Node
          key={n.id}
          node={n}
          accent={accent}
          active={activeId === n.id}
          onHover={onHover}
          onSelect={onSelect}
        />
      ))}
    </group>
  );
}

function Node({
  node, accent, active, onHover, onSelect,
}: {
  node: MeshNode; accent: string; active: boolean;
  onHover: (id: string | null) => void; onSelect: (id: string) => void;
}) {
  const ref = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const scale = useRef(1);

  useFrame((state) => {
    const targetScale = hovered || active ? 1.35 : 1;

    scale.current += (targetScale - scale.current) * 0.15;

    if (ref.current) {
      ref.current.scale.setScalar(scale.current);

      ref.current.position.y =
        node.position[1] +
        Math.sin(state.clock.elapsedTime + node.position[0]) * 0.08;
    }
  });

  return (
    <group position={node.position}>
      <mesh
        ref={ref}
        onPointerOver={(e) => {
          e.stopPropagation(); setHovered(true); onHover(node.id); if (typeof document !== "undefined") {
            document.body.style.cursor = "pointer";
          }
        }}
        onPointerOut={() => {
          setHovered(false); onHover(null); if (typeof document !== "undefined") {
            document.body.style.cursor = "auto";
          }
        }}
        onClick={(e) => { e.stopPropagation(); onSelect(node.id); }}
      >
        <icosahedronGeometry args={[0.42, 1]} />
        <meshStandardMaterial
          color={active || hovered ? accent : "#1a1a1a"}
          emissive={accent}
          emissiveIntensity={active || hovered ? 0.6 : 0.15}
          roughness={0.3}
          metalness={0.7}
          wireframe={!active && !hovered}
        />
      </mesh>
      {/* glow shell */}
      <mesh scale={1.6}>
        <icosahedronGeometry args={[0.42, 0]} />
        <meshBasicMaterial color={accent} transparent opacity={active || hovered ? 0.12 : 0.04} />
      </mesh>
    </group>
  );
}

function Edge({ from, to, accent }: { from: [number, number, number]; to: [number, number, number]; accent: string }) {
  const pulseRef = useRef<THREE.Mesh>(null);
  const t = useRef(Math.random());

  const { mid, len, quat, start, end } = useMemo(() => {
    const a = new THREE.Vector3(...from);
    const b = new THREE.Vector3(...to);

    const dir = new THREE.Vector3().subVectors(b, a);

    const length = dir.length();

    const midpoint = new THREE.Vector3()
      .addVectors(a, b)
      .multiplyScalar(0.5);

    const q = new THREE.Quaternion().setFromUnitVectors(
      new THREE.Vector3(0, 1, 0),
      dir.clone().normalize()
    );

    return {
      mid: midpoint,
      len: length,
      quat: q,
      start: a,
      end: b,
    };
  }, [from, to]);

  useFrame((_, delta) => {
    t.current = (t.current + delta * 0.4) % 1;

    if (pulseRef.current) {
      pulseRef.current.position.lerpVectors(
        start,
        end,
        t.current
      );
    }
  });

  return (
    <group>
      {/* line (thin cylinder) */}
      <mesh position={mid} quaternion={quat}>
        <cylinderGeometry args={[0.012, 0.012, len, 6]} />
        <meshBasicMaterial color={accent} transparent opacity={0.25} />
      </mesh>
      {/* travelling data pulse */}
      <mesh ref={pulseRef}>
        <sphereGeometry args={[0.05, 8, 8]} />
        <meshBasicMaterial color={accent} />
      </mesh>
    </group>
  );
}
