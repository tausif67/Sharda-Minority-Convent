"use client";

import { useActionState } from "react";
import { LoaderCircle, ShieldCheck } from "lucide-react";
import { changePassword, type PasswordState } from "./actions";

export default function PasswordForm() {
  const [state, action, pending] = useActionState(changePassword, {} as PasswordState);
  return <form action={action} className="password-form"><label><span>New password</span><input type="password" name="password" autoComplete="new-password" required /></label><label><span>Confirm new password</span><input type="password" name="confirm" autoComplete="new-password" required /></label><div className="password-rules"><ShieldCheck size={16} /><span>Minimum 10 characters with uppercase, lowercase, number and special character.</span></div>{state.error && <div className="login-error">{state.error}</div>}<button className="login-button" disabled={pending}>{pending ? <><LoaderCircle className="spin" />Updating…</> : "Set new password"}</button></form>;
}
