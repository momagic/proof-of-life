import type React from "react";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import MiniKitProvider from "@/providers/minikit-provider";
import UnifiedMiniKitAuthProvider from "@/providers/unified-minikit-auth";
import { ErudaProvider } from "@/providers/eruda-provider";
import { WorldAppProvider } from "@/contexts/WorldAppContext";
import { ClientLayout } from "@/components/ClientLayout";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Proof of Life",
  description: "Verify your life — together we prove the world&apos;s still here.",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};



export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ErudaProvider>
          <WorldAppProvider>
            <MiniKitProvider>
              <UnifiedMiniKitAuthProvider>
                <ClientLayout>{children}</ClientLayout>
              </UnifiedMiniKitAuthProvider>
            </MiniKitProvider>
          </WorldAppProvider>
        </ErudaProvider>
      </body>
    </html>
  );
}
