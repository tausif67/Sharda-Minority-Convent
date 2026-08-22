import { GraduationCap, LockKeyhole } from "lucide-react";
import PasswordForm from "./password-form";

export default function ChangePasswordPage() {
  return <main className="password-page"><section><div className="mobile-login-brand"><GraduationCap size={24} /><strong>Sharda Minority Convent</strong></div><span className="password-icon"><LockKeyhole /></span><h1>Create your private password</h1><p>For security, replace the temporary password before opening your school dashboard.</p><PasswordForm /></section></main>;
}
