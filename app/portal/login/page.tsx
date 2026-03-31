"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function PortalLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }

    router.push("/portal");
    router.refresh();
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "var(--color-bg, #0a0f0d)" }}>
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo-mark.png" alt="NRTF" width={48} className="mx-auto mb-4" />
          <h1 className="font-display font-bold text-2xl text-nrtf-text">Room Matching Portal</h1>
          <p className="text-sm text-nrtf-muted/60 mt-1">Sign in with your registration email</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block text-xs text-nrtf-muted/60 mb-1.5 font-sans">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full bg-transparent border border-[rgba(109,217,207,0.2)] rounded px-3 py-2 text-sm text-nrtf-text outline-none focus:border-[rgba(109,217,207,0.5)] font-sans"
              placeholder="your@email.com"
            />
          </div>

          <div>
            <label className="block text-xs text-nrtf-muted/60 mb-1.5 font-sans">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full bg-transparent border border-[rgba(109,217,207,0.2)] rounded px-3 py-2 text-sm text-nrtf-text outline-none focus:border-[rgba(109,217,207,0.5)] font-sans"
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="text-xs text-red-400 font-sans">{error}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-2 py-2.5 rounded font-sans text-sm font-medium transition-opacity disabled:opacity-50"
            style={{ background: "linear-gradient(135deg, #137c55, #6dd9cf)", color: "#fff" }}
          >
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>
      </div>
    </main>
  );
}
