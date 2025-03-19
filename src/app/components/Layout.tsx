'use client';

import Header from './Header';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#1E1F24] relative">
      <Header />
      {children}
    </div>
  );
}