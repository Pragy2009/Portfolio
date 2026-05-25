"use client";

type Props = {
  mode: "cyber" | "swe";
  onToggle: () => void;
};

export default function Header({ mode, onToggle }: Props) {
  return (
    <header className="fixed top-0 w-full bg-darkbg/90 backdrop-blur-md border-b border-gray-900 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <div
          className="font-mono text-base sm:text-lg font-bold tracking-tight cursor-pointer flex items-center"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        >
          <span className="accent mr-2">⚡</span> Pragy Jha
          <span className="accent opacity-50 ml-3 text-[10px] sm:text-xs hidden sm:inline">
            // PORTFOLIO_V2.0
          </span>
        </div>

        {/* Mode toggle */}
        <div
          className="flex items-center bg-gray-900 rounded-full p-1 border border-gray-800 cursor-pointer"
          onClick={onToggle}
        >
          <div
            className={`px-3 sm:px-4 py-1 rounded-full text-[11px] font-bold transition-all ${
              mode === "cyber"
                ? "bg-gray-700 text-cyber font-mono"
                : "text-gray-500"
            }`}
          >
            CYBER
          </div>
          <div
            className={`px-3 sm:px-4 py-1 rounded-full text-[11px] font-bold transition-all ${
              mode === "swe" ? "bg-gray-700 text-swe" : "text-gray-500"
            }`}
          >
            SWE
          </div>
        </div>

        <nav className="hidden md:flex space-x-7 text-xs font-medium text-gray-400">
          <a href="#skills" className="hover:text-white transition-colors">
            SKILLS
          </a>
          <a href="#projects" className="hover:text-white transition-colors">
            PROJECTS
          </a>
          <a href="#connect" className="hover:text-white transition-colors">
            CONNECT
          </a>
        </nav>
      </div>
    </header>
  );
}
