
import { metadata } from "./metadata";
import { viewport } from "./viewport";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AppleSplashScreens from "@/components/AppleSplashScreens";
import AppShell from "@/app/appshell";
import Navbar from "@/components/Navbar";
import { ThemeApplier } from '@/components/Theme/ThemeApplier';

export { metadata, viewport };

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <head>
        <AppleSplashScreens />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/assets/apple-icon-180.png"
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased bg-[--color-background] text-[--color-foreground]`}
      >
        <ThemeApplier />
        <header className="px-6 py-4 border-b border-gray-300/40 dark:border-gray-700/50">
          <Navbar />
        </header>
        <AppShell>
          <main className="max-w-4xl mx-auto px-4 pt-8">{children}</main>
        </AppShell>
      </body>
    </html>
  );
}
