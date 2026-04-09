export type JobStatus = "PENDING" | "PROCESSING" | "REVIEW" | "COMPLETED" | "FAILED";

export type SurveyType =
  | "LIDAR"
  | "DRONE_PHOTOGRAMMETRY"
  | "GNSS_TRAVERSE"
  | "TOTAL_STATION"
  | "HYBRID";

export type FileType = "LAS" | "LAZ" | "TIFF" | "GEOTIFF" | "CSV" | "SHP" | "DXF" | "PDF" | "JPG" | "MP4";

export type OutputType =
  | "ORTHOMOSAIC"
  | "POINT_CLOUD"
  | "CONTOUR_DXF"
  | "AREA_REPORT"
  | "BOUNDARY_SHP"
  | "PDF_REPORT";

export type Severity = "INFO" | "WARNING" | "ERROR" | "SUCCESS";

export type Position2D = [number, number];
export type Position3D = [number, number, number?];

export interface MapMarker {
  lat: number;
  lng: number;
}

export interface GeoJsonFeature<P = Record<string, unknown>, G = Record<string, unknown>> {
  type: "Feature";
  geometry: G;
  properties: P;
}

export interface GeoJsonFeatureCollection<F = GeoJsonFeature> {
  type: "FeatureCollection";
  features: F[];
}

export interface GeoJsonPointGeometry {
  type: "Point";
  coordinates: Position3D;
}

export interface GeoJsonPolygonGeometry {
  type: "Polygon";
  coordinates: Position2D[][];
}

export interface GeoJsonMultiPolygonGeometry {
  type: "MultiPolygon";
  coordinates: Position2D[][][];
}

export type BoundaryGeometry = GeoJsonPolygonGeometry | GeoJsonMultiPolygonGeometry;
export type BoundaryFeature = GeoJsonFeature<{ name?: string; areaHectares?: number }, BoundaryGeometry>;
export type BoundaryGeoJson = GeoJsonFeatureCollection<BoundaryFeature>;

export interface ProcessingTimelineEntry {
  stage: string;
  progress: number;
  message: string;
  timestamp: string;
  status: "queued" | "running" | "completed" | "failed";
}

export interface ProcessingMetadata {
  currentStage?: string;
  progressPct?: number;
  lastError?: string | null;
  startedAt?: string | null;
  completedAt?: string | null;
  timeline?: ProcessingTimelineEntry[];
  metricsSummary?: Record<string, unknown>;
}

export interface Organization {
  id: string;
  name: string;
  createdAt: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  orgId: string;
  createdAt: string;
}

export interface SurveyJob {
  id: string;
  projectId: string;
  name: string;
  status: JobStatus;
  type: SurveyType;
  accuracyRmse?: number;
  areaSqM?: number;
  pointCount?: number;
  centroidLat?: number;
  centroidLng?: number;
  markerLat?: number | null;
  markerLng?: number | null;
  boundaryGeojson?: BoundaryGeoJson | null;
  metadata?: Record<string, unknown>;
  processingMetadata?: ProcessingMetadata | null;
  createdAt: string;
  updatedAt: string;
  inputFiles: InputFile[];
  outputs: OutputFile[];
  aiInsights: AiInsight[];
}

export interface InputFile {
  id: string;
  jobId: string;
  fileName: string;
  fileType: FileType;
  s3Key: string;
  sizeBytes: number;
  uploadedAt: string;
}

export interface OutputFile {
  id: string;
  jobId: string;
  fileName: string;
  fileType: OutputType;
  s3Key: string;
  sizeBytes: number;
  createdAt: string;
}

export interface AiInsight {
  id: string;
  jobId: string;
  severity: Severity;
  category: string;
  message: string;
  confidence: number;
  metadata?: { recommendation?: string; [k: string]: unknown };
  createdAt: string;
}

export interface GnssPoint {
  id: string;
  jobId: string;
  lat: number;
  lng: number;
  elevation: number;
  accuracy: number;
  timestamp: string;
}

export interface ProgressEvent {
  type: "PROGRESS" | "COMPLETE" | "FAILED" | "HEARTBEAT";
  jobId: string;
  stage?: string;
  progress?: number;
  message?: string;
  error?: string;
  timestamp: string;
}

export interface BoundaryState {
  boundaryGeojson?: BoundaryGeoJson | null;
  areaSqM?: number | null;
  centroidLat?: number | null;
  centroidLng?: number | null;
  marker?: MapMarker | null;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
  };
}
