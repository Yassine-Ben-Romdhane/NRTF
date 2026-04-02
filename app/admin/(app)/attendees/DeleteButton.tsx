"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DeleteButton({ endpoint }: { endpoint: string }) {
  const [confirming, setConfirming] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleDelete() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(endpoint, { method: "DELETE" });
      if (!res.ok) {
        const { error: msg } = await res.json().catch(() => ({ error: "Failed" }));
        setError(msg ?? "Failed");
        setConfirming(false);
        return;
      }
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  if (confirming) {
    return (
      <div className="flex items-center gap-2 justify-end">
        <span className="text-xs text-nrtf-muted/50 font-sans">Sure?</span>
        <button
          onClick={handleDelete}
          disabled={loading}
          className="px-2 py-1 rounded text-xs font-sans font-medium text-white disabled:opacity-50"
          style={{ background: "#b91c1c" }}
        >
          {loading ? "Deleting…" : "Yes"}
        </button>
        <button
          onClick={() => setConfirming(false)}
          disabled={loading}
          className="px-2 py-1 rounded text-xs font-sans font-medium text-nrtf-muted/70 border border-[rgba(109,217,207,0.12)] disabled:opacity-50"
        >
          No
        </button>
        {error && <span className="text-xs text-red-400">{error}</span>}
      </div>
    );
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      className="px-2 py-1 rounded text-xs font-sans font-medium text-red-400 hover:text-red-300"
    >
      Delete
    </button>
  );
}
