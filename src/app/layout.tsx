import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/lib/context";

export const metadata: Metadata = {
  title: "Howner — L'immobilier intelligent",
  description:
    "Agrégateur d'annonces, matching entre utilisateurs, services IA et jeu concours pour gagner une villa à 695 000€.",
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
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
