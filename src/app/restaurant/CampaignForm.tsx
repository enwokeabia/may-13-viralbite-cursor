"use client";

import { useState } from "react";
import { db, auth } from "@/lib/firebase/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { uploadFile } from "@/lib/firebase/firebaseUtils";

export default function CampaignForm({ onCreated }: { onCreated?: () => void }) {
  const [title, setTitle] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [rewardRate, setRewardRate] = useState("");
  const [maxPayout, setMaxPayout] = useState("");
  const [totalBudget, setTotalBudget] = useState("");
  const [active, setActive] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Helper to compress images
  async function compressImage(file: File): Promise<File> {
    return new Promise((resolve) => {
      const img = document.createElement("img");
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          const maxDim = 1200;
          let width = img.width;
          let height = img.height;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = (height * maxDim) / width;
              width = maxDim;
            } else {
              width = (width * maxDim) / height;
              height = maxDim;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          ctx?.drawImage(img, 0, 0, width, height);
          canvas.toBlob((blob) => {
            if (blob) {
              resolve(new File([blob], file.name, { type: file.type }));
            } else {
              resolve(file);
            }
          }, file.type, 0.7);
        };
      };
      reader.readAsDataURL(file);
    });
  }

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      let file = e.target.files[0];
      // Only allow JPG, PNG, GIF
      if (!/\.(jpe?g|png|gif)$/i.test(file.name)) {
        setError("Only JPG, PNG, or GIF images are allowed.");
        return;
      }
      // Compress if > 1MB
      if (file.size > 1024 * 1024) {
        file = await compressImage(file);
      }
      setImage(file);
      setError("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("You must be logged in to create a campaign.");
      let uploadedImageUrl = "";
      if (image) {
        const path = `campaign-images/${user.uid}-${Date.now()}-${image.name}`;
        uploadedImageUrl = await uploadFile(image, path);
      }
      await addDoc(collection(db, "campaigns"), {
        restaurant_id: user.uid,
        title,
        image_url: uploadedImageUrl,
        description,
        address,
        reward_rate: Number(rewardRate),
        max_payout: Number(maxPayout),
        total_budget: totalBudget ? Number(totalBudget) : null,
        active_status: active,
        created_at: serverTimestamp(),
      });
      setTitle("");
      setImage(null);
      setImageUrl("");
      setDescription("");
      setAddress("");
      setRewardRate("");
      setMaxPayout("");
      setTotalBudget("");
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
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 bg-white p-6 rounded shadow max-h-[80vh] overflow-y-auto">
      <h2 className="text-xl font-bold mb-2 text-purple-700">Create New Campaign</h2>
      <label className="text-sm font-medium text-purple-700">Campaign Name</label>
      <input
        type="text"
        placeholder="Campaign Name"
        className="border rounded px-3 py-2"
        value={title}
        onChange={e => setTitle(e.target.value)}
        required
      />
      <label className="text-sm font-medium text-purple-700">Campaign Image</label>
      <input
        type="file"
        accept="image/jpeg,image/png,image/gif"
        className="border rounded px-3 py-2"
        onChange={handleImageChange}
      />
      {image && (
        <img src={URL.createObjectURL(image)} alt="Preview" className="w-full max-h-40 object-contain rounded border" />
      )}
      <label className="text-sm font-medium text-purple-700">Description of Campaign</label>
      <textarea
        placeholder="Describe your campaign..."
        className="border rounded px-3 py-2"
        value={description}
        onChange={e => setDescription(e.target.value)}
        required
      />
      <label className="text-sm font-medium text-purple-700">Address</label>
      <input
        type="text"
        placeholder="Restaurant Address"
        className="border rounded px-3 py-2"
        value={address}
        onChange={e => setAddress(e.target.value)}
        required
      />
      <label className="text-sm font-medium text-purple-700">Reward Amount per 1k views ($)</label>
      <input
        type="number"
        placeholder="e.g. 5"
        className="border rounded px-3 py-2"
        value={rewardRate}
        onChange={e => setRewardRate(e.target.value)}
        required
        min={0}
      />
      <label className="text-sm font-medium text-purple-700">Max Payout Per Influencer ($)</label>
      <input
        type="number"
        placeholder="e.g. 100"
        className="border rounded px-3 py-2"
        value={maxPayout}
        onChange={e => setMaxPayout(e.target.value)}
        required
        min={0}
      />
      <label className="text-sm font-medium text-purple-700">Total Budget ($) <span className="text-gray-400">(Optional)</span></label>
      <input
        type="number"
        placeholder="e.g. 1000"
        className="border rounded px-3 py-2"
        value={totalBudget}
        onChange={e => setTotalBudget(e.target.value)}
        min={0}
      />
      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={active}
          onChange={e => setActive(e.target.checked)}
        />
        <span className="text-purple-700">Active</span>
      </label>
      <button type="submit" className="bg-purple-600 text-white py-2 rounded hover:bg-purple-700" disabled={loading}>
        {loading ? "Creating..." : "Create Campaign"}
      </button>
      {error && <p className="text-red-500 text-center">{error}</p>}
      {success && <p className="text-green-600 text-center">{success}</p>}
    </form>
  );
} 