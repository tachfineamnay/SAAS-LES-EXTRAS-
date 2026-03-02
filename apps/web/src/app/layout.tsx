import type { Metadata } from "next";
import { Space_Grotesk, Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  title: "ADEPA Les Extras — Remplacement médico-social en 47 secondes",
  description:
    "Trouvez un soignant de remplacement en 47 secondes. Plateforme premium de mise en relation pour le médico-social : profils vérifiés, matching intelligent, contrats auto-générés.",
  keywords: ["remplacement", "médico-social", "infirmier", "EHPAD", "soignant", "freelance", "interim"],
  openGraph: {
    title: "ADEPA Les Extras — Remplacement médico-social en 47 secondes",
    description: "Plateforme premium de mise en relation pour le médico-social.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${spaceGrotesk.variable} ${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="font-[family-name:var(--font-body)]">{children}</body>
    </html>
  );
}
