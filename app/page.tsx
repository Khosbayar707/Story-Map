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
            <div class="popup-container">
              <div class="popup-header">
                ${
                  adventure.coverImage
                    ? `
                      <div class="popup-image-wrapper">
                        <img
                          src="${adventure.coverImage}"
                          alt="${adventure.title}"
                          class="popup-image"
                          onerror="this.style.display='none'"
                        />
                      </div>
                    `
                    : '<div class="popup-placeholder-image">🌄</div>'
                }
              </div>
              
              <div class="popup-content">
                <div class="popup-title">
                  ${adventure.title}
                </div>
                
                ${
                  adventure.description
                    ? `
                      <div class="popup-description">
                        ${
                          adventure.description.length > 120
                            ? adventure.description.substring(0, 120) + "..."
                            : adventure.description
                        }
                      </div>
                    `
                    : ""
                }
                
                <div class="popup-footer">
                  <a 
                    href="/adventure/${adventure.id}" 
                    class="popup-button"
                  >
                    <span>View Details</span>
                    <svg class="popup-button-icon" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M6 12L10 8L6 4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </a>
                </div>
              </div>
            </div>
            
            <style>
              .popup-container {
                width: 280px;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
                border-radius: 12px;
                overflow: hidden;
                background: white;
                box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
              }
              
              .popup-header {
                position: relative;
                height: 160px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              }
              
              .popup-image-wrapper {
                width: 100%;
                height: 100%;
                overflow: hidden;
              }
              
              .popup-image {
                width: 100%;
                height: 100%;
                object-fit: cover;
                transition: transform 0.3s ease;
              }
              
              .popup-image:hover {
                transform: scale(1.05);
              }
              
              .popup-placeholder-image {
                width: 100%;
                height: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 48px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: rgba(255, 255, 255, 0.9);
              }
              
              .popup-content {
                padding: 20px;
              }
              
              .popup-title {
                font-size: 18px;
                font-weight: 700;
                color: #1a202c;
                margin-bottom: 10px;
                line-height: 1.3;
                letter-spacing: -0.01em;
              }
              
              .popup-description {
                font-size: 14px;
                color: #4a5568;
                line-height: 1.5;
                margin-bottom: 20px;
                font-weight: 400;
              }
              
              .popup-footer {
                display: flex;
                align-items: center;
              }
              
              .popup-button {
                display: inline-flex;
                align-items: center;
                gap: 8px;
                padding: 10px 20px;
                font-size: 14px;
                font-weight: 600;
                color: white;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border-radius: 8px;
                text-decoration: none;
                transition: all 0.2s ease;
                box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
              }
              
              .popup-button:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 16px rgba(102, 126, 234, 0.4);
                color: white;
              }
              
              .popup-button:active {
                transform: translateY(0);
              }
              
              .popup-button-icon {
                transition: transform 0.2s ease;
              }
              
              .popup-button:hover .popup-button-icon {
                transform: translateX(3px);
              }
              
              /* Mapbox popup arrow styling */
              .mapboxgl-popup-content {
                padding: 0 !important;
                border-radius: 12px !important;
                overflow: hidden !important;
              }
              
              .mapboxgl-popup-tip {
                border-top-color: white !important;
              }
            </style>
          `;

          new mapboxgl.Marker({
            color: "#667eea",
            scale: 0.8,
          })
            .setLngLat([adventure.longitude, adventure.latitude])
            .setPopup(
              new mapboxgl.Popup({
                offset: 25,
                maxWidth: "280px",
                className: "custom-popup",
              }).setHTML(popupHtml)
            )
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
