"use client";

import { useState } from "react";
import { db, auth } from "@/lib/firebase/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export default function CampaignForm({ onCreated }: { onCreated?: () => void }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [rewardRate, setRewardRate] = useState("");
  const [active, setActive] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("You must be logged in to create a campaign.");
      await addDoc(collection(db, "campaigns"), {
        restaurant_id: user.uid,
        title,
        description,
        reward_rate: Number(rewardRate),
        active_status: active,
        created_at: serverTimestamp(),
      });
      setTitle("");
      setDescription("");
      setRewardRate("");
      setActive(true);
      setSuccess("Campaign created!");
      if (onCreated) onCreated();
    } catch (err: any) {
      setError(err.message || "Failed to create campaign");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 bg-white p-6 rounded shadow">
      <h2 className="text-xl font-bold mb-2 text-indigo-700">Create New Campaign</h2>
      <input
        type="text"
        placeholder="Title"
        className="border rounded px-3 py-2"
        value={title}
        onChange={e => setTitle(e.target.value)}
        required
      />
      <textarea
        placeholder="Description"
        className="border rounded px-3 py-2"
        value={description}
        onChange={e => setDescription(e.target.value)}
        required
      />
      <input
        type="number"
        placeholder="Reward Rate (per 1k views)"
        className="border rounded px-3 py-2"
        value={rewardRate}
        onChange={e => setRewardRate(e.target.value)}
        required
        min={0}
      />
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={active}
          onChange={e => setActive(e.target.checked)}
        />
        Active
      </label>
      <button type="submit" className="bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700" disabled={loading}>
        {loading ? "Creating..." : "Create Campaign"}
      </button>
      {error && <p className="text-red-500 text-center">{error}</p>}
      {success && <p className="text-green-600 text-center">{success}</p>}
    </form>
  );
} 