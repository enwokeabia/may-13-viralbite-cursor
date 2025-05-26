"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/contexts/AuthContext";
import { useMemo, useState, useEffect } from "react";
import { HomeIcon, BuildingStorefrontIcon, DocumentTextIcon, EnvelopeIcon, ChartBarIcon, Cog6ToothIcon, ArrowLeftOnRectangleIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';

const navLinks = [
  { href: "/influencer", label: "Dashboard", icon: HomeIcon },
  { href: "/influencer/restaurants", label: "Restaurants", icon: BuildingStorefrontIcon },
  { href: "/influencer/submissions", label: "Submissions", icon: DocumentTextIcon },
  { href: "/influencer/invitations", label: "Private Invitations", icon: EnvelopeIcon },
  { href: "/influencer/analytics", label: "Earnings & Stats", icon: ChartBarIcon },
  { href: "/influencer/settings", label: "Settings", icon: Cog6ToothIcon },
];

export default function InfluencerSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut } = useAuth();
  const [open, setOpen] = useState(false);

  // Close drawer on route change
  useEffect(() => { setOpen(false); }, [pathname]);

  // ESC to close
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  // Get display name, email, photoURL
  const displayName = user?.displayName || user?.email || "User";
  const photoURL = user?.photoURL;
  const initials = useMemo(() => {
    if (user?.displayName) return user.displayName.split(' ').map(n => n[0]).join('').toUpperCase();
    if (user?.email) return user.email[0].toUpperCase();
    return 'U';
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  // Sidebar content
  const sidebarContent = (
    <div className="h-full w-64 flex flex-col py-8 px-6 justify-between">
      <div>
        <h2 className="text-2xl font-bold text-purple-700 mb-8 tracking-tight">ViralBite</h2>
        <div className="flex flex-col items-start mb-8">
          {photoURL ? (
            <img src={photoURL} alt="avatar" className="w-12 h-12 rounded-full object-cover mb-2 border-2 border-purple-200" />
          ) : (
            <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 text-lg font-bold mb-2 border-2 border-purple-200">{initials}</div>
          )}
          <div className="font-semibold text-gray-900 text-base leading-tight">{displayName}</div>
          <div className="text-xs text-purple-600 font-medium mt-0.5">Influencer</div>
        </div>
        <nav className="flex flex-col gap-1 w-full">
          {navLinks.map((link) => {
            const Icon = link.icon;
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-4 py-2 rounded-l-lg font-medium transition-colors w-full
                  ${active ? "bg-purple-50 text-purple-700 font-semibold border-l-4 border-purple-600" : "text-gray-700 hover:bg-purple-50"}
                `}
              >
                <Icon className={`h-5 w-5 ${active ? "text-purple-600" : "text-gray-400"}`} />
                <span className="text-sm">{link.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>
      <button
        onClick={handleSignOut}
        className="flex items-center gap-2 text-gray-500 hover:text-purple-700 px-2 py-2 rounded transition-colors text-sm"
      >
        <ArrowLeftOnRectangleIcon className="h-5 w-5" />
        Logout
      </button>
    </div>
  );

  return (
    <>
      {/* Top bar for mobile/tablet */}
      <div className="w-full bg-gray-100/80 border-b border-gray-200 px-0 md:hidden flex items-center h-14 fixed top-0 left-0 z-[101]">
        <button
          className="ml-4 bg-white rounded-full p-2 shadow border border-gray-200"
          onClick={() => setOpen(true)}
          aria-label="Open menu"
          type="button"
        >
          <Bars3Icon className="h-6 w-6 text-purple-700" />
        </button>
        <span className="ml-4 text-xl font-bold text-purple-700 tracking-tight">ViralBite</span>
      </div>

      {/* Sidebar for desktop/tablet */}
      <aside className="hidden md:flex h-full w-64 bg-white border-r flex-col py-8 px-6 justify-between">
        {sidebarContent}
      </aside>

      {/* Drawer for mobile */}
      {open && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/30 z-[100] transition-opacity"
            onClick={() => setOpen(false)}
            aria-label="Close menu overlay"
          />
          {/* Drawer */}
          <aside className="fixed top-0 left-0 h-full w-64 bg-white border-r z-[101] shadow-lg flex flex-col transition-transform duration-200">
            <button
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100"
              onClick={() => setOpen(false)}
              aria-label="Close menu"
              type="button"
            >
              <XMarkIcon className="h-6 w-6 text-purple-700" />
            </button>
            {sidebarContent}
          </aside>
        </>
      )}
    </>
  );
} 