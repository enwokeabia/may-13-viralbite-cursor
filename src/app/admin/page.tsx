"use client";

import { useEffect, useState } from "react";
import { getDocuments, Campaign, updateSubmission } from "@/lib/firebase/firebaseUtils";
import { useSubmissions } from "@/lib/hooks/useSubmissions";

export default function AdminDashboard() {
  const [users, setUsers] = useState<any[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [editRows, setEditRows] = useState<Record<string, any>>({});
  const [saveSuccess, setSaveSuccess] = useState<Record<string, boolean>>({});

  useEffect(() => {
    getDocuments("users").then(setUsers);
    getDocuments("campaigns").then((data) => setCampaigns(data as Campaign[]));
  }, []);

  const { submissions, loading, error } = useSubmissions([], true);

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
    setSaveSuccess(prev => ({ ...prev, [sub.id]: true }));
    setTimeout(() => {
      setSaveSuccess(prev => ({ ...prev, [sub.id]: false }));
    }, 2000);
  };

  return (
    <>
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Admin Dashboard</h1>
      <div className="flex flex-col gap-8 w-full max-w-3xl mx-auto">
        {/* Users Table */}
        <div className="overflow-x-auto bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-2xl font-bold text-purple-700 mb-4">Users</h2>
          <table className="min-w-full text-sm md:text-base">
            <thead>
              <tr>
                <th className="px-3 py-2 text-left font-semibold text-gray-700">Email</th>
                <th className="px-3 py-2 text-left font-semibold text-gray-700">Username</th>
                <th className="px-3 py-2 text-left font-semibold text-gray-700">Role</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-t">
                  <td className="px-3 py-2 text-gray-900">{u.email}</td>
                  <td className="px-3 py-2 text-gray-900">{u.username || '-'}</td>
                  <td className="px-3 py-2 text-gray-900">{u.role}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Campaigns Table */}
        <div className="overflow-x-auto bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-2xl font-bold text-purple-700 mb-4">Campaigns</h2>
          <table className="min-w-full text-sm md:text-base">
            <thead>
              <tr>
                <th className="px-3 py-2 text-left font-semibold text-gray-700">Title</th>
                <th className="px-3 py-2 text-left font-semibold text-gray-700">Restaurant</th>
                <th className="px-3 py-2 text-left font-semibold text-gray-700">Reward Rate</th>
                <th className="px-3 py-2 text-left font-semibold text-gray-700">Status</th>
              </tr>
            </thead>
            <tbody>
              {campaigns.map((c) => (
                <tr key={c.id} className="border-t">
                  <td className="px-3 py-2 text-gray-900">{c.title}</td>
                  <td className="px-3 py-2 text-gray-900">{c.restaurant_id}</td>
                  <td className="px-3 py-2 text-gray-900">${c.reward_rate ?? '-'}</td>
                  <td className="px-3 py-2 text-gray-900">{c.active_status ? 'Active' : 'Inactive'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Submissions Table */}
        <div className="bg-white rounded-lg shadow p-6 overflow-x-auto">
          <h2 className="text-2xl font-bold text-purple-700 mb-4">Submissions</h2>
          {loading && <div className="text-gray-500">Loading...</div>}
          {error && <div className="text-red-500">{error}</div>}
          <table className="min-w-full text-base">
            <thead>
              <tr className="text-left">
                <th className="py-1 pr-4 font-semibold text-gray-700">Campaign</th>
                <th className="py-1 pr-4 font-semibold text-gray-700">Influencer</th>
                <th className="py-1 pr-4 font-semibold text-gray-700">Status</th>
                <th className="py-1 pr-4 font-semibold text-gray-700">Views</th>
                <th className="py-1 pr-4 font-semibold text-gray-700">Likes</th>
                <th className="py-1 pr-4 font-semibold text-gray-700">Earnings</th>
                <th className="py-1 pr-4 font-semibold text-gray-700">Content</th>
                <th className="py-1 pr-4 font-semibold text-gray-700">Action</th>
              </tr>
            </thead>
            <tbody>
              {submissions.map((sub) => {
                const edit = editRows[sub.id] || {};
                const campaign = campaignMap[sub.campaignId];
                const influencer = userMap[sub.influencerId];
                const views = Number(edit.views ?? sub.views);
                const likes = Number(edit.likes ?? sub.likes);
                const status = edit.status ?? sub.status;
                const rewardRate = campaign?.reward_rate ?? 0;
                const earnings = Math.round((views * rewardRate) / 1000);
                return (
                  <tr key={sub.id} className="border-t">
                    <td className="py-1 pr-4 font-medium text-gray-900">{campaign?.title || sub.campaignId}</td>
                    <td className="py-1 pr-4 text-gray-900">{influencer?.email || sub.influencerId}</td>
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
                    <td className="py-1 pr-4 text-gray-900">
                      <input
                        type="number"
                        className="border rounded px-2 py-1 w-20"
                        value={views}
                        min={0}
                        onChange={e => handleEdit(sub.id, "views", e.target.value)}
                      />
                    </td>
                    <td className="py-1 pr-4 text-gray-900">
                      <input
                        type="number"
                        className="border rounded px-2 py-1 w-20"
                        value={likes}
                        min={0}
                        onChange={e => handleEdit(sub.id, "likes", e.target.value)}
                      />
                    </td>
                    <td className="py-1 pr-4 text-gray-900">${sub.earnings ?? earnings}</td>
                    <td className="py-1 pr-4">
                      <a href={sub.contentUrl} className="text-purple-600 underline" target="_blank" rel="noopener noreferrer">View Reel</a>
                    </td>
                    <td className="py-1 pr-4">
                      <button
                        className="bg-purple-600 text-white px-3 py-1 rounded hover:bg-purple-700"
                        onClick={() => handleSave(sub)}
                      >
                        Save
                      </button>
                      {saveSuccess[sub.id] && (
                        <span className="ml-2 text-green-600 font-semibold text-sm">Saved!</span>
                      )}
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