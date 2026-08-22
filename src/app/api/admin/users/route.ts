import { randomBytes } from "node:crypto";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";

const roles = ["admin", "teacher", "student", "parent"] as const;

function normalizePhone(value: string) {
  const digits = value.replace(/\D/g, "");
  if (value.trim().startsWith("+")) return `+${digits}`;
  if (digits.length === 10) return `+91${digits}`;
  return `+${digits}`;
}

function phoneLoginEmail(value: string) {
  const phone = normalizePhone(value);
  return `phone-${phone.slice(1)}@sharda-minority-convent.invalid`;
}

export async function POST(request: Request) {
  const supabase = await createClient();
  if (!supabase) return Response.json({ error: "Authentication is not configured." }, { status: 503 });
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: "Unauthorised." }, { status: 401 });
  const { data: caller } = await supabase.from("profiles").select("role, status").eq("id", user.id).single();
  if (caller?.role !== "admin" || caller.status !== "active") return Response.json({ error: "Admin access required." }, { status: 403 });

  const body = await request.json() as { identifier?: string; fullName?: string; role?: string };
  const identifier = body.identifier?.trim() ?? "";
  const fullName = body.fullName?.trim() ?? "";
  const role = roles.includes(body.role as typeof roles[number]) ? body.role as typeof roles[number] : null;
  if (!identifier || !fullName || !role) return Response.json({ error: "Full name, email/phone and role are required." }, { status: 400 });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) return Response.json({ error: "Server-side user provisioning is not configured." }, { status: 503 });
  const admin = createAdminClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });
  const temporaryPassword = `Smc@${randomBytes(6).toString("base64url")}9`;
  const usesEmail = identifier.includes("@");
  const phone = usesEmail ? null : normalizePhone(identifier);
  const email = usesEmail ? identifier.toLowerCase() : phoneLoginEmail(identifier);
  const { data, error } = await admin.auth.admin.createUser({
    email,
    email_confirm: true,
    password: temporaryPassword,
    user_metadata: { full_name: fullName, role, login_phone: phone },
  });
  if (error) return Response.json({ error: error.message }, { status: 400 });
  const { error: profileError } = await admin
    .from("profiles")
    .update({ role, full_name: fullName, email: usesEmail ? email : null, phone })
    .eq("id", data.user.id);
  if (profileError) {
    await admin.auth.admin.deleteUser(data.user.id);
    return Response.json({ error: "The login was rolled back because its school role could not be assigned." }, { status: 500 });
  }
  return Response.json({ id: data.user.id, temporaryPassword });
}
