"use client";

import { useEffect, useRef, useState, useMemo, useCallback } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { formatIndianNumber } from "@/lib/utils";
import { getStateMeta } from "@/lib/states";

export interface CourtMarkerData {
  court_id: number;
  court: {
    id: number;
    name: string;
    tier: "SC" | "HC" | "DISTRICT";
    state: string;
    district: string;
    lat: number;
    lon: number;
    establishment_code?: string;
  };
  total: number;
  civil: number;
  criminal: number;
  judge_strength?: {
    sanctioned: number;
    working: number;
    vacancy: number;
    vacancy_rate: number;
  };
  case_clearance_rate?: number;
  disposal_velocity?: {
    avg_trial_months: number;
    bail_turnaround_days: number;
  };
  police_intelligence?: {
    pending_warrants: number;
    chargesheet_to_trial_days: number;
    undertrial_prisoners: number;
  };
  special_courts?: {
    pocso: number;
    ndps: number;
    mact: number;
    sec_138: number;
    commercial: number;
  };
  citizen_aid?: {
    dlsa_contact: string;
    ecourts_cause_list_url: string;
    free_legal_aid: boolean;
  };
  historical_trends?: Array<{
    year: number;
    instituted: number;
    disposed: number;
    pending: number;
  }>;
  age_bucket?: Record<string, number>;
}

interface MapViewProps {
  courts: CourtMarkerData[];
  selectedTier: "ALL" | "SC" | "HC" | "DISTRICT";
  selectedState?: string;
  selectedCourtId?: number | null;
  isAiOpen?: boolean;
  targetFlight?: { lat: number; lon: number; zoom?: number; pitch?: number } | null;
  onSelectCourt?: (court: CourtMarkerData | null) => void;
  onSelectState?: (state: string) => void;
}

export const MAP_STYLES = {
  carto_minimal: {
    name: "Minimal Charcoal",
    isLight: false,
    tiles: [
      "https://a.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}@2x.png",
      "https://b.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}@2x.png",
      "https://c.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}@2x.png",
      "https://d.basemaps.cartocdn.com/dark_nolabels/{z}/{x}/{y}@2x.png",
    ],
    attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
  },
  carto_light: {
    name: "Apple Platinum",
    isLight: true,
    tiles: [
      "https://a.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png",
      "https://b.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png",
      "https://c.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png",
      "https://d.basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png",
    ],
    attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
  },
};

export function MapView({
  courts,
  selectedTier,
  selectedState = "ALL",
  selectedCourtId,
  isAiOpen,
  targetFlight,
  onSelectCourt,
  onSelectState,
}: MapViewProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const hoverTooltipRef = useRef<maplibregl.Popup | null>(null);
  const [activeStyleKey, setActiveStyleKey] = useState<keyof typeof MAP_STYLES>("carto_minimal");
  const [mapLoaded, setMapLoaded] = useState(false);
  const [webglError, setWebglError] = useState<string | null>(null);

  const currentStyleConfig = MAP_STYLES[activeStyleKey];
  const isLightMode = currentStyleConfig.isLight;

  // Initialize MapLibre Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    try {
      const canvas = document.createElement("canvas");
      const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
      if (!gl) {
        setWebglError("WebGL hardware acceleration is disabled or unsupported in your browser.");
        return;
      }
    } catch (e) {
      setWebglError("Unable to initialize WebGL graphics context.");
      return;
    }

    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    const currentStyle = MAP_STYLES[activeStyleKey];

    try {
      const map = new maplibregl.Map({
        container: mapContainerRef.current,
        style: {
          version: 8,
          sources: {
            basemap: {
              type: "raster",
              tiles: currentStyle.tiles,
              tileSize: 256,
              attribution: currentStyle.attribution,
            },
          },
          layers: [
            {
              id: "basemap-layer",
              type: "raster",
              source: "basemap",
              minzoom: 0,
              maxzoom: 19,
            },
          ],
        },
        center: [78.9629, 22.5937],
        zoom: 4.6,
        minZoom: 3.8,
        maxZoom: 16,
        pitch: 0,
        bearing: 0,
      });

      map.addControl(new maplibregl.NavigationControl({ showCompass: true }), "top-right");

      map.on("load", () => {
        map.resize();

        // Add India States GeoJSON Boundaries
        if (!map.getSource("india-states-source")) {
          map.addSource("india-states-source", {
            type: "geojson",
            data: "/india_states.geojson",
          });

          // State ambient fill
          map.addLayer({
            id: "state-polygons-base",
            type: "fill",
            source: "india-states-source",
            paint: {
              "fill-color": isLightMode ? "#000000" : "#ffffff",
              "fill-opacity": isLightMode ? 0.04 : 0.02,
            },
          });

          // State boundary lines
          map.addLayer({
            id: "state-borders",
            type: "line",
            source: "india-states-source",
            paint: {
              "line-color": isLightMode ? "#000000" : "#ffffff",
              "line-width": 0.8,
              "line-opacity": isLightMode ? 0.35 : 0.25,
            },
          });

          // 3D Elevated Raised Extrusion Block for Selected State
          map.addLayer({
            id: "state-selected-extrusion",
            type: "fill-extrusion",
            source: "india-states-source",
            paint: {
              "fill-extrusion-height": 0,
              "fill-extrusion-base": 0,
              "fill-extrusion-color": isLightMode ? "#18181b" : "#ffffff",
              "fill-extrusion-opacity": 0,
            },
          });

          // Glowing Boundary Line for Selected State
          map.addLayer({
            id: "state-selected-border",
            type: "line",
            source: "india-states-source",
            paint: {
              "line-color": isLightMode ? "#000000" : "#ffffff",
              "line-width": 0,
              "line-opacity": 0.95,
            },
          });

          // Illuminated Fill Glow for Selected State
          map.addLayer({
            id: "state-selected-fill",
            type: "fill",
            source: "india-states-source",
            paint: {
              "fill-color": isLightMode ? "#000000" : "#ffffff",
              "fill-opacity": 0,
            },
          });

          // Click on any state to select and raise it
          map.on("click", "state-polygons-base", (e) => {
            if (!e.features || !e.features[0]) return;
            const props = e.features[0].properties as any;
            if (props.slug && onSelectState) {
              onSelectState(props.slug);
            }
          });

          map.on("mouseenter", "state-polygons-base", () => {
            map.getCanvas().style.cursor = "pointer";
          });
          map.on("mouseleave", "state-polygons-base", () => {
            map.getCanvas().style.cursor = "";
          });
        }

        setMapLoaded(true);
      });

      // Background click dismisses drawer
      map.on("click", (e) => {
        const target = e.originalEvent.target as HTMLElement;
        if (!target.closest(".court-pin-marker")) {
          if (onSelectCourt) onSelectCourt(null);
          if (hoverTooltipRef.current) hoverTooltipRef.current.remove();
        }
      });

      const handleResize = () => {
        map.resize();
      };
      window.addEventListener("resize", handleResize);

      mapRef.current = map;

      return () => {
        window.removeEventListener("resize", handleResize);
        if (hoverTooltipRef.current) hoverTooltipRef.current.remove();
        map.remove();
        mapRef.current = null;
        setMapLoaded(false);
      };
    } catch (err: any) {
      console.error("Map initialization error:", err);
      setWebglError(err.message || "Failed to initialize map canvas");
    }
  }, [activeStyleKey, onSelectState, isLightMode]);

  // Update State 3D Elevation & Glowing Highlight Layers when Selected State Changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;

    const isStateSelected = selectedState && selectedState !== "ALL";

    try {
      if (map.getLayer("state-selected-extrusion")) {
        map.setPaintProperty("state-selected-extrusion", "fill-extrusion-height", [
          "case",
          ["==", ["get", "slug"], selectedState],
          22000,
          0,
        ]);
        map.setPaintProperty("state-selected-extrusion", "fill-extrusion-color", isLightMode ? "#18181b" : "#ffffff");
        map.setPaintProperty("state-selected-extrusion", "fill-extrusion-opacity", [
          "case",
          ["==", ["get", "slug"], selectedState],
          isLightMode ? 0.75 : 0.32,
          0,
        ]);
      }

      if (map.getLayer("state-selected-fill")) {
        map.setPaintProperty("state-selected-fill", "fill-color", isLightMode ? "#000000" : "#ffffff");
        map.setPaintProperty("state-selected-fill", "fill-opacity", [
          "case",
          ["==", ["get", "slug"], selectedState],
          isLightMode ? 0.12 : 0.18,
          0,
        ]);
      }

      if (map.getLayer("state-selected-border")) {
        map.setPaintProperty("state-selected-border", "line-color", isLightMode ? "#000000" : "#ffffff");
        map.setPaintProperty("state-selected-border", "line-width", [
          "case",
          ["==", ["get", "slug"], selectedState],
          3,
          0,
        ]);
      }

      // Camera Fly-To & 3D Tilt Angle
      if (isStateSelected) {
        const meta = getStateMeta(selectedState);
        if (meta) {
          map.flyTo({
            center: meta.center,
            zoom: meta.zoom,
            pitch: 36,
            bearing: 0,
            duration: 1400,
            essential: true,
          });
        }
      } else {
        map.flyTo({
          center: [78.9629, 22.5937],
          zoom: 4.6,
          pitch: 0,
          bearing: 0,
          duration: 1400,
          essential: true,
        });
      }
    } catch (err) {
      console.warn("Could not update state elevation layers:", err);
    }
  }, [selectedState, mapLoaded, isLightMode]);

  // Handle AI Target Flight Camera Move
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded || !targetFlight) return;

    map.flyTo({
      center: [targetFlight.lon, targetFlight.lat],
      zoom: targetFlight.zoom || 10,
      pitch: targetFlight.pitch ?? 36,
      bearing: 0,
      duration: 1800,
      essential: true,
    });
  }, [targetFlight, mapLoaded]);

  // Handle Smooth Split-Screen Canvas Resizing
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const timer1 = setTimeout(() => map.resize(), 100);
    const timer2 = setTimeout(() => map.resize(), 320);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [isAiOpen]);

  // Filter Active Courts
  const activeCourts = useMemo(() => {
    const isStateFiltered = selectedState && selectedState !== "ALL";

    return courts.filter((c) => {
      if (!c.court.lat || !c.court.lon) return false;

      // Tier filter
      if (selectedTier !== "ALL" && c.court.tier !== selectedTier) {
        return false;
      }

      // State filter
      if (isStateFiltered) {
        const courtState = c.court.state?.toLowerCase().replace(/\s+/g, "-");
        const stateSlug = selectedState.toLowerCase().replace(/\s+/g, "-");
        const match = courtState === stateSlug || c.court.state?.toLowerCase().includes(selectedState.toLowerCase());
        if (!match && c.court.tier !== "SC") return false;
      }

      return true;
    });
  }, [courts, selectedTier, selectedState]);

  // 3 DISTINCT MARKER GENERATORS: Adaptive for Dark & Platinum Light
  const createPinElement = useCallback(
    (court: CourtMarkerData, isSelected: boolean) => {
      const tier = court.court.tier;
      const el = document.createElement("div");
      el.className = "court-pin-marker group cursor-pointer relative select-none";

      let width = 20;
      let height = 28;
      let svgContent = "";

      if (tier === "SC") {
        // TIER 1: SUPREME COURT OF INDIA (Apex Hexagonal Shield Beacon)
        width = 34;
        height = 48;
        el.style.width = `${width}px`;
        el.style.height = `${height}px`;

        svgContent = `
          <!-- Supreme Court Apex Hexagonal Shield Beacon -->
          <svg viewBox="0 0 36 50" width="${width}" height="${height}" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 6px 14px rgba(0,0,0,0.85)) drop-shadow(0 0 12px ${isLightMode ? 'rgba(0,0,0,0.4)' : 'rgba(255,255,255,0.7)'});">
            <!-- Shield Body -->
            <path d="M18 0L34 7V26C34 37 25 46 18 50C11 46 2 37 2 26V7L18 0Z" fill="${isLightMode ? '#000000' : '#FFFFFF'}" stroke="${isLightMode ? '#FFFFFF' : '#000000'}" stroke-width="2" />
            <!-- Inner Ring -->
            <circle cx="18" cy="22" r="11" fill="${isLightMode ? '#FFFFFF' : '#000000'}" />
            <!-- Central Supreme Beacon & Judicial Scales -->
            <circle cx="18" cy="22" r="8" fill="${isLightMode ? '#000000' : '#FFFFFF'}" />
            <circle cx="18" cy="22" r="4.5" fill="${isLightMode ? '#FFFFFF' : '#000000'}" />
            <circle cx="18" cy="22" r="2" fill="${isLightMode ? '#000000' : '#FFFFFF'}" />
            <!-- Bottom Anchor Pointer -->
            <polygon points="15,42 21,42 18,48" fill="${isLightMode ? '#FFFFFF' : '#000000'}" />
          </svg>
          <!-- Apex Floating Tag -->
          <div style="position: absolute; top: -16px; background: ${isLightMode ? '#000000' : '#ffffff'}; color: ${isLightMode ? '#ffffff' : '#000000'}; font-size: 8px; font-weight: 900; letter-spacing: 0.1em; padding: 1.5px 6px; border-radius: 4px; border: 1.5px solid ${isLightMode ? '#ffffff' : '#000000'}; white-space: nowrap; box-shadow: 0 2px 8px rgba(0,0,0,0.8);">
            APEX SC
          </div>
        `;
      } else if (tier === "HC") {
        // TIER 2: 25 HIGH COURTS (Monumental Teardrop with Architectural Court Pillars)
        width = 26;
        height = 36;
        el.style.width = `${width}px`;
        el.style.height = `${height}px`;

        svgContent = `
          <!-- High Court Pillar Teardrop Marker -->
          <svg viewBox="0 0 28 40" width="${width}" height="${height}" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 4px 8px rgba(0,0,0,0.8));">
            <!-- Pin Body -->
            <path d="M14 0C6.268 0 0 6.268 0 14C0 23.5 12.6 38.8 13.1 39.4C13.55 39.95 14.45 39.95 14.9 39.4C15.4 38.8 28 23.5 28 14C28 6.268 21.732 0 14 0Z" fill="${isLightMode ? '#18181b' : '#000000'}" stroke="#FFFFFF" stroke-width="2" />
            <!-- Architectural Court Pediment & Pillars Glyph -->
            <polygon points="14,6 7,11 21,11" fill="#FFFFFF" />
            <rect x="8" y="12" width="2" height="7" fill="#FFFFFF" rx="0.5" />
            <rect x="13" y="12" width="2" height="7" fill="#FFFFFF" rx="0.5" />
            <rect x="18" y="12" width="2" height="7" fill="#FFFFFF" rx="0.5" />
            <rect x="7" y="20" width="14" height="2" fill="#FFFFFF" rx="0.5" />
          </svg>
        `;
      } else {
        // TIER 3: 755 DISTRICT COURTS (Precision Diamond Needle)
        width = 18;
        height = 26;
        el.style.width = `${width}px`;
        el.style.height = `${height}px`;

        svgContent = `
          <!-- Subordinate District Court Diamond Needle Marker -->
          <svg viewBox="0 0 20 30" width="${width}" height="${height}" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 2px 6px rgba(0,0,0,0.8));">
            <!-- Diamond Needle Body -->
            <path d="M10 0L19 9L10 29L1 9L10 0Z" fill="${isLightMode ? '#000000' : '#18181b'}" stroke="#FFFFFF" stroke-width="1.6" />
            <!-- Concentric Center Optical Dot -->
            <circle cx="10" cy="10" r="4.2" fill="${isLightMode ? '#18181b' : '#27272a'}" stroke="#FFFFFF" stroke-width="1" />
            <circle cx="10" cy="10" r="1.8" fill="#FFFFFF" />
          </svg>
        `;
      }

      el.innerHTML = `
        <div style="position: relative; width: 100%; height: 100%; display: flex; flex-direction: column; align-items: center; justify-content: flex-end; transform-origin: bottom center; transition: transform 0.18s cubic-bezier(0.16, 1, 0.3, 1);">
          <!-- Ground Shadow -->
          <div style="position: absolute; bottom: -2px; width: ${width * 0.5}px; height: 3px; background: rgba(0,0,0,0.7); border-radius: 9999px; filter: blur(1.5px);"></div>
          
          ${svgContent}

          <!-- Active Selection Pulse Ring -->
          ${
            isSelected
              ? `<div style="position: absolute; top: -4px; width: ${width + 10}px; height: ${width + 10}px; border-radius: 9999px; border: 2px solid ${isLightMode ? '#000000' : '#ffffff'}; animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>`
              : ""
          }
        </div>
      `;

      return { el, height };
    },
    [isLightMode]
  );

  // Render & Update Markers
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;

    // Clear old markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    activeCourts.forEach((c) => {
      const lon = Number(c.court.lon);
      const lat = Number(c.court.lat);
      if (isNaN(lon) || isNaN(lat)) return;

      const isSelected = selectedCourtId === c.court_id;
      const { el, height } = createPinElement(c, isSelected);

      const hoverTooltipHTML = `
        <div style="background: rgba(10, 10, 12, 0.85); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); border: 1px solid rgba(255,255,255,0.15); border-radius: 12px; padding: 6px 10px; color: #ffffff; font-family: -apple-system, BlinkMacSystemFont, 'Inter', sans-serif; box-shadow: 0 10px 25px rgba(0,0,0,0.6); pointer-events: none; white-space: nowrap;">
          <div style="font-size: 11px; font-weight: 600; color: #ffffff;">${c.court.name}</div>
          <div style="font-size: 10px; color: #a1a1aa; display: flex; items-center; gap: 4px; margin-top: 1px;">
            <span>${c.court.tier === "SC" ? "Supreme Court" : c.court.tier === "HC" ? "High Court" : "District Court"}</span>
            <span>•</span>
            <span style="font-weight: 700; color: #ffffff;">${formatIndianNumber(c.total)} Pending</span>
          </div>
        </div>
      `;

      const marker = new maplibregl.Marker({
        element: el,
        anchor: "bottom",
      })
        .setLngLat([lon, lat])
        .addTo(map);

      el.addEventListener("mouseenter", () => {
        if (hoverTooltipRef.current) hoverTooltipRef.current.remove();
        hoverTooltipRef.current = new maplibregl.Popup({
          closeButton: false,
          closeOnClick: false,
          offset: [0, -height - 2],
        })
          .setLngLat([lon, lat])
          .setHTML(hoverTooltipHTML)
          .addTo(map);
      });

      el.addEventListener("mouseleave", () => {
        if (hoverTooltipRef.current) {
          hoverTooltipRef.current.remove();
          hoverTooltipRef.current = null;
        }
      });

      el.addEventListener("click", (e) => {
        e.stopPropagation();
        if (hoverTooltipRef.current) {
          hoverTooltipRef.current.remove();
          hoverTooltipRef.current = null;
        }
        if (onSelectCourt) {
          onSelectCourt(c);
        }
      });

      markersRef.current.push(marker);
    });
  }, [activeCourts, mapLoaded, selectedCourtId, createPinElement, onSelectCourt]);

  return (
    <div className="relative w-full h-full min-h-[620px] bg-black rounded-3xl overflow-hidden border border-white/[0.08] shadow-2xl">
      {webglError ? (
        <div className="w-full h-full min-h-[620px] flex flex-col items-center justify-center p-6 text-center text-zinc-400 space-y-3 bg-zinc-950">
          <div className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white font-bold">!</div>
          <h3 className="text-white font-semibold text-base">WebGL Acceleration Required</h3>
          <p className="text-xs max-w-sm text-zinc-400">{webglError}</p>
          <p className="text-[11px] text-zinc-500">Ensure hardware acceleration is enabled in your browser settings.</p>
        </div>
      ) : (
        <div ref={mapContainerRef} className="w-full h-full min-h-[620px]" />
      )}

      {/* Luxury Map Style Theme Switcher */}
      <div className="absolute bottom-5 right-5 z-20 flex items-center gap-1 glass-panel p-1 rounded-2xl text-xs text-white shadow-2xl">
        {(Object.keys(MAP_STYLES) as (keyof typeof MAP_STYLES)[]).map((key) => (
          <button
            key={key}
            onClick={() => setActiveStyleKey(key)}
            className={`px-3 py-1.5 rounded-xl font-medium transition-all duration-200 ${
              activeStyleKey === key
                ? "bg-white text-black shadow-md font-semibold"
                : "text-zinc-400 hover:text-white hover:bg-white/5"
            }`}
          >
            {MAP_STYLES[key].name}
          </button>
        ))}
      </div>
    </div>
  );
}
