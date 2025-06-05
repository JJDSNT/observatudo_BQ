import { metadata } from './metadata';
import { viewport } from './viewport';
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AppleSplashScreens from "@/components/AppleSplashScreens";
import Navbar from "@/components/Navbar";
import AppShell from "@/components/AppShell";

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
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased bg-[--color-background] text-[--color-foreground]`}
      >
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
