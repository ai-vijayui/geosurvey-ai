import { Router } from "express";
import multer from "multer";
import { z } from "zod";
import { prisma } from "../prisma.js";
import { calculateBoundingBox, parseGnssCSVWithSummary, reprojectPoints } from "../utils/geoprocessing.js";
import { fail, ok } from "../utils/respond.js";

const upload = multer({ storage: multer.memoryStorage() });
const epsgSchema = z.object({
  fromEPSG: z.coerce.number().default(4326),
  toEPSG: z.coerce.number().default(4326)
});

export const gnssRouter = Router();

gnssRouter.get("/:jobId/points", async (req, res) => {
  const points = await prisma.gnssPoint.findMany({
    where: { jobId: req.params.jobId },
    orderBy: { timestamp: "asc" }
  });

  return ok(res, {
    type: "FeatureCollection",
    features: points.map((point: typeof points[number]) => ({
      type: "Feature",
      geometry: { type: "Point", coordinates: [point.lng, point.lat, point.elevation] },
      properties: {
        id: point.id,
        accuracy: point.accuracy,
        elevation: point.elevation,
        timestamp: point.timestamp,
        accuracyClass: point.accuracy <= 2 ? "good" : point.accuracy <= 5 ? "fair" : "poor"
      }
    }))
  });
});

gnssRouter.post("/:jobId/import-csv", upload.single("file") as never, async (req, res) => {
  if (!req.file) {
    return fail(res, "CSV file is required", 400);
  }

  const { fromEPSG, toEPSG } = epsgSchema.parse(req.body ?? {});
  const parsed = parseGnssCSVWithSummary(req.file.buffer);
  const normalizedPoints = fromEPSG === toEPSG
    ? parsed.points
    : reprojectPoints(parsed.points.map((point) => ({ ...point })), fromEPSG, toEPSG);

  await prisma.gnssPoint.deleteMany({ where: { jobId: req.params.jobId } });
  if (normalizedPoints.length > 0) {
    await prisma.gnssPoint.createMany({
      data: normalizedPoints.map((point) => ({
        jobId: req.params.jobId,
        lat: point.lat,
        lng: point.lng,
        elevation: point.elevation,
        accuracy: point.accuracy,
        timestamp: new Date(String(point.timestamp))
      }))
    });
  }

  const bbox = calculateBoundingBox(normalizedPoints);
  await prisma.surveyJob.update({
    where: { id: req.params.jobId },
    data: {
      pointCount: BigInt(normalizedPoints.length),
      centroidLat: normalizedPoints.length > 0 ? bbox.centerLat : null,
      centroidLng: normalizedPoints.length > 0 ? bbox.centerLng : null
    }
  });

  return ok(res, {
    imported: normalizedPoints.length,
    invalidRows: parsed.invalidRows,
    averageAccuracy: parsed.averageAccuracy,
    bbox,
    fromEPSG,
    toEPSG
  });
});
