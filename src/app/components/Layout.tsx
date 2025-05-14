import React from "react";
import Sidebar from "./Sidebar";
import MobileNav from "./MobileNav";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row">
      {/* Sidebar for desktop/tablet */}
      <aside className="hidden md:block w-64 bg-white border-r">
        <Sidebar />
      </aside>
      {/* Main content */}
      <main className="flex-1 flex flex-col">
        {children}
      </main>
      {/* Mobile nav for small screens */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full z-50">
        <MobileNav />
      </nav>
    </div>
  );
} 