"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { tracks, type Track } from "@/lib/tracks";

// ──────────────────────────────────────────────────────────────
//  useAudioPlayer
//  Single source of truth for playback. Owns ONE <audio> element so
//  two tracks can never overlap. Falls back to a timed simulation
//  when a track has no audioSrc. Cleans up listeners + intervals.
// ──────────────────────────────────────────────────────────────

export type PlayerState = {
  activeIndex: number | null;
  track: Track | null;
  isPlaying: boolean;
  elapsed: number;
  duration: number;
  progress: number; // 0-100
};

export function useAudioPlayer() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [duration, setDuration] = useState(50);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const simRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Lazily create the single shared audio element (client only)
  useEffect(() => {
    const audio = new Audio();
    audio.preload = "none";
    audioRef.current = audio;

    const onTime = () => {
      if (audio.src && !audio.paused) setElapsed(audio.currentTime);
    };
    const onMeta = () => {
      if (!isNaN(audio.duration) && isFinite(audio.duration)) {
        setDuration(audio.duration);
      }
    };
    const onEnded = () => setIsPlaying(false);

    audio.addEventListener("timeupdate", onTime);
    audio.addEventListener("loadedmetadata", onMeta);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.removeEventListener("timeupdate", onTime);
      audio.removeEventListener("loadedmetadata", onMeta);
      audio.removeEventListener("ended", onEnded);
      audio.pause();
      audio.src = "";
      if (simRef.current) clearInterval(simRef.current);
    };
  }, []);

  const clearSim = () => {
    if (simRef.current) {
      clearInterval(simRef.current);
      simRef.current = null;
    }
  };

  // React to play/pause + track changes
  useEffect(() => {
    const audio = audioRef.current;
    clearSim();

    if (activeIndex === null || !isPlaying) {
      audio?.pause();
      return;
    }

    const track = tracks[activeIndex];

    if (track.audioSrc) {
      // Real audio — ensure correct source, then play
      if (audio) {
        const want = track.audioSrc;
        if (!audio.src.endsWith(want)) {
          audio.src = want;
          audio.currentTime = 0;
        }
        audio.play().catch(() => {
          // Autoplay blocked or file missing — fall back to simulation
          runSimulation(track.duration);
        });
      }
    } else {
      // Simulation
      runSimulation(track.duration);
    }

    function runSimulation(dur: number) {
      clearSim();
      simRef.current = setInterval(() => {
        setElapsed((e) => {
          if (e >= dur) {
            setIsPlaying(false);
            return dur;
          }
          return e + 0.1;
        });
      }, 100);
    }

    return clearSim;
  }, [isPlaying, activeIndex]);

  const selectTrack = useCallback((index: number) => {
    const track = tracks[index];
    setActiveIndex(index);
    setElapsed(0);
    setDuration(track.duration);
    setIsPlaying(true);
    const audio = audioRef.current;
    if (audio && track.audioSrc) {
      audio.src = track.audioSrc;
      audio.currentTime = 0;
    } else if (audio) {
      audio.pause();
      audio.removeAttribute("src");
    }
  }, []);

  const togglePlay = useCallback(() => {
    setActiveIndex((idx) => {
      if (idx === null) {
        // nothing loaded — start first track
        const t = tracks[0];
        setElapsed(0);
        setDuration(t.duration);
        setIsPlaying(true);
        return 0;
      }
      return idx;
    });
    // toggle only if something is already loaded
    setIsPlaying((p) => (activeIndex === null ? true : !p));
    if (elapsed >= duration) setElapsed(0);
  }, [activeIndex, elapsed, duration]);

  const next = useCallback(() => {
    setActiveIndex((idx) => {
      const ni = idx === null ? 0 : (idx + 1) % tracks.length;
      const t = tracks[ni];
      setElapsed(0);
      setDuration(t.duration);
      setIsPlaying(true);
      const audio = audioRef.current;
      if (audio && t.audioSrc) { audio.src = t.audioSrc; audio.currentTime = 0; }
      return ni;
    });
  }, []);

  const prev = useCallback(() => {
    setActiveIndex((idx) => {
      const pi = idx === null ? tracks.length - 1 : (idx - 1 + tracks.length) % tracks.length;
      const t = tracks[pi];
      setElapsed(0);
      setDuration(t.duration);
      setIsPlaying(true);
      const audio = audioRef.current;
      if (audio && t.audioSrc) { audio.src = t.audioSrc; audio.currentTime = 0; }
      return pi;
    });
  }, []);

  const state: PlayerState = {
    activeIndex,
    track: activeIndex !== null ? tracks[activeIndex] : null,
    isPlaying,
    elapsed,
    duration,
    progress: duration > 0 ? (elapsed / duration) * 100 : 0,
  };

  return { state, selectTrack, togglePlay, next, prev };
}
