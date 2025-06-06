"use client";

import { MagnifyingGlassIcon, PlusIcon, MegaphoneIcon } from '@heroicons/react/24/outline';
import CampaignDiscovery from "../CampaignDiscovery";

export default function CampaignsPage() {
  return (
    <main className="min-h-screen flex flex-col items-center bg-gray">
      <div className="w-full max-w-5xl mx-auto p-4 md:p-8 pt-12 pb-16">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-black mb-1">Campaigns</h1>
            <p className="text-gray-600 text-sm">Discover restaurant campaigns and apply to promote them.</p>
          </div>
        </div>
        <CampaignDiscovery />
      </div>
    </main>
  );
} 