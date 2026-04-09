import { parse } from "csv-parse/sync";
import proj4 from "proj4";
import type { FileType, GnssPoint } from "@geosurvey-ai/shared";

type CsvRecord = Record<string, string>;
type ReprojectablePoint = { lat: number; lng: number; [key: string]: unknown };
type BoundaryGeoJson = {
  type: "FeatureCollection";
  features: Array<{
    type: "Feature";
    properties: Record<string, unknown>;
    geometry:
      | { type: "Polygon"; coordinates: Array<Array<[number, number]>> }
      | { type: "MultiPolygon"; coordinates: Array<Array<Array<[number, number]>>> };
  }>;
};
type ParsedGnssCsv = {
  points: GnssPoint[];
  invalidRows: number;
  averageAccuracy: number;
};

const projCache = new Map<number, string>();
const headerAliases = {
  lat: ["lat", "latitude"],
  lng: ["lng", "lon", "longitude"],
  elevation: ["elev", "elevation", "alt", "altitude"],
  accuracy: ["acc", "accuracy"],
  timestamp: ["time", "timestamp", "datetime"]
} as const;

function getColumnValue(record: CsvRecord, aliases: readonly string[]) {
  const key = Object.keys(record).find((candidate) => aliases.includes(candidate.trim().toLowerCase()));
  return key ? record[key] : undefined;
}

function toNumber(value: string | undefined) {
  if (value === undefined || value.trim() === "") {
    return null;
  }
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function resolveProjDef(epsg: number) {
  if (!projCache.has(epsg)) {
    projCache.set(epsg, `EPSG:${epsg}`);
  }
  return projCache.get(epsg)!;
}

function parseGnssCSVInternal(buffer: Buffer): ParsedGnssCsv {
  const records = parse(buffer, { columns: true, skip_empty_lines: true, trim: true }) as CsvRecord[];
  const rows = records.map((record, index) => ({
    id: `csv-${index + 1}`,
    jobId: "",
    lat: toNumber(getColumnValue(record, headerAliases.lat)),
    lng: toNumber(getColumnValue(record, headerAliases.lng)),
    elevation: toNumber(getColumnValue(record, headerAliases.elevation)) ?? 0,
    accuracy: toNumber(getColumnValue(record, headerAliases.accuracy)) ?? 0,
    timestamp: getColumnValue(record, headerAliases.timestamp) ?? new Date(0).toISOString()
  }));

  const points = rows
    .filter((row): row is GnssPoint => row.lat !== null && row.lng !== null)
    .map((row) => ({ ...row, lat: row.lat, lng: row.lng }));
  const invalidRows = rows.length - points.length;
  const averageAccuracy = points.length
    ? Number((points.reduce((sum, point) => sum + point.accuracy, 0) / points.length).toFixed(2))
    : 0;

  return { points, invalidRows, averageAccuracy };
}

export function parseGnssCSV(buffer: Buffer): GnssPoint[] {
  return parseGnssCSVInternal(buffer).points;
}

export function parseGnssCSVWithSummary(buffer: Buffer): ParsedGnssCsv {
  return parseGnssCSVInternal(buffer);
}

export function reprojectPoints<T extends ReprojectablePoint>(points: T[], fromEPSG: number, toEPSG: number): T[] {
  if (fromEPSG === toEPSG) {
    return points;
  }
  const from = resolveProjDef(fromEPSG);
  const to = resolveProjDef(toEPSG);
  return points.map((point) => {
    const [lng, lat] = proj4(from, to, [point.lng, point.lat]);
    return { ...point, lat, lng };
  });
}

export function calculateBoundingBox(points: Array<Pick<GnssPoint, "lat" | "lng">>) {
  if (points.length === 0) {
    return { minLat: 0, maxLat: 0, minLng: 0, maxLng: 0, centerLat: 0, centerLng: 0 };
  }

  const lats = points.map((point) => point.lat);
  const lngs = points.map((point) => point.lng);
  const minLat = Math.min(...lats);
  const maxLat = Math.max(...lats);
  const minLng = Math.min(...lngs);
  const maxLng = Math.max(...lngs);
  return { minLat, maxLat, minLng, maxLng, centerLat: (minLat + maxLat) / 2, centerLng: (minLng + maxLng) / 2 };
}

type HullPoint = { x: number; y: number };

function cross(o: HullPoint, a: HullPoint, b: HullPoint) {
  return (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
}

export function computeConvexHull(points: Array<Pick<GnssPoint, "lat" | "lng">>) {
  if (points.length < 3) {
    const ring = points.map((point) => `${point.lng} ${point.lat}`);
    if (ring.length > 0) {
      ring.push(ring[0]);
    }
    return `POLYGON((${ring.join(", ")}))`;
  }

  const sorted = points.map((point) => ({ x: point.lng, y: point.lat })).sort((a, b) => (a.x === b.x ? a.y - b.y : a.x - b.x));
  const lower: HullPoint[] = [];
  for (const point of sorted) {
    while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], point) <= 0) {
      lower.pop();
    }
    lower.push(point);
  }

  const upper: HullPoint[] = [];
  for (const point of [...sorted].reverse()) {
    while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], point) <= 0) {
      upper.pop();
    }
    upper.push(point);
  }

  const hull = lower.slice(0, -1).concat(upper.slice(0, -1));
  const ring = hull.map((point) => `${point.x} ${point.y}`);
  ring.push(ring[0]);
  return `POLYGON((${ring.join(", ")}))`;
}

export function calculateAreaHectares(wktPolygon: string) {
  const coords = wktPolygon
    .replace("POLYGON((", "")
    .replace("))", "")
    .split(",")
    .map((pair) => pair.trim().split(/\s+/).map(Number))
    .filter((pair) => pair.length === 2 && pair.every((value) => Number.isFinite(value)));

  let area = 0;
  for (let index = 0; index < coords.length - 1; index += 1) {
    const [x1, y1] = coords[index];
    const [x2, y2] = coords[index + 1];
    area += x1 * y2 - x2 * y1;
  }

  // use PostGIS for production accuracy
  return Math.abs(area / 2) / 10_000;
}

export function calculateAreaSqMFromBoundary(boundary: BoundaryGeoJson | null | undefined) {
  if (!boundary || boundary.features.length === 0) {
    return 0;
  }

  const feature = boundary.features[0];
  const rings = feature.geometry.type === "Polygon"
    ? feature.geometry.coordinates
    : feature.geometry.coordinates[0];
  const ring = rings[0] ?? [];
  if (ring.length < 4) {
    return 0;
  }

  let area = 0;
  for (let index = 0; index < ring.length - 1; index += 1) {
    const [x1, y1] = ring[index];
    const [x2, y2] = ring[index + 1];
    area += x1 * y2 - x2 * y1;
  }

  return Math.abs(area / 2);
}

export function validateFileExtension(fileName: string): FileType | null {
  const ext = fileName.split(".").pop()?.toLowerCase();
  const mapping: Record<string, FileType> = {
    las: "LAS",
    laz: "LAZ",
    tif: "TIFF",
    tiff: "GEOTIFF",
    csv: "CSV",
    shp: "SHP",
    dxf: "DXF",
    pdf: "PDF",
    jpg: "JPG",
    jpeg: "JPG",
    mp4: "MP4"
  };
  return ext ? mapping[ext] ?? null : null;
}
