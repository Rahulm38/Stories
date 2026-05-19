import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Memory OS — Your life, remembered.",
  description:
    "A personal memory system that helps you capture, strengthen, connect, and reuse fragile memories. Capture what matters. Recall it before it fades.",
  keywords: ["memory", "recall", "personal knowledge", "journal", "capture"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${outfit.variable}`}>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
