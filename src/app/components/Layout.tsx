import React from "react";
import Header from "./Header";
import MobileNav from "./MobileNav";
import Sidebar from "./Sidebar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar for md+ screens */}
      <aside className="hidden md:block md:w-64 bg-white border-r min-h-screen fixed top-0 left-0 z-40 pt-16">
        <Sidebar />
      </aside>
      <div className="flex-1 flex flex-col" style={{ marginLeft: '0', marginTop: '0' }}>
        <Header />
        <main className="pt-16 pb-20 md:ml-64">
          {children}
        </main>
        <nav className="md:hidden fixed bottom-0 left-0 w-full z-50">
          <MobileNav />
        </nav>
      </div>
    </div>
  );
} 