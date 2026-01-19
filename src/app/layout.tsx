import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { MainContent } from "@/components/MainContent";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Easy.Store - Dokumentasi",
  description: "Pusat dokumentasi dan tutorial produk Easy.Store",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Outfit:wght@400;500;600;700&family=Poppins:wght@400;500;600;700&family=Roboto:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={inter.variable}>
        {/* Background blur circles */}
        <div className="blur-circles">
          <div className="blur-circle blur-circle-1" />
          <div className="blur-circle blur-circle-2" />
        </div>

        <MainContent>
          {children}
        </MainContent>
      </body>
    </html>
  );
}

