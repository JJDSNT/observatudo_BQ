import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Observatudo BQ",
  description: "Visualização de dados públicos com BigQuery e Next.js",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased bg-[--color-background] text-[--color-foreground]`}
      >
        <header className="px-6 py-4 border-b border-gray-300/40 dark:border-gray-700/50">
          <h1 className="text-2xl font-bold">Observatudo BQ</h1>
          <p className="text-sm opacity-75">
            Infraestrutura de dados públicos
          </p>
          <Navbar />
        </header>
        <main className="max-w-4xl mx-auto px-4 pt-8">{children}</main>
      </body>
    </html>
  );
}
