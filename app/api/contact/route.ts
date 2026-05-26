import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export const runtime = "nodejs";

// Basic email regex for input validation
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: Request) {
  try {
    const { name, email, message } = await req.json();

    // Validate
    if (!name || !email || !message) {
      return NextResponse.json(
        { error: "All fields are required" },
        { status: 400 }
      );
    }
    if (typeof name !== "string" || name.length > 100) {
      return NextResponse.json({ error: "Invalid name" }, { status: 400 });
    }
    if (typeof email !== "string" || !emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }
    if (typeof message !== "string" || message.length > 5000) {
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

    // Strip newlines in headers to prevent injection
    const safeName = name.replace(/[\r\n]/g, " ").trim();
    const safeEmail = email.replace(/[\r\n]/g, " ").trim();

    await transporter.sendMail({
      from: `"Portfolio Contact" <${GMAIL_USER}>`,
      to: CONTACT_TO,
      replyTo: safeEmail,
      subject: `[Portfolio] New message from ${safeName}`,
      text:
`New message from your portfolio.

Name: ${safeName}
Email: ${safeEmail}

Message:
${message}
`,
      html: `
        <div style="font-family:system-ui,sans-serif;max-width:600px;">
          <h2 style="color:#00ff41;font-family:monospace;">[Portfolio] Incoming Transmission</h2>
          <p><strong>From:</strong> ${escapeHtml(safeName)} &lt;${escapeHtml(safeEmail)}&gt;</p>
          <hr/>
          <pre style="white-space:pre-wrap;font-family:inherit;">${escapeHtml(message)}</pre>
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
