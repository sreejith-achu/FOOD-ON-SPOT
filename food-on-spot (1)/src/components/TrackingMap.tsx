import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Order } from "../types";

interface TrackingMapProps {
  order: Order;
}

// Coordinate mappings for Bengaluru (specifically Indiranagar)
const REST_COORDS: Record<string, [number, number]> = {
  "rest-1": [12.9784, 77.6405], // The Royal Biryani House (100 Feet Rd)
  "rest-2": [12.9645, 77.6430], // A2B - Adyar Ananda Bhavan (Indiranagar Double Rd)
  "rest-3": [12.9750, 77.6480], // Delhi Darbar Heritage (12th Main)
  "rest-4": [12.9705, 77.6385], // Chai Point & Samosa (Metro Station)
};

const HOME_COORDS: [number, number] = [12.971891, 77.641151]; // Flat B-1, Parijata Mansion, Indiranagar

export default function TrackingMap({ order }: TrackingMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const routeLineRef = useRef<L.Polyline | null>(null);
  const restaurantMarkerRef = useRef<L.Marker | null>(null);
  const homeMarkerRef = useRef<L.Marker | null>(null);
  const driverMarkerRef = useRef<L.Marker | null>(null);

  // Fraction state for animating the driver along the delivery route (0 to 1)
  const [driverFraction, setDriverFraction] = useState<number>(0);

  // Determine fixed coordinates
  const restaurantCoords = REST_COORDS[order.restaurantId] || [12.9750, 77.6430];
  const homeCoords = HOME_COORDS;

  // Track Driver fraction location based on Order Status
  useEffect(() => {
    let targetFraction = 0;
    switch (order.status) {
      case "PENDING":
      case "ACCEPTED":
        targetFraction = 0;
        break;
      case "PREPARING":
        targetFraction = 0.05;
        break;
      case "READY_FOR_PICKUP":
        targetFraction = 0.12;
        break;
      case "OUT_FOR_DELIVERY":
        targetFraction = 0.45; // Base starting point on out for delivery
        break;
      case "DELIVERED":
        targetFraction = 1.0;
        break;
      default:
        targetFraction = 0;
    }

    if (order.status === "OUT_FOR_DELIVERY") {
      // Simulate real-time continuous movement along the Bengaluru street grid!
      const interval = setInterval(() => {
        setDriverFraction((prev) => {
          if (prev >= 0.95) return 0.95; // Wait near customer house until status switches to DELIVERED
          return Math.min(0.95, prev + 0.02); // Increment slowly
        });
      }, 4000);

      // Start driver at least at 0.35
      setDriverFraction((prev) => Math.max(0.35, prev));

      return () => clearInterval(interval);
    } else {
      setDriverFraction(targetFraction);
    }
  }, [order.status]);

  // Current interpolated coordinates for the Driver Partner
  const getDriverCoords = (): [number, number] => {
    const lat = restaurantCoords[0] + (homeCoords[0] - restaurantCoords[0]) * driverFraction;
    const lng = restaurantCoords[1] + (homeCoords[1] - restaurantCoords[1]) * driverFraction;
    return [lat, lng];
  };

  // Initialize and update the Leaflet map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Clean up existing map instance to ensure stability
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    // Set up Leaflet map with CartoDB Dark Matter layer for a premium, high-tech interface vibe
    const centerLat = (restaurantCoords[0] + homeCoords[0]) / 2;
    const centerLng = (restaurantCoords[1] + homeCoords[1]) / 2;

    const map = L.map(mapContainerRef.current, {
      center: [centerLat, centerLng],
      zoom: 15,
      zoomControl: true,
      attributionControl: false,
    });

    mapRef.current = map;

    // CartoDB Dark Matter - High fidelity aesthetic dark mode overlay tiles
    L.tileLayer("https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png", {
      maxZoom: 19,
    }).addTo(map);

    // Ensure map updates dimensions correctly
    setTimeout(() => {
      map.invalidateSize();
    }, 200);

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [order.restaurantId]); // Reinitialize only if restaurant ID changes

  // Draw/Update markers and polyline as status or fraction changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // 1. Draw Route Polyline (Dashed Hot Orange Street Path)
    if (routeLineRef.current) {
      map.removeLayer(routeLineRef.current);
    }

    // Creating beautiful dashed breadcrumbs linking the kitchen to the customer
    const pathCoords = [restaurantCoords, homeCoords];
    const routeLine = L.polyline(pathCoords, {
      color: "#FF6B35",
      weight: 3.5,
      dashArray: "6, 8",
      opacity: 0.85,
    }).addTo(map);
    routeLineRef.current = routeLine;

    // Zoom path to fit exactly inside window
    map.fitBounds(routeLine.getBounds(), {
      padding: [40, 40],
      animate: true,
      duration: 1.5,
    });

    // 2. Custom HTML/CSS Marker - Restaurant Kitchen Icon (Hot Amber Ring)
    if (restaurantMarkerRef.current) {
      map.removeLayer(restaurantMarkerRef.current);
    }

    const restHtml = `
      <div class="relative flex items-center justify-center">
        <span class="absolute inline-flex h-8 w-8 rounded-full bg-[#FF6B35]/30 animate-ping"></span>
        <div class="relative flex items-center justify-center h-9 w-9 rounded-full bg-[#111625] border-2 border-[#FF6B35] shadow-lg text-white">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FF6B35" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <path d="M16 10a4 4 0 0 1-8 0"></path>
          </svg>
        </div>
      </div>
    `;

    const restIcon = L.divIcon({
      html: restHtml,
      className: "custom-map-icon",
      iconSize: [36, 36],
      iconAnchor: [18, 18],
    });

    const restaurantMarker = L.marker(restaurantCoords, { icon: restIcon })
      .addTo(map)
      .bindPopup(
        `<div style="color: #FFF; background: #111625; padding: 4px; font-family: sans-serif; font-size: 11px;">
           <strong style="color: #FF6B35;">${order.restaurantName}</strong><br/>
           Kitchen Outlet · Cooking Spot
         </div>`
      );
    restaurantMarkerRef.current = restaurantMarker;

    // 3. Custom HTML/CSS Marker - Home Destination Icon (Emerald Blue Glowing Point)
    if (homeMarkerRef.current) {
      map.removeLayer(homeMarkerRef.current);
    }

    const homeHtml = `
      <div class="relative flex flex-col items-center justify-center">
        <span class="absolute inline-flex h-8 w-8 rounded-full bg-[#10B981]/30 animate-pulse"></span>
        <div class="relative flex items-center justify-center h-9 w-9 rounded-full bg-[#111625] border-2 border-[#10B981] shadow-lg text-white">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#10B981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            <polyline points="9 22 9 12 15 12 15 22"></polyline>
          </svg>
        </div>
      </div>
    `;

    const homeIcon = L.divIcon({
      html: homeHtml,
      className: "custom-map-icon",
      iconSize: [36, 36],
      iconAnchor: [18, 18],
    });

    const homeMarker = L.marker(homeCoords, { icon: homeIcon })
      .addTo(map)
      .bindPopup(
        `<div style="color: #FFF; background: #111625; padding: 4px; font-family: sans-serif; font-size: 11px;">
           <strong style="color: #10B981;">Parijata Mansion</strong><br/>
           Flat B-1, 2nd Stage, Indiranagar
         </div>`
      );
    homeMarkerRef.current = homeMarker;

  }, [order.restaurantId, order.restaurantName]);

  // Handle Driver Marker Positioning updates dynamically
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Driver Partner is on spot and moving
    const activeDriver = order.status !== "PENDING" && order.status !== "ACCEPTED" && order.status !== "CANCELLED";

    if (driverMarkerRef.current) {
      map.removeLayer(driverMarkerRef.current);
    }

    if (activeDriver) {
      const driverCoords = getDriverCoords();

      const riderHtml = `
        <div class="relative flex items-center justify-center">
          <span class="absolute inline-flex h-10 w-10 rounded-full bg-[#FFC107]/40 animate-ping"></span>
          <div class="relative flex items-center justify-center h-10 w-10 rounded-full bg-[#FFC107] border-2 border-slate-900 shadow-2xl text-slate-900">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="1" y="3" width="15" height="13" rx="2" ry="2"></rect>
              <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
              <circle cx="5.5" cy="18.5" r="2.5"></circle>
              <circle cx="18.5" cy="18.5" r="2.5"></circle>
            </svg>
          </div>
        </div>
      `;

      const riderIcon = L.divIcon({
        html: riderHtml,
        className: "custom-map-icon",
        iconSize: [40, 40],
        iconAnchor: [20, 20],
      });

      const driverMarker = L.marker(driverCoords, { icon: riderIcon })
        .addTo(map)
        .bindPopup(
          `<div style="color: #111; background: #FFF; padding: 6px; border-radius: 6px; font-family: sans-serif; font-size: 11px; font-weight: bold;">
             🏍️ Driver: ${order.driverName || "Rakesh Kumar"}<br/>
             <span style="color: #E67E22; font-size: 10px;">Status: ${order.status === "DELIVERED" ? "Delivered!" : "En Route towards you!"}</span>
           </div>`
        );
      driverMarkerRef.current = driverMarker;

      // Pan to follow driver if they are moving
      if (order.status === "OUT_FOR_DELIVERY") {
        map.panTo(driverCoords, { animate: true });
      }
    }
  }, [driverFraction, order.status, order.driverName]);

  return (
    <div className="relative w-full h-full">
      {/* Target Container for Leaflet Canvas */}
      <div ref={mapContainerRef} className="w-full h-full z-0" />

      {/* Modern map widgets overlay */}
      <div className="absolute top-3 left-3 bg-[#111625]/90 border border-gray-800 backdrop-blur-md px-3 py-2 rounded-xl z-2 shadow-lg flex flex-col gap-1 pointer-events-none">
        <div className="flex items-center gap-1.5 font-display font-extrabold text-[#F3F4F6] text-xs">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
          REAL-TIME SPOT GPS
        </div>
        <p className="text-[9px] text-[#94A3B8] font-mono">
          Route: Indiranagar 100ft ⇆ metro-grid-KA
        </p>
      </div>

      <div className="absolute bottom-3 right-3 bg-[#111625]/90 border border-gray-800 backdrop-blur-md px-3 py-1.5 rounded-lg z-2 shadow-md text-[9px] font-mono text-[#F3F4F6]/85 flex items-center gap-1">
        🛰️ WebMaps HD · Bengalurugrid Layer
      </div>
    </div>
  );
}
