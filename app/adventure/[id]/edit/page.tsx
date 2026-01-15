"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import type { Adventure } from "@/types/adventure";

export default function EditAdventurePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [adventure, setAdventure] = useState<Adventure | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [latitude, setLatitude] = useState<number | "">("");
  const [longitude, setLongitude] = useState<number | "">("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 🔹 Load adventure
  useEffect(() => {
    const loadAdventure = async () => {
      const { data, error } = await supabase
        .from("adventures")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        setError(error.message);
        return;
      }

      setAdventure(data);
      setTitle(data.title);
      setDescription(data.description ?? "");
      setLatitude(data.latitude);
      setLongitude(data.longitude);
    };

    loadAdventure();
  }, [id]);

  // 🔹 Submit update
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase
      .from("adventures")
      .update({
        title,
        description,
        latitude: Number(latitude),
        longitude: Number(longitude),
      })
      .eq("id", id);

    setLoading(false);

    if (error) {
      setError(error.message);
      return;
    }

    router.push(`/adventure/${id}`);
  };

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-red-500">{error}</p>
      </main>
    );
  }

  if (!adventure) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500">Loading adventure…</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-xl p-6">
      <h1 className="mb-6 text-2xl font-bold">Edit Adventure</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Title</label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full rounded border px-3 py-2"
          />
        </div>

        <div>
          <label className="block text-sm font-medium">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            className="w-full rounded border px-3 py-2"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">Latitude</label>
            <input
              type="number"
              value={latitude}
              onChange={(e) => setLatitude(e.target.valueAsNumber)}
              required
              className="w-full rounded border px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Longitude</label>
            <input
              type="number"
              value={longitude}
              onChange={(e) => setLongitude(e.target.valueAsNumber)}
              required
              className="w-full rounded border px-3 py-2"
            />
          </div>
        </div>

        <div className="flex gap-2 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="rounded bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save Changes"}
          </button>

          <button
            type="button"
            onClick={() => router.back()}
            className="rounded border px-4 py-2"
          >
            Cancel
          </button>
        </div>
      </form>
    </main>
  );
}
