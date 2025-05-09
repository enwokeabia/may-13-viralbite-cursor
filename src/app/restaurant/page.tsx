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
  const totalViews = submissions.reduce((sum, s) => sum + (s.metrics?.views ?? 0), 0);
  const totalLikes = submissions.reduce((sum, s) => sum + (s.metrics?.likes ?? 0), 0);
  // Calculate total spent from views and reward rate
  const totalSpent = submissions.reduce((sum, s) => {
    const campaign = campaigns.find(c => c.id === s.campaignId);
    const rewardRate = campaign?.reward_rate ?? 0;
    const views = s.metrics?.views ?? 0;
    return sum + Math.round((views * rewardRate) / 1000 * 100) / 100;
  }, 0);

  return (
    <main className="min-h-screen flex flex-col items-center bg-white">
      <div className="w-full max-w-5xl mx-auto p-4 md:p-8">
        <h1 className="text-3xl font-bold text-purple-700 mb-1">Dashboard</h1>
        <p className="text-gray-600 mb-8">Overview of your campaigns and performance</p>
        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <div className="bg-white rounded shadow p-4 flex flex-col items-start h-32 justify-between">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-purple-100"><MegaphoneIcon className="h-5 w-5 text-purple-600" /></span>
              <span className="text-xs text-gray-500 font-medium">Active Campaigns</span>
            </div>
            <div className="text-2xl font-bold text-purple-700 mt-2">{activeCampaigns}</div>
          </div>
          <div className="bg-white rounded shadow p-4 flex flex-col items-start h-32 justify-between">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-purple-100"><DocumentTextIcon className="h-5 w-5 text-purple-600" /></span>
              <span className="text-xs text-gray-500 font-medium">Total Submissions</span>
            </div>
            <div className="text-2xl font-bold text-purple-700 mt-2">{totalSubmissions}</div>
          </div>
          <div className="bg-white rounded shadow p-4 flex flex-col items-start h-32 justify-between">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-purple-100"><EyeIcon className="h-5 w-5 text-purple-600" /></span>
              <span className="text-xs text-gray-500 font-medium">Total Views</span>
            </div>
            <div className="text-2xl font-bold text-purple-700 mt-2">{totalViews}</div>
          </div>
          <div className="bg-white rounded shadow p-4 flex flex-col items-start h-32 justify-between">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-purple-100"><HeartIcon className="h-5 w-5 text-purple-600" /></span>
              <span className="text-xs text-gray-500 font-medium">Total Likes</span>
            </div>
            <div className="text-2xl font-bold text-purple-700 mt-2">{totalLikes}</div>
          </div>
          <div className="bg-white rounded shadow p-4 flex flex-col items-start h-32 justify-between">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-purple-100"><CurrencyDollarIcon className="h-5 w-5 text-purple-600" /></span>
              <span className="text-xs text-gray-500 font-medium">Total Spent</span>
            </div>
            <div className="text-2xl font-bold text-purple-700 mt-2">${totalSpent.toFixed(2)}</div>
          </div>
        </div>
        {/* Recent Submissions */}
        <div className="bg-white rounded shadow p-6 mt-8">
          <h2 className="text-lg font-semibold mb-2 text-gray-900">Recent Submissions</h2>
          {loading && <div className="text-gray-500">Loading submissions...</div>}
          {error && <div className="text-red-500">{error}</div>}
          {!loading && submissions.length === 0 && (
            <div className="text-gray-400">No submissions yet</div>
          )}
          {!loading && submissions.length > 0 && (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <th className="px-3 py-2 text-left font-semibold text-gray-700 whitespace-nowrap">Campaign</th>
                    <th className="px-3 py-2 text-left font-semibold text-gray-700 whitespace-nowrap">Influencer</th>
                    <th className="px-3 py-2 text-center font-semibold text-gray-700 whitespace-nowrap">Status</th>
                    <th className="px-3 py-2 text-center font-semibold text-gray-700 whitespace-nowrap">Views</th>
                    <th className="px-3 py-2 text-center font-semibold text-gray-700 whitespace-nowrap">Likes</th>
                  </tr>
                </thead>
                <tbody>
                  {submissions.slice(0, 5).map((sub, idx) => (
                    <tr
                      key={sub.id}
                      className={
                        idx % 2 === 0
                          ? "bg-white border-b border-gray-100"
                          : "bg-gray-50 border-b border-gray-100"
                      }
                    >
                      {/* Campaign Name (truncate, tooltip) */}
                      <td className="px-3 py-2 max-w-[160px]">
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
                      <td className="px-3 py-2 max-w-[160px]">
                        <span
                          className="font-medium text-blue-700 truncate block cursor-pointer"
                          title={sub.influencerId || "N/A"}
                        >
                          {sub.influencerId?.length ? sub.influencerId : "N/A"}
                        </span>
                      </td>
                      {/* Status */}
                      <td className="px-3 py-2 text-center">
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
                      <td className="px-3 py-2 text-center">
                        {sub.metrics?.views ?? "N/A"}
                      </td>
                      {/* Likes */}
                      <td className="px-3 py-2 text-center">
                        {sub.metrics?.likes ?? "N/A"}
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