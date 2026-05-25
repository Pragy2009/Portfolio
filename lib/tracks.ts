// ──────────────────────────────────────────────────────────────
//  TRACK DATA SYSTEM  (lib/tracks.ts)
// ──────────────────────────────────────────────────────────────
//
//  Scalable audio catalogue for the Project Discography.
//
//  HOW TO ADD A TRACK:
//    1. Drop the audio file in  /public/audio/your-file.mp3
//    2. (optional) Drop cover art in  /public/covers/your-cover.png
//    3. Append a new object to `tracks` below with audioSrc/coverArt paths.
//
//  SCALING TO 15-20 TRACKS:
//    Just keep appending. `linkedProject` ties a track to a project id
//    from lib/data.ts. Multiple tracks CAN share the same linkedProject —
//    clicking that project tile then randomly picks one of its tracks.
//
//  PLAYBACK FALLBACK:
//    audioSrc === null  →  player runs a timed simulation using `duration`.
//    audioSrc === "/audio/x.mp3"  →  real <audio> playback.
// ──────────────────────────────────────────────────────────────

export type TrackCategory =
  | "ENCRYPTION" | "CIPHER" | "VAPT" | "FULLSTACK" | "AUTOMATION" | "RESEARCH";

export type Track = {
  id: string;
  title: string;
  artist: string;
  category: TrackCategory;
  duration: number;          // seconds (simulation + fallback display)
  audioSrc: string | null;   // "/audio/x.mp3" or null
  coverArt: string | null;   // "/covers/x.png" or null
  linkedProject: string;     // project id from lib/data.ts
};

export const tracks: Track[] = [
  // ── Cybersecurity ──────────────────────────────────────────
  { id: "trk_rootreaper",   title: "RootReaper Suite",          artist: "prod. Pragy Jha", category: "VAPT",       duration: 50, audioSrc: null, coverArt: null, linkedProject: "rootreaper" },   // TODO /audio/rootreaper.mp3
  { id: "trk_keysafe",      title: "KeySafe Vault",             artist: "prod. Pragy Jha", category: "ENCRYPTION", duration: 50, audioSrc: null, coverArt: null, linkedProject: "keysafe" },      // TODO /audio/keysafe.mp3
  { id: "trk_cryptomancer", title: "CryptoMancer",              artist: "prod. Pragy Jha", category: "CIPHER",     duration: 50, audioSrc: null, coverArt: null, linkedProject: "cryptomancer" }, // TODO /audio/cryptomancer.mp3
  { id: "trk_snapspeak",    title: "SnapSpeak Translator",      artist: "prod. Pragy Jha", category: "AUTOMATION", duration: 50, audioSrc: null, coverArt: null, linkedProject: "snapspeak" },    // TODO /audio/snapspeak.mp3
  { id: "trk_ieee",         title: "AI Fire Detection",         artist: "IEEE ICONAT 2025", category: "RESEARCH",  duration: 50, audioSrc: null, coverArt: null, linkedProject: "ieee" },         // TODO /audio/ieee.mp3
  // ── Software Engineering ───────────────────────────────────
  { id: "trk_shopify",      title: "Shopify Ingestion Service", artist: "prod. Pragy Jha", category: "FULLSTACK",  duration: 50, audioSrc: null, coverArt: null, linkedProject: "shopify" },      // TODO /audio/shopify.mp3

  // ── PLACEHOLDERS to scale toward 15-20 (uncomment + fill) ──
  // { id: "trk_rootreaper_alt", title: "RootReaper (Recon Mix)", artist: "prod. Pragy Jha", category: "VAPT",       duration: 45, audioSrc: null, coverArt: null, linkedProject: "rootreaper" },
  // { id: "trk_keysafe_alt",    title: "KeySafe (RBAC Dub)",     artist: "prod. Pragy Jha", category: "ENCRYPTION", duration: 48, audioSrc: null, coverArt: null, linkedProject: "keysafe" },
  // { id: "trk_08", title: "Track 08", artist: "prod. Pragy Jha", category: "FULLSTACK",  duration: 50, audioSrc: null, coverArt: null, linkedProject: "shopify" },
  // ...continue to trk_20
];

// ── HELPERS ───────────────────────────────────────────────────
export function getTracksForProject(projectId: string): Track[] {
  return tracks.filter((t) => t.linkedProject === projectId);
}
export function pickRandomTrack(projectId: string): Track {
  const pool = getTracksForProject(projectId);
  if (pool.length === 0) return tracks[0];
  return pool[Math.floor(Math.random() * pool.length)];
}
export function indexOfTrack(id: string): number {
  return tracks.findIndex((t) => t.id === id);
}
