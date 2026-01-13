"use client";

import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

export default function CreateAdventurePage() {
  const mapContainer = useRef<HTMLDivElement | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    null
  );

  useEffect(() => {
    if (!mapContainer.current) return;

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
  }, []);

  const submit = async () => {
    if (!coords || !title) return;
    await supabase.from("adventures").insert({
      title,
      description,
      latitude: coords.lat,
      longitude: coords.lng,
    });
  };

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
          <Button onClick={submit}>Save adventure</Button>
        </CardContent>
      </Card>
      <div ref={mapContainer} className="h-full" />
    </main>
  );
}
