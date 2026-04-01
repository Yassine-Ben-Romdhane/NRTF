"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ConfirmButton({ id, email }: { id: string; email: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function confirm() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/attendees/${id}/confirm`, { method: "POST" });
      if (!res.ok) {
        const { error: msg } = await res.json().catch(() => ({ error: "Failed" }));
        setError(msg ?? "Failed");
        return;
      }
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-1">
      <button
        onClick={confirm}
        disabled={loading}
        className="px-3 py-1.5 rounded text-xs font-sans font-medium disabled:opacity-50 whitespace-nowrap"
        style={{ background: "linear-gradient(135deg, #137c55, #6dd9cf)", color: "#fff" }}
      >
        {loading ? "Sending…" : "Confirm & Invite"}
      </button>
      {error && <span className="text-xs text-red-400">{error}</span>}
    </div>
  );
}
