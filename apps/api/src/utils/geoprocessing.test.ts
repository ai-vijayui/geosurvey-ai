import { describe, expect, it } from "vitest";
import { calculateAreaHectares, calculateAreaSqMFromBoundary, calculateBoundingBox, computeConvexHull, parseGnssCSV, parseGnssCSVWithSummary, reprojectPoints, validateFileExtension } from "./geoprocessing.js";

describe("geoprocessing", () => {
  it("parses GNSS CSV regardless of column order", () => {
    const csv = Buffer.from("timestamp,lon,accuracy,latitude,elevation\n2024-01-01T00:00:00Z,77.1,1.2,12.3,900");
    const points = parseGnssCSV(csv);
    expect(points).toHaveLength(1);
    expect(points[0]).toMatchObject({ lat: 12.3, lng: 77.1, elevation: 900, accuracy: 1.2 });
  });

  it("returns CSV import diagnostics", () => {
    const csv = Buffer.from("time,lat,lon,acc\n2024-01-01T00:00:00Z,12.3,77.1,1.2\n2024-01-01T00:01:00Z,,77.2,1.4");
    const summary = parseGnssCSVWithSummary(csv);
    expect(summary.points).toHaveLength(1);
    expect(summary.invalidRows).toBe(1);
    expect(summary.averageAccuracy).toBe(1.2);
  });

  it("reprojects points", () => {
    const result = reprojectPoints([{ lat: 12.9716, lng: 77.5946 }], 4326, 3857);
    expect(result[0].lat).not.toBe(12.9716);
    expect(result[0].lng).not.toBe(77.5946);
  });

  it("calculates bounding box", () => {
    const bbox = calculateBoundingBox([{ lat: 10, lng: 20 }, { lat: 15, lng: 30 }, { lat: 12, lng: 25 }]);
    expect(bbox).toEqual({ minLat: 10, maxLat: 15, minLng: 20, maxLng: 30, centerLat: 12.5, centerLng: 25 });
  });

  it("computes convex hull and area", () => {
    const hull = computeConvexHull([
      { lat: 0, lng: 0 },
      { lat: 0, lng: 100 },
      { lat: 100, lng: 100 },
      { lat: 100, lng: 0 },
      { lat: 50, lng: 50 }
    ]);
    expect(hull).toContain("POLYGON((");
    expect(calculateAreaHectares(hull)).toBeCloseTo(1, 5);
  });

  it("calculates area from boundary geojson", () => {
    expect(
      calculateAreaSqMFromBoundary({
        type: "FeatureCollection",
        features: [
          {
            type: "Feature",
            properties: {},
            geometry: {
              type: "Polygon",
              coordinates: [[[0, 0], [0, 100], [100, 100], [100, 0], [0, 0]]]
            }
          }
        ]
      })
    ).toBeCloseTo(10000, 5);
  });

  it("validates supported extensions", () => {
    expect(validateFileExtension("parcel.las")).toBe("LAS");
    expect(validateFileExtension("map.tiff")).toBe("GEOTIFF");
    expect(validateFileExtension("notes.txt")).toBeNull();
  });
});
