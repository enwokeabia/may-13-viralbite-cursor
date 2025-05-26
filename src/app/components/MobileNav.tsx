"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Store, DollarSign, User } from 'lucide-react';

const navItems = [
  {
    label: 'Dashboard',
    href: '/influencer',
    icon: Home,
  },
  {
    label: 'Restaurants',
    href: '/influencer/restaurants',
    icon: Store,
  },
  {
    label: 'Earnings',
    href: '/influencer/earnings',
    icon: DollarSign,
  },
  {
    label: 'Profile',
    href: '/influencer/profile',
    icon: User,
  },
];

export default function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t shadow-lg">
      <ul className="flex justify-between items-center px-2 py-0">
        {navItems.map(({ label, href, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <li key={label} className="flex-1">
              <Link
                href={href}
                className={`flex flex-col items-center justify-center py-2 transition-colors duration-150 ${
                  isActive
                    ? 'text-purple-700 font-semibold'
                    : 'text-gray-500 hover:text-purple-600'
                }`}
                aria-label={label}
              >
                <span
                  className={`rounded-full p-2 mb-1 transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-purple-800 to-purple-600 text-white shadow'
                      : ''
                  }`}
                >
                  <Icon size={24} />
                </span>
                <span className="text-xs leading-tight">{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
} 