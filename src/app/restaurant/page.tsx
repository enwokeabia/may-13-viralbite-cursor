"use client";

import { useEffect, useState } from "react";
import { useSubmissions } from "@/lib/hooks/useSubmissions";
import { auth } from "@/lib/firebase/firebase";
import { where } from "firebase/firestore";
import { getCampaigns, Campaign } from "@/lib/firebase/firebaseUtils";
import { ChartBarIcon, MegaphoneIcon, DocumentTextIcon, EyeIcon, HeartIcon, CurrencyDollarIcon } from '@heroicons/react/24/solid';

export default function RestaurantDashboard() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [campaignMap, setCampaignMap] = useState<Record<string, string>>({});

  useEffect(() => {
    const unsub = auth.onAuthStateChanged((user) => {
      setUserId(user ? user.uid : null);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!userId) return;
    getCampaigns().then((campaigns: Campaign[]) => {
      const myCampaigns = campaigns.filter((c) => c.restaurant_id === userId && c.id);
      setCampaigns(myCampaigns);
      const map: Record<string, string> = {};
      myCampaigns.forEach((c) => {
        if (c.id) map[c.id] = c.title;
      });
      setCampaignMap(map);
    });
  }, [userId]);

  // Get all campaign IDs for this restaurant
  const campaignIds = campaigns.map((c) => c.id).filter(Boolean);

  // Real-time submissions for these campaigns
  const { submissions, loading, error } = useSubmissions(
    campaignIds.length > 0 ? [where("campaignId", "in", campaignIds)] : []
  );

  // Aggregate metrics
  const activeCampaigns = campaigns.filter((c) => c.active_status).length;
  const totalSubmissions = submissions.length;
  const totalViews = submissions.reduce((sum, s) => sum + (s.views ?? 0), 0);
  const totalLikes = submissions.reduce((sum, s) => sum + (s.likes ?? 0), 0);
  // Calculate total spent from earnings field
  const totalSpent = submissions.reduce((sum, s) => sum + (s.earnings ?? 0), 0);

  return (
    <main className="min-h-screen flex flex-col items-center bg-[#f7f7fa]">
      <div className="w-full max-w-5xl mx-auto px-4 md:px-8 py-8">
        {/* Header Area */}
        <div className="mb-8 pb-4 border-b border-gray-200">
          <h1 className="text-3xl font-bold text-gray-900 mb-1 text-left">Dashboard</h1>
          <p className="text-gray-500 text-base text-left">Overview of your campaigns and performance</p>
        </div>
        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-10">
          <div className="bg-white rounded-xl shadow-sm p-6 flex flex-col items-start justify-between min-h-[110px]">
            <span className="text-sm text-gray-500 font-medium mb-2">Active Campaigns</span>
            <div className="flex items-center gap-2">
              <span className="text-3xl font-bold text-purple-700">{activeCampaigns}</span>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 flex flex-col items-start justify-between min-h-[110px]">
            <span className="text-sm text-gray-500 font-medium mb-2">Total Submissions</span>
            <div className="flex items-center gap-2">
              <span className="text-3xl font-bold text-purple-700">{totalSubmissions}</span>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 flex flex-col items-start justify-between min-h-[110px]">
            <span className="text-sm text-gray-500 font-medium mb-2">Total Views</span>
            <div className="flex items-center gap-2">
              <span className="text-3xl font-bold text-purple-700">{totalViews}</span>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 flex flex-col items-start justify-between min-h-[110px]">
            <span className="text-sm text-gray-500 font-medium mb-2">Total Likes</span>
            <div className="flex items-center gap-2">
              <span className="text-3xl font-bold text-purple-700">{totalLikes}</span>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm p-6 flex flex-col items-start justify-between min-h-[110px]">
            <span className="text-sm text-gray-500 font-medium mb-2">Total Spent</span>
            <div className="flex items-center gap-2">
              <span className="text-3xl font-bold text-purple-700">${totalSpent.toFixed(2)}</span>
            </div>
          </div>
        </div>
        {/* Recent Submissions Section */}
        <div className="bg-white rounded-xl shadow-sm p-6 mt-8 border border-gray-100">
          <h2 className="text-lg font-semibold mb-4 text-gray-900 text-left">Recent Submissions</h2>
          {loading && <div className="text-gray-500">Loading submissions...</div>}
          {error && <div className="text-red-500">{error}</div>}
          {!loading && submissions.length === 0 && (
            <div className="text-gray-400">No submissions yet</div>
          )}
          {!loading && submissions.length > 0 && (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100 bg-gray-50">
                    <th className="px-3 py-2 text-left font-semibold text-gray-700 whitespace-nowrap">Campaign</th>
                    <th className="px-3 py-2 text-left font-semibold text-gray-700 whitespace-nowrap">Influencer</th>
                    <th className="px-3 py-2 text-left font-semibold text-gray-700 whitespace-nowrap">Status</th>
                    <th className="px-3 py-2 text-left font-semibold text-gray-700 whitespace-nowrap">Views</th>
                    <th className="px-3 py-2 text-left font-semibold text-gray-700 whitespace-nowrap">Likes</th>
                  </tr>
                </thead>
                <tbody>
                  {submissions.slice(0, 5).map((sub, idx) => (
                    <tr
                      key={sub.id}
                      className={
                        idx % 2 === 0
                          ? "bg-white border-b border-gray-50"
                          : "bg-gray-50 border-b border-gray-100"
                      }
                    >
                      {/* Campaign Name (truncate, tooltip) */}
                      <td className="px-3 py-2 max-w-[160px] text-gray-900">
                        <span
                          className="font-medium text-purple-700 truncate block cursor-pointer"
                          title={campaignMap[sub.campaignId] || sub.campaignId}
                        >
                          {campaignMap[sub.campaignId]?.length
                            ? campaignMap[sub.campaignId]
                            : "N/A"}
                        </span>
                      </td>
                      {/* Influencer (truncate, tooltip) */}
                      <td className="px-3 py-2 max-w-[160px] text-gray-900">
                        <span
                          className="font-medium text-blue-700 truncate block cursor-pointer"
                          title={sub.influencerId || "N/A"}
                        >
                          {sub.influencerId?.length ? sub.influencerId : "N/A"}
                        </span>
                      </td>
                      {/* Status */}
                      <td className="px-3 py-2 text-left">
                        <span
                          className={`text-xs px-2 py-1 rounded font-semibold ${
                            sub.status === "approved"
                              ? "bg-purple-100 text-purple-700"
                              : sub.status === "rejected"
                              ? "bg-red-100 text-red-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {sub.status || "N/A"}
                        </span>
                      </td>
                      {/* Views */}
                      <td className="px-3 py-2 text-left text-gray-900">
                        {sub.views ?? "N/A"}
                      </td>
                      {/* Likes */}
                      <td className="px-3 py-2 text-left text-gray-900">
                        {sub.likes ?? "N/A"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  );
} 