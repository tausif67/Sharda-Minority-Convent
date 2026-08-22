"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { LoaderCircle, ShieldCheck } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export default function SetupAccountForm() {
  const supabase = useMemo(() => createClient(), []);
  const [ready, setReady] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!supabase) {
      setError("Authentication is not configured.");
      return;
    }

    let active = true;
    const checkSession = async () => {
      const code = new URL(window.location.href).searchParams.get("code");
      if (code) await supabase.auth.exchangeCodeForSession(code);
      const { data } = await supabase.auth.getSession();
      if (active && data.session) {
        window.history.replaceState({}, "", "/setup-account");
        setReady(true);
      }
    };

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (active && session) {
        window.history.replaceState({}, "", "/setup-account");
        setReady(true);
      }
    });
    void checkSession();

    const timeout = window.setTimeout(() => {
      if (active) setError((current) => current || "This invitation is invalid or has expired. Ask the school administrator for a new invite.");
    }, 6000);

    return () => {
      active = false;
      window.clearTimeout(timeout);
      listener.subscription.unsubscribe();
    };
  }, [supabase]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase || !ready) return;
    const form = new FormData(event.currentTarget);
    const password = String(form.get("password") ?? "");
    const confirm = String(form.get("confirm") ?? "");
    if (password.length < 10 || !/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/\d/.test(password) || !/[^A-Za-z0-9]/.test(password)) {
      setError("Use at least 10 characters with uppercase, lowercase, number and special character.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setSaving(true);
    setError("");
    const { error: passwordError } = await supabase.auth.updateUser({ password });
    if (passwordError) {
      setSaving(false);
      setError(passwordError.message);
      return;
    }
    await supabase.rpc("complete_password_change");
    window.location.assign("/dashboard");
  }

  return (
    <form className="password-form" onSubmit={submit}>
      <label><span>New password</span><input type="password" name="password" autoComplete="new-password" required disabled={!ready || saving} /></label>
      <label><span>Confirm new password</span><input type="password" name="confirm" autoComplete="new-password" required disabled={!ready || saving} /></label>
      <div className="password-rules"><ShieldCheck size={16} /><span>Minimum 10 characters with uppercase, lowercase, number and special character.</span></div>
      {error && <div className="login-error">{error}</div>}
      <button className="login-button" disabled={!ready || saving}>{saving ? <><LoaderCircle className="spin" />Saving…</> : ready ? "Create password" : "Verifying invitation…"}</button>
    </form>
  );
}
