import type { Metadata } from "next";
import { Urbanist } from "next/font/google";
import "./globals.css";

import { ResetFlowCta } from "@/components/ResetFlowCta";

const urbanist = Urbanist({
  variable: "--font-urbanist",
  subsets: ["latin"],
  display: "swap",
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
    <html lang="en" className={`${urbanist.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[var(--app-bg)] text-[var(--app-fg)]">
        {children}
        <ResetFlowCta />
      </body>
    </html>
  );
}
