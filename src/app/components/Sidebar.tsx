"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { HomeIcon, MagnifyingGlassIcon, EnvelopeIcon, CurrencyDollarIcon, UserIcon, ArrowLeftOnRectangleIcon } from "@heroicons/react/24/outline";
import { useAuth } from "@/lib/contexts/AuthContext";

export default function Sidebar({ onClose }: { onClose?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, signOut } = useAuth();

  const navItems = [
    { href: "/influencer", label: "Dashboard", icon: HomeIcon },
    { href: "/influencer/restaurants", label: "Browse Restaurants", icon: MagnifyingGlassIcon },
    { href: "/influencer/invitations", label: "Private Invitations", icon: EnvelopeIcon },
    { href: "/influencer/earnings", label: "Earnings", icon: CurrencyDollarIcon },
    { href: "/influencer/profile", label: "Profile", icon: UserIcon },
  ];

  return (
    <div className="flex flex-col h-full bg-white w-full">
      {/* Top: Brand and User */}
      <div className="p-6 border-b">
        <h2 className="text-2xl font-bold text-purple-700 mb-4">ViralBite</h2>
        <div className="flex items-center gap-3 mb-2">
          {user?.photoURL ? (
            <img src={user.photoURL} alt="avatar" className="w-10 h-10 rounded-full object-cover border-2 border-purple-200" />
          ) : (
            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-700 font-bold">
              {user?.displayName ? user.displayName[0].toUpperCase() : "U"}
            </div>
          )}
          <div>
            <div className="font-semibold text-gray-900">{user?.displayName || user?.email || "User"}</div>
            <div className="text-xs text-purple-600 font-medium">Influencer</div>
          </div>
        </div>
      </div>
      {/* Nav */}
      <nav className="flex-1 flex flex-col gap-1 p-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={`flex items-center gap-3 px-4 py-2 rounded-lg font-medium transition-colors ${
                active ? "bg-purple-50 text-purple-700 font-semibold" : "text-gray-700 hover:bg-purple-50"
              }`}
            >
              <Icon className={`h-5 w-5 ${active ? "text-purple-600" : "text-gray-400"}`} />
              <span className="text-base">{item.label}</span>
            </Link>
          );
        })}
        <button
          onClick={async () => {
            await signOut();
            router.push("/");
            if (onClose) onClose();
          }}
          className="flex items-center gap-3 px-4 py-2 rounded-lg font-medium transition-colors w-full text-gray-500 hover:text-purple-700 hover:bg-purple-50 mt-2"
        >
          <ArrowLeftOnRectangleIcon className="h-5 w-5" />
          <span className="text-base">Sign Out</span>
        </button>
      </nav>
    </div>
  );
} 