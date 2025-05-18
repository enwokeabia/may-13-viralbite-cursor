"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { HomeIcon, MegaphoneIcon, DocumentTextIcon, ChartBarIcon } from '@heroicons/react/24/outline';

const navItems = [
  {
    href: "/restaurant",
    label: "Dashboard",
    icon: HomeIcon,
  },
  {
    href: "/restaurant/campaigns",
    label: "Campaigns",
    icon: MegaphoneIcon,
  },
  {
    href: "/restaurant/submissions",
    label: "Submissions",
    icon: DocumentTextIcon,
  },
  {
    href: "/restaurant/analytics",
    label: "Analytics",
    icon: ChartBarIcon,
  },
];

export default function RestaurantMobileNav() {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t flex justify-around md:hidden shadow-lg" style={{height: 68}}>
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center justify-center p-3 flex-1 ${isActive ? "text-purple-700 font-semibold" : "text-gray-700"}`}
          >
            <Icon className={`w-5 h-5 ${isActive ? "text-purple-700" : "text-gray-400"}`} />
            <span className="text-xs mt-1 text-center leading-tight">{item.label}</span>
          </Link>
        );
      })}
    </div>
  );
} 