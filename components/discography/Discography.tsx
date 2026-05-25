"use client";

import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import { projects } from "@/lib/data";
import { pickRandomTrack, indexOfTrack } from "@/lib/tracks";
import { useAudioPlayer } from "@/components/audio/useAudioPlayer";
import ProjectCubeGrid from "@/components/discography/ProjectCubeGrid";

// R3F must be client-only — lazy load so it never blocks first paint
const RecordPlayerR3F = dynamic(
  () => import("@/components/discography/RecordPlayerR3F"),
  { ssr: false, loading: () => <PlayerSkeleton /> }
);

type Props = { mode: "cyber" | "swe" };

export default function Discography({ mode }: Props) {
  const accent = mode === "cyber" ? "#00ff41" : "#3b82f6";
  const { state, selectTrack, togglePlay, next, prev } = useAudioPlayer();
  const { track, isPlaying, elapsed, duration, progress } = state;

  // Clicking a project tile → random linked track → play
  function onSelectProject(projectId: string) {
    const t = pickRandomTrack(projectId);
    const idx = indexOfTrack(t.id);
    if (idx >= 0) selectTrack(idx);
  }

  // Which project is currently "playing" (for tile highlight)
  const activeProjectId = track?.linkedProject ?? null;

  return (
    <section id="projects" className="py-20 border-t border-gray-900">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="font-mono text-2xl mb-12 flex items-center gap-3 font-normal">
          <span className="accent">02 //</span> EXECUTION_LOG
          <div className="flex-1 h-px bg-gray-900 ml-2" />
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Player */}
          <div className="md:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="bg-[#0d0d0d] border border-gray-900 rounded-2xl p-6 h-full flex flex-col transition-shadow"
              style={{ boxShadow: isPlaying ? `0 0 30px ${accent}1a` : "none" }}
            >
              <div className="text-[10px] font-mono text-gray-700 tracking-[3px] mb-1">
                [ PROJECT DISCOGRAPHY ]
              </div>
              <div className="text-[9px] font-mono text-gray-800 mb-2 italic">
                ↳ hover or drag to rotate
              </div>

              {/* 3D player */}
              <div className="flex-1 w-full rounded-lg overflow-hidden" style={{ minHeight: 290 }}>
                <RecordPlayerR3F accent={accent} isPlaying={isPlaying} />
              </div>

              {/* Track info */}
              <div className="mt-3 mb-2 text-center">
                <div className="text-[10px] font-mono tracking-[2px] mb-1" style={{ color: accent }}>
                  {isPlaying ? "▶ NOW PLAYING" : track ? "❚❚ PAUSED" : "SELECT A TRACK"}
                </div>
                <div className="text-sm font-mono font-bold text-white truncate">
                  {track?.title ?? "—"}
                </div>
                <div className="text-[10px] font-mono text-gray-600 mt-0.5">
                  {track ? `${track.category} · ${track.artist}` : "no track loaded"}
                </div>
              </div>

              {/* Progress */}
              <div className="mb-3">
                <div className="h-[3px] bg-gray-900 rounded-full overflow-hidden">
                  <div
                    style={{
                      width: `${progress}%`,
                      background: `linear-gradient(90deg, #3b82f6 0%, ${accent} 50%, #f59e0b 80%, #ef4444 100%)`,
                      transition: "width 0.1s linear",
                    }}
                    className="h-full"
                  />
                </div>
                <div className="flex justify-between mt-1.5 text-[10px] font-mono text-gray-600">
                  <span>{fmt(elapsed)}</span>
                  <span>{fmt(duration)}</span>
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center gap-3">
                <CtrlBtn onClick={prev} aria="Previous">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="#3b82f6"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" /></svg>
                </CtrlBtn>
                <button
                  onClick={togglePlay}
                  className="w-14 h-14 rounded-full border-2 flex items-center justify-center transition-all hover:scale-105"
                  style={{ borderColor: isPlaying ? "#ef4444" : "#00ff41", background: isPlaying ? "#ef444415" : "#00ff4115" }}
                  aria-label={isPlaying ? "Pause" : "Play"}
                >
                  {isPlaying ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="#ef4444"><rect x="6" y="5" width="4" height="14" rx="1" /><rect x="14" y="5" width="4" height="14" rx="1" /></svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="#00ff41"><path d="M8 5v14l11-7z" /></svg>
                  )}
                </button>
                <CtrlBtn onClick={next} aria="Next">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="#3b82f6"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" /></svg>
                </CtrlBtn>
              </div>
            </motion.div>
          </div>

          {/* Project tiles */}
          <div className="md:col-span-2">
            <ProjectCubeGrid
              accent={accent}
              activeProjectId={activeProjectId}
              isPlaying={isPlaying}
              onSelect={onSelectProject}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function fmt(s: number) {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

function CtrlBtn({ onClick, aria, children }: { onClick: () => void; aria: string; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      aria-label={aria}
      className="w-10 h-10 rounded-full border border-gray-800 flex items-center justify-center hover:border-current transition-colors"
    >
      {children}
    </button>
  );
}

function PlayerSkeleton() {
  return (
    <div className="w-full h-full flex items-center justify-center" style={{ minHeight: 290 }}>
      <div className="font-mono text-[10px] text-gray-700 animate-pulse">loading 3D player…</div>
    </div>
  );
}
