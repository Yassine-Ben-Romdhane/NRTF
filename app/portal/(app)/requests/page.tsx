import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import ActionButtons from "./ActionButtons";

export default async function RequestsPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/portal/login");

  const { data: requests } = await supabase
    .from("room_requests")
    .select("id, status, created_at, from_id, profiles!room_requests_from_id_fkey(id, full_name, university, bio)")
    .eq("to_id", user.id)
    .order("created_at", { ascending: false });

  const pending = (requests ?? []).filter((r: { status: string }) => r.status === "pending");
  const past = (requests ?? []).filter((r: { status: string }) => r.status !== "pending");

  type RequestRow = {
    id: string;
    status: string;
    from_id: string;
    profiles: { id: string; full_name: string; university: string; bio: string | null };
  };

  return (
    <main className="min-h-screen px-8 py-12 max-w-2xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/portal" className="text-xs text-nrtf-muted/50 hover:text-nrtf-muted font-sans">← Back</Link>
        <h1 className="font-display font-bold text-2xl text-nrtf-text">Roommate Requests</h1>
      </div>

      <h2 className="text-xs font-sans uppercase tracking-wider text-nrtf-muted/50 mb-4">Pending</h2>
      {pending.length === 0 ? (
        <p className="text-sm text-nrtf-muted/40 font-sans mb-8">No pending requests.</p>
      ) : (
        <div className="flex flex-col gap-4 mb-8">
          {(pending as unknown as RequestRow[]).map((r) => (
            <div key={r.id} className="border border-[rgba(109,217,207,0.15)] rounded-lg p-5 flex items-start justify-between gap-4">
              <div>
                <div className="font-sans font-medium text-nrtf-text text-sm">{r.profiles.full_name}</div>
                <div className="text-xs text-nrtf-muted/50 font-sans mt-0.5">{r.profiles.university}</div>
                {r.profiles.bio && (
                  <div className="text-xs text-nrtf-muted/60 font-sans mt-2 max-w-xs">{r.profiles.bio}</div>
                )}
              </div>
              <ActionButtons requestId={r.id} />
            </div>
          ))}
        </div>
      )}

      {past.length > 0 && (
        <>
          <h2 className="text-xs font-sans uppercase tracking-wider text-nrtf-muted/50 mb-4">Past</h2>
          <div className="flex flex-col gap-3">
            {(past as unknown as RequestRow[]).map((r) => (
              <div key={r.id} className="border border-[rgba(255,255,255,0.05)] rounded-lg p-4 flex items-center justify-between">
                <div className="text-sm font-sans text-nrtf-muted/60">{r.profiles.full_name}</div>
                <span className={`text-xs font-sans px-2 py-0.5 rounded ${r.status === "accepted" ? "text-green-400" : "text-nrtf-muted/40"}`}>
                  {r.status}
                </span>
              </div>
            ))}
          </div>
        </>
      )}
    </main>
  );
}
