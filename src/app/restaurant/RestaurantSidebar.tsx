"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/contexts/AuthContext";
import { useMemo } from "react";
import { HomeIcon, MegaphoneIcon, DocumentTextIcon, EnvelopeIcon, ChartBarIcon, Cog6ToothIcon, ArrowLeftOnRectangleIcon } from '@heroicons/react/24/outline';

const navLinks = [
  { href: "/restaurant", label: "Dashboard", icon: HomeIcon },
  { href: "/restaurant/campaigns", label: "Campaigns", icon: MegaphoneIcon },
  { href: "/restaurant/submissions", label: "Submissions", icon: DocumentTextIcon },
  { href: "/restaurant/invitations", label: "Private Invitations", icon: EnvelopeIcon },
  { href: "/restaurant/analytics", label: "Analytics", icon: ChartBarIcon },
  { href: "/restaurant/settings", label: "Settings", icon: Cog6ToothIcon },
];

export default function RestaurantSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut } = useAuth();

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

  return (
    <aside className="h-full w-64 bg-white border-r flex flex-col py-8 px-6 justify-between">
      <div>
        <h2 className="text-2xl font-bold text-purple-700 mb-8 tracking-tight">ViralBite</h2>
        <div className="flex flex-col items-start mb-8">
          {photoURL ? (
            <img src={photoURL} alt="avatar" className="w-12 h-12 rounded-full object-cover mb-2 border-2 border-purple-200" />
          ) : (
            <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 text-lg font-bold mb-2 border-2 border-purple-200">{initials}</div>
          )}
          <div className="font-semibold text-gray-900 text-base leading-tight">{displayName}</div>
          <div className="text-xs text-purple-600 font-medium mt-0.5">Restaurant Owner</div>
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
    </aside>
  );
} 