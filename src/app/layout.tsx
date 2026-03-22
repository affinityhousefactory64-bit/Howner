import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/context";
import ProfilePopup from "@/components/ProfilePopup";

export const metadata: Metadata = {
  title: 'Howner — Gagnez une villa à 695 000€ au Pays Basque',
  description: 'Participez au tirage d\'une villa à 695 000€. Inscription gratuite, 1 participation offerte. Carte de membre ou pack. Tirage par huissier de justice.',
  keywords: 'villa, tirage, Pays Basque, Boucau, immobilier, jeu concours, gagner maison',
  openGraph: {
    title: 'Howner — Gagnez une villa à 695 000€ au Pays Basque',
    description: 'Participez au tirage d\'une villa à 695 000€ au Pays Basque. À partir de 9€.',
    url: 'https://howner.vercel.app',
    siteName: 'Howner',
    type: 'website',
    images: [{ url: '/villa/exterior-1.jpg', width: 1200, height: 630, alt: 'Villa Boucau — 695 000€' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Howner — Gagnez une villa à 695 000€ au Pays Basque',
    description: 'Participez au tirage d\'une villa à 695 000€ au Pays Basque. À partir de 9€.',
    images: ['/villa/exterior-1.jpg'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,700;9..144,800&family=Syne:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <AuthProvider>
          {children}
          <ProfilePopup />
        </AuthProvider>
      </body>
    </html>
  );
}
