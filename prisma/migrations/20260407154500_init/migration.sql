-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('PENDING', 'PROCESSING', 'REVIEW', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "SurveyType" AS ENUM ('LIDAR', 'DRONE_PHOTOGRAMMETRY', 'GNSS_TRAVERSE', 'TOTAL_STATION', 'HYBRID');

-- CreateEnum
CREATE TYPE "FileType" AS ENUM ('LAS', 'LAZ', 'TIFF', 'GEOTIFF', 'CSV', 'SHP', 'DXF', 'PDF', 'JPG', 'MP4');

-- CreateEnum
CREATE TYPE "OutputType" AS ENUM ('ORTHOMOSAIC', 'POINT_CLOUD', 'CONTOUR_DXF', 'AREA_REPORT', 'BOUNDARY_SHP', 'PDF_REPORT');

-- CreateEnum
CREATE TYPE "Severity" AS ENUM ('INFO', 'WARNING', 'ERROR', 'SUCCESS');

-- CreateTable
CREATE TABLE "Organization" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "clerkOrgId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "orgId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SurveyJob" (
    "id" TEXT NOT NULL,
    "projectId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" "JobStatus" NOT NULL DEFAULT 'PENDING',
    "type" "SurveyType" NOT NULL,
    "accuracyRmse" DOUBLE PRECISION,
    "areaSqM" DOUBLE PRECISION,
    "pointCount" BIGINT,
    "boundaryGeojson" JSONB,
    "markerLat" DOUBLE PRECISION,
    "markerLng" DOUBLE PRECISION,
    "centroidLat" DOUBLE PRECISION,
    "centroidLng" DOUBLE PRECISION,
    "metadata" JSONB,
    "processingMetadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SurveyJob_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InputFile" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileType" "FileType" NOT NULL,
    "s3Key" TEXT NOT NULL,
    "sizeBytes" BIGINT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InputFile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OutputFile" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "fileType" "OutputType" NOT NULL,
    "s3Key" TEXT NOT NULL,
    "sizeBytes" BIGINT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OutputFile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiInsight" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "severity" "Severity" NOT NULL,
    "category" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "confidence" DOUBLE PRECISION NOT NULL,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AiInsight_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GnssPoint" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "lat" DOUBLE PRECISION NOT NULL,
    "lng" DOUBLE PRECISION NOT NULL,
    "elevation" DOUBLE PRECISION NOT NULL,
    "accuracy" DOUBLE PRECISION NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GnssPoint_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Organization_clerkOrgId_key" ON "Organization"("clerkOrgId");

-- CreateIndex
CREATE INDEX "SurveyJob_status_idx" ON "SurveyJob"("status");

-- CreateIndex
CREATE INDEX "SurveyJob_projectId_idx" ON "SurveyJob"("projectId");

-- CreateIndex
CREATE INDEX "SurveyJob_centroidLat_centroidLng_idx" ON "SurveyJob"("centroidLat", "centroidLng");

-- CreateIndex
CREATE INDEX "InputFile_jobId_uploadedAt_idx" ON "InputFile"("jobId", "uploadedAt");

-- CreateIndex
CREATE INDEX "OutputFile_jobId_createdAt_idx" ON "OutputFile"("jobId", "createdAt");

-- CreateIndex
CREATE INDEX "AiInsight_jobId_createdAt_idx" ON "AiInsight"("jobId", "createdAt");

-- CreateIndex
CREATE INDEX "GnssPoint_jobId_idx" ON "GnssPoint"("jobId");

-- CreateIndex
CREATE INDEX "GnssPoint_jobId_timestamp_idx" ON "GnssPoint"("jobId", "timestamp");

-- AddForeignKey
ALTER TABLE "Project" ADD CONSTRAINT "Project_orgId_fkey" FOREIGN KEY ("orgId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SurveyJob" ADD CONSTRAINT "SurveyJob_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InputFile" ADD CONSTRAINT "InputFile_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "SurveyJob"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OutputFile" ADD CONSTRAINT "OutputFile_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "SurveyJob"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiInsight" ADD CONSTRAINT "AiInsight_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "SurveyJob"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GnssPoint" ADD CONSTRAINT "GnssPoint_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "SurveyJob"("id") ON DELETE CASCADE ON UPDATE CASCADE;
