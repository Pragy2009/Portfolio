// Edit this file to update any portfolio content. Nothing here is hard-coded
// anywhere else, so updating this file updates the whole site.

export type Project = {
  id: string;
  title: string;
  tag: string;             // short label shown on the song tile
  cat: "Cyber" | "SWE";    // which mode highlights this project
  stack: string;           // tech stack line in the detail panel
  desc: string;            // long description
  github: string | null;   // GitHub URL, or null to hide the button
  live: string | null;     // live demo URL, or null to hide
  period?: string;         // optional date range
};

export const profile = {
  name: "Pragy Jha",
  tagline: "Cybersecurity + Software Engineering",

  // TODO: fill these in after scaffolding
  email: "pragyjha050@gmail.com",          // shown in connect section + receives form submissions
  github: "https://github.com/Pragy2009/",
  linkedin: "https://www.linkedin.com/in/pragyjha",
  resume: "https://drive.google.com/file/d/1FVJO1_oCI7zagzKbQxslEccDOgwwpSvU/view?usp=sharing",                     // drop your resume into /public/resume.pdf

  education: {
    degree: "B.Tech CSE (Cyber Security & Digital Forensics)",
    school: "Vellore Institute of Technology University",
  },

  extracurricular: "Core Member — Data Science Club ",
};

export const skills = {
  cyber: [
    "VAPT",
    "Penetration Testing",
    "Threat Modeling",
    "BurpSuite",
    "Nmap",
    "Metasploit",
    "Wireshark",
    "Nessus",
    "Netcat",
    "TryHackMe",
  ],
  swe: [
    "C++",
    "Python",
    "Flutter / Dart",
    "Qt6",
    "NodeJS",
    "Next.js",
    "MongoDB",
    "Docker",
    "Linux",
    "Git",
    "DSA / OOP",
  ],
  certifications: [
    "AWS Academy Cloud Architecting",
    "AWS Academy Cloud Foundations",
    "NPTEL: Foundations of Cyber-Physical Systems",
    "MongoDB DBA — FacePrep",
  ],
  achievements: [
    "LeetCode 100 Days Badge 2025",
    "LeetCode Top SQL 50 Medal",
    "GFG 161+ solved · 103-day streak",
    "IEEE ICONAT 2025 — Published",
  ],
};

// Project order = order on the record player.
// Set github/live to null to hide the corresponding button.
export const projects: Project[] = [
  {
    id: "keysafe",
    title: "KeySafe Vault",
    tag: "ENCRYPTION",
    cat: "swe",
    stack: "Flutter · NodeJS · ExpressJS · MongoDB",
    desc: "Tiered encryption system with role-based access control. Flutter frontend, NodeJS + ExpressJS backend, MongoDB persistence.",
    period: "Oct – Nov 2023",
    github: null,  // TODO: add your KeySafe Vault repo URL
    live: null,
  },
  {
    id: "cryptomancer",
    title: "CryptoMancer",
    tag: "CIPHER",
    cat: "cyber",
    stack: "C++ · Qt6 · AES-256 · DES · 3DES · OTP · Caesar",
    desc: "Multi-algorithm file and image encryption desktop app implementing Caesar, OTP, DES, 3DES, and AES-256 ciphers in C++ with a Qt6 GUI.",
    period: "Sep – Nov 2025",
    github: null,  // TODO: add CryptoMancer repo URL
    live: null,
  },
  {
    id: "rootreaper",
    title: "RootReaper Suite",
    tag: "VAPT",
    cat: "cyber",
    stack: "Python · Linux · Nmap · Metasploit · Custom CLI",
    desc: "Cross-platform Enterprise VAPT Automation Framework. Orchestrates reconnaissance, scanning, and structured reporting pipelines. Active development.",
    period: "Ongoing",
    github: null,  // TODO: add when public, or leave null to show "In Dev"
    live: null,
  },
  {
    id: "shopify",
    title: "Shopify Ingestion Service",
    tag: "FULLSTACK",
    cat: "swe",
    stack: "Next.js · Neon PostgreSQL · Prisma · Shopify Admin API",
    desc: "Multi-tenant Shopify data ingestion service built as the Xeno FDE assignment. Auth, manual sync, ingests orders and customers via Shopify Admin API, upserts into Neon PostgreSQL via Prisma, analytics dashboard in Next.js.",
    github: null,  // TODO: add Shopify project repo URL
    live: null,    // TODO: add the deployed URL
  },
  {
    id: "snapspeak",
    title: "SnapSpeak Translator",
    tag: "AUTOMATION",
    cat: "swe",
    stack: "Python · Selenium · OCR",
    desc: "Image-to-text translation pipeline. Automates OCR extraction and translation of text from images using Python and Selenium.",
    period: "Mar 2024",
    github: null,  // TODO: add SnapSpeak repo URL
    live: null,
  },
  {
    id: "ieee",
    title: "AI-Driven Fire Detection",
    tag: "RESEARCH",
    cat: "cyber",
    stack: "IEEE ICONAT 2025 · Data Privacy · Encryption",
    desc: "Published IEEE ICONAT 2025 paper on AI-driven fire detection and emergency response. My contribution focused on data protection, encryption, and privacy preservation within the system architecture.",
    github: null,
    live: null,    // TODO: add IEEE Xplore DOI/URL when available
  },
];
