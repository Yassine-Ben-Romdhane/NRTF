import Link from "next/link";
import { createServiceClient } from "@/lib/supabase/server";
import type { PendingAttendee } from "@/types/portal";
import ImportButton from "./ImportButton";
import ConfirmButton from "./ConfirmButton";

export const dynamic = "force-dynamic";

export default async function AdminAttendeesPage() {
  const serviceClient = createServiceClient();

  const [{ data: pending }, { count: confirmedCount }] = await Promise.all([
    serviceClient
      .from("pending_attendees")
      .select("*")
      .order("imported_at", { ascending: true })
      .returns<PendingAttendee[]>(),
    serviceClient
      .from("profiles")
      .select("*", { count: "exact", head: true }),
  ]);

  const pendingList = pending ?? [];

  return (
    <main className="min-h-screen px-8 py-12 max-w-3xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin" className="text-xs text-nrtf-muted/50 hover:text-nrtf-muted font-sans">← Back</Link>
        <h1 className="font-display font-bold text-2xl text-nrtf-text">Attendees</h1>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="border border-[rgba(109,217,207,0.12)] rounded-lg px-5 py-4 flex-1 font-sans">
          <div className="text-2xl font-bold text-nrtf-text">{pendingList.length}</div>
          <div className="text-xs text-nrtf-muted/50 mt-1">Pending (awaiting payment)</div>
        </div>
        <div className="border border-[rgba(109,217,207,0.12)] rounded-lg px-5 py-4 flex-1 font-sans">
          <div className="text-2xl font-bold text-nrtf-text">{confirmedCount ?? 0}</div>
          <div className="text-xs text-nrtf-muted/50 mt-1">Confirmed (invited)</div>
        </div>
      </div>

      <div className="border border-[rgba(109,217,207,0.12)] rounded-lg p-6 mb-6">
        <h2 className="font-sans font-medium text-nrtf-text text-sm mb-2">Import from Google Sheet</h2>
        <p className="text-xs text-nrtf-muted/50 font-sans mb-4">
          Pulls registrations into the pending list. Confirm each attendee individually after they pay.
        </p>
        <ImportButton />
      </div>

      {pendingList.length > 0 && (
        <div className="border border-[rgba(109,217,207,0.12)] rounded-lg overflow-hidden">
          <table className="w-full text-sm font-sans">
            <thead>
              <tr className="border-b border-[rgba(109,217,207,0.12)]">
                <th className="text-left px-4 py-3 text-xs text-nrtf-muted/50 font-medium">Name</th>
                <th className="text-left px-4 py-3 text-xs text-nrtf-muted/50 font-medium">University</th>
                <th className="text-left px-4 py-3 text-xs text-nrtf-muted/50 font-medium">Email</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {pendingList.map((a) => (
                <tr key={a.id} className="border-b border-[rgba(109,217,207,0.06)] last:border-0">
                  <td className="px-4 py-3 text-nrtf-text">{a.full_name}</td>
                  <td className="px-4 py-3 text-nrtf-muted/70">{a.university}</td>
                  <td className="px-4 py-3 text-nrtf-muted/50">{a.email}</td>
                  <td className="px-4 py-3 text-right">
                    <ConfirmButton id={a.id} email={a.email} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pendingList.length === 0 && (
        <p className="text-xs text-nrtf-muted/50 font-sans text-center py-8">No pending attendees.</p>
      )}
    </main>
  );
}
