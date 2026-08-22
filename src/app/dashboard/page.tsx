import { redirect } from "next/navigation";
import { AlertTriangle, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import DashboardClient from "./dashboard-client";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const supabase = await createClient();
  if (!supabase) return <SetupRequired />;
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("id, full_name, role, status, email, phone, must_change_password").eq("id", user.id).maybeSingle();
  if (!profile || profile.status !== "active") {
    return <main className="access-pending"><div><AlertTriangle size={32} /><h1>Account activation pending</h1><p>Your login is valid, but a school administrator must activate your Sharda Minority Convent profile and assign a role.</p><a href="/logout"><LogOut size={17} />Sign out</a></div></main>;
  }
  if (profile.must_change_password) redirect("/change-password");
  return <DashboardClient profile={profile} />;
}

function SetupRequired() {
  return <main className="access-pending"><div><AlertTriangle size={32} /><h1>Production database setup required</h1><p>Add the Supabase environment values and run the included database migration before opening the dashboard.</p><a href="/login">Return to login</a></div></main>;
}
