import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LesExtras",
  description: "Plateforme SaaS de gestion de vacations",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
