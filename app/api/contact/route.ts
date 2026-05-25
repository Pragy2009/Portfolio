import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export const runtime = "nodejs";

// Basic email regex for input validation
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_ATTEMPTS = 5;
const RATE_LIMIT_BUCKET = new Map<
  string,
  { count: number; resetAt: number }
>();

function normalizeInput(value: unknown) {
  if (typeof value !== "string") return "";
  return value.replace(/[\r\n]+/g, " ").trim();
}

function getClientIp(req: Request) {
  const forwardedFor = req.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0].trim();
  }

  const realIp = req.headers.get("x-real-ip");
  return realIp || "unknown";
}

function rateLimitExceeded(req: Request) {
  const ip = getClientIp(req);
  const now = Date.now();
  const bucket = RATE_LIMIT_BUCKET.get(ip);

  if (!bucket) {
    RATE_LIMIT_BUCKET.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  if (now > bucket.resetAt) {
    RATE_LIMIT_BUCKET.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  if (bucket.count >= RATE_LIMIT_MAX_ATTEMPTS) {
    return true;
  }

  bucket.count += 1;
  RATE_LIMIT_BUCKET.set(ip, bucket);
  return false;
}

export async function POST(req: Request) {
  try {
    if (rateLimitExceeded(req)) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    const { name, email, message, company } = await req.json();

    if (typeof company !== "undefined" && company !== "") {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    const safeName = normalizeInput(name);
    const safeEmail = normalizeInput(email);
    const safeMessage = normalizeInput(message);

    if (!safeName || !safeEmail || !safeMessage) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }

    if (safeName.length > 100) {
      return NextResponse.json({ error: "Invalid name" }, { status: 400 });
    }

    if (!emailRegex.test(safeEmail)) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    if (safeMessage.length > 5000) {
      return NextResponse.json({ error: "Invalid message" }, { status: 400 });
    }

    // Env vars (set in .env.local)
    const { GMAIL_USER, GMAIL_APP_PASSWORD, CONTACT_TO } = process.env;
    if (!GMAIL_USER || !GMAIL_APP_PASSWORD || !CONTACT_TO) {
      console.error("Missing env vars: GMAIL_USER / GMAIL_APP_PASSWORD / CONTACT_TO");
      return NextResponse.json(
        { error: "Email service not configured" },
        { status: 500 }
      );
    }

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: GMAIL_USER,
        pass: GMAIL_APP_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: `"Portfolio Contact" <${GMAIL_USER}>`,
      to: CONTACT_TO,
      replyTo: safeEmail,
      subject: `[Portfolio] New message from ${safeName}`,
      text: `New message from your portfolio.

Name: ${safeName}
Email: ${safeEmail}

Message:
${safeMessage}
`,
      html: `
        <div style="font-family:system-ui,sans-serif;max-width:600px;">
          <h2 style="color:#00ff41;font-family:monospace;">[Portfolio] Incoming Transmission</h2>
          <p><strong>From:</strong> ${escapeHtml(safeName)} &lt;${escapeHtml(safeEmail)}&gt;</p>
          <hr/>
          <pre style="white-space:pre-wrap;font-family:inherit;">${escapeHtml(safeMessage)}</pre>
        </div>
      `,
    });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    console.error("Contact API error:", err);
    return NextResponse.json(
      { error: "Failed to send. Please try again later." },
      { status: 500 }
    );
  }
}

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
