"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import mapboxgl from "mapbox-gl";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

export default function CreateAdventurePage() {
  const router = useRouter();
  const mapContainer = useRef<HTMLDivElement | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    null
  );
  const [loading, setLoading] = useState(false);

  const [userId, setUserId] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUserId(data.user?.id ?? null);
      setAuthLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!authLoading && !userId) {
      toast.error("You must be logged in to create an adventure.");
      router.replace("/login");
    }
  }, [authLoading, userId, router]);

  useEffect(() => {
    if (!mapContainer.current || authLoading || !userId) return;

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [106.9, 47.9],
      zoom: 5,
    });

    let marker: mapboxgl.Marker | null = null;

    map.on("click", (e) => {
      const { lng, lat } = e.lngLat;
      setCoords({ lat, lng });

      if (!marker) {
        marker = new mapboxgl.Marker().setLngLat([lng, lat]).addTo(map);
      } else {
        marker.setLngLat([lng, lat]);
      }
    });

    return () => map.remove();
  }, [authLoading, userId]);

  const submit = async () => {
    if (!coords || !title) {
      toast.error("Please add a title and select a location.");
      return;
    }

    setLoading(true);

    const { data, error } = await supabase
      .from("adventures")
      .insert({
        title,
        description,
        latitude: coords.lat,
        longitude: coords.lng,
        user_id: userId,
      })
      .select()
      .single();

    setLoading(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Adventure created 🎉");

    setTimeout(() => {
      router.push(`/adventure/${data.id}`);
    }, 800);
  };

  if (authLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <p className="text-muted-foreground">Checking login…</p>
      </main>
    );
  }

  if (!userId) {
    return null;
  }

  return (
    <main className="grid min-h-screen grid-cols-1 md:grid-cols-2">
      <Card className="m-6">
        <CardHeader>
          <CardTitle>Create Adventure</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />

          <Textarea
            placeholder="Your story"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />

          {coords && (
            <p className="text-sm text-muted-foreground">
              Selected location: {coords.lat.toFixed(4)},{" "}
              {coords.lng.toFixed(4)}
            </p>
          )}

          <Button onClick={submit} disabled={loading}>
            {loading ? "Saving..." : "Save adventure"}
          </Button>
        </CardContent>
      </Card>

      <div ref={mapContainer} className="min-h-[400px] w-full" />
    </main>
  );
}
