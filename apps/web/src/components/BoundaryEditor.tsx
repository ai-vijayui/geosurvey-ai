import { useEffect, useMemo, useState } from "react";
import type { BoundaryGeoJson, BoundaryState, MapMarker } from "@geosurvey-ai/shared";
import { MapView } from "./MapView";
import { GhostButton, PrimaryButton, SecondaryButton } from "./ui/Button";
import { Card } from "./ui/Card";
import { SectionHeader } from "./ui/SectionHeader";
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
      <Card className="space-y-5">
        <SectionHeader title="Boundary editor" subtitle="Click the map to place a marker, then switch into draw mode to create or revise the saved polygon." />

        <div className="flex flex-wrap gap-2">
          {isDrawing ? (
            <PrimaryButton onClick={() => setIsDrawing((value) => !value)}>
              Finish editing
            </PrimaryButton>
          ) : (
            <SecondaryButton onClick={() => setIsDrawing((value) => !value)}>
            {isDrawing ? "Finish editing" : initialBoundary ? "Edit polygon" : "Start drawing"}
            </SecondaryButton>
          )}
          <GhostButton disabled={vertices.length === 0} onClick={() => setVertices((current) => current.slice(0, -1))}>Undo vertex</GhostButton>
          <PrimaryButton disabled={!canSave || saveState !== "idle"} onClick={() => void saveBoundary()}>{saveState === "saving" ? "Saving..." : "Save map data"}</PrimaryButton>
          <GhostButton disabled={saveState !== "idle" || (!initialBoundary && vertices.length === 0 && !initialMarker && !marker)} onClick={() => void clearBoundary()}>{saveState === "clearing" ? "Clearing..." : "Clear saved map data"}</GhostButton>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="ui-metric-tile"><span className="ui-metric-tile__label">Draft vertices</span><strong className="ui-metric-tile__value">{vertices.length}</strong></div>
          <div className="ui-metric-tile"><span className="ui-metric-tile__label">Marker</span><strong className="ui-metric-tile__value">{marker ? "Placed" : "Missing"}</strong></div>
          <div className="ui-metric-tile"><span className="ui-metric-tile__label">Draft polygon</span><strong className="ui-metric-tile__value">{draftBoundary ? "Ready" : "Incomplete"}</strong></div>
          <div className="ui-metric-tile"><span className="ui-metric-tile__label">Saved geometry</span><strong className="ui-metric-tile__value">{hasPersistedGeometry ? "Present" : "None yet"}</strong></div>
        </div>

        <div className="ui-inline-note">
          Draft vertices: {vertices.length}. The API will reject polygons with fewer than 3 distinct vertices.
        </div>
        {marker ? (
          <div className="ui-inline-note">
            Marker placed at {marker[1].toFixed(6)}, {marker[0].toFixed(6)}.
          </div>
        ) : null}
        {vertices.length > 0 ? (
          <div className="ui-table-container">
            <div className="ui-table-container__desktop">
            <table className="ui-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Latitude</th>
                  <th>Longitude</th>
                </tr>
              </thead>
              <tbody>
                {vertices.map((vertex, index) => (
                  <tr key={`${vertex[0]}-${vertex[1]}-${index}`}>
                    <td>{index + 1}</td>
                    <td>{vertex[1].toFixed(6)}</td>
                    <td>{vertex[0].toFixed(6)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </div>
        ) : null}
      </Card>

      <Card className="space-y-4">
        <SectionHeader title="Boundary map" subtitle="Saved boundary, GNSS points, and the persisted marker are shown together." />
        <MapView geojson={mapGeojson as never} height="480px" autoFit fitSignal={`${vertices.length}-${marker?.join(",") ?? "none"}`} onMapClick={handleMapClick} />
      </Card>
    </div>
  );
}
