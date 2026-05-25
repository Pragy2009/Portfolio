"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { projects } from "@/lib/data";
import type { MeshNode } from "@/components/swe/ServiceMeshR3F";

const ServiceMeshR3F = dynamic(() => import("@/components/swe/ServiceMeshR3F"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center" style={{ minHeight: 340 }}>
      <div className="font-mono text-[10px] text-gray-700 animate-pulse">booting service mesh…</div>
    </div>
  ),
});

type Props = { mode: "cyber" | "swe" };

// SWE projects become mesh nodes. Positions arranged in a loose 3D ring.
const NODE_POSITIONS: [number, number, number][] = [
  [-2.2, 0.6, 0],
  [2.2, 0.4, -0.6],
  [0, 1.4, 0.8],
  [-1.4, -1.2, 0.5],
  [1.6, -1.0, -0.4],
  [0, -1.8, 1.2],
  [-2.5, 1.4, -1.2],
  [2.4, -1.5, 1.1],
];

export default function Architecture({ mode }: Props) {
  const accent = mode === "cyber" ? "#00ff41" : "#3b82f6";
  const sweProjects = projects.filter((p) => p.cat === "swe");

  // Build mesh nodes from SWE projects (cap at 5 for clean topology)
  const nodes: MeshNode[] = sweProjects.slice(0, 5).map((p, i) => ({
    id: p.id,
    label: p.title,
    short: p.title.slice(0, 3).toUpperCase(),
    position:
      NODE_POSITIONS[i] ??
      [
        (Math.random() - 0.5) * 5,
        (Math.random() - 0.5) * 3,
        (Math.random() - 0.5) * 3,
      ],
  }));

  const [hoverId, setHoverId] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const focusId = hoverId ?? selectedId;
  const focused = projects.find((p) => p.id === focusId) ?? null;

  return (
    <section id="architecture" className="py-20 border-t border-gray-900">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="font-mono text-2xl mb-2 flex items-center gap-3 font-normal">
          <span className="accent">03 //</span> SERVICE_MESH
          <div className="flex-1 h-px bg-gray-900 ml-2" />
        </h2>
        <p className="font-mono text-[11px] text-gray-600 mb-10">
          Software engineering systems as a live microservice topology. Hover a node, click to inspect.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Mesh */}
          <div className="md:col-span-2 order-2 md:order-1">
            <div className="bg-[#0d0d0d] border border-gray-900 rounded-2xl p-6">
              <div className="text-[10px] font-mono text-gray-700 tracking-[3px] mb-1">
                [ DISTRIBUTED ARCHITECTURE ]
              </div>
              <div className="text-[9px] font-mono text-gray-800 mb-2 italic">↳ drag to orbit · hover nodes</div>
              <div className="w-full rounded-lg overflow-hidden" style={{ minHeight: 360, height: 360 }}>
                <ServiceMeshR3F
                  accent={accent}
                  nodes={nodes}
                  activeId={focusId}
                  onHover={setHoverId}
                  onSelect={setSelectedId}
                />
              </div>
            </div>
          </div>

          {/* Node detail */}
          <div className="md:col-span-1 order-1 md:order-2">
            <div className="bg-[#0d0d0d] border border-gray-900 rounded-2xl p-6 h-full min-h-[440px] flex flex-col">
              <div className="text-[10px] font-mono text-gray-700 tracking-[3px] mb-4">
                [ NODE INSPECTOR ]
              </div>

              <AnimatePresence mode="wait">
                {focused ? (
                  <motion.div
                    key={focused.id}
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -12 }}
                    transition={{ duration: 0.3 }}
                    className="flex-1"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <div
                        className="w-2 h-2 rounded-full animate-pulse"
                        style={{ background: accent, boxShadow: `0 0 8px ${accent}` }}
                      />
                      <span className="font-mono text-[10px]" style={{ color: accent }}>ONLINE</span>
                    </div>
                    <h3 className="text-lg font-bold text-white mb-1">{focused.title}</h3>
                    <span
                      className="inline-block text-[10px] font-mono border px-2 py-0.5 rounded mb-4"
                      style={{ borderColor: accent + "60", color: accent }}
                    >
                      {focused.tag}
                    </span>

                    <div className="mb-4">
                      <div className="font-mono text-[10px] text-gray-500 tracking-widest mb-1">// STACK</div>
                      <div className="text-gray-300 font-mono text-[11px] leading-relaxed">{focused.stack}</div>
                    </div>
                    <div className="mb-4">
                      <div className="font-mono text-[10px] text-gray-500 tracking-widest mb-1">// SUMMARY</div>
                      <p className="text-gray-300 text-[12px] leading-relaxed">{focused.desc}</p>
                    </div>

                    <div className="flex gap-2 flex-wrap">
                      {focused.github ? (
                        <a href={focused.github} target="_blank" rel="noopener noreferrer"
                          className="font-mono text-[11px] border px-3 py-1.5 rounded"
                          style={{ borderColor: accent, color: accent }}>
                          [ REPO ↗ ]
                        </a>
                      ) : (
                        <span className="font-mono text-[11px] border border-gray-800 px-3 py-1.5 rounded text-gray-600">
                          [ PRIVATE ]
                        </span>
                      )}
                      {focused.live && (
                        <a href={focused.live} target="_blank" rel="noopener noreferrer"
                          className="font-mono text-[11px] border px-3 py-1.5 rounded"
                          style={{ borderColor: accent, color: accent }}>
                          [ LIVE ↗ ]
                        </a>
                      )}
                    </div>
                  </motion.div>
                ) : (
                  <div className="flex-1 flex items-center justify-center text-center">
                    <div className="font-mono text-[11px] text-gray-700 leading-relaxed">
                      ↳ hover or click a node<br />to inspect the service
                    </div>
                  </div>
                )}
              </AnimatePresence>

              {/* skills strip */}
              <div className="mt-4 pt-4 border-t border-gray-900">
                <div className="font-mono text-[9px] text-gray-600 tracking-widest mb-2">// RUNTIME</div>
                <div className="flex flex-wrap gap-1.5">
                  {["Docker", "Linux", "AWS", "REST APIs", "System Design"].map((s) => (
                    <span key={s} className="font-mono text-[9px] border border-gray-800 px-2 py-0.5 rounded text-gray-500">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
