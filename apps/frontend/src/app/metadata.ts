//src/app/metadata.ts
import type { Metadata } from "next";
export const metadata: Metadata = {
  title: "ObservaTudo - Dados Abertos. Decisões Informadas.",
  description:
    "Plataforma digital que transforma dados abertos em indicadores cívicos, promovendo transparência e engajamento cidadão.",
  manifest: "/manifest.json",
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