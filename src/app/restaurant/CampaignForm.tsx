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
  const [uploadProgress, setUploadProgress] = useState(0);

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
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("Image must be less than 5MB. Please choose a smaller image.");
        return;
      }
      // Compress if > 1MB
      if (file.size > 1024 * 1024) {
        try {
          file = await compressImage(file);
        } catch (err) {
          setError("Failed to compress image. Please try a different image.");
          return;
        }
      }
      setImage(file);
      setError("");
    }
  };

  const validateForm = () => {
    if (!title.trim()) {
      setError("Campaign name is required");
      return false;
    }
    if (!description.trim()) {
      setError("Description is required");
      return false;
    }
    if (!address.trim()) {
      setError("Address is required");
      return false;
    }
    const rewardRateNum = Number(rewardRate);
    if (isNaN(rewardRateNum) || rewardRateNum <= 0) {
      setError("Reward rate must be greater than 0");
      return false;
    }
    const maxPayoutNum = Number(maxPayout);
    if (isNaN(maxPayoutNum) || maxPayoutNum <= 0) {
      setError("Max payout must be greater than 0");
      return false;
    }
    if (maxPayoutNum < rewardRateNum) {
      setError("Max payout must be greater than reward rate");
      return false;
    }
    if (totalBudget) {
      const totalBudgetNum = Number(totalBudget);
      if (isNaN(totalBudgetNum) || totalBudgetNum <= 0) {
        setError("Total budget must be greater than 0");
        return false;
      }
      if (totalBudgetNum < maxPayoutNum) {
        setError("Total budget must be greater than max payout");
        return false;
      }
    }
    return true;
  };

  const resetForm = () => {
    setTitle("");
    setImage(null);
    setImageUrl("");
    setDescription("");
    setAddress("");
    setRewardRate("");
    setMaxPayout("");
    setTotalBudget("");
    setActive(true);
    setError("");
    setSuccess("");
    setUploadProgress(0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    setUploadProgress(0);

    try {
      // Validate form
      if (!validateForm()) {
        setLoading(false);
        return;
      }

      const user = auth.currentUser;
      if (!user) throw new Error("You must be logged in to create a campaign.");

      let uploadedImageUrl = "";
      if (image) {
        try {
          const path = `campaign-images/${user.uid}-${Date.now()}-${image.name}`;
          uploadedImageUrl = await uploadFile(image, path, (progress: number) => {
            setUploadProgress(progress);
          });
        } catch (err) {
          throw new Error("Failed to upload image. Please try again.");
        }
      }

      // Create campaign document
      const campaignData = {
        restaurant_id: user.uid,
        title: title.trim(),
        image_url: uploadedImageUrl,
        description: description.trim(),
        address: address.trim(),
        reward_rate: Number(rewardRate),
        max_payout: Number(maxPayout),
        total_budget: totalBudget ? Number(totalBudget) : null,
        active_status: active,
        created_at: serverTimestamp(),
        status: "active",
        total_views: 0,
        total_engagement: 0,
        total_spent: 0,
      };

      await addDoc(collection(db, "campaigns"), campaignData);
      
      // Reset form and show success
      resetForm();
      setSuccess("Campaign created successfully!");
      
      // Call onCreated callback if provided
      if (onCreated) {
        try {
          await onCreated();
        } catch (err) {
          console.error("Error in onCreated callback:", err);
        }
      }
    } catch (err: any) {
      setError(err.message || "Failed to create campaign. Please try again.");
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
        className="border rounded px-3 py-2 text-gray-900"
        value={title}
        onChange={e => setTitle(e.target.value)}
        required
      />

      <label className="text-sm font-medium text-purple-700">Campaign Image</label>
      <input
        type="file"
        accept="image/jpeg,image/png,image/gif"
        className="border rounded px-3 py-2 text-gray-900"
        onChange={handleImageChange}
      />
      {image && (
        <div className="space-y-2">
          <img src={URL.createObjectURL(image)} alt="Preview" className="w-full max-h-40 object-contain rounded border" />
          <p className="text-sm text-gray-500">Image will be compressed if larger than 1MB</p>
        </div>
      )}
      {uploadProgress > 0 && uploadProgress < 100 && (
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className="bg-purple-600 h-2.5 rounded-full" 
            style={{ width: `${uploadProgress}%` }}
          ></div>
        </div>
      )}

      <label className="text-sm font-medium text-purple-700">Description of Campaign</label>
      <textarea
        placeholder="Describe your campaign..."
        className="border rounded px-3 py-2 text-gray-900 w-full min-h-[80px]"
        value={description}
        onChange={e => setDescription(e.target.value)}
        required
        rows={3}
      />

      <label className="text-sm font-medium text-purple-700">Address</label>
      <input
        type="text"
        placeholder="Restaurant Address"
        className="border rounded px-3 py-2 text-gray-900"
        value={address}
        onChange={e => setAddress(e.target.value)}
        required
      />

      <label className="text-sm font-medium text-purple-700">Reward Amount per 1k views ($)</label>
      <input
        type="number"
        placeholder="e.g. 5"
        className="border rounded px-3 py-2 text-gray-900"
        value={rewardRate}
        onChange={e => setRewardRate(e.target.value)}
        required
        min={0}
        step="0.01"
      />

      <label className="text-sm font-medium text-purple-700">Max Payout Per Influencer ($)</label>
      <input
        type="number"
        placeholder="e.g. 100"
        className="border rounded px-3 py-2 text-gray-900"
        value={maxPayout}
        onChange={e => setMaxPayout(e.target.value)}
        required
        min={0}
        step="0.01"
      />

      <label className="text-sm font-medium text-purple-700">Total Budget ($) <span className="text-gray-400">(Optional)</span></label>
      <input
        type="number"
        placeholder="e.g. 1000"
        className="border rounded px-3 py-2 text-gray-900"
        value={totalBudget}
        onChange={e => setTotalBudget(e.target.value)}
        min={0}
        step="0.01"
      />

      <label className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={active}
          onChange={e => setActive(e.target.checked)}
        />
        <span className="text-purple-700">Active</span>
      </label>

      <button 
        type="submit" 
        className="bg-purple-600 text-white py-2 rounded hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed" 
        disabled={loading}
      >
        {loading ? "Creating..." : "Create Campaign"}
      </button>

      {error && <p className="text-red-500 text-center">{error}</p>}
      {success && <p className="text-green-600 text-center">{success}</p>}
    </form>
  );
} 