import { FOAM, buildCode, edgeOf, faceOf, parseBuild, type PadBuild } from "./pad/options";

export interface Contact {
  name: string;
  email: string;
  phone?: string;
  quantity: number;
  notes?: string;
}

export interface BuildRequest {
  build: PadBuild;
  contact: Contact;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export type FieldErrors = Partial<Record<keyof Contact, string>>;

export function validateContact(c: Partial<Contact>): FieldErrors {
  const e: FieldErrors = {};
  if (!c.name || c.name.trim().length < 2) e.name = "Enter your name.";
  if (!c.email || !EMAIL_RE.test(c.email.trim())) e.email = "Enter a valid email so Matt can reply.";
  if (c.phone && !/^[+\d][\d\s()-]{6,}$/.test(c.phone.trim())) e.phone = "That phone number doesn't look right.";
  const q = Number(c.quantity);
  if (!Number.isInteger(q) || q < 1 || q > 500) e.quantity = "Quantity must be between 1 and 500.";
  if (c.notes && c.notes.length > 2000) e.notes = "Keep notes under 2000 characters.";
  return e;
}

/** Parse an untrusted request body. Returns null when anything is invalid. */
export function parseBuildRequest(body: unknown): BuildRequest | null {
  if (!body || typeof body !== "object") return null;
  const o = body as Record<string, unknown>;
  const build = parseBuild(o.build);
  const c = (o.contact ?? {}) as Record<string, unknown>;
  const str = (v: unknown) => (typeof v === "string" ? v.trim() : undefined);
  const contact: Contact = {
    name: str(c.name) ?? "",
    email: str(c.email) ?? "",
    phone: str(c.phone) || undefined,
    quantity: Number(c.quantity),
    notes: str(c.notes) || undefined,
  };
  if (!build || Object.keys(validateContact(contact)).length) return null;
  return { build, contact };
}

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[ch]!);

export function renderBuildEmail({ build, contact }: BuildRequest) {
  const code = buildCode(build);
  const rows: [string, string][] = [
    ["Build code", code],
    ["Foam", `${FOAM.name} (${FOAM.line})`],
    ["Size (velcro Ø)", `${build.size} mm`],
    ["Height", `${build.thickness} mm`],
    ["Edge", edgeOf(build.edge).name],
    ["Face", faceOf(build.face).name],
    ["Quantity", String(contact.quantity)],
    ["Name", contact.name],
    ["Email", contact.email],
    ["Phone", contact.phone ?? "—"],
    ["Notes", contact.notes ?? "—"],
  ];
  const subject = `Custom pad request ${code} × ${contact.quantity} — ${contact.name}`;
  const text = rows.map(([k, v]) => `${k}: ${v}`).join("\n");
  const html = `<!doctype html><html><body style="margin:0;background:#08080a;font-family:Arial,sans-serif;color:#f5f2ea">
<div style="max-width:560px;margin:0 auto;padding:28px">
<p style="font-family:monospace;font-size:11px;letter-spacing:.2em;color:#c99a4a;margin:0 0 8px">THE PAD KING · CUSTOM BUILD REQUEST</p>
<h1 style="font-size:26px;margin:0 0 20px;color:#f5f2ea">${esc(code)}</h1>
<table style="width:100%;border-collapse:collapse">${rows
    .map(
      ([k, v]) =>
        `<tr><td style="padding:9px 0;border-bottom:1px solid #222;color:#a8a49a;font-size:13px;width:40%">${esc(k)}</td><td style="padding:9px 0;border-bottom:1px solid #222;font-size:14px">${esc(v)}</td></tr>`,
    )
    .join("")}</table>
<p style="color:#6b675f;font-size:12px;margin-top:20px">Reply to this email to answer ${esc(contact.name)} directly.</p>
</div></body></html>`;
  return { subject, text, html };
}
