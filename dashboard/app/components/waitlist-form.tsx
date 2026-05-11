"use client";

import { useState } from "react";

export function WaitlistForm({ id }: { id?: string }) {
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "err">("idle");
  const [msg, setMsg] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("loading");
    setMsg("");
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email") ?? "");
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, source: "hero" }),
      });
      const data = (await res.json()) as { ok?: boolean; message?: string; error?: string };
      if (!res.ok || !data.ok) {
        setStatus("err");
        setMsg(data.error ?? "Something went wrong.");
        return;
      }
      setStatus("ok");
      setMsg(data.message ?? "You're on the list.");
      e.currentTarget.reset();
    } catch {
      setStatus("err");
      setMsg("Network error — try again.");
    }
  }

  return (
    <div className="w-full max-w-md">
      <form
        id={id}
        onSubmit={onSubmit}
        className="flex w-full flex-col gap-3 sm:flex-row sm:items-stretch"
        noValidate
      >
        <label htmlFor="waitlist-email" className="sr-only">
          Email for waitlist
        </label>
        <input
          id="waitlist-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="you@studio.gg"
          className="min-h-11 flex-1 rounded-md border border-[var(--border)] bg-[var(--bg-surface)] px-4 py-2.5 font-mono text-sm text-[var(--text)] placeholder:text-[var(--text-tertiary)] focus:border-[var(--accent)]/50 focus:outline-none focus:ring-1 focus:ring-[var(--accent)]/20"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="min-h-11 shrink-0 rounded-md bg-[var(--accent)] px-5 py-2.5 font-mono text-sm font-semibold text-[var(--bg)] transition-opacity hover:opacity-90 disabled:opacity-50"
        >
          {status === "loading" ? "Joining…" : "Join waitlist"}
        </button>
      </form>
      {msg ? (
        <p
          className={`mt-2 font-mono text-xs ${status === "ok" ? "text-[var(--success)]" : "text-[var(--error)]"}`}
          role="status"
        >
          {msg}
        </p>
      ) : null}
    </div>
  );
}
