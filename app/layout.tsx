import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pragy Jha — Portfolio",
  description:
    "Pragy Jha — Cybersecurity & Software Engineering portfolio. B.Tech CSE student at VIT.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="mode-cyber">{children}</body>
    </html>
  );
}
