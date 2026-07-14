import type { Metadata } from "next";
import { Inter } from "next/font/google";
import localFont from "next/font/local";
import "./globals.css";

import { ResetFlowCta } from "@/components/ResetFlowCta";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const gilroy = localFont({
  variable: "--font-logo",
  display: "swap",
  fallback: ["ui-sans-serif", "system-ui", "sans-serif"],
  src: [
    { path: "../fonts/gilroy/Gilroy-Light.woff", weight: "300", style: "normal" },
    { path: "../fonts/gilroy/Gilroy-Regular.woff", weight: "400", style: "normal" },
    { path: "../fonts/gilroy/Gilroy-Medium.woff", weight: "500", style: "normal" },
    { path: "../fonts/gilroy/Gilroy-Bold.woff", weight: "700", style: "normal" },
    { path: "../fonts/gilroy/Gilroy-Heavy.woff", weight: "800", style: "normal" },
  ],
});

export const metadata: Metadata = {
  title: "ProofDive",
  description: "Experience → Proof → Offers",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${gilroy.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[var(--app-bg)] text-[var(--app-fg)]">
        {children}
        <ResetFlowCta />
        <Toaster />
      </body>
    </html>
  );
}
