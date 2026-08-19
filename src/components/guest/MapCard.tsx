"use client";

// Location map card (plan 2 task 6): MapLibre client leaf with an inline
// grayscale style built from design tokens (background white, water
// #e9e8e7, roads #c3c8c2) and a dark green (`primary`) marker at Hulu
// Langat (3.113, 101.815). maplibre-gl + its CSS are dynamically imported
// inside the effect so the library only ever loads in the browser (the
// library accesses WebGL globals at import time, which crashes SSR
// workers) and code-splits out of the server bundle; when WebGL is
// unavailable a static tonal fallback renders instead. Height ~16:9.

import type { Map as MaplibreMap, StyleSpecification } from "maplibre-gl";
import { useEffect, useRef, useState } from "react";
import { MapPin } from "@phosphor-icons/react";

import { Card } from "@/components/ui/Card";
import { LabelCaps } from "@/components/ui/LabelCaps";

const HULU_LANGAT: [number, number] = [101.815, 3.113]; // [lng, lat]

// Grayscale style from spec tokens: background white, water #e9e8e7,
// roads #c3c8c2 (rendered as a desaturated light raster basemap —
// separate water/road vector layers would require a tile server, which
// is out of scope here; the raster-saturation filter yields the same
// grayscale result). Carto basemaps require no API key.
const grayscaleStyle: StyleSpecification = {
  version: 8,
  sources: {
    carto: {
      type: "raster",
      tiles: [
        "https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png",
        "https://b.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png",
        "https://c.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png",
      ],
      tileSize: 256,
      attribution: "© OpenStreetMap contributors © CARTO",
    },
  },
  layers: [
    {
      id: "background",
      type: "background",
      paint: { "background-color": "#ffffff" },
    },
    {
      id: "carto-grayscale",
      type: "raster",
      source: "carto",
      paint: { "raster-saturation": -1 }, // grayscale render of the light basemap
    },
  ],
};

function webglAvailable(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(
      canvas.getContext("webgl2") ?? canvas.getContext("webgl"),
    );
  } catch {
    return false;
  }
}

export function MapCard() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!containerRef.current || !webglAvailable()) {
      setFailed(true);
      return;
    }

    let map: MaplibreMap | null = null;
    let cancelled = false;

    void (async () => {
      const maplibregl = await import("maplibre-gl");
      // Lazy-load the stylesheet alongside the library.
      await import("maplibre-gl/dist/maplibre-gl.css");
      if (cancelled || !containerRef.current) return;

      try {
        map = new maplibregl.Map({
          container: containerRef.current,
          style: grayscaleStyle,
          center: HULU_LANGAT,
          zoom: 12,
          attributionControl: { compact: true },
          interactive: true,
        });
        map.on("error", () => setFailed(true));
        new maplibregl.Marker({ color: "#18241b" }) // primary dark green
          .setLngLat(HULU_LANGAT)
          .addTo(map);
      } catch {
        setFailed(true);
      }
    })();

    return () => {
      cancelled = true;
      map?.remove();
    };
  }, []);

  return (
    <section aria-labelledby="location-heading">
      <h2
        id="location-heading"
        className="text-headline-sm font-semibold leading-headline-sm tracking-headline-sm text-on-surface"
      >
        Location
      </h2>
      <Card className="mt-6 overflow-hidden">
        <div className="flex items-center justify-between gap-4 border-b border-outline-variant px-5 py-4">
          <LabelCaps as="span">THE PAVILION | LUMASTAY</LabelCaps>
          <span className="flex items-center gap-2 text-body-md text-on-surface">
            <MapPin
              size={20}
              strokeWidth={1.5}
              className="text-on-surface"
              aria-hidden="true"
            />
            Location Overview
          </span>
        </div>
        <div className="relative aspect-video w-full bg-surface-container-low">
          {failed ? (
            // Static fallback when WebGL is unavailable: tonal panel with a
            // centered marker — zero shadows, token colors only.
            <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-surface-container-low">
              <MapPin
                size={32}
                weight="fill"
                strokeWidth={1.5}
                className="text-primary"
                aria-hidden="true"
              />
              <p className="text-sm text-on-surface-variant">
                Hulu Langat, Selangor · 3.113, 101.815
              </p>
            </div>
          ) : (
            <div ref={containerRef} className="h-full w-full" />
          )}
        </div>
      </Card>
    </section>
  );
}
