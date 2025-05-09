"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/contexts/AuthContext";

const navLinks = [
  { href: "/admin", label: "Dashboard" },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  return (
    <aside className="h-full w-56 bg-gray-50 border-r flex flex-col py-8 px-4 justify-between">
      <div>
        <h2 className="text-2xl font-bold text-gray-800 mb-8">ViralBite Admin</h2>
        <nav className="flex flex-col gap-2">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-4 py-2 rounded text-left font-medium transition-colors ${
                pathname === link.href
                  ? "bg-gray-200 text-gray-900"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
      <button
        onClick={handleSignOut}
        className="mt-8 bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300"
      >
        Sign Out
      </button>
    </aside>
  );
} 