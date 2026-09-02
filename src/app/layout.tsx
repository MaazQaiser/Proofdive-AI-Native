import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import { IconDefaultsProvider } from "@/components/IconDefaultsProvider";
import { ResetFlowCta } from "@/components/ResetFlowCta";
import { Toaster } from "@/components/ui/sonner";
import { THEME_BOOTSTRAP } from "@/lib/theme";

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
      // The bootstrap below sets `class`, `style.colorScheme` and
      // `data-theme` on this element before React hydrates, which is exactly
      // the mismatch React would otherwise warn about.
      suppressHydrationWarning
    >
      <head>
        {/* Blocking, before first paint: without it the page renders in the
            default theme and then snaps, which is the one theme bug users
            always notice. */}
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOTSTRAP }} />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <IconDefaultsProvider>
          {children}
          <ResetFlowCta />
          <Toaster />
        </IconDefaultsProvider>
      </body>
    </html>
  );
}
