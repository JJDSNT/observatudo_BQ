import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AppleSplashScreens from "@/components/AppleSplashScreens";
import Navbar from "@/components/Navbar";
import GlobalHealthNotifier from "@/components/GlobalHealthNotifier";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ObservaTudo - Dados Abertos. Decisões Informadas.",
  description:
    "Plataforma digital que transforma dados abertos em indicadores cívicos, promovendo transparência e engajamento cidadão.",
  manifest: "/manifest.json",
  themeColor: "#00d6d6",
  icons: {
    icon: "/assets/favicon-196.png",
    apple: "/assets/apple-icon-180.png",
  },
  appleWebApp: {
    capable: true,
    title: "ObservaTudo",
    statusBarStyle: "default",
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    url: "https://www.observatudo.com.br",
    siteName: "ObservaTudo",
    title: "ObservaTudo - Dados Abertos. Decisões Informadas.",
    description:
      "Plataforma digital que transforma dados abertos em indicadores cívicos, promovendo transparência e engajamento cidadão.",
    images: [
      {
        url: "https://www.observatudo.com.br/assets/og-image.png",
        width: 1200,
        height: 630,
        alt: "Visualização Global de Indicadores - ObservaTudo",
      },
    ],
    locale: "pt_BR",
  },
  twitter: {
    card: "summary_large_image",
    title: "ObservaTudo - Dados Abertos. Decisões Informadas.",
    description:
      "Plataforma digital que transforma dados abertos em indicadores cívicos, promovendo transparência e engajamento cidadão.",
    images: ["https://www.observatudo.com.br/assets/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <head>
        <AppleSplashScreens />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased bg-[--color-background] text-[--color-foreground]`}
      >
        <GlobalHealthNotifier />
        <header className="px-6 py-4 border-b border-gray-300/40 dark:border-gray-700/50">
          <h1 className="text-2xl font-bold">ObservaTudo</h1>
          <Navbar />
        </header>
        <main className="max-w-4xl mx-auto px-4 pt-8">{children}</main>
      </body>
    </html>
  );
}
