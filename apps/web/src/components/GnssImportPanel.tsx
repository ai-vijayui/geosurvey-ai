import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { FeatureCollection } from "geojson";
import { useNotifications } from "../context/NotificationContext";
import { MapView } from "./MapView";
import { apiGet, apiPostForm, type PaginatedResponse } from "../lib/api";

type JobOption = {
  id: string;
  name: string;
  status: string;
};

type ImportSummary = {
  imported: number;
  bbox: {
    minLat: number;
    maxLat: number;
    minLng: number;
    maxLng: number;
    centerLat: number;
    centerLng: number;
  };
  invalidRows: number;
  averageAccuracy: number;
};

type CsvRow = Record<string, string>;

type ColumnMapping = {
  lat: string;
  lng: string;
  elevation: string;
  accuracy: string;
  timestamp: string;
};

type Props = {
  fixedJobId?: string;
  importedGeojson?: FeatureCollection;
  onImported?: (summary: ImportSummary) => void;
};

const columnAliases: Record<keyof ColumnMapping, string[]> = {
  lat: ["lat", "latitude"],
  lng: ["lng", "lon", "longitude"],
  elevation: ["elev", "elevation", "alt", "altitude"],
  accuracy: ["acc", "accuracy"],
  timestamp: ["time", "timestamp", "datetime"]
};

function parseCsvText(text: string): CsvRow[] {
  const trimmed = text.trim();
  if (!trimmed) {
    return [];
  }

  const [headerLine, ...lines] = trimmed.split(/\r?\n/);
  const headers = headerLine.split(",").map((item) => item.trim());

  return lines
    .filter((line) => line.trim().length > 0)
    .map((line) =>
      line.split(",").reduce<CsvRow>((record, value, index) => {
        record[headers[index] ?? `column_${index}`] = value.trim();
        return record;
      }, {})
    );
}

function detectMapping(headers: string[]): ColumnMapping {
  const normalized = headers.map((header) => ({ original: header, normalized: header.trim().toLowerCase() }));
  return {
    lat: normalized.find((entry) => columnAliases.lat.includes(entry.normalized))?.original ?? "",
    lng: normalized.find((entry) => columnAliases.lng.includes(entry.normalized))?.original ?? "",
    elevation: normalized.find((entry) => columnAliases.elevation.includes(entry.normalized))?.original ?? "",
    accuracy: normalized.find((entry) => columnAliases.accuracy.includes(entry.normalized))?.original ?? "",
    timestamp: normalized.find((entry) => columnAliases.timestamp.includes(entry.normalized))?.original ?? ""
  };
}

function toNumber(value: string | undefined) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function formatTimestamp(value: string | undefined) {
  if (!value) {
    return new Date(0).toISOString();
  }
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? new Date(0).toISOString() : parsed.toISOString();
}

function makePreviewFeatureCollection(rows: Array<{ lat: number; lng: number; elevation: number; accuracy: number; timestamp: string }>): FeatureCollection {
  return {
    type: "FeatureCollection",
    features: rows.slice(0, 500).map((row, index) => ({
      type: "Feature",
      geometry: {
        type: "Point",
        coordinates: [row.lng, row.lat, row.elevation]
      },
      properties: {
        id: `preview-${index}`,
        elevation: row.elevation,
        accuracy: row.accuracy,
        timestamp: row.timestamp,
        accuracyClass: row.accuracy <= 2 ? "good" : row.accuracy <= 5 ? "fair" : "poor"
      }
    }))
  };
}

function inputClasses() {
  return "mt-2 min-h-[46px] w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-slate-300 focus:bg-white focus:ring-2 focus:ring-emerald-500/20";
}

function labelClasses() {
  return "block text-xs font-semibold uppercase tracking-[0.14em] text-slate-500";
}

function metricTile(label: string, value: string) {
  return (
    <div key={label} className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4">
      <span className="block text-xs font-medium uppercase tracking-[0.14em] text-slate-500">{label}</span>
      <strong className="mt-2 block text-base font-semibold text-slate-900">{value}</strong>
    </div>
  );
}

export function GnssImportPanel({ fixedJobId, importedGeojson, onImported }: Props) {
  const { addNotification } = useNotifications();
  const [jobId, setJobId] = useState(fixedJobId ?? "");
  const [csvText, setCsvText] = useState("");
  const [fileName, setFileName] = useState("");
  const [fromEPSG, setFromEPSG] = useState("4326");
  const [toEPSG, setToEPSG] = useState("4326");
  const [mapping, setMapping] = useState<ColumnMapping>({ lat: "", lng: "", elevation: "", accuracy: "", timestamp: "" });
  const [importSummary, setImportSummary] = useState<ImportSummary | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const jobsQuery = useQuery({
    queryKey: ["jobs-for-gnss-panel"],
    queryFn: () => apiGet<PaginatedResponse<JobOption[]>>("/api/jobs?limit=50"),
    enabled: !fixedJobId
  });

  useEffect(() => {
    if (fixedJobId) {
      setJobId(fixedJobId);
    }
  }, [fixedJobId]);

  const rows = useMemo(() => parseCsvText(csvText), [csvText]);
  const availableJobs = jobsQuery.data?.data ?? [];
  const headers = useMemo(() => Object.keys(rows[0] ?? {}), [rows]);

  useEffect(() => {
    if (headers.length === 0) {
      setMapping({ lat: "", lng: "", elevation: "", accuracy: "", timestamp: "" });
      return;
    }
    setMapping((current) => {
      const detected = detectMapping(headers);
      return {
        lat: current.lat && headers.includes(current.lat) ? current.lat : detected.lat,
        lng: current.lng && headers.includes(current.lng) ? current.lng : detected.lng,
        elevation: current.elevation && headers.includes(current.elevation) ? current.elevation : detected.elevation,
        accuracy: current.accuracy && headers.includes(current.accuracy) ? current.accuracy : detected.accuracy,
        timestamp: current.timestamp && headers.includes(current.timestamp) ? current.timestamp : detected.timestamp
      };
    });
  }, [headers]);

  const normalizedRows = useMemo(() => {
    return rows.map((row, index) => {
      const lat = toNumber(row[mapping.lat]);
      const lng = toNumber(row[mapping.lng]);
      const elevation = toNumber(row[mapping.elevation]) ?? 0;
      const accuracy = toNumber(row[mapping.accuracy]) ?? 0;
      return {
        id: index + 1,
        lat,
        lng,
        elevation,
        accuracy,
        timestamp: formatTimestamp(row[mapping.timestamp])
      };
    });
  }, [mapping, rows]);

  const validRows = useMemo(() => normalizedRows.filter((row) => row.lat !== null && row.lng !== null), [normalizedRows]);
  const invalidRows = normalizedRows.length - validRows.length;
  const averageAccuracy = useMemo(() => {
    if (validRows.length === 0) {
      return 0;
    }
    const total = validRows.reduce((sum, row) => sum + row.accuracy, 0);
    return Number((total / validRows.length).toFixed(2));
  }, [validRows]);

  const previewGeojson = useMemo(() => {
    if (validRows.length === 0) {
      return importedGeojson;
    }
    return makePreviewFeatureCollection(
      validRows.map((row) => ({
        lat: row.lat ?? 0,
        lng: row.lng ?? 0,
        elevation: row.elevation,
        accuracy: row.accuracy,
        timestamp: row.timestamp
      }))
    );
  }, [importedGeojson, validRows]);

  const previewHeaders = headers.slice(0, 8);

  async function handleImport() {
    if (!jobId || validRows.length === 0) {
      return;
    }

    setSubmitting(true);
    try {
      const normalizedCsv = [
        "lat,lng,elevation,accuracy,timestamp",
        ...validRows.map((row) => `${row.lat ?? 0},${row.lng ?? 0},${row.elevation},${row.accuracy},${row.timestamp}`)
      ].join("\n");

      const formData = new FormData();
      formData.append("file", new File([normalizedCsv], fileName || "gnss-import.csv", { type: "text/csv" }));
      formData.append("fromEPSG", fromEPSG);
      formData.append("toEPSG", toEPSG);

      const response = await apiPostForm<{ imported: number; bbox: ImportSummary["bbox"]; invalidRows: number; averageAccuracy: number }>(`/api/gnss/${jobId}/import-csv`, formData);
      const summary = {
        imported: response.imported,
        bbox: response.bbox,
        invalidRows: response.invalidRows,
        averageAccuracy: response.averageAccuracy
      };
      setImportSummary(summary);
      addNotification({
        title: "GNSS import complete",
        message: `Imported ${response.imported} GNSS points successfully.`,
        tone: "success",
        href: `/jobs/${jobId}?tab=Map`,
        source: "gnss"
      });
      onImported?.(summary);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="grid gap-6">
      <section className="space-y-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="space-y-1">
          <strong className="block text-lg font-semibold text-slate-900">GNSS CSV import</strong>
          <span className="block text-sm leading-6 text-slate-500">Preview, map, and normalize observations before they enter the survey job.</span>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {!fixedJobId ? (
            <label>
              <span className={labelClasses()}>Job</span>
              <select className={inputClasses()} value={jobId} onChange={(event) => setJobId(event.target.value)}>
                <option value="">Select job</option>
                {availableJobs.map((job) => (
                  <option key={job.id} value={job.id}>
                    {job.name} · {job.status}
                  </option>
                ))}
              </select>
            </label>
          ) : null}

          <label>
            <span className={labelClasses()}>Source EPSG</span>
            <input className={inputClasses()} value={fromEPSG} onChange={(event) => setFromEPSG(event.target.value)} placeholder="4326" />
          </label>

          <label>
            <span className={labelClasses()}>Target EPSG</span>
            <input className={inputClasses()} value={toEPSG} onChange={(event) => setToEPSG(event.target.value)} placeholder="4326" />
          </label>

          <label>
            <span className={labelClasses()}>CSV file</span>
            <label className={`${inputClasses()} flex cursor-pointer items-center justify-between`}>
              <span>{fileName || "Browse CSV"}</span>
              <span className="inline-flex rounded-full bg-slate-900 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-white">Select</span>
              <input
                hidden
                type="file"
                accept=".csv"
                onChange={async (event) => {
                  const file = event.target.files?.[0];
                  if (!file) {
                    return;
                  }
                  setFileName(file.name);
                  setCsvText(await file.text());
                }}
              />
            </label>
          </label>
        </div>

        {fromEPSG !== toEPSG ? (
          <div className="rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm leading-6 text-slate-600">
            Reprojection fields are captured in the workflow, but the current import endpoint stores coordinates exactly as uploaded.
          </div>
        ) : null}

        {headers.length > 0 ? (
          <div className="space-y-4">
            <div className="space-y-1">
              <strong className="block text-lg font-semibold text-slate-900">Column mapping</strong>
              <span className="block text-sm leading-6 text-slate-500">Align the CSV fields to the normalized GNSS schema before import.</span>
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
              {(Object.keys(mapping) as Array<keyof ColumnMapping>).map((key) => (
                <label key={key}>
                  <span className={labelClasses()}>{key}</span>
                  <select className={inputClasses()} value={mapping[key]} onChange={(event) => setMapping((current) => ({ ...current, [key]: event.target.value }))}>
                    <option value="">Select column</option>
                    {headers.map((header) => (
                      <option key={header} value={header}>
                        {header}
                      </option>
                    ))}
                  </select>
                </label>
              ))}
            </div>
          </div>
        ) : null}

        {rows.length > 0 ? (
          <div className="space-y-4">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <strong className="text-lg font-semibold text-slate-900">Preview first 20 rows</strong>
              <span className="text-sm text-slate-500">
                {validRows.length} valid · {invalidRows} skipped
              </span>
            </div>
            <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
              <table className="min-w-full border-collapse">
                <thead>
                  <tr className="bg-slate-50">
                    {previewHeaders.map((header) => (
                      <th key={header} className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">{header}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.slice(0, 20).map((row, index) => (
                    <tr key={`preview-row-${index}`} className="border-t border-slate-200">
                      {previewHeaders.map((header) => (
                        <td key={`${index}-${header}`} className="px-4 py-3 text-sm leading-6 text-slate-700">{row[header]}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50/70 px-6 py-8 text-center">
            <strong className="block text-lg font-semibold text-slate-900">No CSV loaded yet</strong>
            <span className="mt-2 block text-sm leading-6 text-slate-500">Upload a GNSS CSV to preview rows, align columns, and validate the import before processing.</span>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <button className="button-primary" disabled={!jobId || validRows.length === 0 || submitting} onClick={() => void handleImport()}>
            {submitting ? "Importing..." : "Import GNSS"}
          </button>
          <button
            disabled={validRows.length === 0}
            onClick={() => {
              const normalizedCsv = [
                "lat,lng,elevation,accuracy,timestamp",
                ...validRows.map((row) => `${row.lat ?? 0},${row.lng ?? 0},${row.elevation},${row.accuracy},${row.timestamp}`)
              ].join("\n");
              const blob = new Blob([normalizedCsv], { type: "text/csv" });
              const url = URL.createObjectURL(blob);
              const anchor = document.createElement("a");
              anchor.href = url;
              anchor.download = `${fileName.replace(/\.csv$/i, "") || "gnss"}-converted.csv`;
              anchor.click();
              URL.revokeObjectURL(url);
            }}
          >
            Export converted CSV
          </button>
          <span className="text-sm leading-6 text-slate-500">Imported data is normalized to the expected job schema before upload.</span>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <section className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="space-y-1">
            <strong className="block text-lg font-semibold text-slate-900">Import summary</strong>
            <span className="block text-sm leading-6 text-slate-500">Check data quality and extent before or after import.</span>
          </div>
          {importSummary ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {metricTile("Imported points", String(importSummary.imported))}
              {metricTile("Skipped rows", String(importSummary.invalidRows))}
              {metricTile("Avg accuracy", `${importSummary.averageAccuracy.toFixed(2)} m`)}
              {metricTile("Bounding box", `${importSummary.bbox.minLat.toFixed(4)}, ${importSummary.bbox.minLng.toFixed(4)} to ${importSummary.bbox.maxLat.toFixed(4)}, ${importSummary.bbox.maxLng.toFixed(4)}`)}
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm leading-6 text-slate-600">Summary metrics appear here after the import completes.</div>
          )}
        </section>

        <section className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="space-y-1">
            <strong className="block text-lg font-semibold text-slate-900">Preview map</strong>
            <span className="block text-sm leading-6 text-slate-500">Points shown from preview rows or the latest imported job geometry.</span>
          </div>
          <MapView geojson={previewGeojson} height="420px" autoFit fitSignal={importSummary?.imported ?? validRows.length} />
        </section>
      </div>
    </div>
  );
}
