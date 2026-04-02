import Link from "next/link";
import { createServiceClient } from "@/lib/supabase/server";
import type { Registration, Profile } from "@/types/portal";
import ImportButton from "./ImportButton";
import ConfirmButton from "./ConfirmButton";
import DeleteButton from "./DeleteButton";

export const dynamic = "force-dynamic";

export default async function AdminAttendeesPage() {
  const serviceClient = createServiceClient();

  const [
    { data: registrations },
    { count: invitedCount },
    { data: confirmed },
  ] = await Promise.all([
    serviceClient
      .from("registrations")
      .select("*")
      .order("registered_at", { ascending: true })
      .returns<Registration[]>(),
    serviceClient
      .from("registrations")
      .select("*", { count: "exact", head: true })
      .eq("status", "invited"),
    serviceClient
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: true })
      .returns<Profile[]>(),
  ]);

  const registrationList: Registration[] = registrations ?? [];
  const confirmedList: Profile[] = confirmed ?? [];

  return (
    <main className="min-h-screen px-8 py-12 max-w-5xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/admin" className="text-xs text-nrtf-muted/50 hover:text-nrtf-muted font-sans">← Back</Link>
        <h1 className="font-display font-bold text-2xl text-nrtf-text">Attendees</h1>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="border border-[rgba(109,217,207,0.12)] rounded-lg px-5 py-4 flex-1 font-sans">
          <div className="text-2xl font-bold text-nrtf-text">{registrationList.length}</div>
          <div className="text-xs text-nrtf-muted/50 mt-1">Registered (total)</div>
        </div>
        <div className="border border-[rgba(109,217,207,0.12)] rounded-lg px-5 py-4 flex-1 font-sans">
          <div className="text-2xl font-bold text-nrtf-text">{invitedCount ?? 0}</div>
          <div className="text-xs text-nrtf-muted/50 mt-1">Invited</div>
        </div>
        <div className="border border-[rgba(109,217,207,0.12)] rounded-lg px-5 py-4 flex-1 font-sans">
          <div className="text-2xl font-bold text-nrtf-text">{confirmedList.length}</div>
          <div className="text-xs text-nrtf-muted/50 mt-1">Confirmed</div>
        </div>
      </div>

      <div className="border border-[rgba(109,217,207,0.12)] rounded-lg p-6 mb-6">
        <h2 className="font-sans font-medium text-nrtf-text text-sm mb-2">Import from Google Sheet</h2>
        <p className="text-xs text-nrtf-muted/50 font-sans mb-4">
          Pulls existing registrations into the pending list. New registrations are saved automatically.
        </p>
        <ImportButton />
      </div>

      {registrationList.length > 0 && (
        <div className="border border-[rgba(109,217,207,0.12)] rounded-lg overflow-hidden">
          <table className="w-full text-sm font-sans">
            <thead>
              <tr className="border-b border-[rgba(109,217,207,0.12)]">
                <th className="text-left px-4 py-3 text-xs text-nrtf-muted/50 font-medium">Name</th>
                <th className="text-left px-4 py-3 text-xs text-nrtf-muted/50 font-medium">University</th>
                <th className="text-left px-4 py-3 text-xs text-nrtf-muted/50 font-medium">Email</th>
                <th className="text-left px-4 py-3 text-xs text-nrtf-muted/50 font-medium">Field</th>
                <th className="text-left px-4 py-3 text-xs text-nrtf-muted/50 font-medium">IEEE</th>
                <th className="text-left px-4 py-3 text-xs text-nrtf-muted/50 font-medium">Status</th>
                <th className="text-left px-4 py-3 text-xs text-nrtf-muted/50 font-medium">Date</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {registrationList.map((r) => (
                <tr key={r.id} className="border-b border-[rgba(109,217,207,0.06)] last:border-0">
                  <td className="px-4 py-3 text-nrtf-text">{r.full_name}</td>
                  <td className="px-4 py-3 text-nrtf-muted/70">{r.university}</td>
                  <td className="px-4 py-3 text-nrtf-muted/50">{r.email}</td>
                  <td className="px-4 py-3 text-nrtf-muted/70">{r.field}</td>
                  <td className="px-4 py-3 text-nrtf-muted/50">{r.ieee_member}</td>
                  <td className="px-4 py-3">
                    <span className={
                      r.status === "invited"
                        ? "text-xs px-2 py-0.5 rounded font-sans font-medium bg-[rgba(19,124,85,0.2)] text-[#6dd9cf]"
                        : "text-xs px-2 py-0.5 rounded font-sans font-medium bg-[rgba(109,217,207,0.08)] text-nrtf-muted/70"
                    }>
                      {r.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-nrtf-muted/50 text-xs">
                    {new Date(r.registered_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center gap-2 justify-end">
                      <ConfirmButton id={r.id} email={r.email} status={r.status} />
                      <DeleteButton endpoint={`/api/admin/registrations/${r.id}`} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {registrationList.length === 0 && (
        <p className="text-xs text-nrtf-muted/50 font-sans text-center py-8">No registrations yet.</p>
      )}

      <h2 className="font-display font-bold text-lg text-nrtf-text mt-10 mb-4">Confirmed Attendees</h2>

      {confirmedList.length > 0 && (
        <div className="border border-[rgba(109,217,207,0.12)] rounded-lg overflow-hidden">
          <table className="w-full text-sm font-sans">
            <thead>
              <tr className="border-b border-[rgba(109,217,207,0.12)]">
                <th className="text-left px-4 py-3 text-xs text-nrtf-muted/50 font-medium">Name</th>
                <th className="text-left px-4 py-3 text-xs text-nrtf-muted/50 font-medium">University</th>
                <th className="text-left px-4 py-3 text-xs text-nrtf-muted/50 font-medium">Email</th>
                <th className="text-left px-4 py-3 text-xs text-nrtf-muted/50 font-medium">Joined</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {confirmedList.map((p) => (
                <tr key={p.id} className="border-b border-[rgba(109,217,207,0.06)] last:border-0">
                  <td className="px-4 py-3 text-nrtf-text">{p.full_name}</td>
                  <td className="px-4 py-3 text-nrtf-muted/70">{p.university}</td>
                  <td className="px-4 py-3 text-nrtf-muted/50">{p.email}</td>
                  <td className="px-4 py-3 text-nrtf-muted/50 text-xs">
                    {new Date(p.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <DeleteButton endpoint={`/api/admin/profiles/${p.id}`} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {confirmedList.length === 0 && (
        <p className="text-xs text-nrtf-muted/50 font-sans text-center py-8">No confirmed attendees yet.</p>
      )}
    </main>
  );
}
