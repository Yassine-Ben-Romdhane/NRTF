"use client";

import { useState } from "react";

export default function RequestButton({ toId }: { toId: string }) {
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function sendRequest() {
    setStatus("loading");
    try {
      const res = await fetch("/api/portal/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to_id: toId }),
      });
      if (res.ok) {
        setStatus("sent");
      } else {
        const data = await res.json().catch(() => ({}));
        setErrorMessage(data.error ?? "Request failed");
        setStatus("error");
      }
    } catch {
      setErrorMessage("Network error");
      setStatus("error");
    }
  }

  if (status === "sent") return (
    <span className="text-xs text-nrtf-muted/50 font-sans py-2">Request sent</span>
  );

  if (status === "error") return (
    <div className="flex flex-col items-end gap-1">
      <span className="text-xs text-red-400 font-sans">{errorMessage}</span>
      <button
        onClick={() => { setStatus("idle"); setErrorMessage(null); }}
        className="text-xs text-nrtf-muted/50 font-sans underline"
      >
        Retry
      </button>
    </div>
  );

  return (
    <button
      onClick={sendRequest}
      disabled={status === "loading"}
      className="shrink-0 px-4 py-2 rounded text-xs font-sans font-medium disabled:opacity-50 transition-opacity"
      style={{ background: "linear-gradient(135deg, #137c55, #6dd9cf)", color: "#fff" }}
    >
      {status === "loading" ? "Sending…" : "Send Request"}
    </button>
  );
}
