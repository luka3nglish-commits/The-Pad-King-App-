"use client";

import { useEffect, useId, useRef, useState } from "react";
import { track } from "@/lib/analytics";
import { validateContact, type Contact, type FieldErrors } from "@/lib/buildRequest";
import { FOAM, buildCode, edgeOf, faceOf, type PadBuild } from "@/lib/pad/options";

const PHONE = "0468 373 625";

type Status = { kind: "idle" } | { kind: "sending" } | { kind: "sent"; code: string } | { kind: "error"; message: string };

interface Props {
  open: boolean;
  onClose: () => void;
  build: PadBuild;
}

export function RequestSheet({ open, onClose, build }: Props) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const formId = useId();
  const [contact, setContact] = useState<Contact>({ name: "", email: "", phone: "", quantity: 1, notes: "" });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  useEffect(() => {
    const d = dialogRef.current;
    if (!d) return;
    if (open && !d.open) {
      d.showModal();
      track("build_request_open", { build: buildCode(build) });
      setStatus((s) => (s.kind === "sent" ? { kind: "idle" } : s));
    }
    if (!open && d.open) d.close();
    // only the open/close transition matters; the build is read at that moment
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const update = <K extends keyof Contact>(k: K, v: Contact[K]) => {
    setContact((c) => ({ ...c, [k]: v }));
    if (errors[k]) setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const submit = async (ev: React.FormEvent<HTMLFormElement>) => {
    ev.preventDefault();
    const found = validateContact(contact);
    setErrors(found);
    const first = Object.keys(found)[0];
    if (first) {
      document.getElementById(`${formId}-${first}`)?.focus();
      return;
    }
    setStatus({ kind: "sending" });
    const company = (new FormData(ev.currentTarget).get("company") as string) || "";
    try {
      const res = await fetch("/api/build-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ build, contact, company }),
      });
      if (res.ok) {
        setStatus({ kind: "sent", code: buildCode(build) });
        // build spec only, never the customer's details
        track("build_request_sent", { build: buildCode(build), quantity: contact.quantity });
        return;
      }
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      track("build_request_failed", { reason: data.error ?? `http_${res.status}` });
      setStatus({
        kind: "error",
        message:
          data.error === "not_configured"
            ? `Online requests aren't switched on yet. Call The Pad King on ${PHONE} with your build code.`
            : `That didn't send. Try again, or call ${PHONE} with your build code.`,
      });
    } catch {
      track("build_request_failed", { reason: "offline" });
      setStatus({ kind: "error", message: `You look to be offline. Try again, or call ${PHONE} with your build code.` });
    }
  };

  const field =
    "mt-1.5 block h-12 w-full rounded-xl border border-line-2 bg-bg/70 px-4 text-[16px] text-text placeholder:text-muted outline-none transition-colors focus:border-gold aria-[invalid=true]:border-orange";
  const err = (k: keyof Contact) =>
    errors[k] ? (
      <p id={`${formId}-${k}-err`} role="alert" className="mt-1.5 text-[13px] text-orange">
        {errors[k]}
      </p>
    ) : null;
  const a11y = (k: keyof Contact) => ({
    id: `${formId}-${k}`,
    "aria-invalid": !!errors[k],
    "aria-describedby": errors[k] ? `${formId}-${k}-err` : undefined,
  });

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      onClick={(e) => e.target === dialogRef.current && onClose()}
      className="pk-sheet m-0 mt-auto max-h-[92svh] w-full max-w-none overflow-y-auto rounded-t-[28px] border border-line-2 bg-surface p-0 text-text backdrop:bg-black/70 backdrop:backdrop-blur-sm md:m-auto md:max-w-[560px] md:rounded-[28px]"
      aria-labelledby={`${formId}-title`}
    >
      <div className="p-6 md:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="pk-eyebrow">Custom build request</p>
            <h3 id={`${formId}-title`} className="pk-display mt-2 text-[34px]">
              {status.kind === "sent" ? "Sent." : "Send to Matt."}
            </h3>
          </div>
          <button type="button" onClick={onClose} className="grid size-11 place-items-center rounded-full border border-line-2 text-text-2 hover:text-text" aria-label="Close">
            <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden>
              <path d="M2 2l10 10M12 2 2 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="mt-5 rounded-2xl border border-line bg-bg/60 p-4">
          <p className="pk-mono text-[15px] text-gold-hi">{buildCode(build)}</p>
          <p className="mt-1 text-[14px] text-text-2">
            {FOAM.name} · {build.size} mm velcro · {build.thickness} mm high · {edgeOf(build.edge).name} edge · {faceOf(build.face).name} face
          </p>
        </div>

        {status.kind === "sent" ? (
          <div className="mt-6" role="status">
            <p className="text-[16px] leading-relaxed text-text-2">
              Build <span className="pk-mono text-text">{status.code}</span> is with The Pad King. Matt will confirm it and come back to you
              with a quote at <span className="text-text">{contact.email}</span>.
            </p>
            <button type="button" onClick={onClose} className="pk-btn-gold mt-6 h-12 w-full rounded-2xl text-[15px]">
              Done
            </button>
          </div>
        ) : (
          <form noValidate onSubmit={submit} className="mt-6 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor={`${formId}-name`} className="text-[13px] font-semibold text-text-2">
                  Name <span className="text-gold">*</span>
                </label>
                <input {...a11y("name")} autoComplete="name" className={field} value={contact.name} onChange={(e) => update("name", e.target.value)} />
                {err("name")}
              </div>
              <div>
                <label htmlFor={`${formId}-email`} className="text-[13px] font-semibold text-text-2">
                  Email <span className="text-gold">*</span>
                </label>
                <input {...a11y("email")} type="email" inputMode="email" autoComplete="email" className={field} value={contact.email} onChange={(e) => update("email", e.target.value)} />
                {err("email")}
              </div>
              <div>
                <label htmlFor={`${formId}-phone`} className="text-[13px] font-semibold text-text-2">
                  Phone <span className="text-muted">(optional)</span>
                </label>
                <input {...a11y("phone")} type="tel" inputMode="tel" autoComplete="tel" className={field} value={contact.phone} onChange={(e) => update("phone", e.target.value)} />
                {err("phone")}
              </div>
              <div>
                <label htmlFor={`${formId}-quantity`} className="text-[13px] font-semibold text-text-2">
                  Quantity <span className="text-gold">*</span>
                </label>
                <div className="mt-1.5 flex h-12 items-center rounded-xl border border-line-2 bg-bg/70">
                  <button type="button" className="grid size-12 place-items-center text-xl text-text-2 hover:text-text" aria-label="Fewer" onClick={() => update("quantity", Math.max(1, contact.quantity - 1))}>
                    −
                  </button>
                  <input
                    {...a11y("quantity")}
                    type="number"
                    inputMode="numeric"
                    min={1}
                    max={500}
                    className="pk-mono h-full w-full bg-transparent text-center text-[16px] outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
                    value={contact.quantity}
                    onChange={(e) => update("quantity", Number(e.target.value))}
                  />
                  <button type="button" className="grid size-12 place-items-center text-xl text-text-2 hover:text-text" aria-label="More" onClick={() => update("quantity", Math.min(500, contact.quantity + 1))}>
                    +
                  </button>
                </div>
                {err("quantity")}
              </div>
            </div>
            <div>
              <label htmlFor={`${formId}-notes`} className="text-[13px] font-semibold text-text-2">
                Notes <span className="text-muted">(machine, backing plate, anything Matt should know)</span>
              </label>
              <textarea
                {...a11y("notes")}
                rows={3}
                className="mt-1.5 block w-full rounded-xl border border-line-2 bg-bg/70 px-4 py-3 text-[16px] text-text outline-none transition-colors focus:border-gold"
                value={contact.notes}
                onChange={(e) => update("notes", e.target.value)}
              />
              {err("notes")}
            </div>
            {/* honeypot */}
            <input type="text" name="company" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />

            {status.kind === "error" && (
              <p role="alert" className="rounded-xl border border-orange/40 bg-orange/10 p-3 text-[14px] leading-snug text-text">
                {status.message}
              </p>
            )}

            <button type="submit" disabled={status.kind === "sending"} className="pk-btn-gold inline-flex h-14 w-full items-center justify-center gap-2 rounded-2xl text-[16px]">
              {status.kind === "sending" ? (
                <>
                  <span className="size-4 animate-spin rounded-full border-2 border-bg/30 border-t-bg" aria-hidden /> Sending…
                </>
              ) : (
                "Send build request"
              )}
            </button>
            <p className="text-center text-[13px] text-muted">
              No payment now. Matt confirms the build and quotes it first.
              <span className="mt-1 block text-[12px]">Your details are only used to reply about this build.</span>
            </p>
          </form>
        )}
      </div>
    </dialog>
  );
}
