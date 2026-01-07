"use client";

import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

export default function CreateAdventurePage() {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);

  const [user, setUser] = useState<User | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, []);

  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [106.9057, 47.8864],
      zoom: 5,
    });

    map.on("click", (e) => {
      const { lng, lat } = e.lngLat;
      setCoords({ lat, lng });

      if (markerRef.current) {
        markerRef.current.setLngLat([lng, lat]);
      } else {
        markerRef.current = new mapboxgl.Marker({ color: "#4f46e5" })
          .setLngLat([lng, lat])
          .addTo(map);
      }
    });

    mapRef.current = map;

    return () => map.remove();
  }, []);

  const createAdventure = async () => {
    if (!user || !coords || !title) {
      setError("Title and location are required");
      return;
    }

    setLoading(true);
    setError(null);

    const { error } = await supabase.from("adventures").insert({
      title,
      description,
      latitude: coords.lat,
      longitude: coords.lng,
      user_id: user.id,
    });

    setLoading(false);

    if (error) {
      setError(error.message);
    } else {
      setTitle("");
      setDescription("");
      setCoords(null);
      alert("Adventure created!");
    }
  };

  if (!user) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-gray-600">Please log in to create an adventure.</p>
      </main>
    );
  }

  return (
    <main className="grid min-h-screen grid-cols-1 md:grid-cols-2">
      <div className="p-6">
        <h1 className="mb-4 text-2xl font-bold">Create Adventure</h1>

        <input
          type="text"
          placeholder="Adventure title"
          className="mb-3 w-full rounded border p-3"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <textarea
          placeholder="Tell your story..."
          className="mb-3 w-full rounded border p-3"
          rows={5}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        {coords && (
          <p className="mb-3 text-sm text-gray-600">
            Selected location: {coords.lat.toFixed(4)}, {coords.lng.toFixed(4)}
          </p>
        )}

        {error && <p className="mb-3 text-red-500">{error}</p>}

        <button
          onClick={createAdventure}
          disabled={loading}
          className="rounded bg-indigo-600 px-6 py-3 font-semibold text-white disabled:opacity-50"
        >
          {loading ? "Saving..." : "Create Adventure"}
        </button>
      </div>

      <div ref={mapContainer} className="h-[400px] md:h-full" />
    </main>
  );
}
