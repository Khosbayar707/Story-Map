"use client";

import mapboxgl from "mapbox-gl";
import { useEffect, useRef } from "react";

mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN || "";

export default function HomePage() {
  const mapContainer = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!mapContainer.current) return;

    const map = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [0, 20],
      zoom: 2,
    });

    new mapboxgl.Marker()
      .setLngLat([106.920926, 47.922478])
      .setPopup(new mapboxgl.Popup().setText("First Adventure!"))
      .addTo(map);

    return () => map.remove();
  }, []);

  return (
    <main className="h-screen w-screen">
      <div ref={mapContainer} className="h-full w-full" />
    </main>
  );
}
