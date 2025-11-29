import maplibregl from "maplibre-gl";

// hằng số mặc định (có thể override qua options)
const DEFAULTS = {
    GEOJSON_URL: "/data/dongnai-95-demo.geojson",
    SOURCE_ID: "dongnai-communes",
    LAYER_FILL: "commune-fill",
    LAYER_LINE: "commune-line",
    LAYER_HL: "commune-highlight",
    LAYER_LABEL: "commune-label",
    FILL: "#2563eb",
    HL: "#22c55e",
    LINE: "#1f2937",
};

function featureBounds(f) {
    let minX = 180, minY = 90, maxX = -180, maxY = -90;
    const geom = f.geometry;
    const polys = geom?.type === "Polygon" ? geom.coordinates
        : geom?.type === "MultiPolygon" ? geom.coordinates.flat() : [];
    for (const ring of polys) for (const [x, y] of ring) {
        if (x < minX) minX = x; if (x > maxX) maxX = x;
        if (y < minY) minY = y; if (y > maxY) maxY = y;
    }
    return [[minX, minY], [maxX, maxY]];
}
function fcBounds(fc) {
    let minX = 180, minY = 90, maxX = -180, maxY = -90;
    for (const f of fc.features || []) {
        const [[x0, y0], [x1, y1]] = featureBounds(f);
        if (x0 < minX) minX = x0; if (x1 > maxX) maxX = x1;
        if (y0 < minY) minY = y0; if (y1 > maxY) maxY = y1;
    }
    return [[minX, minY], [maxX, maxY]];
}
function bboxCenter(b) {
    const [[x0, y0], [x1, y1]] = b;
    return [(x0 + x1) / 2, (y0 + y1) / 2];
}

/**
 * Đảm bảo source + layers xã/phường và bind click.
 * @param {maplibregl.Map} map
 * @param {{ setSelectedPoi: Function } & Partial<typeof DEFAULTS>} options
 */
export async function ensureCommuneLayers(map, options = {}) {
    const opt = { ...DEFAULTS, ...options };
    const { GEOJSON_URL, SOURCE_ID, LAYER_FILL, LAYER_LINE, LAYER_HL, LAYER_LABEL, FILL, HL, LINE, setSelectedPoi } = opt;

    if (map.__dnCommuneLoading) return;
    try {
        if (!map.getSource(SOURCE_ID)) {
            map.__dnCommuneLoading = true;
            const res = await fetch(GEOJSON_URL);
            const fc = await res.json();
            if (!fc || fc.type !== "FeatureCollection") throw new Error("GeoJSON invalid: cần FeatureCollection");

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
                map.setFilter(LAYER_HL, ["==", ["get", "id"], id]);

                const fb = featureBounds(f);
                const [cx, cy] = bboxCenter(fb);
                map.fitBounds(fb, { padding: 80, duration: 900, maxZoom: 13 });

                setSelectedPoi?.({
                    id, name: f.properties?.name, category: "commune",
                    lng: cx, lat: cy,
                    address: `${f.properties?.type || ""} ${f.properties?.name || ""}, ${f.properties?.district || ""}`,
                    images: [], desc: f.properties?.note || "Thông tin đang cập nhật",
                });
            });
            map.__dnCommuneEventsBound = true;
        }
    } catch (err) {
        console.error("Commune layer error:", err);
        map.__dnCommuneLoading = false;
    }
}
