import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import { IconDefaultsProvider } from "@/components/IconDefaultsProvider";
import { ResetFlowCta } from "@/components/ResetFlowCta";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({
  variable: "--font-sans",
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
    <html
      lang="en"
      className={`${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[var(--app-bg)] text-[var(--app-fg)]">
        <IconDefaultsProvider>
          {children}
          <ResetFlowCta />
          <Toaster />
        </IconDefaultsProvider>
      </body>
    </html>
  );
}
