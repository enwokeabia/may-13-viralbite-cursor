"use client";

import { useEffect, useState } from "react";
import { getDocuments, Campaign, updateSubmission } from "@/lib/firebase/firebaseUtils";
import { useSubmissions } from "@/lib/hooks/useSubmissions";

export default function AdminDashboard() {
  const [users, setUsers] = useState<any[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [editRows, setEditRows] = useState<Record<string, any>>({});

  useEffect(() => {
    getDocuments("users").then(setUsers);
    getDocuments("campaigns").then((data) => setCampaigns(data as Campaign[]));
  }, []);

  const { submissions, loading, error } = useSubmissions();

  // Lookup maps
  const campaignMap = Object.fromEntries(campaigns.map(c => [c.id, c]));
  const userMap = Object.fromEntries(users.map(u => [u.id, u]));

  // Handle edit state
  const handleEdit = (id: string, field: string, value: any) => {
    setEditRows(prev => ({
      ...prev,
      [id]: { ...prev[id], [field]: value }
    }));
  };

  // Save changes
  const handleSave = async (sub: any) => {
    const edit = editRows[sub.id] || {};
    const campaign = campaignMap[sub.campaignId];
    const views = Number(edit.views ?? sub.views ?? 0);
    const likes = Number(edit.likes ?? sub.likes ?? 0);
    const status = edit.status ?? sub.status;
    const rewardRate = campaign?.reward_rate ?? 0;
    const earnings = Math.round((views * rewardRate) / 1000);
    await updateSubmission(sub.id, { status, views, likes, earnings });
    setEditRows(prev => ({ ...prev, [sub.id]: undefined }));
  };

  return (
    <>
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl">
        {/* Users Table */}
        <div className="bg-gray-50 rounded shadow p-4">
          <h2 className="text-xl font-semibold mb-2">Users</h2>
          <ul className="text-sm divide-y">
            {users.map((u) => (
              <li key={u.id} className="py-2 flex flex-col">
                <span className="font-medium">{u.email}</span>
                <span className="text-gray-500">Role: {u.role}</span>
              </li>
            ))}
          </ul>
        </div>
        {/* Campaigns Table */}
        <div className="bg-gray-50 rounded shadow p-4">
          <h2 className="text-xl font-semibold mb-2">Campaigns</h2>
          <ul className="text-sm divide-y">
            {campaigns.map((c) => (
              <li key={c.id} className="py-2 flex flex-col">
                <span className="font-medium">{c.title}</span>
                <span className="text-gray-500">Restaurant: {c.restaurant_id}</span>
              </li>
            ))}
          </ul>
        </div>
        {/* Submissions Table */}
        <div className="bg-gray-50 rounded shadow p-4 overflow-x-auto">
          <h2 className="text-xl font-semibold mb-2">Submissions</h2>
          {loading && <div className="text-gray-500">Loading...</div>}
          {error && <div className="text-red-500">{error}</div>}
          <table className="min-w-full text-sm">
            <thead>
              <tr className="text-left">
                <th className="py-1 pr-4">Campaign</th>
                <th className="py-1 pr-4">Influencer</th>
                <th className="py-1 pr-4">Status</th>
                <th className="py-1 pr-4">Views</th>
                <th className="py-1 pr-4">Likes</th>
                <th className="py-1 pr-4">Earnings</th>
                <th className="py-1 pr-4">Content</th>
                <th className="py-1 pr-4">Action</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((sub) => {
                const edit = editRows[sub.id] || {};
                const campaign = campaignMap[sub.campaignId];
                const influencer = userMap[sub.influencerId];
                const views = Number(edit.views ?? sub.views ?? 0);
                const likes = Number(edit.likes ?? sub.likes ?? 0);
                const status = edit.status ?? sub.status;
                const rewardRate = campaign?.reward_rate ?? 0;
                const earnings = Math.round((views * rewardRate) / 1000);
                return (
                  <tr key={sub.id} className="border-t">
                    <td className="py-1 pr-4 font-medium">{campaign?.title || sub.campaignId}</td>
                    <td className="py-1 pr-4">{influencer?.email || sub.influencerId}</td>
                    <td className="py-1 pr-4">
                      <select
                        className="border rounded px-2 py-1"
                        value={status}
                        onChange={e => handleEdit(sub.id, "status", e.target.value)}
                      >
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </td>
                    <td className="py-1 pr-4">
                      <input
                        type="number"
                        className="border rounded px-2 py-1 w-20"
                        value={views}
                        min={0}
                        onChange={e => handleEdit(sub.id, "views", e.target.value)}
                      />
                    </td>
                    <td className="py-1 pr-4">
                      <input
                        type="number"
                        className="border rounded px-2 py-1 w-20"
                        value={likes}
                        min={0}
                        onChange={e => handleEdit(sub.id, "likes", e.target.value)}
                      />
                    </td>
                    <td className="py-1 pr-4">${earnings}</td>
                    <td className="py-1 pr-4">
                      <a href={sub.contentUrl} className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">View Reel</a>
                    </td>
                    <td className="py-1 pr-4">
                      <button
                        className="bg-purple-600 text-white px-3 py-1 rounded hover:bg-purple-700"
                        onClick={() => handleSave(sub)}
                      >
                        Save
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
} 