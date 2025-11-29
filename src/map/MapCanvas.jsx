import React, { useEffect, useRef } from "react";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

export default function MapCanvas({
    styleId = "streets",
    BASE_STYLES,
    defaultCenter = { lng: 107.15, lat: 10.95 },
    defaultZoom = 7.8,
    onReady, // (map) => void
    onStyleLoad, // (map) => void
    onError, // (err) => void
}) {
    const containerRef = useRef(null);
    const mapRef = useRef(null);

    useEffect(() => {
        if (!containerRef.current) return;
        const styleUrl = BASE_STYLES[styleId] || BASE_STYLES.streets;

        const map = new maplibregl.Map({
            container: containerRef.current,
            style: styleUrl,
            center: [106.0, 16.0],
            zoom: 2.2,
            pitch: 0,
            bearing: 0,
            attributionControl: false,
            hash: false,
        });

        mapRef.current = map;
        map.addControl(
            new maplibregl.NavigationControl({ visualizePitch: true }),
            "bottom-right"
        );
        map.addControl(
            new maplibregl.ScaleControl({ maxWidth: 120, unit: "metric" })
        );

        const rotateAndFly = (m, targetCenter, targetZoom) => {
            let bearing = 0;
            const spin = () => {
                if (!m || m.isMoving()) return;
                bearing = (bearing + 0.4) % 360;
                m.rotateTo(bearing, { duration: 0 });
                requestAnimationFrame(spin);
            };
            requestAnimationFrame(spin);
            m.flyTo({
                center: targetCenter,
                zoom: targetZoom,
                pitch: 60,
                bearing: 30,
                duration: 6200,
                essential: true,
            });
        };

        map.once("load", () => {
            rotateAndFly(map, [defaultCenter.lng, defaultCenter.lat], defaultZoom);
            onReady?.(map);
        });

        map.on("style.load", () => onStyleLoad?.(map));
        map.on("error", (e) => onError?.(e?.error || e));

        return () => map.remove();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [styleId]);

    return (
        <div
            ref={containerRef}
            className="absolute inset-0"
            style={{ width: "100%", height: "100%" }}
        />
    );
}
