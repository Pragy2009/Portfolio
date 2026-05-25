"use client";

import { useEffect, useRef, useState } from "react";
import { profile, projects, skills } from "@/lib/data";
import AsciiAvatar from "@/components/AsciiAvatar";

const PROMPT = "guest@system:~$";

type Line = {
  prompt?: string;
  value: string;
  type: "command" | "output" | "error";
};

const COMMANDS: Record<string, string | string[]> = {
  help: [
    "┌─ AVAILABLE COMMANDS ──────────────────────────────┐",
    "│  whoami      — Identity & current status           │",
    "│  education   — Degree, school, CGPA                │",
    "│  skills      — Full technical skill set            │",
    "│  cyber       — Cybersecurity tools & expertise     │",
    "│  projects    — All 6 projects with stack           │",
    "│  certs       — Certifications & achievements       │",
    "│  status      — Current availability & targets      │",
    "│  contact     — Email, GitHub, LinkedIn             │",
    "│  social      — Competitive profiles (LC, GFG, THM) │",
    "│  sudo        — Try it. I dare you.                 │",
    "│  clear       — Wipe the terminal                   │",
    "│  help        — Show this menu                      │",
    "└────────────────────────────────────────────────────┘",
  ],
  whoami: [
    `> Name    : ${profile.name}`,
    `> Role    : Cybersecurity Engineer & Software Developer`,
    `> Degree  : ${profile.education.degree}`,
    `> School  : ${profile.education.school}`,
    `> CGPA    : ${profile.education.cgpa}`,
    `> Status  : OPERATIONAL ✓`,
  ],
  education: [
    `> Degree  : ${profile.education.degree}`,
    `> School  : ${profile.education.school}`,
    `> CGPA    : ${profile.education.cgpa}`,
    `> Period  : ${profile.education.period}`,
    `> Extra   : ${profile.extracurricular}`,
  ],
  skills: [
    "── CYBERSECURITY ──────────────────────────────────",
    ...skills.cyber.map((s) => `  [+] ${s}`),
    "── SOFTWARE DEVELOPMENT ───────────────────────────",
    ...skills.swe.map((s) => `  [+] ${s}`),
  ],
  cyber: [
    "── OFFENSIVE & DEFENSIVE SECURITY ─────────────────",
    ...skills.cyber.map((s) => `  [*] ${s}`),
    "",
    "  Platforms: TryHackMe (active) · HackTheBox",
    "  Focus    : VAPT · Red Teaming · Threat Modeling",
  ],
  projects: [
    "── PROJECT MANIFEST ────────────────────────────────",
    ...projects.map(
      (p, i) =>
        `  ${String(i + 1).padStart(2, "0")}. [${p.tag}] ${p.title}${
          p.period ? ` (${p.period})` : ""
        }`
    ),
    "",
    "  Scroll down to the Discography to play any of them.",
  ],
  certs: [
    "── CERTIFICATIONS ──────────────────────────────────",
    ...skills.certifications.map((c) => `  [✓] ${c}`),
    "── ACHIEVEMENTS ────────────────────────────────────",
    ...skills.achievements.map((a) => `  [★] ${a}`),
  ],
  status: [
    "> Availability : Open to fresher roles (Jun 2026)",
    "> Target       : Cybersecurity / Penetration Testing",
    "> Graduation   : Jun 2026 — VIT University",
    "> Currently    : Final year B.Tech CSE",
    "> Building     : RootReaper VAPT Automation Suite",
  ],
  contact: [
    `> Email    : ${profile.email}`,
    `> GitHub   : ${profile.github}`,
    `> LinkedIn : ${profile.linkedin}`,
    `> Resume   : ${profile.resume}`,
  ],
  social: [
    "> LeetCode  : 100 Days Badge 2025 · Top SQL 50 Medal",
    "> GFG       : 161+ solved · 103-day streak",
    "> TryHackMe : Active · Seeker 0x4 badge",
  ],
  sudo: [
    "[sudo] password for guest:",
    "guest is not in the sudoers file. This incident will be reported.",
    "Just kidding. But seriously, type 'help' to see what you can actually do.",
  ],
};

const QUICK_CMDS = [
  "whoami","skills","projects","cyber","certs","status","contact","social","clear",
];

export default function Terminal() {
  const [history, setHistory] = useState<Line[]>([]);
  const [input, setInput] = useState("");
  const [cmdHistory, setCmdHistory] = useState<string[]>([]);
  const [histIdx, setHistIdx] = useState(-1);
  const [showPortrait, setShowPortrait] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  function runCommand(raw: string) {
    const cmd = raw.trim().toLowerCase();
    if (!cmd) return;

    setShowPortrait(false);
    setCmdHistory((h) => [cmd, ...h]);
    setHistIdx(-1);

    if (cmd === "clear") {
      setHistory([]);
      setShowPortrait(true);
      return;
    }

    const commandLine: Line = { prompt: PROMPT, value: cmd, type: "command" };

    if (cmd.startsWith("project ")) {
      const slug = cmd.replace("project ", "").trim();
      const proj = projects.find(
        (p) => p.id === slug || p.title.toLowerCase().includes(slug)
      );
      if (proj) {
        const divider = `── ${proj.title.toUpperCase()} ${"─".repeat(
          Math.max(0, 44 - proj.title.length)
        )}`;
        const lines: Line[] = [
          commandLine,
          { value: divider, type: "output" },
          { value: `  Tag    : ${proj.tag}`, type: "output" },
          { value: `  Stack  : ${proj.stack}`, type: "output" },
          { value: `  Desc   : ${proj.desc}`, type: "output" },
          ...(proj.period ? [{ value: `  Period : ${proj.period}`, type: "output" as const }] : []),
          ...(proj.github ? [{ value: `  GitHub : ${proj.github}`, type: "output" as const }] : [{ value: `  GitHub : [private]`, type: "output" as const }]),
          ...(proj.live ? [{ value: `  Live   : ${proj.live}`, type: "output" as const }] : []),
        ];
        setHistory((h) => [...h, ...lines]);
        return;
      } else {
        setHistory((h) => [
          ...h,
          commandLine,
          { value: `project '${slug}' not found. Type 'projects' to list all.`, type: "error" },
        ]);
        return;
      }
    }

    if (cmd in COMMANDS) {
      const out = COMMANDS[cmd];
      const outLines: Line[] = Array.isArray(out)
        ? out.map((v) => ({ value: v, type: "output" as const }))
        : [{ value: out, type: "output" as const }];
      setHistory((h) => [...h, commandLine, ...outLines]);
    } else {
      setHistory((h) => [
        ...h,
        commandLine,
        { value: `command not found: ${cmd} — type 'help' for available commands`, type: "error" },
      ]);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    runCommand(input);
    setInput("");
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowUp") {
      e.preventDefault();
      const next = Math.min(histIdx + 1, cmdHistory.length - 1);
      setHistIdx(next);
      setInput(cmdHistory[next] ?? "");
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      const next = Math.max(histIdx - 1, -1);
      setHistIdx(next);
      setInput(next === -1 ? "" : cmdHistory[next]);
    }
  }

  return (
    <div
      className="bg-black border accent-border rounded-lg shadow-2xl flex flex-col w-full"
      style={{ height: "620px" }}
      onClick={() => inputRef.current?.focus()}
    >
      {/* Title bar */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-900 flex-shrink-0">
        <div className="w-3 h-3 rounded-full bg-red-500 opacity-80"></div>
        <div className="w-3 h-3 rounded-full bg-yellow-500 opacity-80"></div>
        <div className="w-3 h-3 rounded-full bg-green-500 opacity-80"></div>
        <span className="ml-2 font-mono text-[11px] text-gray-600">
          pragy@portfolio — bash — 80x24
        </span>
      </div>

      {/* Output */}
      <div className="flex-1 overflow-y-auto px-6 py-5 font-mono">

        {/* Portrait + simple greeting */}
        {showPortrait && (
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            {/* Live 3D ASCII avatar — hidden on the smallest screens */}
            <div className="flex-shrink-0 hidden sm:block">
              <AsciiAvatar cols={160} rows={110} color="var(--accent, #00ff41)" />
            </div>

            {/* Simple greeting */}
            <div className="flex flex-col gap-3 min-w-0">
              <div className="text-white text-lg font-mono leading-tight">
                Hi there, I&apos;m <span className="accent font-bold">Pragy Jha</span>.
              </div>
              <div className="space-y-2 mt-2">
                <div className="text-[12px] font-mono text-gray-300 leading-relaxed flex gap-2">
                  <span className="accent">▸</span>
                  <span>Final-year B.Tech CSE at VIT, specializing in Cyber Security &amp; Digital Forensics.</span>
                </div>
                <div className="text-[12px] font-mono text-gray-300 leading-relaxed flex gap-2">
                  <span className="accent">▸</span>
                  <span>I break things on purpose so I can patch them with style. Currently fluent in Python, payloads, and procrastination.</span>
                </div>
              </div>
              <div className="mt-4 text-[11px] font-mono text-gray-600">
                ↳ type a command or click a pill below.
              </div>
            </div>
          </div>
        )}

        {/* Command history */}
        <div className="space-y-0.5">
          {history.map((line, i) => (
            <div key={i} className="flex gap-2 text-xs">
              {line.prompt && (
                <span className="accent font-bold flex-shrink-0 whitespace-nowrap">
                  {line.prompt}
                </span>
              )}
              <span
                className={
                  line.type === "command"
                    ? "text-white"
                    : line.type === "error"
                    ? "text-red-400"
                    : "text-gray-400"
                }
              >
                {line.value}
              </span>
            </div>
          ))}
        </div>

        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-2 px-4 py-3 border-t border-gray-900 flex-shrink-0"
        onClick={(e) => e.stopPropagation()}
      >
        <span className="accent font-mono text-xs font-bold flex-shrink-0 whitespace-nowrap">
          {PROMPT}
        </span>
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          className="flex-1 bg-transparent font-mono text-xs text-white outline-none placeholder-gray-700"
          placeholder="Type a command..."
          autoComplete="off"
          spellCheck={false}
        />
        <button
          type="submit"
          className="accent accent-border border px-3 py-1 font-mono text-[10px] font-bold rounded hover:opacity-70 transition-opacity flex-shrink-0"
        >
          RUN
        </button>
      </form>

      {/* Quick pills */}
      <div
        className="px-4 pb-3 flex flex-wrap gap-1.5 flex-shrink-0"
        onClick={(e) => e.stopPropagation()}
      >
        {QUICK_CMDS.map((cmd) => (
          <button
            key={cmd}
            onClick={() => { runCommand(cmd); inputRef.current?.focus(); }}
            className="font-mono text-[10px] border border-gray-800 px-2.5 py-1 rounded-full text-gray-500 hover:border-gray-500 hover:text-gray-300 transition-colors"
          >
            {cmd}
          </button>
        ))}
      </div>
    </div>
  );
}