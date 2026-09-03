"use client";

import React, { useState, useEffect, useRef } from "react";
import { GovernmentVoucher, LocationMerchant } from "@/lib/types";
import { 
  MapPin, 
  Search, 
  Store, 
  Utensils, 
  Navigation, 
  Check, 
  ChevronRight,
  Plus,
  Minus,
  LocateFixed,
  ExternalLink
} from "lucide-react";
import "leaflet/dist/leaflet.css";

export interface VoucherLocationItem {
  id: string;
  name: string;
  category: "Hawker Stalls" | "Supermarkets" | "Appliance Stores" | "Heartland Merchants";
  voucherType: "CDC_Hawker" | "CDC_Supermarket" | "Climate" | "SG60";
  address: string;
  area: string;
  distance: string;
  lat: number;
  lng: number;
  stallsCount?: number;
  featuredDeals?: string;
  isOpen: boolean;
}

export const REAL_SINGAPORE_LOCATIONS: VoucherLocationItem[] = [
  {
    id: "loc-bedok85",
    name: "Bedok 85 Fengshan Food Centre",
    category: "Hawker Stalls",
    voucherType: "CDC_Hawker",
    address: "85 Bedok North St 4, Singapore 460085",
    area: "Bedok",
    distance: "120m away",
    lat: 1.3319,
    lng: 103.9385,
    stallsCount: 42,
    featuredDeals: "Xing Ji Rou Cuo Mian, BBQ Chicken Wings, Sugar Cane",
    isOpen: true,
  },
  {
    id: "loc-fairprice-tamp",
    name: "NTUC FairPrice (Tampines Mall)",
    category: "Supermarkets",
    voucherType: "CDC_Supermarket",
    address: "4 Tampines Central 5, #B1-01, Singapore 529510",
    area: "Tampines",
    distance: "85m away",
    lat: 1.3525,
    lng: 103.9447,
    featuredDeals: "Fresh produce, groceries, dairy (CDC vouchers eligible)",
    isOpen: true,
  },
  {
    id: "loc-sheng-siong-bedok",
    name: "Sheng Siong Supermarket",
    category: "Supermarkets",
    voucherType: "CDC_Supermarket",
    address: "209 New Upper Changi Rd #01-631, Singapore 460209",
    area: "Bedok Central",
    distance: "350m away",
    lat: 1.3242,
    lng: 103.9304,
    featuredDeals: "Live seafood, heartland groceries, household goods",
    isOpen: true,
  },
  {
    id: "loc-old-airport",
    name: "Old Airport Road Food Centre",
    category: "Hawker Stalls",
    voucherType: "CDC_Hawker",
    address: "51 Old Airport Rd, Singapore 390051",
    area: "Geylang / Mountbatten",
    distance: "2.4 km away",
    lat: 1.3082,
    lng: 103.8858,
    stallsCount: 86,
    featuredDeals: "Nam Sing Hokkien Mee, Lao Fu Zhi Fried Kway Teow",
    isOpen: true,
  },
  {
    id: "loc-courts-tamp",
    name: "Courts Megastore",
    category: "Appliance Stores",
    voucherType: "Climate",
    address: "50 Tampines North Dr 2, Singapore 528766",
    area: "Tampines North",
    distance: "1.1 km away",
    lat: 1.3718,
    lng: 103.9332,
    featuredDeals: "5-tick energy refrigerators, LED lights, water-saving fittings",
    isOpen: true,
  },
  {
    id: "loc-maxwell",
    name: "Maxwell Food Centre",
    category: "Hawker Stalls",
    voucherType: "CDC_Hawker",
    address: "1 Kadayanallur St, Singapore 069184",
    area: "Chinatown / CBD",
    distance: "4.8 km away",
    lat: 1.2804,
    lng: 103.8447,
    stallsCount: 54,
    featuredDeals: "Tian Tian Hainanese Chicken Rice, Popiah",
    isOpen: true,
  },
  {
    id: "loc-amk-central",
    name: "Ang Mo Kio Central Market & Food Centre",
    category: "Hawker Stalls",
    voucherType: "CDC_Hawker",
    address: "724 Ang Mo Kio Ave 6, Singapore 560724",
    area: "Ang Mo Kio",
    distance: "3.2 km away",
    lat: 1.3691,
    lng: 103.8483,
    stallsCount: 48,
    featuredDeals: "Fried Carrot Cake, Fishball Noodles",
    isOpen: true,
  },
  {
    id: "loc-toa-payoh",
    name: "Toa Payoh West Market & Food Centre",
    category: "Hawker Stalls",
    voucherType: "CDC_Hawker",
    address: "127 Lor 1 Toa Payoh, Singapore 310127",
    area: "Toa Payoh",
    distance: "3.9 km away",
    lat: 1.3347,
    lng: 103.8492,
    stallsCount: 38,
    featuredDeals: "Chee Cheong Fun, Kopi & Toast",
    isOpen: true,
  },
  {
    id: "loc-giant-tamp",
    name: "Giant Hypermarket",
    category: "Supermarkets",
    voucherType: "SG60",
    address: "21 Tampines North Drive 2, Singapore 528765",
    area: "Tampines Retail Park",
    distance: "1.3 km away",
    lat: 1.3725,
    lng: 103.9328,
    featuredDeals: "Accepts both CDC Supermarket & SG60 Community vouchers",
    isOpen: true,
  },
];

interface VoucherMapScreenProps {
  vouchers: GovernmentVoucher[];
  onSelectSimulatedLocation: (loc: LocationMerchant) => void;
}

export const VoucherMapScreen: React.FC<VoucherMapScreenProps> = ({
  vouchers,
  onSelectSimulatedLocation,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<string>("All");
  const [selectedLocation, setSelectedLocation] = useState<VoucherLocationItem>(REAL_SINGAPORE_LOCATIONS[0]);
  const [simulatedSet, setSimulatedSet] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  const filterOptions = [
    "All",
    "CDC Hawker",
    "CDC Supermarket",
    "Climate Vouchers",
    "SG60",
  ];

  const filteredLocations = REAL_SINGAPORE_LOCATIONS.filter((loc) => {
    const matchesSearch =
      loc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loc.area.toLowerCase().includes(searchQuery.toLowerCase()) ||
      loc.address.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (activeFilter === "CDC Hawker") return loc.voucherType === "CDC_Hawker";
    if (activeFilter === "CDC Supermarket") return loc.voucherType === "CDC_Supermarket";
    if (activeFilter === "Climate Vouchers") return loc.voucherType === "Climate";
    if (activeFilter === "SG60") return loc.voucherType === "SG60";

    return true;
  });

  // Initialize Free OpenStreetMap Leaflet Map
  useEffect(() => {
    if (typeof window === "undefined" || !mapRef.current) return;

    let mapInstance: any = null;

    const initMap = async () => {
      const L = (await import("leaflet")).default;

      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
      }

      mapInstance = L.map(mapRef.current!, {
        center: [1.345, 103.935], // Singapore East / Tampines / Bedok
        zoom: 13,
        zoomControl: false,
        attributionControl: false,
      });

      // Add 100% Free OpenStreetMap Clean Tiles
      L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
        maxZoom: 19,
        subdomains: "abcd",
      }).addTo(mapInstance);

      leafletMapRef.current = mapInstance;
      renderMarkers(L, mapInstance);
    };

    initMap();

    return () => {
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, []);

  // Update Markers when Filter changes
  useEffect(() => {
    if (!leafletMapRef.current || typeof window === "undefined") return;
    import("leaflet").then(({ default: L }) => {
      renderMarkers(L, leafletMapRef.current);
    });
  }, [activeFilter, searchQuery]);

  const renderMarkers = (L: any, map: any) => {
    if (!map) return;

    // Clear existing
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    filteredLocations.forEach((loc) => {
      const isHawker = loc.voucherType === "CDC_Hawker";
      const isClimate = loc.voucherType === "Climate";
      const color = isHawker ? "#D7442A" : isClimate ? "#0F4635" : "#E8A02C";

      const iconHtml = `
        <div style="
          background-color: ${color};
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 13px;
          box-shadow: 0 4px 10px rgba(0,0,0,0.3);
          border: 2px solid white;
          cursor: pointer;
        ">
          ${isHawker ? "🍜" : isClimate ? "⚡" : "🛒"}
        </div>
      `;

      const customIcon = L.divIcon({
        html: iconHtml,
        className: "custom-leaflet-pin",
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      const marker = L.marker([loc.lat, loc.lng], { icon: customIcon }).addTo(map);

      marker.on("click", () => {
        setSelectedLocation(loc);
        map.setView([loc.lat, loc.lng], 15, { animate: true });
      });

      markersRef.current.push(marker);
    });
  };

  // Zoom Controls
  const handleZoomIn = () => leafletMapRef.current?.zoomIn();
  const handleZoomOut = () => leafletMapRef.current?.zoomOut();

  // Zoom to My Current Location
  const handleZoomToMyLocation = () => {
    setIsLocating(true);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          if (leafletMapRef.current) {
            leafletMapRef.current.setView([lat, lng], 16, { animate: true });
          }
          setIsLocating(false);
        },
        () => {
          // Fallback location near Tampines
          if (leafletMapRef.current) {
            leafletMapRef.current.setView([1.3525, 103.9447], 16, { animate: true });
          }
          setIsLocating(false);
        },
        { timeout: 3000 }
      );
    } else {
      if (leafletMapRef.current) {
        leafletMapRef.current.setView([1.3525, 103.9447], 16, { animate: true });
      }
      setIsLocating(false);
    }
  };

  const handleSelectLocationFromList = (loc: VoucherLocationItem) => {
    setSelectedLocation(loc);
    if (leafletMapRef.current) {
      leafletMapRef.current.setView([loc.lat, loc.lng], 15, { animate: true });
    }
  };

  const handleSimulateAtLocation = (loc: VoucherLocationItem) => {
    onSelectSimulatedLocation({
      id: loc.id,
      name: loc.name,
      locationName: loc.area,
      acceptedVouchers: [loc.voucherType as any],
      distanceMeters: parseInt(loc.distance) || 85,
      discountNote: `Accepts ${loc.voucherType.replace("_", " ")} Vouchers near ${loc.area}`,
    });
    setSimulatedSet(true);
    setTimeout(() => setSimulatedSet(false), 2000);
  };

  return (
    <div className="flex flex-col h-full bg-[#FBF6EC] animate-fadeIn font-sans">
      {/* Top Search Bar & Filters */}
      <div className="p-4 bg-[#FBF6EC] border-b border-[#EDE4D6] space-y-3 shrink-0">
        <div>
          <h2 className="font-display font-bold text-xl text-[#1B1815] tracking-tight">
            Voucher Map & Stalls
          </h2>
          <p className="text-xs text-[#6B6259]">
            Live Singapore heartland stalls, hawkers, and supermarkets (100% Free Open Map)
          </p>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-[#8A8075] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search hawkers, supermarkets, Bedok, Tampines..."
            className="w-full pl-9 pr-4 py-2.5 rounded-2xl bg-[#FFFDF8] border border-[#E0D4BF] text-xs text-[#1B1815] placeholder-[#8A8075] focus:outline-none focus:border-[#0F4635] shadow-xs"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 text-xs">
          {filterOptions.map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-3 py-1.5 rounded-full whitespace-nowrap text-xs font-semibold transition ${
                activeFilter === f
                  ? "bg-[#0F4635] text-[#FBF6EC] shadow-xs"
                  : "bg-[#FFFDF8] text-[#584F45] border border-[#E0D4BF] hover:bg-[#F5F1E7]"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Free Real-World OpenStreetMap Live Viewport */}
      <div className="relative h-64 bg-[#E5E3DF] overflow-hidden border-b border-[#E0D4BF]">
        {/* Leaflet Map DOM Mount */}
        <div ref={mapRef} className="w-full h-full z-10" />

        {/* Map UI Controls (Zoom & Locate Me) */}
        <div className="absolute right-3 bottom-3 flex flex-col space-y-1.5 z-30">
          {/* Zoom to Current Location Button */}
          <button
            onClick={handleZoomToMyLocation}
            disabled={isLocating}
            className="p-2 rounded-xl bg-[#FFFDF8] hover:bg-[#F5F1E7] text-[#1B1815] border border-[#D6C9B4] shadow-md transition active:scale-95 flex items-center justify-center cursor-pointer"
            title="Locate Me & Zoom In"
          >
            <LocateFixed className={`w-4 h-4 ${isLocating ? "animate-spin text-[#0F4635]" : "text-[#0F4635]"}`} />
          </button>

          {/* Zoom In */}
          <button
            onClick={handleZoomIn}
            className="p-2 rounded-t-xl bg-[#FFFDF8] hover:bg-[#F5F1E7] text-[#1B1815] border border-[#D6C9B4] shadow-md transition active:scale-95 flex items-center justify-center cursor-pointer"
            title="Zoom In"
          >
            <Plus className="w-4 h-4 text-[#1B1815]" />
          </button>

          {/* Zoom Out */}
          <button
            onClick={handleZoomOut}
            className="p-2 rounded-b-xl bg-[#FFFDF8] hover:bg-[#F5F1E7] text-[#1B1815] border-x border-b border-[#D6C9B4] shadow-md transition active:scale-95 flex items-center justify-center -mt-1.5 cursor-pointer"
            title="Zoom Out"
          >
            <Minus className="w-4 h-4 text-[#1B1815]" />
          </button>
        </div>

        {/* Selected Stall Pill Overlay */}
        <div className="absolute top-3 left-3 bg-[#FFFDF8]/95 backdrop-blur-md border border-[#D6C9B4] px-2.5 py-1 rounded-full text-[10.5px] font-semibold text-[#1B1815] flex items-center gap-1.5 shadow-sm z-30">
          <MapPin className="w-3 h-3 text-[#0F4635]" />
          <span className="truncate max-w-[170px]">{selectedLocation.name}</span>
          <span className="text-[#0F4635] font-bold">({selectedLocation.distance})</span>
        </div>
      </div>

      {/* Selected Location Card & Stalls List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {/* Active Selected Card */}
        <div className="p-4 rounded-2xl bg-[#FFFDF8] border border-[#E0D4BF] shadow-sm space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span
                  className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                    selectedLocation.voucherType === "CDC_Hawker"
                      ? "bg-[#FAE3DD] text-[#8F2A17] border border-[#D7442A]/30"
                      : selectedLocation.voucherType === "Climate"
                      ? "bg-[#DDE8E1] text-[#0F4635] border border-[#0F4635]/30"
                      : "bg-[#F5EAD6] text-[#9A7420] border border-[#E8A02C]/30"
                  }`}
                >
                  Accepts {selectedLocation.voucherType.replace("_", " ")}
                </span>
                <span className="text-[10px] text-[#0F4635] font-semibold">
                  ● Verified Merchant
                </span>
              </div>
              <h3 className="font-display font-bold text-base text-[#1B1815] mt-1">
                {selectedLocation.name}
              </h3>
              <p className="text-xs text-[#6B6259]">
                {selectedLocation.address} • <strong className="text-[#1B1815]">{selectedLocation.distance}</strong>
              </p>
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-[#FBF6EC] border border-[#EDE4D6] text-xs text-[#584F45]">
            <strong className="text-[#1B1815] block mb-0.5">Popular Stalls & Items:</strong>
            {selectedLocation.featuredDeals}
          </div>

          {/* Action Buttons: Simulate Being Here & Directions */}
          <div className="pt-1 flex items-center gap-2">
            <button
              onClick={() => handleSimulateAtLocation(selectedLocation)}
              className="flex-1 py-2 px-3 rounded-xl bg-[#0F4635] hover:bg-[#0A3227] text-[#FBF6EC] text-xs font-semibold flex items-center justify-center gap-1.5 transition shadow-sm cursor-pointer"
            >
              {simulatedSet ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#E8A02C]" />
                  <span>Proximity Alert Active!</span>
                </>
              ) : (
                <>
                  <Navigation className="w-3.5 h-3.5" />
                  <span>Simulate Proximity (Trigger Alert)</span>
                </>
              )}
            </button>

            <a
              href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedLocation.name + " " + selectedLocation.address)}`}
              target="_blank"
              rel="noreferrer"
              className="p-2 rounded-xl bg-[#FFFDF8] hover:bg-[#F5F1E7] border border-[#D6C9B4] text-[#1B1815] text-xs font-semibold flex items-center justify-center transition"
              title="Open Directions in Google Maps"
            >
              <ExternalLink className="w-4 h-4 text-[#8A8075]" />
            </a>
          </div>
        </div>

        {/* Directory List of Stalls & Supermarkets */}
        <div className="space-y-2 pt-1">
          <div className="text-[11px] font-mono-custom font-semibold uppercase tracking-wider text-[#6B6259] px-1">
            Singapore Voucher Directory ({filteredLocations.length})
          </div>

          {filteredLocations.map((loc) => {
            const isSelected = selectedLocation.id === loc.id;

            return (
              <div
                key={loc.id}
                onClick={() => handleSelectLocationFromList(loc)}
                className={`p-3 rounded-2xl border transition cursor-pointer flex items-center justify-between ${
                  isSelected
                    ? "bg-[#FFFDF8] border-[#0F4635] ring-1 ring-[#0F4635]/30 shadow-sm"
                    : "bg-[#FFFDF8] border-[#E0D4BF] hover:border-[#0F4635]/40"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div
                    className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 ${
                      loc.voucherType === "CDC_Hawker"
                        ? "bg-[#FAE3DD] text-[#D7442A]"
                        : loc.voucherType === "Climate"
                        ? "bg-[#DDE8E1] text-[#0F4635]"
                        : "bg-[#F5EAD6] text-[#9A7420]"
                    }`}
                  >
                    {loc.voucherType === "CDC_Hawker" ? (
                      <Utensils className="w-4 h-4" />
                    ) : (
                      <Store className="w-4 h-4" />
                    )}
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#1B1815]">
                      {loc.name}
                    </div>
                    <div className="text-[11px] text-[#8A8075]">
                      {loc.area} • {loc.distance}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-1.5 text-right">
                  <span
                    className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                      loc.voucherType === "CDC_Hawker"
                        ? "bg-[#FAE3DD] text-[#8F2A17]"
                        : loc.voucherType === "Climate"
                        ? "bg-[#DDE8E1] text-[#0F4635]"
                        : "bg-[#F5EAD6] text-[#9A7420]"
                    }`}
                  >
                    {loc.voucherType.replace("_", " ")}
                  </span>
                  <ChevronRight className="w-4 h-4 text-[#8A8075]" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
