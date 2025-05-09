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
    });
  }, []);

  const { submissions, loading, error } = useSubmissions(
    userId ? [where("influencerId", "==", userId)] : []
  );

  return (
    <main className="min-h-screen flex flex-col items-center bg-white">
      <div className="w-full max-w-5xl mx-auto p-4 md:p-8">
        <h1 className="text-3xl font-bold text-purple-700 mb-2">Dashboard</h1>
        <p className="text-gray-600 mb-6">Track your performance and earnings</p>
        <InfluencerSummaryCards />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {/* Your Top Content */}
          <div className="bg-white rounded shadow p-6 flex flex-col justify-between min-h-[180px]">
            <div>
              <h2 className="text-lg font-bold mb-1">Your Top Content</h2>
              <p className="text-gray-500 text-sm mb-4">Best performing submissions based on views</p>
              <div className="flex flex-col items-center justify-center h-20 text-gray-400">
                {/* Placeholder icon */}
                <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a4 4 0 004 4h10a4 4 0 004-4V7a4 4 0 00-4-4H7a4 4 0 00-4 4z" /></svg>
                <span className="text-sm">No approved submissions yet<br/>Create your first submission to see performance</span>
              </div>
            </div>
            <button className="mt-4 self-end bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 text-sm">View all</button>
          </div>
          {/* Recommended Opportunities */}
          <div className="bg-white rounded shadow p-6 flex flex-col justify-between min-h-[180px]">
            <div>
              <h2 className="text-lg font-bold mb-1">Recommended Opportunities</h2>
              <p className="text-gray-500 text-sm mb-4">Campaigns that match your profile</p>
              <div className="flex flex-col items-center justify-center h-20 text-gray-400">
                <span className="text-sm">No recommended campaigns available</span>
              </div>
            </div>
            <button className="mt-4 self-end bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 text-sm">View all</button>
          </div>
        </div>
        <div className="mb-8">
          <CampaignDiscovery />
        </div>
        <div className="mb-8">
          <SubmissionList />
        </div>
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-2 text-purple-700">Your Submissions</h2>
          {loading && <div className="text-gray-500">Loading submissions...</div>}
          {error && <div className="text-red-500">{error}</div>}
          {!loading && submissions.length === 0 && (
            <div className="text-gray-400">No submissions yet.</div>
          )}
          <ul className="space-y-4">
            {submissions.map((sub) => (
              <li key={sub.id} className="border rounded p-4 bg-white shadow flex flex-col gap-1 text-left">
                <div><span className="font-semibold">Campaign:</span> {campaignMap[sub.campaignId] || sub.campaignId}</div>
                <div><span className="font-semibold">Status:</span> <span className={`text-xs px-2 py-1 rounded ${sub.status === 'approved' ? 'bg-purple-100 text-purple-700' : sub.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>{sub.status}</span></div>
                <div><span className="font-semibold">Content:</span> <a href={sub.contentUrl} className="text-purple-600 underline" target="_blank" rel="noopener noreferrer">View Reel</a></div>
                {sub.metrics && (
                  <div className="text-sm text-gray-500">Views: {sub.metrics.views} | Likes: {sub.metrics.likes}</div>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </main>
  );
} 