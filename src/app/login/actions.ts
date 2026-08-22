"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type LoginState = { error?: string };

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

export async function login(_: LoginState, formData: FormData): Promise<LoginState> {
  const identifier = String(formData.get("identifier") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!identifier || !password) return { error: "Email/phone and password are required." };

  const supabase = await createClient();
  if (!supabase) return { error: "Authentication is not configured yet. Add the Supabase environment values." };

  const credentials = identifier.includes("@")
    ? { email: identifier.toLowerCase(), password }
    : { email: phoneLoginEmail(identifier), password };
  const { error } = await supabase.auth.signInWithPassword(credentials);
  if (error) return { error: "Email/phone or password is incorrect." };
  redirect("/dashboard");
}
