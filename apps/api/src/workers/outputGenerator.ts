import { prisma } from "../prisma.js";
import { ensureOutputArtifactUploaded } from "../services/outputArtifacts.js";
import { makeStorageKey } from "../services/storage.js";

export async function outputGenerator(jobId: string) {
  const existing = await prisma.outputFile.count({ where: { jobId } });
  if (existing > 0) {
    return;
  }

  const outputs = [
    {
      jobId,
      fileName: "contours.dxf",
      fileType: "CONTOUR_DXF" as const,
      s3Key: makeStorageKey(jobId, "contours.dxf", "output")
    },
    {
      jobId,
      fileName: "report.pdf",
      fileType: "PDF_REPORT" as const,
      s3Key: makeStorageKey(jobId, "report.pdf", "output")
    },
    {
      jobId,
      fileName: "boundary.shp",
      fileType: "BOUNDARY_SHP" as const,
      s3Key: makeStorageKey(jobId, "boundary.shp", "output")
    }
  ];

  const data = [];
  for (const output of outputs) {
    const sizeBytes = await ensureOutputArtifactUploaded(output);
    data.push({ ...output, sizeBytes: BigInt(sizeBytes) });
  }

  await prisma.outputFile.createMany({ data });
}
