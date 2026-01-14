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

    map.on("load", async () => {
      try {
        const res = await fetch("/api/adventures");
        const { data } = await res.json();

        if (!data) return;

        data.forEach((adventure: Adventure) => {
          const popupHtml = `
  <div style="
    width:260px;
    font-family: system-ui, -apple-system, BlinkMacSystemFont, sans-serif;
  ">
    ${
      adventure.coverImage
        ? `
          <img
            src="${adventure.coverImage}"
            alt="Adventure cover"
            style="
              width:100%;
              height:140px;
              object-fit:cover;
              border-radius:10px;
              margin-bottom:10px;
            "
          />
        `
        : ""
    }

    <div style="font-weight:600;font-size:15px;margin-bottom:6px;">
      ${adventure.title}
    </div>

    ${
      adventure.description
        ? `
          <div style="
            font-size:13px;
            color:#555;
            line-height:1.4;
            margin-bottom:10px;
          ">
            ${adventure.description}
          </div>
        `
        : ""
    }

    <a
      href="/adventure/${adventure.id}"
      style="
        display:inline-block;
        padding:6px 10px;
        font-size:13px;
        font-weight:500;
        color:white;
        background:#4f46e5;
        border-radius:6px;
        text-decoration:none;
      "
    >
      View adventure →
    </a>
  </div>
`;

          new mapboxgl.Marker()
            .setLngLat([adventure.longitude, adventure.latitude])
            .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML(popupHtml))
            .addTo(map);
        });
      } catch (err) {
        console.error("Failed to load adventures", err);
      }
    });

    return () => {
      map.remove();
    };
  }, []);

  return (
    <main className="h-screen w-screen">
      <div ref={mapContainer} className="h-full w-full" />
    </main>
  );
}
