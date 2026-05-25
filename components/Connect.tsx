"use client";

import { useState, FormEvent } from "react";
import { profile } from "@/lib/data";

type Status = "idle" | "sending" | "success" | "error";

export default function Connect() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errMsg, setErrMsg] = useState("");

  const [honeypot, setHoneypot] = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setErrMsg("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          message: message.trim(),
          company: honeypot,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Send failed");
      setStatus("success");
      setName("");
      setEmail("");
      setMessage("");
      setHoneypot("");
      setTimeout(() => setStatus("idle"), 4500);
    } catch (err: any) {
      setErrMsg(err.message || "Send failed");
      setStatus("error");
      setTimeout(() => setStatus("idle"), 4500);
    }
  }

  return (
    <section id="connect" className="py-20 border-t border-gray-900">
      <div className="max-w-3xl mx-auto px-6">
        <h2 className="font-mono text-2xl mb-8 font-normal">
          <span className="accent">03 //</span> ESTABLISH_CONNECTION
        </h2>

        <div className="bg-[#050505] border accent-border rounded-xl p-8 pt-12 relative">
          {/* Terminal header bar */}
          <div className="absolute top-0 left-0 right-0 h-8 bg-gray-900 rounded-t-xl border-b border-gray-900 flex items-center px-4">
            <span className="font-mono text-[11px] text-gray-600">
              root@portfolio:~ — bash — 80x24
            </span>
          </div>

          <p className="font-mono text-xs mb-6 text-gray-400">
            <span className="accent font-bold">root@portfolio:~$</span>{" "}
            ./connect.sh --secure-channel
          </p>

          <form onSubmit={handleSubmit} className="space-y-5 font-mono text-xs">
            <Field
              label="User_Identifier:"
              type="text"
              placeholder="Enter Handle..."
              value={name}
              onChange={setName}
            />
            <Field
              label="Secure_Channel_URI:"
              type="email"
              placeholder="Email Address..."
              value={email}
              onChange={setEmail}
            />
            <div className="flex flex-col md:flex-row md:items-start gap-3">
              <label className="text-gray-500 md:w-44 pt-2 flex-shrink-0">
                Message_Payload:
              </label>
              <textarea
                required
                rows={4}
                placeholder="Encrypt message here..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                maxLength={5000}
                className="flex-1 w-full bg-transparent border border-gray-800 rounded p-3 text-white placeholder-gray-700 outline-none focus:border-white transition-colors resize-none"
              />
            </div>
            <input
              type="text"
              name="company"
              tabIndex={-1}
              autoComplete="off"
              value={honeypot}
              onChange={(e) => setHoneypot(e.target.value)}
              className="hidden"
            />

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                disabled={status === "sending"}
                className="accent accent-border accent-bg border px-7 py-2.5 rounded font-bold uppercase tracking-widest text-[11px] disabled:opacity-50 hover:opacity-80 transition-opacity"
              >
                {status === "sending"
                  ? "...ENCRYPTING..."
                  : "> TRANSMIT_PAYLOAD"}
              </button>
            </div>

            {status === "success" && (
              <div className="text-center accent font-mono text-xs">
                Status: 200 OK. Payload delivered to {profile.email}.
              </div>
            )}
            {status === "error" && (
              <div className="text-center text-red-400 font-mono text-xs">
                Status: 500. {errMsg}
              </div>
            )}
          </form>
        </div>

        {/* Social fallbacks */}
        <div className="mt-8 flex flex-wrap gap-3 justify-center text-xs font-mono text-gray-500">
          <a
            href={`mailto:${profile.email}`}
            className="hover:text-white transition-colors"
          >
            {profile.email}
          </a>
          <span className="text-gray-700">|</span>
          <a
            href={profile.github}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition-colors"
          >
            GitHub
          </a>
          <span className="text-gray-700">|</span>
          <a
            href={profile.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white transition-colors"
          >
            LinkedIn
          </a>
        </div>
      </div>
    </section>
  );
}

function Field({
  label,
  type,
  placeholder,
  value,
  onChange,
}: {
  label: string;
  type: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-col md:flex-row md:items-center gap-3">
      <label className="text-gray-500 md:w-44 flex-shrink-0">{label}</label>
      <input
        type={type}
        required
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        maxLength={type === "email" ? 254 : 100}
        autoComplete={type === "email" ? "email" : "name"}
        className="flex-1 w-full bg-transparent border-b border-gray-800 focus:border-white outline-none py-2 text-white placeholder-gray-700 transition-colors"
      />
    </div>
  );
}
