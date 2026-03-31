"use client";

import { useState } from "react";
import Link from "next/link";

export default function AdminAttendeesPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ imported: number; skipped: number; errors: string[] } | null>(null);

  async function runImport() {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/admin/import", { method: "POST" });
      const data = await res.json();
      setResult(data);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen px-8 py-12 max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin" className="text-xs text-nrtf-muted/50 hover:text-nrtf-muted font-sans">← Back</Link>
        <h1 className="font-display font-bold text-2xl text-nrtf-text">Attendees</h1>
      </div>

      <div className="border border-[rgba(109,217,207,0.12)] rounded-lg p-6 mb-6">
        <h2 className="font-sans font-medium text-nrtf-text text-sm mb-2">Import from Google Sheet</h2>
        <p className="text-xs text-nrtf-muted/50 font-sans mb-4">
          Pulls all registrations, creates accounts, and sends invite emails. Already-imported attendees are skipped.
        </p>
        <button onClick={runImport} disabled={loading}
          className="px-5 py-2 rounded font-sans text-sm font-medium disabled:opacity-50"
          style={{ background: "linear-gradient(135deg, #137c55, #6dd9cf)", color: "#fff" }}>
          {loading ? "Importing…" : "Run Import"}
        </button>
      </div>

      {result && (
        <div className="border border-[rgba(109,217,207,0.12)] rounded-lg p-5 text-sm font-sans">
          <div className="text-nrtf-text mb-1">✓ Imported: <strong>{result.imported}</strong></div>
          <div className="text-nrtf-muted/50 mb-1">Skipped (already exists): {result.skipped}</div>
          {result.errors.length > 0 && (
            <div className="mt-3">
              <div className="text-red-400 text-xs mb-1">Errors:</div>
              {result.errors.map(e => <div key={e} className="text-xs text-red-300">{e}</div>)}
            </div>
          )}
        </div>
      )}
    </main>
  );
}
