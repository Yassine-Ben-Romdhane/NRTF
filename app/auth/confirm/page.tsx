"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

function AuthConfirm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const supabase = createClient();
    const next = searchParams.get("next") ?? "/portal";

    async function handleAuth() {
      // Case 1: hash fragment — invite / implicit flow
      // Supabase redirects: /auth/confirm#access_token=...&refresh_token=...
      const hash = window.location.hash.slice(1);
      if (hash) {
        const params = new URLSearchParams(hash);
        const access_token = params.get("access_token");
        const refresh_token = params.get("refresh_token");
        if (access_token && refresh_token) {
          const { error } = await supabase.auth.setSession({ access_token, refresh_token });
          if (!error) { router.replace(next); return; }
        }
      }

      // Case 2: PKCE code — ?code=...
      const code = searchParams.get("code");
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (!error) { router.replace(next); return; }
      }

      // Case 3: OTP token hash — ?token_hash=...&type=...
      const token_hash = searchParams.get("token_hash");
      const type = searchParams.get("type");
      if (token_hash && type) {
        const { error } = await supabase.auth.verifyOtp({ type: type as never, token_hash });
        if (!error) { router.replace(next); return; }
      }

      // Already has a valid session (e.g. page refresh)
      const { data: { session } } = await supabase.auth.getSession();
      if (session) { router.replace(next); return; }

      router.replace("/");
    }

    handleAuth();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-nrtf-bg">
      <p className="text-nrtf-muted/50 text-sm font-sans">Signing you in…</p>
    </div>
  );
}

export default function AuthConfirmPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-nrtf-bg">
        <p className="text-nrtf-muted/50 text-sm font-sans">Signing you in…</p>
      </div>
    }>
      <AuthConfirm />
    </Suspense>
  );
}
