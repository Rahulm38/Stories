import type { Metadata, Viewport } from "next";
import { Inter, Lora } from "next/font/google";
import "./globals.css";
import { MemoryProvider } from '@/components/shared/memory-store';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const lora = Lora({
  subsets: ['latin'],
  variable: '--font-lora',
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Stories — Your Markdown vault.",
  description: "A quiet, local Markdown vault for capturing and organizing the things you want to remember.",
  keywords: ["markdown", "notes", "personal knowledge", "journal", "memory"],
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#f7f5f0",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${lora.variable}`}>
      <body className="antialiased">
        <MemoryProvider>{children}</MemoryProvider>
      </body>
    </html>
  );
}
