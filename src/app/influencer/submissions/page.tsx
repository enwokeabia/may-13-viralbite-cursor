"use client";

export default function SubmissionsPage() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-white">
      <div className="w-full max-w-2xl p-8 bg-gray-50 rounded shadow text-center">
        <h1 className="text-3xl font-bold text-green-700 mb-4">Your Submissions</h1>
        <p className="text-gray-600 mb-6">Track your campaign submissions, approval status, and performance. More features coming soon!</p>
        <div className="border border-dashed border-green-300 rounded p-6 text-green-400">Submission list and statuses will appear here.</div>
      </div>
    </main>
  );
} 