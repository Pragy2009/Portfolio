"use client";

import { skills } from "@/lib/data";

type Props = { mode: "cyber" | "swe" };

export default function Skills({ mode }: Props) {
  // Lead with the active discipline's skills; the other set is dimmed.
  const primary =
    mode === "cyber"
      ? { title: "Offensive & Defensive Security", color: "text-cyber", items: skills.cyber, mono: true }
      : { title: "Dev & Architecture", color: "text-swe", items: skills.swe, mono: false };
  const secondary =
    mode === "cyber"
      ? { title: "Dev & Architecture", color: "text-swe", items: skills.swe, mono: false }
      : { title: "Offensive & Defensive Security", color: "text-cyber", items: skills.cyber, mono: true };

  return (
    <section id="skills" className="py-20 border-t border-gray-900">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="font-mono text-2xl mb-2 flex items-center gap-3 font-normal">
          <span className="accent">01 //</span> CORE_COMPETENCIES
          <div className="flex-1 h-px bg-gray-900 ml-2"></div>
        </h2>
        <p className="font-mono text-[11px] text-gray-600 mb-10">
          {mode === "cyber"
            ? "Security tooling and offensive engineering, front and centre."
            : "Systems, languages and infrastructure, front and centre."}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SkillCard title={primary.title} color={primary.color} items={primary.items} mono={primary.mono} />
          <SkillCard title={secondary.title} color={secondary.color} items={secondary.items} mono={secondary.mono} dim />
          <SkillCard title="Certifications" color="text-amber-400" items={skills.certifications} span />
          <SkillCard title="Achievements" color="text-amber-400" items={skills.achievements} span highlight />
        </div>
      </div>
    </section>
  );
}

function SkillCard({
  title, color, items, mono, span, highlight, dim,
}: {
  title: string;
  color: string;
  items: string[];
  mono?: boolean;
  span?: boolean;
  highlight?: boolean;
  dim?: boolean;
}) {
  return (
    <div
      className={`bg-cardbg border border-gray-900 rounded-xl p-7 transition-opacity duration-300 ${
        span ? "md:col-span-2" : ""
      } ${dim ? "opacity-50" : "opacity-100"}`}
    >
      <h3 className="text-base font-medium mb-5 flex items-center gap-2">
        <span className={`${color} text-lg`}>◆</span> {title}
      </h3>
      <div className="flex flex-wrap gap-2">
        {items.map((item, i) => (
          <span
            key={i}
            className={`px-3 py-1 bg-black border border-gray-800 rounded text-xs text-gray-300 cursor-default transition-colors hover:border-gray-600 ${
              mono ? "font-mono" : ""
            } ${highlight ? "text-amber-400/90" : ""}`}
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
