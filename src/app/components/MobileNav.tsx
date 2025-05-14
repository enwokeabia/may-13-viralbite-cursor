"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { HomeIcon, MegaphoneIcon, DocumentTextIcon, EnvelopeIcon, ChartBarIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';

const navItems = [
  {
    href: "/influencer",
    label: "Dashboard",
    icon: HomeIcon,
  },
  {
    href: "/influencer/campaigns",
    label: "Campaigns",
    icon: MegaphoneIcon,
  },
  {
    href: "/influencer/submissions",
    label: "Submissions",
    icon: DocumentTextIcon,
  },
  {
    href: "/influencer/analytics",
    label: "Earnings",
    icon: ChartBarIcon,
  },
];

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t flex justify-around md:hidden shadow-lg" style={{height: 68}}>
      {navItems.map((item) => {
        const isActive = pathname === (typeof item.href === 'string' ? item.href : '');
        const Icon = item.icon;
        return (
          <Link
            key={typeof item.href === 'string' ? item.href : ''}
            href={typeof item.href === 'string' ? item.href : ''}
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