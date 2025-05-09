"use client";

import { useEffect, useState } from "react";
import { getCampaigns, updateCampaign, deleteCampaign, Campaign } from "@/lib/firebase/firebaseUtils";

export default function CampaignManagement() {
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
        const data = await getCampaigns();
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
  if (campaigns.length === 0) return <div className="text-center text-gray-400 py-4">No campaigns found.</div>;

  return (
    <div className="overflow-x-auto mt-8">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Campaign Management</h2>
      <table className="min-w-full bg-white border rounded shadow">
        <thead>
          <tr>
            <th className="px-4 py-2 border-b">Title</th>
            <th className="px-4 py-2 border-b">Restaurant</th>
            <th className="px-4 py-2 border-b">Status</th>
            <th className="px-4 py-2 border-b">Actions</th>
          </tr>
        </thead>
        <tbody>
          {campaigns.map((c) => (
            <tr key={c.id} className="text-center">
              <td className="px-4 py-2 border-b">{c.title}</td>
              <td className="px-4 py-2 border-b">{c.restaurant_id}</td>
              <td className="px-4 py-2 border-b">
                <span className={`text-xs px-2 py-1 rounded ${c.active_status ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'}`}>{c.active_status ? 'Active' : 'Inactive'}</span>
              </td>
              <td className="px-4 py-2 border-b flex gap-2 justify-center">
                <button
                  className="bg-indigo-500 text-white px-3 py-1 rounded hover:bg-indigo-600"
                  onClick={() => handleToggleActive(c.id!, c.active_status)}
                  disabled={updating === c.id}
                >
                  {updating === c.id ? 'Updating...' : c.active_status ? 'Deactivate' : 'Activate'}
                </button>
                <button
                  className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                  onClick={() => handleDelete(c.id!)}
                  disabled={deleting === c.id}
                >
                  {deleting === c.id ? 'Deleting...' : 'Delete'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 