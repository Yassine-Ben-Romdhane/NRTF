import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/admin/login");
  if (user.app_metadata?.role !== "admin") redirect("/admin/login");

  return <>{children}</>;
}
