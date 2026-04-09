import type { Feature, FeatureCollection, Geometry } from "geojson";
import maplibregl, { type GeoJSONSource, type Map } from "maplibre-gl";
import { useEffect, useMemo, useRef, useState } from "react";
import { palette } from "../design-system/tokens";

type Props = {
  geojson?: FeatureCollection;
  center?: [number, number];
  zoom?: number;
  onParcelClick?: (feature: Feature) => void;
  onMapClick?: (lng: number, lat: number) => void;
  height?: string;
  autoFit?: boolean;
  fitSignal?: number | string;
};

function fitMapToGeojson(map: Map, geojson?: FeatureCollection) {
  if (!geojson || geojson.features.length === 0) {
    return;
  }

  const bounds = geojson.features.reduce(
    (current, feature) => {
      const geometry = feature.geometry;
      if (geometry.type === "Point") {
        const [lng, lat] = geometry.coordinates;
        return {
          minLng: Math.min(current.minLng, lng),
          maxLng: Math.max(current.maxLng, lng),
          minLat: Math.min(current.minLat, lat),
          maxLat: Math.max(current.maxLat, lat)
        };
      }
      const coordinates =
        geometry.type === "Polygon"
          ? geometry.coordinates.flat()
          : geometry.type === "MultiPolygon"
            ? geometry.coordinates.flat(2)
            : [];
      for (const [lng, lat] of coordinates) {
        current.minLng = Math.min(current.minLng, lng);
        current.maxLng = Math.max(current.maxLng, lng);
        current.minLat = Math.min(current.minLat, lat);
        current.maxLat = Math.max(current.maxLat, lat);
      }
      return current;
    },
    { minLng: Infinity, maxLng: -Infinity, minLat: Infinity, maxLat: -Infinity }
  );

  if (!Number.isFinite(bounds.minLng) || !Number.isFinite(bounds.minLat)) {
    return;
  }

  map.fitBounds(
    [
      [bounds.minLng, bounds.minLat],
      [bounds.maxLng, bounds.maxLat]
    ],
    { padding: 48, duration: 800 }
  );
}

export default function MapViewInner({ geojson, center = [77.5946, 12.9716], zoom = 11, onParcelClick, onMapClick, height = "360px", autoFit = false, fitSignal }: Props) {
  const [popupFeature, setPopupFeature] = useState<Feature<Geometry> | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<Map | null>(null);
  const mapLoadedRef = useRef(false);
  const hasPolygon = useMemo(() => geojson?.features.some((feature) => feature.geometry.type.includes("Polygon")) ?? false, [geojson]);
  const hasPoints = useMemo(() => geojson?.features.some((feature) => feature.geometry.type === "Point") ?? false, [geojson]);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) {
      return;
    }

    mapRef.current = new maplibregl.Map({
      container: mapContainerRef.current,
      style: {
        version: 8,
        sources: {
          "osm-raster-tiles": {
            type: "raster",
            tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
            tileSize: 256,
            attribution: '© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap</a> contributors'
          }
        },
        layers: [
          {
            id: "osm-base-layer",
            type: "raster",
            source: "osm-raster-tiles"
          }
        ]
      },
      center,
      zoom
    });
    mapRef.current.addControl(new maplibregl.NavigationControl(), "top-right");
    mapRef.current.addControl(new maplibregl.ScaleControl({ unit: "metric" }), "bottom-left");

    mapRef.current.on("click", (event) => {
      onMapClick?.(event.lngLat.lng, event.lngLat.lat);
      if (!geojson) {
        return;
      }
      const clicked = geojson.features.find((feature) => {
        if (feature.geometry.type === "Point") {
          const [lng, lat] = feature.geometry.coordinates;
          return Math.abs(event.lngLat.lng - lng) < 0.001 && Math.abs(event.lngLat.lat - lat) < 0.001;
        }
        if (feature.geometry.type === "Polygon" || feature.geometry.type === "MultiPolygon") {
          return Boolean(feature.properties);
        }
        return false;
      });
      if (clicked) {
        setPopupFeature(clicked as Feature<Geometry>);
        onParcelClick?.(clicked);
      }
    });
    mapRef.current.on("load", () => {
      const map = mapRef.current;
      if (!map) {
        return;
      }
      mapLoadedRef.current = true;
      const sourceData = (geojson ?? { type: "FeatureCollection", features: [] }) as GeoJSON.FeatureCollection;
      map.addSource("survey-geojson", { type: "geojson", data: sourceData });
      map.addLayer({
        id: "parcel-fill",
        type: "fill",
        source: "survey-geojson",
        filter: ["in", ["geometry-type"], ["literal", ["Polygon", "MultiPolygon"]]],
        paint: { "fill-color": palette.green[600], "fill-opacity": 0.35 }
      });
      map.addLayer({
        id: "parcel-outline",
        type: "line",
        source: "survey-geojson",
        filter: ["in", ["geometry-type"], ["literal", ["Polygon", "MultiPolygon"]]],
        paint: { "line-color": palette.green[700], "line-width": 2 }
      });
      map.addLayer({
        id: "points",
        type: "circle",
        source: "survey-geojson",
        filter: ["==", ["geometry-type"], "Point"],
        paint: {
          "circle-radius": 5,
          "circle-color": [
            "match",
            ["get", "accuracyClass"],
            "good",
            palette.green[600],
            "fair",
            palette.red[400],
            "poor",
            palette.red[600],
            palette.green[500]
          ],
          "circle-stroke-width": 1.5,
          "circle-stroke-color": palette.gray[50]
        }
      });
      if (autoFit) {
        fitMapToGeojson(map, geojson);
      }
    });

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
      mapLoadedRef.current = false;
    };
  }, [center, geojson, onMapClick, onParcelClick, zoom]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoadedRef.current) {
      return;
    }

    const sourceId = "survey-geojson";
    const existingSource = map.getSource(sourceId) as GeoJSONSource | undefined;
    existingSource?.setData((geojson ?? { type: "FeatureCollection", features: [] }) as GeoJSON.FeatureCollection);
    if (map.getLayer("parcel-fill")) {
      map.setLayoutProperty("parcel-fill", "visibility", hasPolygon ? "visible" : "none");
    }
    if (map.getLayer("points")) {
      map.setLayoutProperty("points", "visibility", hasPoints ? "visible" : "none");
    }
    if (autoFit) {
      fitMapToGeojson(map, geojson);
    }
  }, [geojson, hasPoints, hasPolygon]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || autoFit) {
      return;
    }

    map.easeTo({ center, zoom, duration: 800 });
  }, [autoFit, center, zoom]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !autoFit) {
      return;
    }
    fitMapToGeojson(map, geojson);
  }, [autoFit, fitSignal, geojson]);

  return (
    <div className="map-frame" style={{ height }}>
      <div ref={mapContainerRef} style={{ width: "100%", height: "100%" }} />
      {popupFeature ? (
        <div className="card" style={{ position: "absolute", margin: 12, maxWidth: 260 }}>
          <div className="stack">
            <strong>{String((popupFeature.properties ?? {}).name ?? (popupFeature.geometry.type === "Point" ? "GNSS Point" : "Survey Boundary"))}</strong>
            {popupFeature.geometry.type === "Point" ? (
              <>
                <span>Elevation: {String((popupFeature.properties ?? {}).elevation ?? "N/A")}</span>
                <span>Accuracy: {String((popupFeature.properties ?? {}).accuracy ?? "N/A")}</span>
                <span>Timestamp: {String((popupFeature.properties ?? {}).timestamp ?? "N/A")}</span>
              </>
            ) : (
              <span>Area (ha): {String((popupFeature.properties ?? {}).areaHectares ?? "N/A")}</span>
            )}
            <button className="icon-button icon-button-ghost" onClick={() => setPopupFeature(null)} aria-label="Close map popup" title="Close">
              <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true">
                <path d="M6.7 5.3 12 10.6l5.3-5.3 1.4 1.4L13.4 12l5.3 5.3-1.4 1.4L12 13.4l-5.3 5.3-1.4-1.4L10.6 12 5.3 6.7l1.4-1.4Z" />
              </svg>
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
