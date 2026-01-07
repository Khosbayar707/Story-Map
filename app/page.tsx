"use client";

import mapboxgl from "mapbox-gl";
import { useEffect, useRef } from "react";
import type { Adventure } from "@/types/adventure";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

export default function HomePage() {
  const mapContainer = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [106.9057, 47.8864],
      zoom: 5,
    });

    const loadAdventures = async () => {
      const res = await fetch("/api/adventures");
      const { data } = await res.json();

      if (!data) return;

      data.forEach((adventure: Adventure) => {
        new mapboxgl.Marker()
          .setLngLat([adventure.longitude, adventure.latitude])
          .setPopup(
            new mapboxgl.Popup().setHTML(
              `<strong>${adventure.title}</strong><br/>${
                adventure.description ?? ""
              }`
            )
          )
          .addTo(map);
      });
    };

    loadAdventures();

    return () => map.remove();
  }, []);

  return (
    <main className="h-screen w-screen">
      <div ref={mapContainer} className="h-full w-full" />
    </main>
  );
}
