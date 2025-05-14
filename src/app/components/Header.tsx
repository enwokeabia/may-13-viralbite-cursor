"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bars3Icon, XMarkIcon } from "@heroicons/react/24/outline";
import { useAuth } from "@/lib/contexts/AuthContext";

export default function Header() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const toggleProfile = () => setIsProfileOpen(!isProfileOpen);

  const getPageTitle = () => {
    const path = pathname.split("/").pop();
    if (path === "influencer") return "Dashboard";
    if (path === "campaigns") return "Browse Campaigns";
    if (path === "submissions") return "Submissions";
    if (path === "analytics") return "Earnings & Stats";
    return "ViralBite";
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b shadow-sm">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center">
          <button onClick={toggleMenu} className="p-2 rounded-md hover:bg-gray-100">
            {isMenuOpen ? <XMarkIcon className="h-6 w-6" /> : <Bars3Icon className="h-6 w-6" />}
          </button>
          <h1 className="ml-4 text-xl font-bold text-purple-700">{getPageTitle()}</h1>
        </div>
        <div className="relative">
          <button onClick={toggleProfile} className="flex items-center space-x-2">
            {user?.photoURL ? (
              <img src={user.photoURL} alt="avatar" className="w-8 h-8 rounded-full" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold">
                {user?.displayName ? user.displayName[0].toUpperCase() : "U"}
              </div>
            )}
          </button>
          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
              <Link href="/influencer/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Settings</Link>
              <button onClick={signOut} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Logout</button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
} 