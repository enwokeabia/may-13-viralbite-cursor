"use client";

import { useEffect, useState } from "react";
import { getSubmissions, updateSubmission, deleteSubmission, getCampaigns, Submission, Campaign, getMetricsBySubmission, updateMetrics, getDocuments } from "@/lib/firebase/firebaseUtils";

export default function SubmissionManagement() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [campaignMap, setCampaignMap] = useState<{ [id: string]: string }>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [metricsModal, setMetricsModal] = useState<{ id: string; views: number; likes: number; campaignId: string; rewardRate: number } | null>(null);
  const [metricsLoading, setMetricsLoading] = useState(false);
  const [metricsError, setMetricsError] = useState("");
  const [userMap, setUserMap] = useState<{ [id: string]: string }>({});
  const [metricsMap, setMetricsMap] = useState<{ [id: string]: { views: number; likes: number; earnings: number } }>({});

  const fetchAllData = async () => {
    setLoading(true);
    setError("");
    try {
      const [subs, campaignsData, users] = await Promise.all([
        getSubmissions(),
        getCampaigns(),
        getDocuments('users'),
      ]);
      setSubmissions(subs);
      setCampaigns(campaignsData);
      const cmap: { [id: string]: string } = {};
      campaignsData.forEach((c: Campaign) => {
        cmap[c.id!] = c.title;
      });
      setCampaignMap(cmap);
      const umap: { [id: string]: string } = {};
      users.forEach((u: any) => {
        umap[u.id] = u.username || u.email || u.id;
      });
      setUserMap(umap);
      // Fetch metrics for all submissions
      const metricsObj: { [id: string]: { views: number; likes: number; earnings: number } } = {};
      for (const s of subs) {
        const metrics = await getMetricsBySubmission(s.id!);
        const campaign = campaignsData.find((c: Campaign) => c.id === s.campaign_id);
        const rewardRate = campaign?.reward_rate ?? 0;
        const views = metrics?.views ?? s.views ?? 0;
        const likes = metrics?.likes ?? 0;
        const earnings = Math.round((views * rewardRate) / 1000 * 100) / 100;
        metricsObj[s.id!] = { views, likes, earnings };
      }
      setMetricsMap(metricsObj);
    } catch (err: any) {
      setError(err.message || "Failed to fetch submissions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const handleStatusChange = async (id: string, newStatus: string) => {
    setUpdating(id);
    try {
      await updateSubmission(id, { status: newStatus });
      await fetchAllData();
    } catch (err) {
      alert("Failed to update submission");
    } finally {
      setUpdating(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this submission?")) return;
    setDeleting(id);
    try {
      await deleteSubmission(id);
      await fetchAllData();
    } catch (err) {
      alert("Failed to delete submission");
    } finally {
      setDeleting(null);
    }
  };

  const handleOpenMetrics = async (submissionId: string, campaignId: string) => {
    setMetricsError("");
    setMetricsLoading(true);
    try {
      const metrics = await getMetricsBySubmission(submissionId);
      const campaign = campaigns.find((c: Campaign) => c.id === campaignId);
      setMetricsModal({
        id: submissionId,
        views: metrics?.views ?? 0,
        likes: metrics?.likes ?? 0,
        campaignId,
        rewardRate: campaign?.reward_rate ?? 0,
      });
    } catch (err: any) {
      setMetricsError(err.message || "Failed to load metrics");
    } finally {
      setMetricsLoading(false);
    }
  };

  const handleSaveMetrics = async () => {
    if (!metricsModal) return;
    setMetricsLoading(true);
    setMetricsError("");
    try {
      await updateMetrics(metricsModal.id, {
        views: metricsModal.views,
        likes: metricsModal.likes,
      });
      await fetchAllData();
      setMetricsModal(null);
    } catch (err: any) {
      setMetricsError(err.message || "Failed to update metrics");
    } finally {
      setMetricsLoading(false);
    }
  };

  if (loading) return <div className="text-center text-gray-500 py-4">Loading submissions...</div>;
  if (error) return <div className="text-center text-red-500 py-4">{error}</div>;
  if (submissions.length === 0) return <div className="text-center text-gray-400 py-4">No submissions found.</div>;

  return (
    <div className="overflow-x-auto mt-8">
      <h2 className="text-2xl font-bold mb-4 text-gray-800">Submission Management</h2>
      <table className="min-w-full bg-white border rounded shadow">
        <thead>
          <tr>
            <th className="px-4 py-2 border-b">Campaign</th>
            <th className="px-4 py-2 border-b">Influencer</th>
            <th className="px-4 py-2 border-b">Content Link</th>
            <th className="px-4 py-2 border-b">Status</th>
            <th className="px-4 py-2 border-b">Views</th>
            <th className="px-4 py-2 border-b">Likes</th>
            <th className="px-4 py-2 border-b">Earnings</th>
            <th className="px-4 py-2 border-b">Actions</th>
          </tr>
        </thead>
        <tbody>
          {submissions.map((s) => (
            <tr key={s.id} className="text-center">
              <td className="px-4 py-2 border-b">{campaignMap[s.campaign_id] || "Campaign"}</td>
              <td className="px-4 py-2 border-b">{userMap[s.influencer_id] || s.influencer_id}</td>
              <td className="px-4 py-2 border-b">
                <a href={s.video_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline break-all">{s.video_url}</a>
              </td>
              <td className="px-4 py-2 border-b">
                <span className={`text-xs px-2 py-1 rounded ${s.status === 'approved' ? 'bg-green-100 text-green-700' : s.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>{s.status.charAt(0).toUpperCase() + s.status.slice(1)}</span>
              </td>
              <td className="px-4 py-2 border-b">{metricsMap[s.id!]?.views ?? 0}</td>
              <td className="px-4 py-2 border-b">{metricsMap[s.id!]?.likes ?? 0}</td>
              <td className="px-4 py-2 border-b">${metricsMap[s.id!]?.earnings?.toFixed(2) ?? '0.00'}</td>
              <td className="px-4 py-2 border-b flex gap-2 justify-center">
                <button
                  className="bg-green-500 text-white px-3 py-1 rounded hover:bg-green-600"
                  onClick={() => handleStatusChange(s.id!, 'approved')}
                  disabled={updating === s.id}
                >
                  {updating === s.id ? 'Updating...' : 'Approve'}
                </button>
                <button
                  className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                  onClick={() => handleStatusChange(s.id!, 'rejected')}
                  disabled={updating === s.id}
                >
                  {updating === s.id ? 'Updating...' : 'Reject'}
                </button>
                <button
                  className="bg-gray-400 text-white px-3 py-1 rounded hover:bg-gray-500"
                  onClick={() => handleDelete(s.id!)}
                  disabled={deleting === s.id}
                >
                  {deleting === s.id ? 'Deleting...' : 'Delete'}
                </button>
                <button
                  className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                  onClick={() => handleOpenMetrics(s.id!, s.campaign_id)}
                >
                  Edit Metrics
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {metricsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl"
              onClick={() => setMetricsModal(null)}
              aria-label="Close"
            >
              &times;
            </button>
            <h3 className="text-xl font-bold mb-4 text-blue-700">Edit Metrics</h3>
            <div className="flex flex-col gap-3">
              <label className="flex flex-col">
                <span className="text-sm text-gray-600 mb-1">Views</span>
                <input
                  type="number"
                  className="border rounded px-3 py-2"
                  value={metricsModal.views}
                  min={0}
                  onChange={e => setMetricsModal({ ...metricsModal, views: Number(e.target.value) })}
                />
              </label>
              <label className="flex flex-col">
                <span className="text-sm text-gray-600 mb-1">Likes</span>
                <input
                  type="number"
                  className="border rounded px-3 py-2"
                  value={metricsModal.likes}
                  min={0}
                  onChange={e => setMetricsModal({ ...metricsModal, likes: Number(e.target.value) })}
                />
              </label>
              <div className="flex flex-col">
                <span className="text-sm text-gray-600 mb-1">Earnings (auto-calculated)</span>
                <div className="border rounded px-3 py-2 bg-gray-100">${((metricsModal.views * metricsModal.rewardRate) / 1000).toFixed(2)}</div>
              </div>
              <button
                className="mt-4 bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                onClick={handleSaveMetrics}
                disabled={metricsLoading}
              >
                {metricsLoading ? "Saving..." : "Save"}
              </button>
              {metricsError && <div className="text-red-500 text-sm text-center mt-2">{metricsError}</div>}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 