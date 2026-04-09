import { useEffect, useMemo, useState } from "react";
import type { BoundaryGeoJson, BoundaryState, MapMarker } from "@geosurvey-ai/shared";
import { MapView } from "./MapView";
import { apiDelete, apiPost } from "../lib/api";

type Props = {
  jobId: string;
  pointsGeojson?: Record<string, unknown>;
  initialBoundary?: BoundaryGeoJson | null;
  initialMarker?: MapMarker | null;
  onBoundarySaved: () => void;
};

type DraftVertex = [number, number];

function makeDraftBoundary(vertices: DraftVertex[]): BoundaryGeoJson | null {
  if (vertices.length < 3) {
    return null;
  }

  const closedRing = [...vertices, vertices[0]];
  return {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        properties: { name: "Draft boundary" },
        geometry: {
          type: "Polygon",
          coordinates: [closedRing]
        }
      }
    ]
  };
}

function combineGeojson(boundary: BoundaryGeoJson | null, pointsGeojson?: Record<string, unknown>, marker?: DraftVertex | null) {
  const pointFeatures = Array.isArray((pointsGeojson as { features?: unknown[] } | undefined)?.features)
    ? ((pointsGeojson as { features?: unknown[] }).features as unknown[])
    : [];
  const features = [
    ...(boundary?.features ?? []),
    ...pointFeatures,
    ...(marker
      ? [{
          type: "Feature" as const,
          properties: { name: "Placed marker" },
          geometry: { type: "Point" as const, coordinates: [marker[0], marker[1], 0] as [number, number, number] }
        }]
      : [])
  ];

  return features.length > 0 ? { type: "FeatureCollection", features } : undefined;
}

export function BoundaryEditor({ jobId, pointsGeojson, initialBoundary, initialMarker, onBoundarySaved }: Props) {
  const [vertices, setVertices] = useState<DraftVertex[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [marker, setMarker] = useState<DraftVertex | null>(null);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "clearing">("idle");

  useEffect(() => {
    if (initialBoundary?.features[0]?.geometry.type === "Polygon") {
      const ring = initialBoundary.features[0].geometry.coordinates[0] ?? [];
      setVertices(ring.slice(0, -1));
    } else {
      setVertices([]);
    }
  }, [initialBoundary]);

  useEffect(() => {
    if (initialMarker) {
      setMarker([initialMarker.lng, initialMarker.lat]);
      return;
    }
    setMarker(null);
  }, [initialMarker]);

  const draftBoundary = useMemo(() => makeDraftBoundary(vertices), [vertices]);
  const boundaryToSave = draftBoundary ?? initialBoundary ?? null;
  const mapGeojson = useMemo(
    () => combineGeojson(boundaryToSave, pointsGeojson, marker),
    [boundaryToSave, marker, pointsGeojson]
  );
  const canSave = Boolean(boundaryToSave || marker);

  async function saveBoundary() {
    if (!canSave) {
      return;
    }
    setSaveState("saving");
    try {
      const response = await apiPost<BoundaryState>(`/api/jobs/${jobId}/boundary`, {
        boundaryGeojson: boundaryToSave,
        marker: marker ? { lng: marker[0], lat: marker[1] } : null
      });
      setMarker(response.marker ? [response.marker.lng, response.marker.lat] : null);
      setIsDrawing(false);
      onBoundarySaved();
    } finally {
      setSaveState("idle");
    }
  }

  async function clearBoundary() {
    setSaveState("clearing");
    try {
      await apiDelete(`/api/jobs/${jobId}/boundary`);
      setVertices([]);
      setMarker(null);
      setIsDrawing(false);
      onBoundarySaved();
    } finally {
      setSaveState("idle");
    }
  }

  function handleMapClick(lng: number, lat: number) {
    if (isDrawing) {
      setVertices((current) => [...current, [Number(lng.toFixed(6)), Number(lat.toFixed(6))]]);
      return;
    }
    setMarker([Number(lng.toFixed(6)), Number(lat.toFixed(6))]);
  }

  const hasPersistedGeometry = Boolean(initialBoundary || initialMarker);

  return (
    <div className="grid gap-6">
      <section className="space-y-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="space-y-1">
          <strong className="block text-lg font-semibold text-slate-900">Boundary editor</strong>
          <span className="block text-sm leading-6 text-slate-500">Click the map to place a marker, then switch into draw mode to create or revise the saved polygon.</span>
        </div>

        <div className="flex flex-wrap gap-2">
          <button className={isDrawing ? "button-primary" : ""} onClick={() => setIsDrawing((value) => !value)}>
            {isDrawing ? "Finish editing" : initialBoundary ? "Edit polygon" : "Start drawing"}
          </button>
          <button disabled={vertices.length === 0} onClick={() => setVertices((current) => current.slice(0, -1))}>
            Undo vertex
          </button>
          <button disabled={!canSave || saveState !== "idle"} onClick={() => void saveBoundary()}>
            {saveState === "saving" ? "Saving..." : "Save map data"}
          </button>
          <button disabled={saveState !== "idle" || (!initialBoundary && vertices.length === 0 && !initialMarker && !marker)} onClick={() => void clearBoundary()}>
            {saveState === "clearing" ? "Clearing..." : "Clear saved map data"}
          </button>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
            <span className="block text-xs font-medium uppercase tracking-[0.14em] text-slate-500">Draft vertices</span>
            <strong className="mt-2 block text-base font-semibold text-slate-900">{vertices.length}</strong>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
            <span className="block text-xs font-medium uppercase tracking-[0.14em] text-slate-500">Marker</span>
            <strong className="mt-2 block text-base font-semibold text-slate-900">{marker ? "Placed" : "Missing"}</strong>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
            <span className="block text-xs font-medium uppercase tracking-[0.14em] text-slate-500">Draft polygon</span>
            <strong className="mt-2 block text-base font-semibold text-slate-900">{draftBoundary ? "Ready" : "Incomplete"}</strong>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
            <span className="block text-xs font-medium uppercase tracking-[0.14em] text-slate-500">Saved geometry</span>
            <strong className="mt-2 block text-base font-semibold text-slate-900">{hasPersistedGeometry ? "Present" : "None yet"}</strong>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm leading-6 text-slate-600">
          Draft vertices: {vertices.length}. The API will reject polygons with fewer than 3 distinct vertices.
        </div>
        {marker ? (
          <div className="rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm leading-6 text-slate-600">
            Marker placed at {marker[1].toFixed(6)}, {marker[0].toFixed(6)}.
          </div>
        ) : null}
        {vertices.length > 0 ? (
          <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
            <table className="min-w-full border-collapse">
              <thead>
                <tr className="bg-slate-50">
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">#</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Latitude</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">Longitude</th>
                </tr>
              </thead>
              <tbody>
                {vertices.map((vertex, index) => (
                  <tr key={`${vertex[0]}-${vertex[1]}-${index}`} className="border-t border-slate-200">
                    <td className="px-4 py-3 text-sm leading-6 text-slate-700">{index + 1}</td>
                    <td className="px-4 py-3 text-sm leading-6 text-slate-700">{vertex[1].toFixed(6)}</td>
                    <td className="px-4 py-3 text-sm leading-6 text-slate-700">{vertex[0].toFixed(6)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </section>

      <section className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="space-y-1">
          <strong className="block text-lg font-semibold text-slate-900">Boundary map</strong>
          <span className="block text-sm leading-6 text-slate-500">Saved boundary, GNSS points, and the persisted marker are shown together.</span>
        </div>
        <MapView geojson={mapGeojson as never} height="480px" autoFit fitSignal={`${vertices.length}-${marker?.join(",") ?? "none"}`} onMapClick={handleMapClick} />
      </section>
    </div>
  );
}
