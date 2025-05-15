"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bars3Icon, XMarkIcon, ChevronDownIcon } from "@heroicons/react/24/outline";
import { Dialog } from "@headlessui/react";
import Sidebar from "./Sidebar";
import { useAuth } from "@/lib/contexts/AuthContext";

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const toggleProfile = () => setIsProfileOpen(!isProfileOpen);

  const getPageTitle = () => {
    const path = pathname.split("/").pop();
    if (path === "influencer") return "Dashboard";
    if (path === "restaurants") return "Restaurants";
    if (path === "earnings") return "Earnings";
    if (path === "profile") return "Profile";
    return "ViralBite";
  };

  const handleLogout = async () => {
    await signOut();
    router.push("/");
  };

  return (
    <>
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b shadow-sm">
        <div className="flex items-center justify-between px-4 py-3">
          {/* Burger for mobile */}
          <button
            className="p-2 rounded-md hover:bg-gray-100 md:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Bars3Icon className="h-6 w-6" />
          </button>
          <h1 className="ml-4 text-xl font-bold text-purple-700">{getPageTitle()}</h1>
          <div className="relative">
            <button onClick={toggleProfile} className="flex items-center space-x-2">
              {user?.photoURL ? (
                <img src={user.photoURL} alt="avatar" className="w-8 h-8 rounded-full" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold">
                  {user?.displayName ? user.displayName[0].toUpperCase() : "U"}
                </div>
              )}
              {user?.displayName && (
                <span className="hidden md:inline ml-2 text-gray-800 font-medium">{user.displayName}</span>
              )}
              <ChevronDownIcon className={`h-4 w-4 text-gray-500 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
            </button>
            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                <Link href="/influencer/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Profile</Link>
                <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Logout</button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Sidebar (Sheet) */}
      <Dialog open={sidebarOpen} onClose={() => setSidebarOpen(false)} className="relative z-50 md:hidden">
        {/* Overlay */}
        <div className="fixed inset-0 bg-black/80 transition-opacity" aria-hidden="true" />
        {/* Sidebar panel with smooth slide animation */}
        <div className={`fixed inset-y-0 left-0 h-full w-3/4 max-w-sm bg-white shadow-lg border-r transform transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <div className="flex justify-end p-4">
            <button onClick={() => setSidebarOpen(false)}>
              <XMarkIcon className="h-6 w-6 text-gray-700" />
            </button>
          </div>
          <Sidebar onClose={() => setSidebarOpen(false)} />
        </div>
      </Dialog>
    </>
  );
} 