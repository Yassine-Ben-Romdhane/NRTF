"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function RoomEditor({
  roomId, currentNumber, currentCapacity
}: { roomId: string; currentNumber: string | null; currentCapacity: number }) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [number, setNumber] = useState(currentNumber ?? "");
  const [capacity, setCapacity] = useState(currentCapacity);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function save() {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/rooms/${roomId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ room_number: number || null, capacity }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error ?? "Save failed");
        return;
      }
      setEditing(false);
      router.refresh();
    } finally {
      setSaving(false);
    }
  }

  if (!editing) return (
    <button onClick={() => setEditing(true)}
      className="text-xs text-nrtf-muted/50 hover:text-nrtf-muted font-sans border border-[rgba(255,255,255,0.08)] px-3 py-1 rounded transition-colors">
      Edit
    </button>
  );

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <input value={number} onChange={e => setNumber(e.target.value)}
        placeholder="Room #"
        className="w-20 bg-transparent border border-[rgba(109,217,207,0.2)] rounded px-2 py-1 text-xs text-nrtf-text font-sans outline-none" />
      <select value={capacity} onChange={e => setCapacity(Number(e.target.value))}
        className="bg-transparent border border-[rgba(109,217,207,0.2)] rounded px-2 py-1 text-xs text-nrtf-text font-sans outline-none">
        <option value={2}>2 people</option>
        <option value={3}>3 people</option>
      </select>
      <button onClick={save} disabled={saving}
        className="text-xs px-3 py-1 rounded font-sans disabled:opacity-50"
        style={{ background: "#137c55", color: "#fff" }}>
        {saving ? "…" : "Save"}
      </button>
      <button onClick={() => setEditing(false)} className="text-xs text-nrtf-muted/50 font-sans">Cancel</button>
      {error && <span className="text-xs text-red-400 font-sans">{error}</span>}
    </div>
  );
}
