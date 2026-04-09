import { PrismaClient, FileType, JobStatus, OutputType, Severity, SurveyType } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.aiInsight.deleteMany();
  await prisma.gnssPoint.deleteMany();
  await prisma.outputFile.deleteMany();
  await prisma.inputFile.deleteMany();
  await prisma.surveyJob.deleteMany();
  await prisma.project.deleteMany();
  await prisma.organization.deleteMany();

  const org = await prisma.organization.create({ data: { name: "GeoSurvey Demo Org" } });
  const [northProject, southProject] = await Promise.all([
    prisma.project.create({
      data: {
        orgId: org.id,
        name: "North Ridge Corridor",
        description: "LiDAR and control validation for corridor survey"
      }
    }),
    prisma.project.create({
      data: {
        orgId: org.id,
        name: "South Basin Cadastre",
        description: "Boundary retracement and GNSS traverse dataset"
      }
    })
  ]);

  const savedBoundary = {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        properties: { name: "South Basin Parcel A", areaHectares: 9.8 },
        geometry: {
          type: "Polygon",
          coordinates: [[
            [77.501, 12.901],
            [77.509, 12.901],
            [77.509, 12.909],
            [77.501, 12.909],
            [77.501, 12.901]
          ]]
        }
      }
    ]
  };

  const jobs = await Promise.all([
    prisma.surveyJob.create({
      data: {
        projectId: northProject.id,
        name: "North Ridge LiDAR Block A",
        status: JobStatus.COMPLETED,
        type: SurveyType.LIDAR,
        areaSqM: 250_000,
        pointCount: BigInt(2_400_000),
        accuracyRmse: 1.8,
        centroidLat: 12.974,
        centroidLng: 77.602,
        boundaryGeojson: {
          type: "FeatureCollection",
          features: [
            {
              type: "Feature",
              properties: { name: "North Ridge Block A", areaHectares: 25 },
              geometry: {
                type: "Polygon",
                coordinates: [[
                  [77.595, 12.968],
                  [77.609, 12.968],
                  [77.609, 12.98],
                  [77.595, 12.98],
                  [77.595, 12.968]
                ]]
              }
            }
          ]
        },
        metadata: { classification: { ground: 62, vegetation: 24, structures: 14 } },
        processingMetadata: {
          currentStage: "AI_INSIGHT_ENGINE",
          progressPct: 100,
          startedAt: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
          completedAt: new Date(Date.now() - 20 * 60 * 1000).toISOString(),
          timeline: [
            { stage: "FILE_VALIDATOR", progress: 10, message: "Validated source files", timestamp: new Date(Date.now() - 55 * 60 * 1000).toISOString(), status: "completed" },
            { stage: "POINT_CLOUD_PROCESSOR", progress: 60, message: "Processed point cloud", timestamp: new Date(Date.now() - 40 * 60 * 1000).toISOString(), status: "completed" },
            { stage: "OUTPUT_GENERATOR", progress: 90, message: "Generated output artifacts", timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString(), status: "completed" },
            { stage: "AI_INSIGHT_ENGINE", progress: 100, message: "Generated AI insights", timestamp: new Date(Date.now() - 20 * 60 * 1000).toISOString(), status: "completed" }
          ],
          metricsSummary: { sourceFiles: 2, outputs: 3 }
        }
      }
    }),
    prisma.surveyJob.create({
      data: {
        projectId: northProject.id,
        name: "North Ridge Drone Mosaic",
        status: JobStatus.PROCESSING,
        type: SurveyType.DRONE_PHOTOGRAMMETRY,
        areaSqM: 180_000,
        pointCount: BigInt(1_250_000),
        centroidLat: 12.969,
        centroidLng: 77.615,
        processingMetadata: {
          currentStage: "CLASSIFICATION_ENGINE",
          progressPct: 74,
          startedAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
          timeline: [
            { stage: "FILE_VALIDATOR", progress: 10, message: "Validated source files", timestamp: new Date(Date.now() - 24 * 60 * 1000).toISOString(), status: "completed" },
            { stage: "POINT_CLOUD_PROCESSOR", progress: 58, message: "Generated dense point cloud", timestamp: new Date(Date.now() - 12 * 60 * 1000).toISOString(), status: "completed" },
            { stage: "CLASSIFICATION_ENGINE", progress: 74, message: "Classifying returns", timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(), status: "running" }
          ]
        }
      }
    }),
    prisma.surveyJob.create({
      data: {
        projectId: southProject.id,
        name: "South Basin GNSS Traverse",
        status: JobStatus.REVIEW,
        type: SurveyType.GNSS_TRAVERSE,
        areaSqM: 55_000,
        accuracyRmse: 2.4,
        centroidLat: 12.905,
        centroidLng: 77.505,
        boundaryGeojson: savedBoundary,
        processingMetadata: {
          currentStage: "OUTPUT_GENERATOR",
          progressPct: 92,
          startedAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
          timeline: [
            { stage: "FILE_VALIDATOR", progress: 15, message: "Validated files and observations", timestamp: new Date(Date.now() - 42 * 60 * 1000).toISOString(), status: "completed" },
            { stage: "POINT_CLOUD_PROCESSOR", progress: 55, message: "Computed survey extent metrics", timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(), status: "completed" },
            { stage: "OUTPUT_GENERATOR", progress: 92, message: "Waiting for QA review", timestamp: new Date(Date.now() - 8 * 60 * 1000).toISOString(), status: "running" }
          ]
        }
      }
    }),
    prisma.surveyJob.create({
      data: {
        projectId: southProject.id,
        name: "South Basin Hybrid Boundary",
        status: JobStatus.FAILED,
        type: SurveyType.HYBRID,
        areaSqM: 98_000,
        pointCount: BigInt(800_000),
        centroidLat: 12.913,
        centroidLng: 77.492,
        processingMetadata: {
          currentStage: "POINT_CLOUD_PROCESSOR",
          progressPct: 33,
          lastError: "Missing classified point cloud source for contour generation.",
          startedAt: new Date(Date.now() - 75 * 60 * 1000).toISOString(),
          timeline: [
            { stage: "FILE_VALIDATOR", progress: 10, message: "Validated partial upload set", timestamp: new Date(Date.now() - 72 * 60 * 1000).toISOString(), status: "completed" },
            { stage: "POINT_CLOUD_PROCESSOR", progress: 33, message: "Processing stopped due to incomplete source data", timestamp: new Date(Date.now() - 66 * 60 * 1000).toISOString(), status: "failed" }
          ]
        }
      }
    })
  ]);

  for (const job of jobs) {
    await prisma.gnssPoint.createMany({
      data: Array.from({ length: 3 }, (_, index) => ({
        jobId: job.id,
        lat: 12.9 + index * 0.001 + Math.random() / 100,
        lng: 77.5 + index * 0.001 + Math.random() / 100,
        elevation: 915 + index * 2,
        accuracy: 1.2 + index,
        timestamp: new Date(Date.now() - index * 60_000)
      }))
    });

    await prisma.aiInsight.createMany({
      data: [
        {
          jobId: job.id,
          severity: Severity.WARNING,
          category: "Residual Check",
          message: `Review residual spread for ${job.name}`,
          confidence: 0.79,
          metadata: { recommendation: "Verify control points with the highest residuals." }
        },
        {
          jobId: job.id,
          severity: job.status === JobStatus.COMPLETED ? Severity.SUCCESS : Severity.INFO,
          category: "Coverage",
          message: `Coverage summary prepared for ${job.name}`,
          confidence: 0.91,
          metadata: { recommendation: "Use the generated report during QA review." }
        }
      ]
    });
  }

  const completedJob = jobs[0];
  const reviewJob = jobs[2];

  await prisma.inputFile.createMany({
    data: [
      {
        jobId: completedJob.id,
        fileName: "north-ridge-block-a.las",
        fileType: FileType.LAS,
        s3Key: `jobs/${completedJob.id}/north-ridge-block-a.las`,
        sizeBytes: BigInt(48_000_000)
      },
      {
        jobId: completedJob.id,
        fileName: "north-ridge-control.csv",
        fileType: FileType.CSV,
        s3Key: `jobs/${completedJob.id}/north-ridge-control.csv`,
        sizeBytes: BigInt(28_000)
      },
      {
        jobId: reviewJob.id,
        fileName: "south-basin-traverse.csv",
        fileType: FileType.CSV,
        s3Key: `jobs/${reviewJob.id}/south-basin-traverse.csv`,
        sizeBytes: BigInt(18_400)
      }
    ]
  });

  await prisma.outputFile.createMany({
    data: [
      {
        jobId: completedJob.id,
        fileName: "north-ridge-report.pdf",
        fileType: OutputType.PDF_REPORT,
        s3Key: `jobs/${completedJob.id}/outputs/north-ridge-report.pdf`,
        sizeBytes: BigInt(120_000)
      },
      {
        jobId: completedJob.id,
        fileName: "north-ridge-contours.dxf",
        fileType: OutputType.CONTOUR_DXF,
        s3Key: `jobs/${completedJob.id}/outputs/north-ridge-contours.dxf`,
        sizeBytes: BigInt(245_000)
      },
      {
        jobId: completedJob.id,
        fileName: "north-ridge-boundary.shp",
        fileType: OutputType.BOUNDARY_SHP,
        s3Key: `jobs/${completedJob.id}/outputs/north-ridge-boundary.shp`,
        sizeBytes: BigInt(84_000)
      }
    ]
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
