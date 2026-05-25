"use client";

import { useEffect, useState } from "react";
import Header from "@/components/Header";
import Terminal from "@/components/Terminal";
import Discography from "@/components/discography/Discography";
import Architecture from "@/components/swe/Architecture";
import Skills from "@/components/Skills";
import Connect from "@/components/Connect";

export default function Home() {
  const [mode, setMode] = useState<"cyber" | "swe">("cyber");

  useEffect(() => {
    document.body.classList.remove("mode-cyber", "mode-swe");
    document.body.classList.add(`mode-${mode}`);
  }, [mode]);

  // Always start at the top — browser sometimes restores scroll position
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, []);

  function toggleMode() {
    setMode((m) => (m === "cyber" ? "swe" : "cyber"));
  }

  return (
    <main>
      <Header mode={mode} onToggle={toggleMode} />

      {/* HERO — Terminal only, full width */}
      <section className="min-h-screen flex items-center pt-24 pb-12">
        <div className="max-w-5xl mx-auto px-6 w-full">
          <Terminal />
        </div>
      </section>

      <Skills mode={mode} />
      {mode === "cyber" ? <Discography mode={mode} /> : <Architecture mode={mode} />}
      <Connect />

      <footer className="py-8 border-t border-gray-900 text-center font-mono text-[11px] text-gray-700">
        &copy; {new Date().getFullYear()} Pragy Jha &middot; Built with Next.js + Tailwind
      </footer>
    </main>
  );
}
