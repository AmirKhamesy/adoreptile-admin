import { useEffect, useRef, useState } from "react";

export default function DeliveryRadiusPicker({ value, onChange }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const circleRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);

  const defaultLat = value?.lat || 49.285;
  const defaultLng = value?.lng || -122.855;
  const defaultRadius = value?.radiusKm || 20;

  const valueRef = useRef(value);
  const onChangeRef = useRef(onChange);
  useEffect(() => {
    valueRef.current = value;
    onChangeRef.current = onChange;
  });

  // Update circle radius when prop changes (e.g. from external slider)
  useEffect(() => {
    if (circleRef.current && value?.radiusKm) {
      circleRef.current.setRadius(value.radiusKm * 1000);
    }
  }, [value?.radiusKm]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (mapInstanceRef.current) return;

    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link");
      link.id = "leaflet-css";
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

    let cancelled = false;

    import("leaflet").then((mod) => {
      if (cancelled || !mapRef.current) return;
      if (mapRef.current._leaflet_id) return;

      const L = mod.default;

      delete L.Icon.Default.prototype._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        iconUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        shadowUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
      });

      const initialRadius = valueRef.current?.radiusKm || 20;
      const map = L.map(mapRef.current).setView([defaultLat, defaultLng], 10);

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);

      const marker = L.marker([defaultLat, defaultLng], {
        draggable: true,
      }).addTo(map);

      const circle = L.circle([defaultLat, defaultLng], {
        radius: initialRadius * 1000,
        color: "#3b82f6",
        fillColor: "#93c5fd",
        fillOpacity: 0.2,
        weight: 2,
      }).addTo(map);

      const handlePositionChange = async (lat, lng) => {
        circle.setLatLng([lat, lng]);
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
          );
          const data = await res.json();
          onChangeRef.current({
            ...(valueRef.current || {}),
            lat,
            lng,
            address: data.display_name,
          });
        } catch {
          onChangeRef.current({ ...(valueRef.current || {}), lat, lng });
        }
      };

      marker.on("dragend", () => {
        const pos = marker.getLatLng();
        handlePositionChange(pos.lat, pos.lng);
      });

      map.on("click", (e) => {
        marker.setLatLng(e.latlng);
        handlePositionChange(e.latlng.lat, e.latlng.lng);
      });

      mapInstanceRef.current = map;
      markerRef.current = marker;
      circleRef.current = circle;
    });

    return () => {
      cancelled = true;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
        markerRef.current = null;
        circleRef.current = null;
      }
    };
  }, []);

  async function handleSearch() {
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          searchQuery
        )}&limit=1`
      );
      const data = await res.json();
      if (data[0]) {
        const lat = parseFloat(data[0].lat);
        const lng = parseFloat(data[0].lon);
        if (mapInstanceRef.current && markerRef.current && circleRef.current) {
          mapInstanceRef.current.setView([lat, lng], 10);
          markerRef.current.setLatLng([lat, lng]);
          circleRef.current.setLatLng([lat, lng]);
        }
        onChangeRef.current({
          ...(valueRef.current || {}),
          lat,
          lng,
          address: data[0].display_name,
        });
      }
    } catch (e) {
      console.error("Search failed:", e);
    } finally {
      setSearching(false);
    }
  }

  function handleRadiusChange(ev) {
    const km = Number(ev.target.value);
    if (circleRef.current) {
      circleRef.current.setRadius(km * 1000);
    }
    onChangeRef.current({
      ...(valueRef.current || {}),
      radiusKm: km,
    });
  }

  const currentRadius = value?.radiusKm || defaultRadius;

  return (
    <div>
      <div className="flex gap-2 mb-2">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleSearch();
            }
          }}
          placeholder="Search for an address..."
          style={{ marginBottom: 0 }}
        />
        <button
          type="button"
          onClick={handleSearch}
          disabled={searching}
          className="btn-primary"
          style={{ whiteSpace: "nowrap" }}
        >
          {searching ? "..." : "Search"}
        </button>
      </div>

      <div
        ref={mapRef}
        style={{
          height: "300px",
          borderRadius: "6px",
          border: "1px solid #e5e7eb",
          position: "relative",
          zIndex: 0,
        }}
      />

      {value?.address && (
        <p
          style={{
            fontSize: "0.75rem",
            color: "#6b7280",
            marginTop: "0.375rem",
            marginBottom: 0,
          }}
        >
          {value.address}
        </p>
      )}

      <div style={{ marginTop: "1rem" }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "0.375rem",
          }}
        >
          <label style={{ marginBottom: 0 }}>Max delivery radius</label>
          <span
            style={{
              fontSize: "0.95rem",
              fontWeight: 600,
              color: "#3b82f6",
            }}
          >
            {currentRadius} km
          </span>
        </div>
        <input
          type="range"
          min="1"
          max="150"
          step="1"
          value={currentRadius}
          onChange={handleRadiusChange}
          style={{ width: "100%", accentColor: "#3b82f6" }}
        />
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: "0.7rem",
            color: "#9ca3af",
          }}
        >
          <span>1 km</span>
          <span>150 km</span>
        </div>
      </div>
    </div>
  );
}
