"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function ActionButtons({ requestId }: { requestId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState<"accept" | "decline" | null>(null);

  async function act(action: "accept" | "decline") {
    setLoading(action);
    await fetch(`/api/portal/requests/${requestId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    router.refresh();
  }

  return (
    <div className="flex gap-2 shrink-0">
      <button
        onClick={() => act("accept")}
        disabled={!!loading}
        className="px-3 py-1.5 rounded text-xs font-sans font-medium disabled:opacity-50 transition-opacity"
        style={{ background: "linear-gradient(135deg, #137c55, #6dd9cf)", color: "#fff" }}
      >
        {loading === "accept" ? "…" : "Accept"}
      </button>
      <button
        onClick={() => act("decline")}
        disabled={!!loading}
        className="px-3 py-1.5 rounded text-xs font-sans font-medium border border-[rgba(255,255,255,0.1)] text-nrtf-muted/60 disabled:opacity-50 transition-opacity"
      >
        {loading === "decline" ? "…" : "Decline"}
      </button>
    </div>
  );
}
