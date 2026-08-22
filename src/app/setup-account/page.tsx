import { GraduationCap, LockKeyhole } from "lucide-react";
import SetupAccountForm from "./setup-account-form";

export default function SetupAccountPage() {
  return (
    <main className="password-page">
      <section>
        <div className="mobile-login-brand"><GraduationCap size={24} /><strong>Sharda Minority Convent</strong></div>
        <span className="password-icon"><LockKeyhole /></span>
        <h1>Set up your school account</h1>
        <p>Accept your invitation and create a private password for the school portal.</p>
        <SetupAccountForm />
      </section>
    </main>
  );
}
