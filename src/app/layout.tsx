import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ЖКУ Севастополь - Расчёт коммунальных услуг",
  description: "Система расчёта коммунальных услуг для частного дома с гостевыми домиками. Газ, вода, электричество - расчёт по счётчикам и объёму.",
  keywords: ["ЖКУ", "Севастополь", "коммунальные услуги", "расчёт", "счётчики", "газ", "вода", "электричество"],
  authors: [{ name: "ЖКУ Севастополь" }],
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "ЖКУ Севастополь",
    description: "Система расчёта коммунальных услуг",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
