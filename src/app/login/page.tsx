import { BarChart3, CheckCircle2, GraduationCap, ShieldCheck, UsersRound } from "lucide-react";
import LoginForm from "./login-form";

export default function LoginPage() {
  const configured = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);
  return (
    <main className="login-page">
      <section className="login-brand-panel">
        <div className="login-brand"><span><GraduationCap size={28} /></span><div><strong>Sharda Minority Convent</strong><small>School Management System</small></div></div>
        <div className="login-pitch"><span className="secure-pill"><ShieldCheck size={15} /> Secure school workspace</span><h1>One connected system for your entire school.</h1><p>Manage admissions, attendance, fees, academics and staff with role-based access and a reliable data trail.</p><div className="pitch-stats"><div><span><UsersRound /></span><strong>4 roles</strong><small>Admin, Teacher, Student, Parent</small></div><div><span><BarChart3 /></span><strong>Live insights</strong><small>Attendance, fees and results</small></div></div></div>
        <div className="security-note"><CheckCircle2 size={17} /><span><strong>Production-ready security</strong>Passwords are handled by managed authentication—not stored in the application database.</span></div>
      </section>
      <section className="login-form-panel"><div className="login-card"><div className="mobile-login-brand"><GraduationCap size={24} /><strong>Sharda Minority Convent</strong></div><span className="form-eyebrow">Authorised access</span><h2>Welcome back</h2><p>Sign in with the credentials issued by your school administrator.</p>{!configured && <div className="setup-alert"><strong>Setup required</strong>Add the Supabase environment values before the first production login.</div>}<LoginForm /></div><footer>© {new Date().getFullYear()} Sharda Minority Convent · Privacy · Support</footer></section>
    </main>
  );
}
