import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/context";
import ProfilePopup from "@/components/ProfilePopup";

export const metadata: Metadata = {
  title: 'Howner — Le matching immobilier + gagnez une villa à 695 000€',
  description: 'Plateforme d\'annonces immobilières avec matching. Trouvez le bon bien, le bon agent, le bon artisan. Chaque crédit acheté = 1 ticket offert pour gagner une villa au Pays Basque.',
  keywords: 'immobilier, annonces, matching, villa, Pays Basque, Bayonne, Biarritz, agent immobilier, artisan, courtier',
  openGraph: {
    title: 'Howner — Devenez propriétaire',
    description: 'Le 1er matching immobilier en France. Gagnez une villa à 695 000€.',
    url: 'https://howner.vercel.app',
    siteName: 'Howner',
    type: 'website',
    images: [{ url: '/villa/exterior-1.jpg', width: 1200, height: 630, alt: 'Villa Boucau — 695 000€' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Howner — Devenez propriétaire',
    description: 'Le matching immobilier + gagnez une villa à 695 000€',
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
