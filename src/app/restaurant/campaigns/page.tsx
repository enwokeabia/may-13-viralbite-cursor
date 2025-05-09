"use client";

import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase/firebase";
import { getCampaignsByRestaurant, updateCampaign, deleteCampaign, Campaign } from "@/lib/firebase/firebaseUtils";
import { MagnifyingGlassIcon, PlusIcon, MegaphoneIcon } from '@heroicons/react/24/outline';

export default function RestaurantCampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

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

  const handleToggleActive = async (id: string, current: boolean) => {
    setUpdating(id);
    try {
      await updateCampaign(id, { active_status: !current });
      setCampaigns((prev) => prev.map((c) => c.id === id ? { ...c, active_status: !current } : c));
    } catch (err) {
      alert("Failed to update campaign");
    } finally {
      setUpdating(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this campaign?")) return;
    setDeleting(id);
    try {
      await deleteCampaign(id);
      setCampaigns((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      alert("Failed to delete campaign");
    } finally {
      setDeleting(null);
    }
  };

  if (loading) return <div className="text-center text-gray-500 py-4">Loading campaigns...</div>;
  if (error) return <div className="text-center text-red-500 py-4">{error}</div>;
  return (
    <main className="min-h-screen flex flex-col items-center bg-white">
      <div className="w-full max-w-5xl mx-auto p-4 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-purple-700 mb-1">Campaigns</h1>
            <p className="text-gray-600 text-sm">Create and manage your promotional campaigns</p>
          </div>
          <button className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded shadow hover:bg-purple-700 text-sm self-start md:self-auto">
            <PlusIcon className="h-5 w-5" />
            Create Campaign
          </button>
        </div>
        <div className="flex flex-col md:flex-row gap-2 mb-6">
          <div className="flex-1 flex items-center bg-white border rounded px-3 py-2 shadow-sm">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 mr-2" />
            <input type="text" placeholder="Search campaigns..." className="flex-1 outline-none bg-transparent text-sm" />
          </div>
          <select className="border rounded px-3 py-2 text-sm bg-white shadow-sm">
            <option>All Status</option>
            <option>Active</option>
            <option>Inactive</option>
          </select>
          <select className="border rounded px-3 py-2 text-sm bg-white shadow-sm">
            <option>Newest</option>
            <option>Oldest</option>
          </select>
        </div>
        {campaigns.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 bg-white rounded shadow">
            <MegaphoneIcon className="h-12 w-12 text-gray-300 mb-4" />
            <div className="text-lg font-semibold text-gray-700 mb-1">No campaigns found</div>
            <div className="text-gray-500 mb-4 text-sm">Create your first campaign to get started</div>
            <button className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded shadow hover:bg-purple-700 text-sm">
              <PlusIcon className="h-5 w-5" />
              Create Campaign
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {campaigns.map((c) => (
              <div key={c.id} className="border rounded bg-white shadow p-4 flex flex-col gap-2">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold text-purple-700">{c.title}</h3>
                  <span className={`text-xs px-2 py-1 rounded ${c.active_status ? 'bg-purple-100 text-purple-700' : 'bg-gray-200 text-gray-500'}`}>{c.active_status ? 'Active' : 'Inactive'}</span>
                </div>
                <p className="text-gray-600 text-sm mb-2">{c.description}</p>
                <div className="text-xs text-purple-500 mb-2">Reward Rate: <span className="font-semibold">${c.reward_rate} / 1k views</span></div>
                <div className="flex gap-2 mt-auto">
                  <button
                    className="bg-purple-600 text-white px-3 py-1 rounded hover:bg-purple-700 text-xs"
                    onClick={() => handleToggleActive(c.id!, c.active_status)}
                    disabled={updating === c.id}
                  >
                    {updating === c.id ? 'Updating...' : c.active_status ? 'Deactivate' : 'Activate'}
                  </button>
                  <button
                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 text-xs"
                    onClick={() => handleDelete(c.id!)}
                    disabled={deleting === c.id}
                  >
                    {deleting === c.id ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
} 