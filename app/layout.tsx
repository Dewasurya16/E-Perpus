import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { GlobalLoadingProvider } from "./components/GlobalLoadingProvider";
import ScrollReveal from "./components/ScrollReveal";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const viewport = {
  themeColor: "#1B4332",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export const metadata: Metadata = {
  title: "E-Perpus Kejaksaan Negeri Soppeng",
  description: "Sistem Informasi Perpustakaan Digital dan Buku Tamu Kejaksaan Negeri Soppeng",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "E-Perpus",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <GlobalLoadingProvider>
          {children}
        </GlobalLoadingProvider>
        <ScrollReveal />
      </body>
    </html>
  );
}