// Shared helpers used across discography / swe modules.

/** Format seconds as m:ss */
export function formatTime(s: number): string {
  const m = Math.floor(s / 60);
  const sec = Math.floor(s % 60);
  return `${m}:${sec.toString().padStart(2, "0")}`;
}

/** Accent colour for a given mode. */
export function accentFor(mode: "cyber" | "swe"): string {
  return mode === "cyber" ? "#00ff41" : "#3b82f6";
}
