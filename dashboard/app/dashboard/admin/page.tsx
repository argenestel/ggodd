"use client";

import { useState } from "react";
import { Shield, Loader2, RefreshCcw } from "lucide-react";

export default function AdminPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");

  async function runResolver() {
    setLoading(true);
    setError("");
    setResult(null);
    try {
      const res = await fetch("/api/admin/resolve-due", { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to resolve due markets");
      }
      setResult(data);
    } catch (e: any) {
      setError(e.message || "Failed to resolve due markets");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-5">
        <div className="mb-3 flex items-center gap-2">
          <Shield className="h-5 w-5 text-[var(--accent)]" />
          <h1 className="font-display text-2xl">Admin Resolver</h1>
        </div>
        <p className="text-sm text-[var(--text-secondary)]">
          Resolve all due markets based on Steam achievement status and credit streamer pending rewards.
        </p>

        <button
          className="btn-primary mt-4"
          onClick={runResolver}
          disabled={loading}
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCcw className="h-4 w-4" />}
          Run Resolve Due
        </button>

        {error && (
          <div className="mt-4 rounded-lg border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-400">
            {error}
          </div>
        )}
      </div>

      {result && (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] p-5">
          <h2 className="mb-3 font-display text-xl">Result</h2>
          <p className="mb-3 text-sm text-[var(--text-secondary)]">
            Processed: <span className="font-mono text-[var(--text)]">{result.processed}</span>
          </p>

          <div className="space-y-2">
            {(result.results || []).map((r: any, idx: number) => (
              <div key={idx} className="rounded-lg border border-[var(--border)] bg-[var(--bg)] p-3">
                <p className="font-mono text-xs text-[var(--text)]">{r.market}</p>
                {r.error ? (
                  <p className="text-xs text-rose-400">error: {r.error}</p>
                ) : (
                  <p className="text-xs text-[var(--text-secondary)]">
                    outcome: <span className="text-[var(--text)]">{r.outcome}</span>
                    {typeof r.streamerShare === "number" ? (
                      <>
                        {" "}• streamer share: <span className="text-[var(--text)]">{r.streamerShare.toFixed(4)} SOL</span>
                      </>
                    ) : null}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
