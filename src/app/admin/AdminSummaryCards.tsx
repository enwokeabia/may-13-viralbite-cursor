"use client";

import { useEffect, useState } from "react";
import { getDocuments, getCampaigns, getSubmissions, Campaign, Submission } from "@/lib/firebase/firebaseUtils";

export default function AdminSummaryCards() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [userCount, setUserCount] = useState(0);
  const [campaignCount, setCampaignCount] = useState(0);
  const [submissionCount, setSubmissionCount] = useState(0);
  const [totalViews, setTotalViews] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError("");
      try {
        const [users, campaigns, submissions] = await Promise.all([
          getDocuments('users'),
          getCampaigns(),
          getSubmissions(),
        ]);
        setUserCount(users.length);
        setCampaignCount(campaigns.length);
        setSubmissionCount(submissions.length);
        // Aggregate views
        let views = 0;
        for (const s of submissions) {
          views += s.views ?? 0;
        }
        setTotalViews(views);
      } catch (err: any) {
        setError(err.message || "Failed to fetch stats");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <div className="flex gap-4 my-6"><div className="bg-gray-100 rounded p-6 w-48 h-24 animate-pulse" /><div className="bg-gray-100 rounded p-6 w-48 h-24 animate-pulse" /><div className="bg-gray-100 rounded p-6 w-48 h-24 animate-pulse" /><div className="bg-gray-100 rounded p-6 w-48 h-24 animate-pulse" /></div>;
  if (error) return <div className="text-center text-red-500 py-4">{error}</div>;

  return (
    <div className="flex flex-wrap gap-4 my-6">
      <div className="bg-white rounded shadow p-6 w-48 flex flex-col items-center">
        <div className="text-2xl font-bold text-gray-800">{userCount}</div>
        <div className="text-xs text-gray-500 mt-1">Total Users</div>
      </div>
      <div className="bg-white rounded shadow p-6 w-48 flex flex-col items-center">
        <div className="text-2xl font-bold text-gray-800">{campaignCount}</div>
        <div className="text-xs text-gray-500 mt-1">Total Campaigns</div>
      </div>
      <div className="bg-white rounded shadow p-6 w-48 flex flex-col items-center">
        <div className="text-2xl font-bold text-gray-800">{submissionCount}</div>
        <div className="text-xs text-gray-500 mt-1">Total Submissions</div>
      </div>
      <div className="bg-white rounded shadow p-6 w-48 flex flex-col items-center">
        <div className="text-2xl font-bold text-gray-800">{totalViews}</div>
        <div className="text-xs text-gray-500 mt-1">Total Views</div>
      </div>
    </div>
  );
} 