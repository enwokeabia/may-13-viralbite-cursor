"use client";

import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase/firebase";
import { getCampaignsByRestaurant, Campaign, getUserById } from "@/lib/firebase/firebaseUtils";
import { useSubmissions } from "@/lib/hooks/useSubmissions";
import { where } from "firebase/firestore";
import { updateSubmission } from "@/lib/firebase/firebaseUtils";
import { FunnelIcon, DocumentTextIcon } from '@heroicons/react/24/outline';

export default function RestaurantSubmissionsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedCampaign, setSelectedCampaign] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [updating, setUpdating] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [influencerMap, setInfluencerMap] = useState<Record<string, string>>({});

  useEffect(() => {
    const unsub = auth.onAuthStateChanged((user) => {
      setUserId(user ? user.uid : null);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!userId) return;
    getCampaignsByRestaurant(userId).then(setCampaigns);
  }, [userId]);

  // Get all campaign IDs for this restaurant
  const campaignIds = campaigns.map((c) => c.id).filter(Boolean);

  // Real-time submissions for these campaigns
  const { submissions, loading, error } = useSubmissions(
    campaignIds.length > 0 ? [where("campaignId", "in", campaignIds)] : []
  );

  const handleStatusChange = async (id: string, newStatus: string) => {
    setUpdating(id);
    try {
      await updateSubmission(id, { status: newStatus });
    } catch (err) {
      alert("Failed to update submission");
    } finally {
      setUpdating(null);
    }
  };

  const filtered = submissions.filter((s) =>
    (selectedCampaign === "all" || s.campaignId === selectedCampaign) &&
    (selectedStatus === "all" || s.status === selectedStatus)
  );

  // Fetch influencer display names for all unique influencerIds in filtered submissions
  useEffect(() => {
    const uniqueInfluencerIds = Array.from(new Set(filtered.map(s => s.influencerId)));
    const missingIds = uniqueInfluencerIds.filter(id => !influencerMap[id]);
    if (missingIds.length === 0) return;
    Promise.all(missingIds.map(id => getUserById(id))).then(users => {
      const newMap: Record<string, string> = {};
      users.forEach((u, i) => {
        if (u) newMap[missingIds[i]] = (u as any).displayName || (u as any).email || missingIds[i];
      });
      setInfluencerMap(prev => ({ ...prev, ...newMap }));
    });
  }, [filtered]);

  // Helper to get domain from URL
  function getDomain(url?: string) {
    if (!url) return '';
    try {
      return new URL(url).hostname.replace('www.', '');
    } catch {
      return url;
    }
  }

  if (loading) return <div className="text-center text-gray-500 py-4">Loading submissions...</div>;
  if (error) return <div className="text-center text-red-500 py-4">{error}</div>;
  return (
    <main className="min-h-screen flex flex-col items-center bg-white">
      <div className="w-full max-w-5xl mx-auto p-4 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-purple-700 mb-1">Submissions</h1>
            <p className="text-gray-600 text-sm">Review and manage influencer submissions</p>
          </div>
        </div>
        <div className="flex flex-col md:flex-row gap-2 mb-6">
          <div className="flex-1 flex items-center bg-white border rounded px-3 py-2 shadow-sm">
            <FunnelIcon className="h-5 w-5 text-gray-400 mr-2" />
            <select
              value={selectedCampaign}
              onChange={e => setSelectedCampaign(e.target.value)}
              className="flex-1 outline-none bg-transparent text-sm"
            >
              <option value="all">All Campaigns</option>
              {campaigns.map(c => (
                <option key={c.id} value={c.id}>{c.title}</option>
              ))}
            </select>
          </div>
          <select
            value={selectedStatus}
            onChange={e => setSelectedStatus(e.target.value)}
            className="border rounded px-3 py-2 text-sm bg-white shadow-sm"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="submitted">Submitted</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 bg-white rounded shadow">
            <DocumentTextIcon className="h-12 w-12 text-gray-300 mb-4" />
            <div className="text-lg font-semibold text-gray-700 mb-1">No submissions found</div>
            <div className="text-gray-500 mb-4 text-sm">Submissions from influencers will appear here.</div>
          </div>
        ) : (
          <div className="overflow-x-auto rounded shadow bg-white">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="px-3 py-2 text-left font-semibold text-gray-700 whitespace-nowrap">Campaign</th>
                  <th className="px-3 py-2 text-left font-semibold text-gray-700 whitespace-nowrap">Influencer</th>
                  <th className="px-3 py-2 text-left font-semibold text-gray-700 whitespace-nowrap">Content</th>
                  <th className="px-3 py-2 text-center font-semibold text-gray-700 whitespace-nowrap">Status</th>
                  <th className="px-3 py-2 text-center font-semibold text-gray-700 whitespace-nowrap">Views</th>
                  <th className="px-3 py-2 text-center font-semibold text-gray-700 whitespace-nowrap">Likes</th>
                  <th className="px-3 py-2 text-center font-semibold text-gray-700 whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s, idx) => (
                  <tr
                    key={s.id}
                    className={
                      idx % 2 === 0
                        ? "bg-white border-b border-gray-100"
                        : "bg-gray-50 border-b border-gray-100"
                    }
                    style={{ height: 56 }}
                  >
                    {/* Campaign Name (truncate, tooltip) */}
                    <td className="px-3 py-2 max-w-[160px]">
                      <span
                        className="font-medium text-purple-700 truncate block cursor-pointer"
                        title={campaigns.find(c => c.id === s.campaignId)?.title || s.campaignId}
                      >
                        {(() => {
                          const campaign = campaigns.find(c => c.id === s.campaignId);
                          if (campaign && campaign.title) {
                            return campaign.title.length > 32
                              ? campaign.title.slice(0, 32) + '…'
                              : campaign.title;
                          }
                          return s.campaignId || '—';
                        })()}
                      </span>
                    </td>
                    {/* Influencer Name (truncate, tooltip) */}
                    <td className="px-3 py-2 max-w-[160px]">
                      <span
                        className="font-medium text-blue-700 truncate block cursor-pointer"
                        title={influencerMap[s.influencerId] || s.influencerId || '—'}
                      >
                        {(influencerMap[s.influencerId] || s.influencerId || '—').slice(0, 24)}
                        {(influencerMap[s.influencerId] || s.influencerId || '').length > 24 ? '…' : ''}
                      </span>
                    </td>
                    {/* Content URL (shorten, clickable) */}
                    <td className="px-3 py-2 max-w-[120px]">
                      {s.contentUrl ? (
                        <a
                          href={s.contentUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-green-700 underline truncate block"
                          title={s.contentUrl}
                        >
                          {getDomain(s.contentUrl) ? `View Reel (${getDomain(s.contentUrl)})` : 'View Reel'}
                        </a>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                    {/* Status */}
                    <td className="px-3 py-2 text-center">
                      <span
                        className={`text-xs px-2 py-1 rounded font-semibold ${
                          s.status === "approved"
                            ? "bg-purple-100 text-purple-700"
                            : s.status === "rejected"
                            ? "bg-red-100 text-red-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {s.status ? s.status.charAt(0).toUpperCase() + s.status.slice(1) : '—'}
                      </span>
                    </td>
                    {/* Views */}
                    <td className="px-3 py-2 text-center">
                      {s.metrics?.views ?? '—'}
                    </td>
                    {/* Likes */}
                    <td className="px-3 py-2 text-center">
                      {s.metrics?.likes ?? '—'}
                    </td>
                    {/* Actions */}
                    <td className="px-3 py-2 text-center">
                      <select
                        className="border rounded px-2 py-1"
                        value={s.status}
                        onChange={e => handleStatusChange(s.id, e.target.value)}
                        disabled={updating === s.id}
                      >
                        <option value="pending">Pending</option>
                        <option value="submitted">Submitted</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
} 