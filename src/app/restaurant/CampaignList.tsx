"use client";

import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase/firebase";
import { getCampaignsByRestaurant, Campaign } from "@/lib/firebase/firebaseUtils";

export default function CampaignList() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCampaigns = async () => {
      setLoading(true);
      setError("");
      try {
        const user = auth.currentUser;
        if (!user) throw new Error("You must be logged in to view campaigns.");
        const data = await getCampaignsByRestaurant(user.uid);
        setCampaigns(data);
      } catch (err: any) {
        setError(err.message || "Failed to fetch campaigns");
      } finally {
        setLoading(false);
      }
    };
    fetchCampaigns();
  }, []);

  if (loading) return <div className="text-center text-gray-500 py-4">Loading campaigns...</div>;
  if (error) return <div className="text-center text-red-500 py-4">{error}</div>;
  if (campaigns.length === 0) return <div className="text-center text-gray-400 py-4">No campaigns found.</div>;

  return (
    <div className="mt-8 w-full max-w-2xl mx-auto grid gap-4">
      {campaigns.map((c) => (
        <div key={c.id} className="border rounded p-4 bg-white shadow flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-indigo-700">{c.title}</h3>
            <span className={`text-xs px-2 py-1 rounded ${c.active_status ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'}`}>{c.active_status ? 'Active' : 'Inactive'}</span>
          </div>
          <p className="text-gray-600">{c.description}</p>
          <div className="text-sm text-indigo-500">Reward Rate: <span className="font-semibold">${c.reward_rate} / 1k views</span></div>
        </div>
      ))}
    </div>
  );
} 