"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ImportButton() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ imported: number; skipped: number; errors: string[] } | null>(null);
  const router = useRouter();

  async function runImport() {
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/admin/import", { method: "POST" });
      if (!res.ok) {
        const { error } = await res.json().catch(() => ({ error: "Import failed" }));
        setResult({ imported: 0, skipped: 0, errors: [error ?? "Import failed"] });
        return;
      }
      const data = await res.json();
      setResult(data);
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button onClick={runImport} disabled={loading}
        className="px-5 py-2 rounded font-sans text-sm font-medium disabled:opacity-50"
        style={{ background: "linear-gradient(135deg, #137c55, #6dd9cf)", color: "#fff" }}>
        {loading ? "Importing…" : "Run Import"}
      </button>

      {result && (
        <div className="mt-4 text-sm font-sans">
          <div className="text-nrtf-text mb-1">✓ Added to pending: <strong>{result.imported}</strong></div>
          <div className="text-nrtf-muted/50 mb-1">Skipped (already exists): {result.skipped}</div>
          {result.errors.length > 0 && (
            <div className="mt-3">
              <div className="text-red-400 text-xs mb-1">Errors:</div>
              {result.errors.map(e => <div key={e} className="text-xs text-red-300">{e}</div>)}
            </div>
          )}
        </div>
      )}
    </>
  );
}
