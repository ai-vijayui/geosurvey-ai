import type { OutputFile, OutputType } from "@prisma/client";
import { uploadBuffer } from "./storage.js";

function buildContourDxfContent(jobId: string) {
  return `0
SECTION
2
HEADER
9
$ACADVER
1
AC1021
0
ENDSEC
0
SECTION
2
ENTITIES
0
TEXT
8
0
10
0.0
20
0.0
30
0.0
40
2.5
1
GeoSurvey contour export placeholder for job ${jobId}
0
ENDSEC
0
EOF
`;
}

function buildBoundaryShapeContent(jobId: string) {
  return `GeoSurvey placeholder boundary export
Job: ${jobId}
Format note: This demo build stores a placeholder .shp payload so downloads work end-to-end.
Replace with a true shapefile bundle export in the production pipeline.
`;
}

function buildPdfReportContent(jobId: string) {
  const escapedLines = [
    "GeoSurvey AI Report",
    `Job: ${jobId}`,
    "",
    "This is a generated placeholder report file for the demo pipeline.",
    "The download path and storage integration are working.",
    "Replace this with a real PDF renderer when the reporting engine is wired in."
  ]
    .map((line) => line.replaceAll("\\", "\\\\").replaceAll("(", "\\(").replaceAll(")", "\\)"))
    .join(") Tj T* (");

  return `%PDF-1.1
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>
endobj
4 0 obj
<< /Length ${escapedLines.length + 40} >>
stream
BT
/F1 12 Tf
72 720 Td
14 TL
(${escapedLines}) Tj
ET
endstream
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
xref
0 6
0000000000 65535 f 
0000000010 00000 n 
0000000063 00000 n 
0000000122 00000 n 
0000000248 00000 n 
0000000408 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
478
%%EOF
`;
}

function getArtifactPayload(type: OutputType, jobId: string) {
  if (type === "CONTOUR_DXF") {
    return { body: Buffer.from(buildContourDxfContent(jobId), "utf8"), contentType: "application/dxf" };
  }
  if (type === "BOUNDARY_SHP") {
    return { body: Buffer.from(buildBoundaryShapeContent(jobId), "utf8"), contentType: "application/octet-stream" };
  }
  return { body: Buffer.from(buildPdfReportContent(jobId), "binary"), contentType: "application/pdf" };
}

export async function ensureOutputArtifactUploaded(file: Pick<OutputFile, "jobId" | "fileType" | "s3Key">) {
  const { body, contentType } = getArtifactPayload(file.fileType, file.jobId);
  await uploadBuffer(file.s3Key, body, contentType);
  return body.length;
}
