"use client";

import { useEffect, useState } from "react";
import { useSubmissions } from "@/lib/hooks/useSubmissions";
import { auth } from "@/lib/firebase/firebase";
import { where } from "firebase/firestore";
import { getCampaigns, Campaign } from "@/lib/firebase/firebaseUtils";

export default function EarningsPage() {
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

  // Calculate total earnings
  const totalEarnings = submissions.reduce((sum, sub) => sum + (sub.earnings ?? 0), 0);

  return (
    <main className="min-h-screen flex flex-col items-center bg-gray-50">
      <div className="w-full max-w-3xl mx-auto p-4 md:p-8">
        <div className="mb-4">
          <h1 className="text-2xl md:text-3xl font-bold text-black">Earnings</h1>
        </div>
        <div className="mb-6 text-lg font-semibold text-gray-700">Total Earnings: <span className="text-green-600">${totalEarnings.toFixed(2)}</span></div>
        <p className="text-gray-600 mb-6">Track your campaign submissions, approval status, and performance.</p>
        {loading && <div className="text-gray-400">Loading submissions...</div>}
        {error && <div className="text-red-500">{error}</div>}
        {!loading && submissions.length === 0 && (
          <div className="flex flex-col items-center justify-center bg-gray-50 border border-gray-200 rounded-xl p-8 text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a4 4 0 004 4h10a4 4 0 004-4V7a4 4 0 004-4H7a4 4 0 00-4 4z" /></svg>
            <span className="text-xs">No submissions yet.</span>
          </div>
        )}
        <ul className="space-y-4">
          {submissions.map((sub) => (
            <li key={sub.id} className="border border-gray-200 rounded-xl p-4 bg-white shadow-sm flex flex-col gap-1 text-left">
              <div><span className="text-xs uppercase text-gray-500 font-semibold">Campaign:</span> <span className="font-medium text-purple-700">{campaignMap[sub.campaignId] || sub.campaignId}</span></div>
              <div><span className="text-xs uppercase text-gray-500 font-semibold">Status:</span> <span className={`text-xs px-2 py-1 rounded ${sub.status === 'approved' ? 'bg-purple-100 text-purple-700' : sub.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>{sub.status}</span></div>
              <div><span className="text-xs uppercase text-gray-500 font-semibold">Content:</span> <a href={sub.contentUrl} className="text-purple-600 underline" target="_blank" rel="noopener noreferrer">View Reel</a></div>
              {sub.views && (
                <div className="text-xs text-gray-400">Views: {sub.views}</div>
              )}
              {sub.likes && (
                <div className="text-xs text-gray-400">Likes: {sub.likes}</div>
              )}
              <div className="text-xs text-green-600 font-semibold">Earnings: ${sub.earnings?.toFixed(2) ?? '0.00'}</div>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
} 