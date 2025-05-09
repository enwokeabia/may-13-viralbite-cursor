"use client";

import { MagnifyingGlassIcon, PlusIcon, MegaphoneIcon } from '@heroicons/react/24/outline';

export default function CampaignsPage() {
  return (
    <main className="min-h-screen flex flex-col items-center bg-white">
      <div className="w-full max-w-5xl mx-auto p-4 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-purple-700 mb-1">Campaigns</h1>
            <p className="text-gray-600 text-sm">Discover restaurant campaigns and apply to promote them.</p>
          </div>
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
        <div className="flex flex-col items-center justify-center py-16 bg-white rounded shadow">
          <MegaphoneIcon className="h-12 w-12 text-gray-300 mb-4" />
          <div className="text-lg font-semibold text-gray-700 mb-1">No campaigns found</div>
          <div className="text-gray-500 mb-4 text-sm">Campaign cards and application actions will appear here.</div>
        </div>
      </div>
    </main>
  );
} 