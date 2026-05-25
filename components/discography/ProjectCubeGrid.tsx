"use client";

import { motion, AnimatePresence } from "framer-motion";
import { projects } from "@/lib/data";

type Props = {
  accent: string;
  activeProjectId: string | null;
  isPlaying: boolean;
  onSelect: (projectId: string) => void;
};

const CUBE_COLORS = ["#00ff41", "#ef4444", "#3b82f6", "#f59e0b", "#a855f7", "#ec4899"];

export default function ProjectCubeGrid({ accent, activeProjectId, isPlaying, onSelect }: Props) {
  const active = projects.find((p) => p.id === activeProjectId) ?? null;
  const activeNum = active ? projects.findIndex((p) => p.id === active.id) + 1 : 0;

  return (
    <div className="bg-[#0d0d0d] border border-gray-900 rounded-2xl p-6 min-h-[500px]">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6" style={{ perspective: "800px" }}>
        {projects.map((p, i) => {
          const isActive = activeProjectId === p.id;
          const isOther = activeProjectId !== null && !isActive;
          return (
            <motion.button
              key={p.id}
              onClick={() => onSelect(p.id)}
              className="relative outline-none"
              animate={{
                height: isOther ? 60 : 110,
                opacity: isOther ? 0.25 : 1,
                scale: isOther ? 0.92 : 1,
              }}
              transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
            >
              <Cube
                title={p.title}
                tag={p.tag}
                index={i}
                color={CUBE_COLORS[i % CUBE_COLORS.length]}
                small={isOther}
                highlighted={isActive}
              />
            </motion.button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        {active ? (
          <motion.div
            key={active.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.35 }}
            className="bg-black/40 border rounded-xl p-5"
            style={{ borderColor: accent + "40" }}
          >
            <div className="flex items-start justify-between gap-4 mb-3">
              <div className="min-w-0">
                <div className="font-mono text-[10px] tracking-[2px] mb-1" style={{ color: accent }}>
                  {isPlaying ? "▶ NOW PLAYING" : "❚❚ PAUSED"} · TRACK {String(activeNum).padStart(2, "0")}
                </div>
                <h3 className="text-xl font-bold text-white">{active.title}</h3>
                {active.period && (
                  <div className="text-[11px] font-mono text-gray-600 mt-1">{active.period}</div>
                )}
              </div>
              <span
                className="text-[10px] font-mono border px-2 py-1 rounded flex-shrink-0"
                style={{ borderColor: accent + "60", color: accent }}
              >
                {active.tag}
              </span>
            </div>

            <div className="space-y-3 text-sm">
              <div>
                <div className="font-mono text-[10px] text-gray-500 tracking-widest mb-1">// TECH STACK</div>
                <div className="text-gray-300 font-mono text-xs">{active.stack}</div>
              </div>
              <div>
                <div className="font-mono text-[10px] text-gray-500 tracking-widest mb-1">// HOW IT WORKS</div>
                <p className="text-gray-300 text-[13px] leading-relaxed">{active.desc}</p>
              </div>
              <div className="flex gap-2 flex-wrap pt-2">
                {active.github ? (
                  <a href={active.github} target="_blank" rel="noopener noreferrer"
                     className="font-mono text-[11px] border px-4 py-2 rounded transition-colors"
                     style={{ borderColor: accent, color: accent }}>
                    [ REPO ↗ ]
                  </a>
                ) : (
                  <span className="font-mono text-[11px] border border-gray-800 px-4 py-2 rounded text-gray-600">
                    [ REPO PRIVATE ]
                  </span>
                )}
                {active.live && (
                  <a href={active.live} target="_blank" rel="noopener noreferrer"
                     className="font-mono text-[11px] border px-4 py-2 rounded transition-colors"
                     style={{ borderColor: accent, color: accent }}>
                    [ LIVE DEMO ↗ ]
                  </a>
                )}
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="text-center py-10 text-gray-700 font-mono text-xs">
            ↳ click a project to spin up its track
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Cube({
  title, tag, index, color, small, highlighted,
}: {
  title: string; tag: string; index: number; color: string; small: boolean; highlighted: boolean;
}) {
  const size = small ? 50 : 80;
  const half = size / 2;
  const faceBase: React.CSSProperties = {
    position: "absolute", width: "100%", height: "100%",
    border: "1px solid", display: "flex", alignItems: "center",
    justifyContent: "center", backfaceVisibility: "hidden", background: "#0a0a0a",
  };
  return (
    <div className="w-full h-full flex items-center justify-center" style={{ perspective: "600px" }}>
      <div
        style={{
          width: size, height: size, position: "relative", transformStyle: "preserve-3d",
          animation: `cubeRotate ${small ? 20 : 12}s linear infinite`,
          filter: highlighted ? `drop-shadow(0 0 12px ${color}99)` : "none",
        }}
      >
        <div style={{ ...faceBase, transform: `translateZ(${half}px)`, borderColor: color, background: `${color}12` }}>
          <div className="font-mono font-bold leading-tight text-center px-1" style={{ color, fontSize: small ? 7 : 9 }}>
            {title.split(" ").slice(0, 2).join(" ")}
          </div>
        </div>
        <div style={{ ...faceBase, transform: `rotateY(180deg) translateZ(${half}px)`, borderColor: color + "60" }}>
          <span className="font-mono font-bold" style={{ color, fontSize: small ? 8 : 11 }}>{String(index + 1).padStart(2, "0")}</span>
        </div>
        <div style={{ ...faceBase, transform: `rotateY(90deg) translateZ(${half}px)`, borderColor: color + "60" }}>
          <span className="font-mono" style={{ color, fontSize: small ? 6 : 8 }}>{tag}</span>
        </div>
        <div style={{ ...faceBase, transform: `rotateY(-90deg) translateZ(${half}px)`, borderColor: color + "60" }}>
          <span className="font-mono" style={{ color, fontSize: small ? 8 : 11 }}>♫</span>
        </div>
        <div style={{ ...faceBase, transform: `rotateX(90deg) translateZ(${half}px)`, borderColor: color + "60" }}>
          <span className="font-mono" style={{ color, fontSize: small ? 6 : 8 }}>▣</span>
        </div>
        <div style={{ ...faceBase, transform: `rotateX(-90deg) translateZ(${half}px)`, borderColor: color + "60" }}>
          <span className="font-mono" style={{ color, fontSize: small ? 6 : 8 }}>⊞</span>
        </div>
      </div>
      <style jsx>{`
        @keyframes cubeRotate {
          0% { transform: rotateX(0deg) rotateY(0deg); }
          100% { transform: rotateX(360deg) rotateY(360deg); }
        }
      `}</style>
    </div>
  );
}
