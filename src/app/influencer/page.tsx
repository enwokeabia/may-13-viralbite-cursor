"use client";

import { useEffect, useState } from "react";
import { useSubmissions } from "@/lib/hooks/useSubmissions";
import { auth } from "@/lib/firebase/firebase";
import { where } from "firebase/firestore";
import { getCampaigns, Campaign } from "@/lib/firebase/firebaseUtils";
import CampaignDiscovery from "./CampaignDiscovery";
import SubmissionList from "./SubmissionList";
import InfluencerSummaryCards from "./InfluencerSummaryCards";

export default function InfluencerDashboard() {
  const [userId, setUserId] = useState<string | null>(null);
  const [campaignMap, setCampaignMap] = useState<Record<string, string>>({});
  const [recentCampaigns, setRecentCampaigns] = useState<Campaign[]>([]);

  useEffect(() => {
    const unsub = auth.onAuthStateChanged((user) => {
      setUserId(user ? user.uid : null);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    getCampaigns().then((campaigns: Campaign[]) => {
      const map: Record<string, string> = {};
      campaigns.forEach((c) => {
        if (c.id) map[c.id] = c.title;
      });
      setCampaignMap(map);
      // Sort by id (string comparison) as fallback
      const sorted = [...campaigns].sort((a, b) => {
        if (a.id && b.id) return b.id.localeCompare(a.id);
        return 0;
      });
      setRecentCampaigns(sorted.slice(0, 2));
    });
  }, []);

  const { submissions, loading, error } = useSubmissions(
    userId ? [where("influencerId", "==", userId)] : []
  );

  // Helper to estimate earnings if not present in metrics
  function getEarnings(sub: any) {
    if (sub.metrics && typeof sub.metrics.earnings === 'number') return sub.metrics.earnings;
    // fallback: estimate earnings if reward_rate is available
    if (sub.metrics && typeof sub.metrics.views === 'number' && sub.reward_rate) {
      return Math.round((sub.metrics.views * sub.reward_rate) / 1000 * 100) / 100;
    }
    return 0;
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar is assumed to be rendered outside this file, so we just add a divider */}
      <div className="hidden md:block w-0.5 bg-gray-200" />
      <main className="flex-1 flex flex-col items-center">
        {/* Soft header */}
        <div className="w-full bg-gray-100/80 border-b border-gray-200 px-0 md:px-0">
          <div className="max-w-5xl mx-auto px-4 md:px-8 pt-8 pb-4">
            <h1 className="text-2xl md:text-3xl font-bold text-black tracking-tight mb-1">Dashboard</h1>
            <p className="text-gray-500 text-base mb-2">Track your performance and earnings</p>
          </div>
        </div>
        <div className="w-full max-w-5xl mx-auto px-4 md:px-8">
          {/* Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6 mb-8">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col justify-between">
              <span className="uppercase text-xs text-gray-500 font-medium mb-2 tracking-wider">Active Submissions</span>
              <span className="text-2xl font-semibold text-purple-700 mb-1">{submissions.filter(s => s.status === 'approved' || s.status === 'submitted' || s.status === 'pending').length}</span>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col justify-between">
              <span className="uppercase text-xs text-gray-500 font-medium mb-2 tracking-wider">Total Views</span>
              <span className="text-2xl font-semibold text-purple-700 mb-1">{submissions.reduce((sum, s) => sum + (s.metrics?.views ?? 0), 0)}</span>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col justify-between">
              <span className="uppercase text-xs text-gray-500 font-medium mb-2 tracking-wider">Total Earnings</span>
              <span className="text-2xl font-semibold text-purple-700 mb-1">${submissions.reduce((sum, s) => sum + getEarnings(s), 0).toFixed(2)}</span>
            </div>
          </div>
          {/* Top Content & Opportunities */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {/* Your Top Content */}
            <div className="bg-gray-50 rounded-xl border border-gray-200 shadow-sm p-6 flex flex-col justify-between min-h-[180px]">
              <div>
                <h2 className="text-sm uppercase text-gray-500 font-semibold mb-1 tracking-wider">Your Top Content</h2>
                <p className="text-gray-400 text-xs mb-4">Best performing submissions based on views</p>
                <div className="flex flex-col items-center justify-center h-20 text-gray-300">
                  {/* Placeholder icon */}
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a4 4 0 004 4h10a4 4 0 004-4V7a4 4 0 00-4-4H7a4 4 0 00-4 4z" /></svg>
                  <span className="text-xs text-gray-400 text-center">No approved submissions yet<br/>Create your first submission to see performance</span>
                </div>
              </div>
              <button className="mt-4 self-end bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 text-xs font-medium">View all</button>
            </div>
            {/* Recommended Opportunities (recent campaigns only) */}
            <div className="bg-gray-50 rounded-xl border border-gray-200 shadow-sm p-6 flex flex-col justify-between min-h-[180px]">
              <div>
                <h2 className="text-sm uppercase text-gray-500 font-semibold mb-1 tracking-wider">Recommended Opportunities</h2>
                <p className="text-gray-400 text-xs mb-4">Campaigns that match your profile</p>
                <div className="flex flex-col gap-2">
                  {recentCampaigns.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-20 text-gray-300">
                      <span className="text-xs text-gray-400 text-center">No recommended campaigns available</span>
                    </div>
                  ) : (
                    recentCampaigns.map((c) => (
                      <div key={c.id} className="border border-gray-200 rounded-lg bg-white p-3 flex flex-col gap-1">
                        <span className="font-semibold text-purple-700 truncate" title={c.title}>{c.title}</span>
                        <span className="text-xs text-gray-500 truncate" title={c.description}>{c.description}</span>
                        <span className="text-xs text-purple-500">Reward Rate: <span className="font-semibold">${c.reward_rate} / 1k views</span></span>
                      </div>
                    ))
                  )}
                </div>
              </div>
              <a href="/influencer/campaigns" className="mt-4 self-end bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 text-xs font-medium text-center">View all</a>
            </div>
          </div>
          {/* Your Submissions - REMOVE from dashboard, now only on submissions page */}
        </div>
      </main>
    </div>
  );
} 