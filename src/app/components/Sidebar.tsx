import React from "react";

export default function Sidebar() {
  return (
    <nav className="flex flex-col gap-4 p-6">
      <a href="/influencer" className="text-purple-700 font-semibold">Dashboard</a>
      <a href="/influencer/browse" className="text-gray-700">Browse</a>
      <a href="/influencer/earnings" className="text-gray-700">Earnings</a>
      {/* Add more links as needed */}
    </nav>
  );
} 