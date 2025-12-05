import React, { useEffect, useMemo, useRef, useState } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

import { initSmartMapAI } from "/src/ai/brain";
import ChatDock from "./components/ChatDock";
import InfoPanel from "./components/InfoPanel";
import SidebarSlim from "./components/SidebarSlim";
import BaseLayerVertical from "./components/BaseLayerVertical";
import SearchBar from "./components/SearchBar";
import MapCanvas from "./map/MapCanvas";
import { useSpeechRecognition } from "./hooks/useSpeechRecognition";
import { useTextToSpeech } from "./hooks/useTextToSpeech";
import { loadPoiIndex, searchPoi } from "./services/poiIndex";
import { norm } from "./utils/vn";
import MapLoadingOverlay from "./components/MapLoadingOverlay";
import { ProvinceInfoButton, ProvinceInfoOverlay } from "./components/ProvinceInfoPanel";



// ====== Map & Layer constants ======
const GEOJSON_URL = "/data/dongnai-95.geojson"; // đổi sang file thật khi có
const SOURCE_ID = "dongnai-communes";
const LAYER_FILL = "commune-fill";
const LAYER_LINE = "commune-line";
const LAYER_HL = "commune-highlight";
const LAYER_LABEL = "commune-label";

const FILL = "#2563eb"; // xanh
const HL = "#22c55e"; // lục
const LINE = "#1f2937"; // xám đậm

// --- Load Font Awesome CDN (icons for sidebar/buttons) ---
function ensureFontAwesomeCDN() {
  if (typeof document === "undefined") return;
  const hasFA = document.querySelector('link[data-fa-cdn="1"]');
  if (hasFA) return;
  const l = document.createElement("link");
  l.rel = "stylesheet";
  l.href = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css";
  l.setAttribute("data-fa-cdn", "1");
  document.head.appendChild(l);
}

// --- Safe env reader ---
function getEnv(name) {
  try {
    if (typeof import.meta !== "undefined" && import.meta.env && name in import.meta.env) {
      return import.meta.env[name];
    }
  } catch { }
  try {
    if (typeof process !== "undefined" && process.env && name in process.env) {
      return process.env[name];
    }
  } catch { }
  try {
    if (typeof window !== "undefined" && window.__ENV__ && name in window.__ENV__) {
      return window.__ENV__[name];
    }
  } catch { }
  return undefined;
}

const RAW_KEY = getEnv("VITE_MAPTILER_KEY");
const HAS_KEY = !!RAW_KEY && RAW_KEY !== "YOUR_MAPTILER_KEY";

// Base style URLs. Khi thiếu key sẽ dùng DEMO style của MapLibre (không cần key).
const DEMO_STYLE = "https://demotiles.maplibre.org/style.json";
const BASE_STYLES = {
  satellite: HAS_KEY ? `https://api.maptiler.com/maps/hybrid/style.json?key=${RAW_KEY}` : DEMO_STYLE,
  streets: HAS_KEY ? `https://api.maptiler.com/maps/streets-v2/style.json?key=${RAW_KEY}` : DEMO_STYLE,
  terrain: HAS_KEY ? `https://api.maptiler.com/maps/terrain/style.json?key=${RAW_KEY}` : DEMO_STYLE,
};

const CATEGORIES = [
  { id: "school", label: "Trường học" },
  { id: "hospital", label: "Bệnh viện" },
  { id: "market", label: "Chợ" },
  { id: "fuel", label: "Cây xăng" },
  { id: "tourism", label: "Du lịch" },
];

// ====== Geo helpers for fitBounds ======
function featureBounds(f) {
  let minX = 180, minY = 90, maxX = -180, maxY = -90;
  const geom = f.geometry;
  const polys = geom.type === "Polygon" ? geom.coordinates
    : geom.type === "MultiPolygon" ? geom.coordinates.flat()
      : [];
  for (const ring of polys) for (const [x, y] of ring) {
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  }
  return [[minX, minY], [maxX, maxY]];
}
function fcBounds(fc) {
  let minX = 180, minY = 90, maxX = -180, maxY = -90;
  for (const f of fc.features || []) {
    const [[x0, y0], [x1, y1]] = featureBounds(f);
    if (x0 < minX) minX = x0;
    if (x1 > maxX) maxX = x1;
    if (y0 < minY) minY = y0;
    if (y1 > maxY) maxY = y1;
  }
  return [[minX, minY], [maxX, maxY]];
}
function bboxCenter(b) {
  const [[x0, y0], [x1, y1]] = b;
  return [(x0 + x1) / 2, (y0 + y1) / 2];
}

function detectCategoryId(text) {
  const n = norm(text);
  console.log("tw dang tim la : ", n);

  // chỉ bắt các query đúng tên filter, không bắt chuỗi dài
  if (n === "cay xang") return "fuel";
  if (n === "truong hoc") return "school";
  if (n === "benh vien") return "hospital";
  if (n === "cho") return "market";
  if (n === "du lich") return "tourism";

  return null;
}



export default function DongNaiSmartMap() {
  const mapRef = useRef(null);
  const [styleId, setStyleId] = useState("streets");

  const [activeCat, setActiveCat] = useState(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [communeReady, setCommuneReady] = useState(false);

  const allReady = mapLoaded && communeReady;

  const [poiList, setPoiList] = useState([]);
  const [loadingPoi, setLoadingPoi] = useState(false);
  const [selectedPoi, setSelectedPoi] = useState(null);
  // speech in: nhận câu hỏi bằng giọng nói
  const speech = useSpeechRecognition({ lang: "vi-VN" });

  // speech out: đọc câu trả lời
  const tts = useTextToSpeech({ lang: "vi-VN" });

  // flag để auto đọc khi câu trả lời là kết quả của voice search
  const [autoReadPending, setAutoReadPending] = useState(false);


  // “Search this area”
  const [showSearchHere, setShowSearchHere] = useState(false);
  const lastSearchBoundsRef = useRef(null);
  const [showProvinceInfo, setShowProvinceInfo] = useState(false);
  const chatDockRef = useRef(null);

  const defaultCenter = useMemo(() => ({ lng: 107.15, lat: 10.95 }), []);
  const defaultZoom = 7.8;
  const dongNaiBounds = useMemo(() => new maplibregl.LngLatBounds([106.6, 10.4], [107.5, 11.4]), []);

  useEffect(() => { ensureFontAwesomeCDN(); }, []);

  //load POI
  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoadingPoi(true);
        const list = await loadPoiIndex(); // đọc /data/pois.json
        if (!cancelled) setPoiList(list || []);
      } catch (e) {
        console.warn("Không load được POI:", e);
      } finally {
        if (!cancelled) setLoadingPoi(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);


  // ====== Commune layers (inside App to access setSelectedPoi) ======
  async function ensureCommuneLayers(map) {
    if (map.__dnCommuneLoading) return;
    map.__dnCommuneLoading = true;

    try {
      if (!map.getSource(SOURCE_ID)) {
        const res = await fetch(GEOJSON_URL);
        if (!res.ok) throw new Error(`GeoJSON HTTP ${res.status}`);
        const fc = await res.json();
        if (!fc || fc.type !== "FeatureCollection") {
          console.error("GeoJSON invalid: cần FeatureCollection");
          map.__dnCommuneLoading = false;
          return;
        }
        map.addSource(SOURCE_ID, { type: "geojson", data: fc });

        const b = fcBounds(fc);
        const pad = 0.08;
        map.setMaxBounds([[b[0][0] - pad, b[0][1] - pad], [b[1][0] + pad, b[1][1] + pad]]);
        map.fitBounds(b, { padding: 60, duration: 1200, maxZoom: 10.8 });
        map.__dnCommuneLoading = false;
      }

      if (!map.getLayer(LAYER_FILL)) {
        map.addLayer({ id: LAYER_FILL, type: "fill", source: SOURCE_ID, paint: { "fill-color": FILL, "fill-opacity": 0.18 } });
      }
      if (!map.getLayer(LAYER_LINE)) {
        map.addLayer({ id: LAYER_LINE, type: "line", source: SOURCE_ID, paint: { "line-color": LINE, "line-width": 1 } });
      }
      if (!map.getLayer(LAYER_HL)) {
        map.addLayer({ id: LAYER_HL, type: "fill", source: SOURCE_ID, paint: { "fill-color": HL, "fill-opacity": 0.35 }, filter: ["==", ["get", "id"], ""] });
      }
      if (!map.getLayer(LAYER_LABEL)) {
        map.addLayer({
          id: LAYER_LABEL, type: "symbol", source: SOURCE_ID,
          layout: { "text-field": ["get", "name"], "text-size": 11, "text-allow-overlap": false },
          paint: { "text-halo-color": "#fff", "text-halo-width": 1.2 },
        });
      }

      if (!map.__dnCommuneEventsBound) {
        map.on("mouseenter", LAYER_FILL, () => (map.getCanvas().style.cursor = "pointer"));
        map.on("mouseleave", LAYER_FILL, () => (map.getCanvas().style.cursor = ""));
        map.on("click", LAYER_FILL, (e) => {
          const f = e.features?.[0]; if (!f) return;
          const id = f.properties?.id || "";
          const p = f.properties || {};
          const code = String(p.code || p.id || "").trim();
          const geoId = String(p.id || code || "").trim();
          map.setFilter(LAYER_HL, ["==", ["get", "id"], id]);

          const fb = featureBounds(f);
          const [cx, cy] = bboxCenter(fb);
          map.fitBounds(fb, { padding: 80, duration: 900, maxZoom: 13 });

          setSelectedPoi({
            id: geoId,
            code,
            name: f.properties?.name,
            category: "commune",
            lng: cx,
            lat: cy,
            address: `${f.properties?.type || ""} ${f.properties?.name || ""}, ${f.properties?.district || ""}`,
            images: [],
            desc: f.properties?.note || "Thông tin đang cập nhật",
          });
        });
        map.__dnCommuneEventsBound = true;
      }
    } catch (err) {
      console.error("Commune layer error:", err);
      map.__dnCommuneLoading = false;
    } finally {
      map.__dnCommuneLoading = false;
    }
  }

  // ====== POI markers ======
  const markerRefs = useRef([]);
  function clearMarkers() {
    markerRefs.current.forEach((m) => m.remove());
    markerRefs.current = [];
  }

  function addMarker(poi) {
    console.log(">>> ADDING MARKER FOR:", poi.name);
    const el = document.createElement("div");
    el.style.cursor = "pointer";

    // chọn icon theo loại
    let iconClass = "fa-solid fa-location-dot"; // default
    let color = "#ef4444";

    if (poi.type === "market") {
      iconClass = "fa-solid fa-store";  // icon chợ giống SidebarSlim
      color = "#2563eb";                // màu xanh nhẹ, bạn có thể chỉnh
    }
    if (poi.type === "tourism") {
      iconClass = "fa-solid fa-camera";
      color = "#f59e0b"; // vàng du lịch
    }
    if (poi.type === "school") {
      iconClass = "fa-solid fa-school";
      color = "#10b981";
    }
    if (poi.type === "hospital") {
      iconClass = "fa-solid fa-hospital";
      color = "#dc2626";
    }
    if (poi.type === "fuel") {
      iconClass = "fa-solid fa-gas-pump";
      color = "#8b5cf6";
    }

    // render icon
    el.innerHTML = `
        <div class="poi-pin" style="--poi-color:${color}" >
            <i class="${iconClass}" style="color:${color}"></i>
        </div>
    `;

    const marker = new maplibregl.Marker({ element: el, anchor: "bottom", offset: [0, -20] })
      .setLngLat([poi.lng, poi.lat])
      .addTo(mapRef.current);

    // tooltip
    const tooltip = document.createElement("div");
    tooltip.className =
      "pointer-events-none absolute px-2 py-1 text-xs rounded bg-gray-900 text-white shadow";
    tooltip.style.display = "none";
    tooltip.innerText = poi.name;
    document.body.appendChild(tooltip);

    const showTip = (e) => {
      tooltip.style.left = e.pageX + 12 + "px";
      tooltip.style.top = e.pageY + 12 + "px";
      tooltip.style.display = "block";
    };
    const hideTip = () => (tooltip.style.display = "none");

    el.addEventListener("mouseenter", showTip);
    el.addEventListener("mousemove", showTip);
    el.addEventListener("mouseleave", hideTip);

    // ✅ chặn click xuyên xuống layer xã
    el.addEventListener("click", (ev) => {
      ev.stopPropagation();
      ev.preventDefault();

      setSelectedPoi({
        ...poi,
        category: "poi",
        address: [poi.commune, poi.district, poi.province]
          .filter(Boolean)
          .join(", "),
        desc: poi.description,
      });

      mapRef.current?.easeTo({
        center: [poi.lng, poi.lat],
        zoom: 14.5,
        pitch: 55,
        duration: 900,
      });
    });

    markerRefs.current.push(marker);
  }
  function showPoiMarker(poi) {
    console.log(">>> SHOW MARKER:", poi.name);
    if (!mapRef.current) {
      console.warn("Map not ready yet");
      return;
    }
    clearMarkers(); // Xóa marker cũ để map không rối

    addMarker(poi); // Dùng addMarker có sẵn (đảm bảo icon đúng loại)

    // zoom gần hơn tới POI
    mapRef.current?.easeTo({
      center: [poi.lng, poi.lat],
      zoom: 16,        // zoom gần hơn
      pitch: 45,       // nghiêng nhẹ để nhìn đẹp hơn
      bearing: 0,
      duration: 800,
    });
  }


  // vẽ marker theo category + viewport, dùng poiList thật
  function drawMarkersForCategory(category, bounds) {
    clearMarkers();
    if (!category || !mapRef.current) return;

    const b = bounds || mapRef.current.getBounds();
    const west = b.getWest();
    const east = b.getEast();
    const south = b.getSouth();
    const north = b.getNorth();

    const filtered = poiList.filter((p) => {
      const cat = p.category || p.type; // ưu tiên field category, fallback type
      if (cat !== category) return false;
      if (p.lng == null || p.lat == null) return false;
      return (
        p.lng >= west &&
        p.lng <= east &&
        p.lat >= south &&
        p.lat <= north
      );
    });

    filtered.forEach(addMarker);
  }
  useEffect(() => {
    if (!activeCat || !poiList.length || !mapRef.current) return;
    const bounds = mapRef.current.getBounds();
    lastSearchBoundsRef.current = bounds;
    setShowSearchHere(false);
    drawMarkersForCategory(activeCat, bounds);
  }, [activeCat, poiList]);


  function runPoiSearchInView(categoryOverride) {
    const cat = categoryOverride ?? activeCat;
    if (!cat || !mapRef.current) return;

    const bounds = mapRef.current.getBounds();
    lastSearchBoundsRef.current = bounds;
    mapRef.current.__lastSearchZoom = mapRef.current.getZoom();
    setShowSearchHere(false);

    drawMarkersForCategory(cat, bounds);
  }

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const handleMoveEnd = () => {
      if (!activeCat || !lastSearchBoundsRef.current) return;

      const current = map.getBounds();
      const prev = lastSearchBoundsRef.current;

      const c1 = prev.getCenter();
      const c2 = current.getCenter();
      const diffLng = Math.abs(c1.lng - c2.lng);
      const diffLat = Math.abs(c1.lat - c2.lat);

      // nếu người dùng kéo map đi xa một chút thì bật nút
      if (diffLng > 0.01 || diffLat > 0.01) {
        setShowSearchHere(true);
      }
    };

    map.on("moveend", handleMoveEnd);
    return () => map.off("moveend", handleMoveEnd);
  }, [activeCat]);

  function handleSelectCategory(id) {
    setSelectedPoi(null);

    if (activeCat === id) {
      setActiveCat(null);
      clearMarkers();
      setShowSearchHere(false);
      lastSearchBoundsRef.current = null;
      return;
    }

    setActiveCat(id);
    if (mapRef.current) {
      runPoiSearchInView(id);
    }
  }

  function handleClearFilters() {
    setActiveCat(null);
    setSelectedPoi(null);
    clearMarkers();
    setShowSearchHere(false);
    lastSearchBoundsRef.current = null;
  }


  // ====== AI & Search ======
  const aiRef = useRef(null);
  useEffect(() => {
    aiRef.current = initSmartMapAI({ mapRef, setSelectedPoi, geojsonUrl: GEOJSON_URL });
  }, []);


  async function handleSearch(q) {
    const text = (q || "").trim();
    if (!text) return;

    console.log("SEARCH TEXT:", text);
    console.log("POI LIST LENGTH:", poiList.length);

    // 1) ƯU TIÊN: nếu query đúng tên 1 filter → xử lý như click filter
    const catId = detectCategoryId(text);
    if (catId) {
      console.log("DETECTED CATEGORY FROM QUERY:", catId);

      setSelectedPoi(null);
      setActiveCat(catId);

      if (mapRef.current) {
        runPoiSearchInView(catId);   // vẽ tất cả POI thuộc category này trong viewport
      }
      return;
    }

    // 2) Nếu không phải category → tìm POI cụ thể
    const poiMatches = searchPoi(text, poiList, 1);
    console.log("POI matches:", poiMatches);

    const poi = poiMatches[0];
    if (poi && mapRef.current) {
      console.log("FOUND POI:", poi);

      setSelectedPoi({
        ...poi,
        category: "poi",
        address: [poi.commune, poi.district, poi.province]
          .filter(Boolean)
          .join(", "),
        desc: poi.description,
      });

      showPoiMarker(poi);   // zoom gần + ghim marker
      return;
    }

    // 3) Không phải POI, không phải category → thử giao cho AI (tên xã, mô tả tự do…)
    if (aiRef.current) {
      const handled = await aiRef.current.handleSearchQuery(text);
      if (handled) return;
    }

    // 4) fallback: đưa map về trung tâm
    mapRef.current?.easeTo({
      center: [defaultCenter.lng, defaultCenter.lat],
      zoom: defaultZoom,
      pitch: 0,
      duration: 800,
    });
  }



  return (
    <div className="w-screen h-screen relative bg-gray-100">
      {/* Map */}
      {!allReady && <MapLoadingOverlay />}
      <MapCanvas
        styleId={styleId}
        BASE_STYLES={BASE_STYLES}
        defaultCenter={defaultCenter}
        defaultZoom={defaultZoom}
        onReady={(map) => {
          mapRef.current = map;
          setMapLoaded(true); // base map ok
        }}
        onStyleLoad={async (map) => {
          await ensureCommuneLayers(map);
          setCommuneReady(true);    // geojson + layer xong => cho phép tắt overlay
          if (activeCat) runPoiSearchInView(activeCat);
        }}
        onError={(e) => console.error("MapLibre error:", e)}
      />

      {/* Banner thiếu key */}
      {!HAS_KEY && (
        <div className="absolute right-3 top-3 z-20 rounded-xl bg-amber-500/90 text-white text-xs px-3 py-2 shadow">
          Không thấy <code>VITE_MAPTILER_KEY</code>. Đang dùng DEMO style. Thêm file <code>.env</code> với <code>VITE_MAPTILER_KEY=...</code>.
        </div>
      )}

      {allReady && (
        <>

          {/* UI */}
          <BaseLayerVertical styleId={styleId} setBase={setStyleId} />
          <div className="absolute left-3 top-3 z-20 w-[240px] space-y-2">
            <SidebarSlim
              activeCat={activeCat}
              onSelectCat={handleSelectCategory}
              resetCamera={() =>
                mapRef.current?.fitBounds(dongNaiBounds, {
                  padding: 80,
                  duration: 900,
                  maxZoom: 10,
                })
              }
              onClear={handleClearFilters}
            />

            {/* Nút nằm ngoài sidebar, ngay bên dưới, rộng bằng sidebar */}
            <ProvinceInfoButton onClick={() => setShowProvinceInfo(true)} />
          </div>

          <SearchBar onSearch={handleSearch} speech={speech} />
          {activeCat && showSearchHere && (
            <div className="absolute left-1/2 top-20 -translate-x-1/2 z-20">
              <button
                onClick={() => runPoiSearchInView()}
                className="px-3 py-1.5 rounded-full bg-white shadow-md text-xs ring-1 ring-gray-300 hover:bg-gray-50 flex items-center gap-1"
              >
                <i className="fa-solid fa-magnifying-glass-location" />
                <span>Tìm kiếm ở khu vực này</span>
              </button>
            </div>
          )}


          {selectedPoi && (
            <InfoPanel
              poi={selectedPoi}
              onClose={() => setSelectedPoi(null)}
              tts={tts}
              autoReadPending={autoReadPending}
              onAutoReadDone={() => setAutoReadPending(false)}
            />
          )}

          <ProvinceInfoOverlay
            open={showProvinceInfo}
            onClose={() => setShowProvinceInfo(false)}
            onAskAssistant={() => {
              chatDockRef.current?.openAndFocus?.();
            }}
          />

          <ChatDock
            ref={chatDockRef}
            onAsk={async (text, ui) => {
              // Ẩn InfoPanel khi người dùng chuyển sang chat
              setSelectedPoi(null);
              await aiRef.current?.handleChatQuery(text, ui);
            }}
          />

        </>
      )}
    </div>
  );
}

// ========== Dev Smoke Tests ==========
function runSmokeTests() {
  const results = [];
  results.push({ name: "env-read", pass: typeof RAW_KEY === "string" || RAW_KEY === undefined });
  results.push({ name: "styles-exist", pass: typeof BASE_STYLES.streets === "string" });
  results.push({ name: "fallback-when-missing-key", pass: !HAS_KEY ? BASE_STYLES.streets === DEMO_STYLE : true });
  console.group("SmartMap smoke tests");
  console.table(results);
  console.groupEnd();
}
if (typeof window !== "undefined") {
  const params = new URLSearchParams(window.location.search);
  if (params.get("test") === "1") runSmokeTests();
}
