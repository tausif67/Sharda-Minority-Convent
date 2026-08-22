import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Sharda Minority Convent", template: "%s · Sharda Minority Convent" },
  description: "Secure school management system for admissions, attendance, fees, academics, communication and staff operations.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en-IN">
      <body>{children}</body>
    </html>
  );
}
