import { NextResponse } from "next/server";
import { parseBuildRequest, renderBuildEmail } from "@/lib/buildRequest";
import { buildCode } from "@/lib/pad/options";

export const runtime = "nodejs";

/**
 * Custom pad maker → email to The Pad King.
 * Sends through Resend's HTTP API when RESEND_API_KEY, BUILD_REQUEST_TO and
 * BUILD_REQUEST_FROM are set (see .env.example). Without them it answers 503 —
 * it never pretends a request was sent.
 */
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad_json" }, { status: 400 });
  }

  // honeypot: real people never see or fill this field
  if (body && typeof body === "object" && (body as Record<string, unknown>).company) {
    return NextResponse.json({ ok: true });
  }

  const parsed = parseBuildRequest(body);
  if (!parsed) return NextResponse.json({ error: "invalid" }, { status: 422 });

  const { RESEND_API_KEY, BUILD_REQUEST_TO, BUILD_REQUEST_FROM } = process.env;
  if (!RESEND_API_KEY || !BUILD_REQUEST_TO || !BUILD_REQUEST_FROM) {
    return NextResponse.json({ error: "not_configured" }, { status: 503 });
  }

  const { subject, text, html } = renderBuildEmail(parsed);
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: BUILD_REQUEST_FROM,
      to: BUILD_REQUEST_TO.split(",").map((s) => s.trim()),
      reply_to: parsed.contact.email,
      subject,
      text,
      html,
    }),
  });

  if (!res.ok) {
    console.error("build-request: email provider error", res.status, await res.text().catch(() => ""));
    return NextResponse.json({ error: "send_failed" }, { status: 502 });
  }
  return NextResponse.json({ ok: true, code: buildCode(parsed.build) });
}
