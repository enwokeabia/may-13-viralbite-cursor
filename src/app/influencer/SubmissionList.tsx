"use client";

import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase/firebase";
import { getSubmissionsByInfluencer, Submission, getCampaigns, Campaign } from "@/lib/firebase/firebaseUtils";

interface SubmissionWithMetrics extends Submission {
  views: number;
  engagement_rate?: number;
  earnings: number;
  reward_rate?: number;
}

export default function SubmissionList() {
  const [submissions, setSubmissions] = useState<SubmissionWithMetrics[]>([]);
  const [campaignMap, setCampaignMap] = useState<{ [id: string]: Campaign }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError("");
      try {
        const user = auth.currentUser;
        if (!user) throw new Error("You must be logged in to view submissions.");
        const [subs, campaigns] = await Promise.all([
          getSubmissionsByInfluencer(user.uid),
          getCampaigns(),
        ]);
        const cmap: { [id: string]: Campaign } = {};
        campaigns.forEach((c) => {
          cmap[c.id!] = c;
        });
        setCampaignMap(cmap);
        // Fetch metrics for each submission
        const subsWithMetrics = subs.map((s) => {
          const campaign = cmap[s.campaignId];
          const reward_rate = campaign?.reward_rate || 0;
          const views = s.views ?? 0;
          const engagement_rate = undefined;
          const earnings = Math.round((views * reward_rate) / 1000 * 100) / 100 || 0;
          return {
            ...s,
            views,
            engagement_rate,
            earnings,
            reward_rate,
          };
        });
        setSubmissions(subsWithMetrics);
      } catch (err: any) {
        setError(err.message || "Failed to fetch submissions");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="text-center text-gray-500 py-4">Loading submissions...</div>;
  if (error) return <div className="text-center text-red-500 py-4">{error}</div>;
  if (submissions.length === 0) return <div className="text-center text-gray-400 py-4">No submissions yet.</div>;

  return (
    <div className="mt-8 w-full max-w-2xl mx-auto grid gap-4">
      {submissions.map((s) => (
        <div key={s.id} className="border rounded p-4 bg-white shadow flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-purple-700">{campaignMap[s.campaignId]?.title || "Campaign"}</h3>
            <span className={`text-xs px-2 py-1 rounded ${s.status === 'approved' ? 'bg-purple-100 text-purple-700' : s.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>{s.status.charAt(0).toUpperCase() + s.status.slice(1)}</span>
          </div>
          <a href={s.contentUrl} target="_blank" rel="noopener noreferrer" className="text-purple-600 underline break-all">{s.contentUrl}</a>
          <div className="flex flex-wrap gap-4 mt-2 text-sm">
            <div><span className="font-semibold">Views:</span> {s.views ?? 0}</div>
            <div><span className="font-semibold">Engagement:</span> {s.engagement_rate !== undefined ? `${Math.round(s.engagement_rate * 100) / 100}%` : 'N/A'}</div>
            <div><span className="font-semibold">Earnings:</span> <span className="text-purple-700">${s.earnings?.toFixed(2) ?? '0.00'}</span></div>
          </div>
        </div>
      ))}
    </div>
  );
} 