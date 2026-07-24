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
  icons: {
    icon: [
      { url: "/brand/favicon.svg" },
      { url: "/brand/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/brand/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    shortcut: "/brand/favicon.ico",
    apple: "/brand/apple-touch-icon.png",
  },
  manifest: "/brand/site.webmanifest",
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
