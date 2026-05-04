import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from 'sonner'
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

export const metadata: Metadata = {
  title: "Kwik — Devis pro en 3 minutes",
  description: "Créez et envoyez des devis professionnels en moins de 3 minutes. Pour tous les indépendants et petites entreprises qui vendent des prestations.",
  metadataBase: new URL('https://www.kwik-devis.fr'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: "Kwik — Devis pro en 3 minutes",
    description: "Créez et envoyez des devis professionnels en moins de 3 minutes. Signature électronique, conversion en facture, envoi par email.",
    url: 'https://www.kwik-devis.fr',
    siteName: 'Kwik',
    locale: 'fr_FR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Kwik — Devis pro en 3 minutes",
    description: "Créez et envoyez des devis professionnels en moins de 3 minutes. Pour artisans, freelances et indépendants.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="fr"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
