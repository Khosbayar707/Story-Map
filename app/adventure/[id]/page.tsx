"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
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

  // Initialize map
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

  // ✅ SAFE ownership check
  const isOwner = userId === adventure.user_id;

  return (
    <main className="mx-auto max-w-5xl p-6">
      <h1 className="mb-2 text-3xl font-bold">{adventure.title}</h1>
      <p className="mb-6 text-gray-600">{adventure.description}</p>

      <div id="adventure-map" className="mb-6 h-[400px] w-full rounded-xl" />

      <div className="mb-6 text-sm text-gray-500">
        Posted on {new Date(adventure.created_at).toLocaleDateString()}
      </div>

      {/* 📸 Everyone can see photos */}
      <AdventureGallery adventureId={adventure.id} />

      {/* ⬆️ Only owner can upload */}
      {isOwner && (
        <div className="mt-4">
          <UploadPhotoDialog adventureId={adventure.id} />
        </div>
      )}
    </main>
  );
}
