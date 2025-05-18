"use client";

import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase/firebase";
import { getCampaignsByRestaurant, Campaign } from "@/lib/firebase/firebaseUtils";
import { useSubmissions } from "@/lib/hooks/useSubmissions";
import { where } from "firebase/firestore";

export default function RestaurantSummaryCards() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const unsub = auth.onAuthStateChanged((user) => {
      setUserId(user ? user.uid : null);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!userId) return;
    getCampaignsByRestaurant(userId).then(setCampaigns);
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
  const totalSpent = submissions.reduce((sum, s) => sum + (s.earnings ?? 0), 0);

  if (loading) return <div className="flex gap-4 my-6"><div className="bg-gray-100 rounded p-6 w-48 h-24 animate-pulse" /><div className="bg-gray-100 rounded p-6 w-48 h-24 animate-pulse" /><div className="bg-gray-100 rounded p-6 w-48 h-24 animate-pulse" /></div>;
  if (error) return <div className="text-center text-red-500 py-4">{error}</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
      <div className="bg-white rounded shadow p-6 w-48 flex flex-col items-center">
        <div className="text-2xl font-bold text-indigo-700">{activeCampaigns}</div>
        <div className="text-xs text-gray-500 mt-1">Active Campaigns</div>
      </div>
      <div className="bg-white rounded shadow p-6 w-48 flex flex-col items-center">
        <div className="text-2xl font-bold text-indigo-700">{totalSubmissions}</div>
        <div className="text-xs text-gray-500 mt-1">Total Submissions</div>
      </div>
      <div className="bg-white rounded shadow p-6 w-48 flex flex-col items-center">
        <div className="text-2xl font-bold text-indigo-700">{totalViews}</div>
        <div className="text-xs text-gray-500 mt-1">Total Views</div>
      </div>
      <div className="bg-white rounded shadow p-6 w-48 flex flex-col items-center">
        <div className="text-2xl font-bold text-indigo-700">{totalLikes}</div>
        <div className="text-xs text-gray-500 mt-1">Total Likes</div>
      </div>
      <div className="bg-white rounded shadow p-6 w-48 flex flex-col items-center">
        <div className="text-2xl font-bold text-indigo-700">${totalSpent.toFixed(2)}</div>
        <div className="text-xs text-gray-500 mt-1">Total $ Spent</div>
      </div>
    </div>
  );
} 