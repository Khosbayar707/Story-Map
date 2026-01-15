"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import mapboxgl from "mapbox-gl";
import { supabase } from "@/lib/supabase";
import type { Adventure } from "@/types/adventure";
import {
  UploadPhotoDialog,
  AdventureGallery,
} from "@/components/AdventureMedia";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

export default function AdventureDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [adventure, setAdventure] = useState<Adventure | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [photos, setPhotos] = useState<string[]>([]);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id ?? null);
    });
  }, []);

  useEffect(() => {
    const loadAdventure = async () => {
      const { data, error } = await supabase
        .from("adventures")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        setError(error.message);
      } else {
        setAdventure(data);
      }
    };

    loadAdventure();
  }, [id]);

  useEffect(() => {
    if (!adventure) return;

    const map = new mapboxgl.Map({
      container: "adventure-map",
      style: "mapbox://styles/mapbox/streets-v12",
      center: [adventure.longitude, adventure.latitude],
      zoom: 8,
    });

    new mapboxgl.Marker({ color: "#4f46e5" })
      .setLngLat([adventure.longitude, adventure.latitude])
      .addTo(map);

    return () => map.remove();
  }, [adventure]);

  useEffect(() => {
    if (!adventure) return;

    supabase
      .from("adventure_photos")
      .select("image_url")
      .eq("adventure_id", adventure.id)
      .then(({ data }) => {
        setPhotos(data?.map((p) => p.image_url) ?? []);
      });
  }, [adventure]);

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

  const isOwner = userId === adventure.user_id;

  const handleDelete = async () => {
    const ok = confirm("Are you sure you want to delete this adventure?");
    if (!ok) return;

    const { error } = await supabase
      .from("adventures")
      .delete()
      .eq("id", adventure.id);

    if (error) {
      alert(error.message);
      return;
    }

    router.push("/");
  };

  return (
    <main className="mx-auto max-w-5xl p-6">
      <h1 className="mb-2 text-3xl font-bold">{adventure.title}</h1>
      <p className="mb-6 text-gray-600">{adventure.description}</p>

      <div id="adventure-map" className="mb-6 h-[400px] w-full rounded-xl" />

      <div className="mb-6 text-sm text-gray-500">
        Posted on {new Date(adventure.created_at).toLocaleDateString()}
      </div>

      <AdventureGallery photos={photos} />

      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-3xl font-bold">{adventure.title}</h1>

        {isOwner && (
          <div className="flex gap-2">
            <button
              onClick={() => router.push(`/adventure/${adventure.id}/edit`)}
              className="rounded-lg border px-3 py-1 text-sm hover:bg-gray-100"
            >
              ✏️ Edit
            </button>

            <button
              onClick={handleDelete}
              className="rounded-lg border border-red-300 px-3 py-1 text-sm text-red-600 hover:bg-red-50"
            >
              🗑 Delete
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
