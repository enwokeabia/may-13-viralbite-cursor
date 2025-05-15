"use client";

import { useAuth } from "@/lib/contexts/AuthContext";
import { UserIcon } from '@heroicons/react/24/outline';

export default function InfluencerProfilePage() {
  const { user } = useAuth();

  // Placeholder values for social and payment info
  const instagramUsername = "@yourhandle";
  const tiktokUsername = "@yourtiktok";
  const paymentInfo = "Not connected";

  return (
    <main className="min-h-screen flex flex-col items-center bg-gray-50 py-8 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 flex flex-col items-center mb-8">
        {/* Avatar or Icon */}
        {user?.photoURL ? (
          <img src={user.photoURL} alt="avatar" className="w-24 h-24 rounded-full object-cover border-4 border-purple-200 mb-4" />
        ) : (
          <div className="w-24 h-24 rounded-full bg-purple-50 flex items-center justify-center mb-4 border-4 border-purple-200">
            <UserIcon className="w-16 h-16 text-purple-400" />
          </div>
        )}
        {/* Display Name */}
        <h1 className="text-2xl font-bold text-purple-700 mb-1">{user?.displayName || user?.email || "Influencer"}</h1>
        {/* Email */}
        <div className="text-gray-500 text-sm mb-2">{user?.email}</div>
      </div>
      <div className="w-full max-w-md flex flex-col gap-4">
        {/* Instagram Card */}
        <div className="bg-white rounded-xl shadow p-5 flex flex-col gap-2">
          <div className="text-sm text-gray-500 font-semibold">Instagram Account</div>
          <div className="text-lg font-medium text-gray-800">{instagramUsername}</div>
          <button className="self-end text-xs text-purple-700 hover:underline">Edit</button>
        </div>
        {/* TikTok Card */}
        <div className="bg-white rounded-xl shadow p-5 flex flex-col gap-2">
          <div className="text-sm text-gray-500 font-semibold">TikTok Account</div>
          <div className="text-lg font-medium text-gray-800">{tiktokUsername}</div>
          <button className="self-end text-xs text-purple-700 hover:underline">Edit</button>
        </div>
        {/* Payments Card */}
        <div className="bg-white rounded-xl shadow p-5 flex flex-col gap-2">
          <div className="text-sm text-gray-500 font-semibold">Payments</div>
          <div className="text-lg font-medium text-gray-800">{paymentInfo}</div>
          <button className="self-end text-xs text-purple-700 hover:underline">Edit</button>
        </div>
      </div>
    </main>
  );
} 