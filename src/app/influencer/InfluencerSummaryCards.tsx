"use client";

import { useEffect, useState } from "react";
import { useSubmissions } from "@/lib/hooks/useSubmissions";
import { auth } from "@/lib/firebase/firebase";
import { where } from "firebase/firestore";

export default function InfluencerSummaryCards() {
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const unsub = auth.onAuthStateChanged((user) => {
      setUserId(user ? user.uid : null);
      setIsLoading(false);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    console.log("Current userId:", userId);
  }, [userId]);

  // Don't try to fetch data if we're not ready with authentication
  const { submissions, loading, error } = useSubmissions(
    !isLoading && userId ? [where("influencerId", "==", userId)] : []
  );

  if (isLoading) return <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6"><div className="bg-gray-100 rounded p-6 h-24 animate-pulse" /><div className="bg-gray-100 rounded p-6 h-24 animate-pulse" /><div className="bg-gray-100 rounded p-6 h-24 animate-pulse" /></div>;
  if (!userId) return <div className="text-center text-red-500 py-4">Please log in to view your dashboard.</div>;

  const activeCount = submissions.filter(s => s.status === 'approved' || s.status === 'submitted' || s.status === 'joined' || s.status === 'pending').length;
  const totalViews = submissions.reduce((sum, s) => sum + (s.views ?? 0), 0);
  const totalEarnings = submissions.reduce((sum, s) => sum + (s.earnings ?? 0), 0);

  if (loading) return <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6"><div className="bg-gray-100 rounded p-6 h-24 animate-pulse" /><div className="bg-gray-100 rounded p-6 h-24 animate-pulse" /><div className="bg-gray-100 rounded p-6 h-24 animate-pulse" /></div>;
  if (error) return <div className="text-center text-red-500 py-4">{error}</div>;

  return (
    <>
      {/* Existing loading, error, and summary cards UI */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6"><div className="bg-gray-100 rounded p-6 h-24 animate-pulse" /><div className="bg-gray-100 rounded p-6 h-24 animate-pulse" /><div className="bg-gray-100 rounded p-6 h-24 animate-pulse" /></div>
      ) : !userId ? (
        <div className="text-center text-red-500 py-4">Please log in to view your dashboard.</div>
      ) : error ? (
        <div className="text-center text-red-500 py-4">{error}</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
          <div className="bg-white rounded shadow p-6 flex flex-col items-center h-28 justify-center">
            <div className="text-2xl font-bold text-purple-700">{activeCount}</div>
            <div className="text-xs text-gray-500 mt-1">Active Submissions</div>
          </div>
          <div className="bg-white rounded shadow p-6 flex flex-col items-center h-28 justify-center">
            <div className="text-2xl font-bold text-purple-700">{totalViews}</div>
            <div className="text-xs text-gray-500 mt-1">Total Views</div>
          </div>
          <div className="bg-white rounded shadow p-6 flex flex-col items-center h-28 justify-center">
            <div className="text-2xl font-bold text-purple-700">${totalEarnings.toFixed(2)}</div>
            <div className="text-xs text-gray-500 mt-1">Total Earnings</div>
          </div>
        </div>
      )}
    </>
  );
} 