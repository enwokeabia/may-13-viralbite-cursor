"use client";

import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase/firebase";
import { getSubmissionsByInfluencer, getCampaigns, getMetricsBySubmission, Submission, Campaign } from "@/lib/firebase/firebaseUtils";

export default function InfluencerSummaryCards() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeCount, setActiveCount] = useState(0);
  const [totalViews, setTotalViews] = useState(0);
  const [totalEarnings, setTotalEarnings] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError("");
      try {
        const user = auth.currentUser;
        if (!user) throw new Error("You must be logged in to view stats.");
        const [subs, campaigns] = await Promise.all([
          getSubmissionsByInfluencer(user.uid),
          getCampaigns(),
        ]);
        const cmap: { [id: string]: Campaign } = {};
        campaigns.forEach((c) => {
          cmap[c.id!] = c;
        });
        let active = 0;
        let views = 0;
        let earnings = 0;
        for (const s of subs) {
          if (s.status === 'approved' || s.status === 'submitted' || s.status === 'joined' || s.status === 'pending') {
            active++;
          }
          const metrics = await getMetricsBySubmission(s.id!);
          const reward_rate = cmap[s.campaignId]?.reward_rate || 0;
          const v = metrics?.views ?? s.views ?? 0;
          views += v;
          earnings += Math.round((v * reward_rate) / 1000 * 100) / 100;
        }
        setActiveCount(active);
        setTotalViews(views);
        setTotalEarnings(earnings);
      } catch (err: any) {
        setError(err.message || "Failed to fetch stats");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6"><div className="bg-gray-100 rounded p-6 h-24 animate-pulse" /><div className="bg-gray-100 rounded p-6 h-24 animate-pulse" /><div className="bg-gray-100 rounded p-6 h-24 animate-pulse" /></div>;
  if (error) return <div className="text-center text-red-500 py-4">{error}</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
      <div className="bg-white rounded shadow p-6 flex flex-col items-center h-28 justify-center">
        <div className="text-2xl font-bold text-purple-700">{activeCount}</div>
        <div className="text-xs text-gray-500 mt-1">Active Submissions</div>
      </div>
      <div className="bg-white rounded shadow p-6 flex flex-col items-center h-28 justify-center">
        <div className="text-2xl font-bold text-purple-700">{totalViews}</div>
        <div className="text-xs text-gray-500 mt-1">Total Views</div>
      </div>
      <div className="bg-white rounded shadow p-6 flex flex-col items-center h-28 justify-center">
        <div className="text-2xl font-bold text-purple-700">${totalEarnings.toFixed(2)}</div>
        <div className="text-xs text-gray-500 mt-1">Total Earnings</div>
      </div>
    </div>
  );
} 