import { describe, expect, it } from "vitest";
import { parseBuildRequest, renderBuildEmail, validateContact } from "@/lib/buildRequest";

const good = {
  build: { size: 75, thickness: 20, edge: "splay", face: "crosscut" },
  contact: { name: "Jordan Reyes", email: "jordan@example.com", phone: "0400 000 000", quantity: 4, notes: "Rupes LHR15" },
};

describe("build requests", () => {
  it("accepts a valid request", () => {
    const r = parseBuildRequest(good);
    expect(r?.build.edge).toBe("splay");
    expect(r?.contact.quantity).toBe(4);
  });

  it("rejects bad builds and bad contact details", () => {
    expect(parseBuildRequest({ ...good, build: { ...good.build, size: 125 } })).toBeNull();
    expect(parseBuildRequest({ ...good, contact: { ...good.contact, email: "nope" } })).toBeNull();
    expect(parseBuildRequest({ ...good, contact: { ...good.contact, quantity: 0 } })).toBeNull();
    expect(parseBuildRequest("junk")).toBeNull();
  });

  it("explains each field error", () => {
    const e = validateContact({ name: "", email: "x", quantity: 1.5, phone: "abc" });
    expect(Object.keys(e).sort()).toEqual(["email", "name", "phone", "quantity"]);
  });

  it("escapes customer text in the email", () => {
    const r = parseBuildRequest({ ...good, contact: { ...good.contact, name: "<script>alert(1)</script>" } })!;
    const { html, subject, text } = renderBuildEmail(r);
    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
    expect(subject).toContain("SPF-75-20-SPL-XCT × 4");
    expect(text).toContain("Edge: Splay");
  });
});
