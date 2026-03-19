import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { BetaBanner } from "@/components/layout/BetaBanner";
import { BetaBadge } from "@/components/layout/BetaBadge";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mazmatics Stats Playground",
  description: "Interactive math & statistics data visualization playground",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${geist.variable} ${geistMono.variable}`}>
      <body className="antialiased bg-black text-white">
        <BetaBanner />
        <BetaBadge />
        {children}
      </body>
    </html>
  );
}
