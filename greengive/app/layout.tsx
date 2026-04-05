import type { Metadata } from "next";
import { Syne, DM_Sans } from "next/font/google";
import "./globals.css";

const syne = Syne({
  subsets: ["latin"],
  variable: "--font-syne",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm",
});

export const metadata: Metadata = {
  title: "GreenGive | Play golf. Win big. Give back.",
  description: "Enter your Stableford scores, compete in monthly prize draws, and give a portion of your subscription to a cause you care about.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${syne.variable} ${dmSans.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#06060e] text-white font-dm selection:bg-teal-brand/30 selection:text-white">
        {children}
      </body>
    </html>
  );
}
