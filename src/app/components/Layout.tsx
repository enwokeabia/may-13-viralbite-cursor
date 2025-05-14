import React from "react";
import Header from "./Header";
import MobileNav from "./MobileNav";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="pt-16 pb-20">
        {children}
      </main>
      <nav className="md:hidden fixed bottom-0 left-0 w-full z-50">
        <MobileNav />
      </nav>
    </div>
  );
} 