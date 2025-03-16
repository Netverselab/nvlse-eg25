import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Next Gen Search',
  description: 'Search the web privately',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[#1E1F24] text-white">
        {children}
      </body>
    </html>
  );
}
