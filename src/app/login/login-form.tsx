"use client";

import { useActionState, useState } from "react";
import { Eye, EyeOff, LoaderCircle, LockKeyhole, Mail } from "lucide-react";
import { login, type LoginState } from "./actions";

const initialState: LoginState = {};

export default function LoginForm() {
  const [state, action, pending] = useActionState(login, initialState);
  const [showPassword, setShowPassword] = useState(false);
  return (
    <form action={action} className="login-form">
      <label><span>Email address or phone number</span><div className="input-shell"><Mail size={18} /><input name="identifier" autoComplete="username" placeholder="name@school.com or 9876543210" required /></div></label>
      <label><span>Password</span><div className="input-shell"><LockKeyhole size={18} /><input name="password" type={showPassword ? "text" : "password"} autoComplete="current-password" placeholder="Enter your password" required /><button type="button" className="reveal-button" onClick={() => setShowPassword((value) => !value)} aria-label={showPassword ? "Hide password" : "Show password"}>{showPassword ? <EyeOff size={17} /> : <Eye size={17} />}</button></div></label>
      <div className="login-help"><span>Secure cookie-based session</span><span>Contact school admin to reset password</span></div>
      {state.error && <div className="login-error">{state.error}</div>}
      <button className="login-button" disabled={pending}>{pending ? <><LoaderCircle className="spin" size={18} />Signing in…</> : "Sign in securely"}</button>
      <p className="login-policy">Access is restricted to authorised Sharda Minority Convent users. Every sensitive action is logged.</p>
    </form>
  );
}
