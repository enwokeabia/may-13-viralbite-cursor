"use client";

import { useEffect, useState } from "react";
import { getCampaigns, Campaign } from "@/lib/firebase/firebaseUtils";
import { addSubmission } from "@/lib/firebase/firebaseUtils";
import { auth } from "@/lib/firebase/firebase";

export default function CampaignDiscovery() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [submissionUrl, setSubmissionUrl] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");

  useEffect(() => {
    const fetchCampaigns = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await getCampaigns();
        setCampaigns(data.filter((c) => c.active_status));
      } catch (err: any) {
        setError(err.message || "Failed to fetch campaigns");
      } finally {
        setLoading(false);
      }
    };
    fetchCampaigns();
  }, []);

  const openModal = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setSubmissionUrl("");
    setSubmitError("");
    setSubmitSuccess("");
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedCampaign(null);
    setSubmissionUrl("");
    setSubmitError("");
    setSubmitSuccess("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError("");
    setSubmitSuccess("");
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("You must be logged in to apply.");
      if (!selectedCampaign) throw new Error("No campaign selected.");
      if (!submissionUrl) throw new Error("Please enter your content link.");
      await addSubmission({
        influencerId: user.uid,
        campaignId: selectedCampaign.id!,
        restaurantId: selectedCampaign.restaurant_id || "",
        contentUrl: submissionUrl,
      });
      setSubmitSuccess("Application submitted!");
      setTimeout(() => {
        closeModal();
      }, 1200);
    } catch (err: any) {
      setSubmitError(err.message || "Failed to submit application");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="text-center text-gray-500 py-4">Loading campaigns...</div>;
  if (error) return <div className="text-center text-red-500 py-4">{error}</div>;
  if (campaigns.length === 0) return <div className="text-center text-gray-400 py-4">No active campaigns found.</div>;

  return (
    <>
      <div className="mt-8 w-full max-w-2xl mx-auto grid gap-4">
        {campaigns.map((c) => (
          <div key={c.id} className="border rounded p-4 bg-white shadow flex flex-col gap-2">
            <h3 className="text-lg font-semibold text-purple-700">{c.title}</h3>
            <p className="text-gray-600">{c.description}</p>
            <div className="text-sm text-purple-500">Reward Rate: <span className="font-semibold">${c.reward_rate} / 1k views</span></div>
            <button
              className="mt-2 bg-purple-600 text-white py-1 px-4 rounded hover:bg-purple-700"
              onClick={() => openModal(c)}
            >
              Apply
            </button>
          </div>
        ))}
      </div>
      {modalOpen && selectedCampaign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md relative">
            <button
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-2xl"
              onClick={closeModal}
              aria-label="Close"
            >
              &times;
            </button>
            <h2 className="text-2xl font-bold mb-2 text-purple-700">Apply to {selectedCampaign.title}</h2>
            <p className="mb-2 text-gray-600">{selectedCampaign.description}</p>
            <div className="mb-4 text-purple-500">Reward Rate: <span className="font-semibold">${selectedCampaign.reward_rate} / 1k views</span></div>
            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
              <input
                type="url"
                placeholder="Paste your content link (Instagram/TikTok)"
                className="border rounded px-3 py-2"
                value={submissionUrl}
                onChange={e => setSubmissionUrl(e.target.value)}
                required
              />
              <button
                type="submit"
                className="bg-purple-600 text-white py-2 rounded hover:bg-purple-700"
                disabled={submitting}
              >
                {submitting ? "Submitting..." : "Submit Application"}
              </button>
              {submitError && <div className="text-red-500 text-sm text-center">{submitError}</div>}
              {submitSuccess && <div className="text-purple-600 text-sm text-center">{submitSuccess}</div>}
            </form>
          </div>
        </div>
      )}
    </>
  );
} 