import { NextResponse } from "next/server";

/**
 * Placeholder waitlist endpoint — v1 stores nothing durable.
 * Wire to email provider / DB when ready.
 */
export async function POST(request: Request) {
  let email: string | undefined;
  let source: string | undefined;

  const ct = request.headers.get("content-type") ?? "";
  try {
    if (ct.includes("application/json")) {
      const body = (await request.json()) as Record<string, unknown>;
      email = typeof body.email === "string" ? body.email : undefined;
      source = typeof body.source === "string" ? body.source : undefined;
    } else {
      const fd = await request.formData();
      const e = fd.get("email");
      const s = fd.get("source");
      email = typeof e === "string" ? e : undefined;
      source = typeof s === "string" ? s : undefined;
    }
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid body" }, { status: 400 });
  }

  if (!email?.includes("@")) {
    return NextResponse.json({ ok: false, error: "Valid email required" }, { status: 400 });
  }

  return NextResponse.json({
    ok: true,
    message: "Received (placeholder — not persisted in v1).",
    echo: { email: email.trim(), source: source ?? "landing" },
  });
}
