import type { Metadata } from "next";
import { Outfit, Inter } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  weight: ["400", "500", "600", "700", "800", "900"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "ADEPA Les Extras — Plateforme de remplacement médico-social",
  description:
    "Trouvez un soignant de remplacement en 47 secondes. Plateforme premium de mise en relation pour le médico-social avec profils vérifiés, contrats auto-générés et matching intelligent.",
  keywords: ["remplacement", "médico-social", "infirmier", "EHPAD", "intérim", "soignant", "freelance"],
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
    <html lang="fr" className={`${outfit.variable} ${inter.variable}`}>
      <body className="font-[family-name:var(--font-body)]">{children}</body>
    </html>
  );
}
