import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans"
});

export const metadata: Metadata = {
  title: "Browser",
  description: "Sir Isaac Newton (1643-1727) was an English polymath active as a mathematician, physicist, astronomer, alchemist, theologian, and author. Newton was a key figure in the Scientific Revolution and the Enlightenment that followed.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
