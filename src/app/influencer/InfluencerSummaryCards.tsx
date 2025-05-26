"use client";

import { useEffect, useState } from "react";
import { useSubmissions } from "@/lib/hooks/useSubmissions";
import { auth } from "@/lib/firebase/firebase";
import { where } from "firebase/firestore";

interface Props {
  compact?: boolean;
}

export default function InfluencerSummaryCards({ compact = false }: Props) {
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

  const gridClass = compact
    ? "grid grid-cols-3 gap-3 my-4"
    : "grid grid-cols-1 md:grid-cols-3 gap-4 my-6";
  const cardClass = compact
    ? "bg-white rounded-lg shadow px-8 py-4 flex flex-col items-center h-24 justify-center"
    : "bg-white rounded shadow p-6 flex flex-col items-center h-28 justify-center";
  const numberClass = compact
    ? "text-l font-bold text-purple-700"
    : "text-2xl font-bold text-purple-700";
  const labelClass = compact
    ? "text-xs text-gray-500 mt-1 text-center leading-tight"
    : "text-xs text-gray-500 mt-1";

  if (isLoading) return <div className={gridClass}><div className={cardClass + " bg-gray-100 animate-pulse"} /><div className={cardClass + " bg-gray-100 animate-pulse"} /><div className={cardClass + " bg-gray-100 animate-pulse"} /></div>;
  if (!userId) return <div className="text-center text-red-500 py-4">Please log in to view your dashboard.</div>;

  const activeCount = submissions.filter(s => s.status === 'approved' || s.status === 'submitted' || s.status === 'joined' || s.status === 'pending').length;
  const totalViews = submissions.reduce((sum, s) => sum + (s.views ?? 0), 0);
  const totalEarnings = submissions.reduce((sum, s) => sum + (s.earnings ?? 0), 0);

  if (loading) return <div className={gridClass}><div className={cardClass + " bg-gray-100 animate-pulse"} /><div className={cardClass + " bg-gray-100 animate-pulse"} /><div className={cardClass + " bg-gray-100 animate-pulse"} /></div>;
  if (error) return <div className="text-center text-red-500 py-4">{error}</div>;

  return (
    <div className={gridClass}>
      <div className={cardClass}>
        <div className={numberClass}>{activeCount}</div>
        <div className={labelClass}>Approved submissions</div>
      </div>
      <div className={cardClass}>
        <div className={numberClass}>{totalViews}</div>
        <div className={labelClass}>Across all approved submissions</div>
      </div>
      <div className={cardClass}>
        <div className={numberClass}>${totalEarnings.toFixed(2)}</div>
        <div className={labelClass}>Total earnings</div>
      </div>
    </div>
  );
} 