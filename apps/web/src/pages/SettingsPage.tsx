import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiGet, type PaginatedResponse } from "../lib/api";

type SettingsState = {
  organizationLabel: string;
  defaultCrs: string;
  preferredUnits: string;
  mapProvider: string;
  defaultBasemap: string;
  defaultZoom: number;
  enableAutoFit: boolean;
  aiProviderLabel: string;
  autoRunAiAfterProcessing: boolean;
  aiRiskThreshold: number;
  storageMode: string;
  keepUploadsDays: number;
  preferDownloadLinks: boolean;
  processingConcurrency: number;
  defaultSurveyType: string;
  autoOpenOutputs: boolean;
  appearanceMode: string;
};

type DashboardStats = {
  totalAreaHa: number;
  activeJobs: number;
  totalPoints: number;
  avgRmse: number;
};

const storageKey = "geosurvey.settings.v1";
const defaultSettings: SettingsState = {
  organizationLabel: "GeoSurvey Demo Org",
  defaultCrs: "EPSG:4326",
  preferredUnits: "Metric",
  mapProvider: "MapLibre / OpenStreetMap",
  defaultBasemap: "Topographic",
  defaultZoom: 15,
  enableAutoFit: true,
  aiProviderLabel: "Configured backend AI service",
  autoRunAiAfterProcessing: false,
  aiRiskThreshold: 0.7,
  storageMode: "Remote object storage",
  keepUploadsDays: 180,
  preferDownloadLinks: true,
  processingConcurrency: 2,
  defaultSurveyType: "GNSS_TRAVERSE",
  autoOpenOutputs: true,
  appearanceMode: "Earth light"
};

function readSettings(): SettingsState {
  if (typeof window === "undefined") {
    return defaultSettings;
  }

  const saved = window.localStorage.getItem(storageKey);
  if (!saved) {
    return defaultSettings;
  }

  try {
    return { ...defaultSettings, ...(JSON.parse(saved) as Partial<SettingsState>) };
  } catch {
    return defaultSettings;
  }
}

type SettingSectionProps = {
  title: string;
  description: string;
  note?: string;
  children: ReactNode;
};

function statusTone(isHealthy: boolean) {
  return isHealthy
    ? "inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-700"
    : "inline-flex items-center rounded-full border border-rose-200 bg-rose-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-rose-700";
}

function sectionCardClasses() {
  return "space-y-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm";
}

function labelClasses() {
  return "block text-xs font-semibold uppercase tracking-[0.14em] text-slate-500";
}

function inputClasses() {
  return "mt-2 min-h-[46px] w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-slate-300 focus:bg-white focus:ring-2 focus:ring-emerald-500/20";
}

function noteClasses() {
  return "rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm leading-6 text-slate-600";
}

function checkboxClasses(enabled: boolean) {
  return `group flex items-start gap-3 rounded-2xl border px-4 py-3 transition ${
    enabled ? "border-emerald-200 bg-emerald-50/70" : "border-slate-200 bg-slate-50/70 hover:border-slate-300"
  }`;
}

function statCardTone(emphasis?: "default" | "soft") {
  return emphasis === "soft"
    ? "rounded-2xl border border-slate-200 bg-slate-50/70 p-4"
    : "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm";
}

function SettingSection({ title, description, note, children }: SettingSectionProps) {
  return (
    <section className={sectionCardClasses()}>
      <div className="space-y-1">
        <strong className="block text-lg font-semibold text-slate-900">{title}</strong>
        <span className="block text-sm leading-6 text-slate-500">{description}</span>
      </div>
      <div className="grid gap-4">{children}</div>
      {note ? <div className={noteClasses()}>{note}</div> : null}
    </section>
  );
}

export function SettingsPage() {
  const [settings, setSettings] = useState<SettingsState>(() => readSettings());
  const [saveState, setSaveState] = useState("Saved locally");
  const [storageEstimate, setStorageEstimate] = useState<{ quota?: number; usage?: number } | null>(null);

  const jobsQuery = useQuery({
    queryKey: ["settings", "jobs-health"],
    queryFn: () => apiGet<PaginatedResponse<Array<{ id: string; status: string }>>>("/api/jobs?limit=5")
  });
  const projectsQuery = useQuery({
    queryKey: ["settings", "projects-health"],
    queryFn: () => apiGet<Array<{ id: string }>>("/api/projects")
  });
  const dashboardQuery = useQuery({
    queryKey: ["settings", "dashboard-health"],
    queryFn: () => apiGet<DashboardStats>("/api/dashboard/stats")
  });

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify(settings));
    setSaveState("Saved locally");
  }, [settings]);

  useEffect(() => {
    let cancelled = false;

    async function loadEstimate() {
      if (!navigator.storage?.estimate) {
        return;
      }
      const estimate = await navigator.storage.estimate();
      if (!cancelled) {
        setStorageEstimate(estimate);
      }
    }

    void loadEstimate();
    return () => {
      cancelled = true;
    };
  }, []);

  const environmentStatus = useMemo(() => {
    const apiHealthy = jobsQuery.isSuccess && projectsQuery.isSuccess && dashboardQuery.isSuccess;
    const authConfigured = Boolean(import.meta.env.VITE_CLERK_PUBLISHABLE_KEY);
    const mapHealthy = true;

    return [
      {
        label: "API routes",
        value: apiHealthy ? "Reachable" : jobsQuery.isError || projectsQuery.isError || dashboardQuery.isError ? "Unavailable" : "Checking",
        healthy: apiHealthy
      },
      {
        label: "Auth",
        value: authConfigured ? "Clerk configured" : "Dev mode without Clerk key",
        healthy: authConfigured
      },
      {
        label: "Map stack",
        value: mapHealthy ? settings.mapProvider : "Unavailable",
        healthy: mapHealthy
      },
      {
        label: "Object storage links",
        value: settings.preferDownloadLinks ? "Preferred" : "Manual review",
        healthy: settings.preferDownloadLinks
      }
    ];
  }, [dashboardQuery.isError, dashboardQuery.isSuccess, jobsQuery.isError, jobsQuery.isSuccess, projectsQuery.isError, projectsQuery.isSuccess, settings.mapProvider, settings.preferDownloadLinks]);

  const systemStats = [
    { label: "Projects", value: projectsQuery.data?.length ?? "-" },
    { label: "Recent jobs loaded", value: jobsQuery.data?.data.length ?? "-" },
    { label: "Active jobs", value: dashboardQuery.data?.activeJobs ?? "-" },
    { label: "Total points", value: dashboardQuery.data?.totalPoints?.toLocaleString?.() ?? "-" },
    { label: "Browser storage quota", value: storageEstimate?.quota ? `${(storageEstimate.quota / (1024 * 1024)).toFixed(0)} MB` : "Unavailable" },
    { label: "Browser storage used", value: storageEstimate?.usage ? `${(storageEstimate.usage / (1024 * 1024)).toFixed(1)} MB` : "Unavailable" }
  ];

  function updateSetting<K extends keyof SettingsState>(key: K, value: SettingsState[K]) {
    setSaveState("Saving...");
    setSettings((current) => ({ ...current, [key]: value }));
  }

  return (
    <div className="reference-page">
      <div className="reference-page-header">
        <div className="reference-page-header__copy">
          <h1>Settings</h1>
          <p>
            Manage local workspace defaults for maps, AI review, storage behavior, processing, and environment visibility.
          </p>
        </div>
        <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-slate-600 shadow-sm">
          {saveState}
        </span>
      </div>

      <div className="reference-panel-grid">
        <div className="reference-card reference-card--accent space-y-4">
          <span className="reference-chip">Workspace controls</span>
          <strong className="block text-2xl font-semibold leading-tight text-slate-900">Shape how this workstation handles maps, AI review, storage, and processing defaults.</strong>
          <span className="block max-w-2xl text-sm leading-6 text-slate-500">
            These preferences are saved locally in the browser, so the app can feel tailored without waiting on a backend settings model.
          </span>
        </div>
        <div className="reference-metrics">
          <div className="reference-metric">
            <span className="reference-metric__label">Projects</span>
            <strong className="reference-metric__value">{projectsQuery.data?.length ?? 0}</strong>
            <span className="reference-metric__meta">Projects detected from the current API session</span>
          </div>
          <div className="reference-metric">
            <span className="reference-metric__label">Recent jobs loaded</span>
            <strong className="reference-metric__value">{jobsQuery.data?.data.length ?? 0}</strong>
            <span className="reference-metric__meta">Latest jobs used for environment visibility</span>
          </div>
          <div className="reference-metric">
            <span className="reference-metric__label">Active jobs</span>
            <strong className="reference-metric__value">{dashboardQuery.data?.activeJobs ?? 0}</strong>
            <span className="reference-metric__meta">Live work currently moving through the pipeline</span>
          </div>
          <div className="reference-metric">
            <span className="reference-metric__label">Storage used</span>
            <strong className="reference-metric__value">{storageEstimate?.usage ? `${(storageEstimate.usage / (1024 * 1024)).toFixed(1)} MB` : "N/A"}</strong>
            <span className="reference-metric__meta">Browser-side workspace storage utilization</span>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <SettingSection
          title="Organization"
          description="Workspace identity and spatial defaults."
          note="These organization settings are local-only until a server-side settings model is added."
        >
          <label>
            <span className={labelClasses()}>Organization label</span>
            <input className={inputClasses()} value={settings.organizationLabel} onChange={(event) => updateSetting("organizationLabel", event.target.value)} />
          </label>
          <label>
            <span className={labelClasses()}>Default CRS / EPSG</span>
            <input className={inputClasses()} value={settings.defaultCrs} onChange={(event) => updateSetting("defaultCrs", event.target.value)} />
          </label>
          <label>
            <span className={labelClasses()}>Preferred units</span>
            <select className={inputClasses()} value={settings.preferredUnits} onChange={(event) => updateSetting("preferredUnits", event.target.value)}>
              <option value="Metric">Metric</option>
              <option value="Imperial">Imperial</option>
              <option value="Mixed">Mixed</option>
            </select>
          </label>
        </SettingSection>

        <SettingSection title="Map settings" description="Controls stored in this browser.">
          <label>
            <span className={labelClasses()}>Map provider</span>
            <input className={inputClasses()} value={settings.mapProvider} onChange={(event) => updateSetting("mapProvider", event.target.value)} />
          </label>
          <label>
            <span className={labelClasses()}>Default basemap</span>
            <select className={inputClasses()} value={settings.defaultBasemap} onChange={(event) => updateSetting("defaultBasemap", event.target.value)}>
              <option value="Topographic">Topographic</option>
              <option value="Street">Street</option>
              <option value="Satellite fallback">Satellite fallback</option>
            </select>
          </label>
          <label>
            <span className={labelClasses()}>Default zoom</span>
            <input
              className={inputClasses()}
              type="number"
              min={1}
              max={20}
              value={settings.defaultZoom}
              onChange={(event) => updateSetting("defaultZoom", Number(event.target.value))}
            />
          </label>
          <label className={checkboxClasses(settings.enableAutoFit)}>
            <input
              className="mt-1 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500/30"
              type="checkbox"
              checked={settings.enableAutoFit}
              onChange={(event) => updateSetting("enableAutoFit", event.target.checked)}
            />
            <span className="block text-sm leading-6 text-slate-700">Auto-fit imported geometry on open</span>
          </label>
        </SettingSection>

        <SettingSection title="AI settings" description="Review defaults for this workstation.">
          <label>
            <span className={labelClasses()}>AI provider label</span>
            <input className={inputClasses()} value={settings.aiProviderLabel} onChange={(event) => updateSetting("aiProviderLabel", event.target.value)} />
          </label>
          <label>
            <span className={labelClasses()}>Risk threshold</span>
            <input
              className={inputClasses()}
              type="number"
              min={0}
              max={1}
              step={0.05}
              value={settings.aiRiskThreshold}
              onChange={(event) => updateSetting("aiRiskThreshold", Number(event.target.value))}
            />
          </label>
          <label className={checkboxClasses(settings.autoRunAiAfterProcessing)}>
            <input
              className="mt-1 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500/30"
              type="checkbox"
              checked={settings.autoRunAiAfterProcessing}
              onChange={(event) => updateSetting("autoRunAiAfterProcessing", event.target.checked)}
            />
            <span className="block text-sm leading-6 text-slate-700">Auto-run AI review after processing completes</span>
          </label>
        </SettingSection>

        <SettingSection title="Storage settings" description="Artifact handling preferences.">
          <label>
            <span className={labelClasses()}>Storage mode</span>
            <select className={inputClasses()} value={settings.storageMode} onChange={(event) => updateSetting("storageMode", event.target.value)}>
              <option value="Remote object storage">Remote object storage</option>
              <option value="Hybrid local cache">Hybrid local cache</option>
              <option value="Read-only review">Read-only review</option>
            </select>
          </label>
          <label>
            <span className={labelClasses()}>Retain uploads for (days)</span>
            <input
              className={inputClasses()}
              type="number"
              min={1}
              max={3650}
              value={settings.keepUploadsDays}
              onChange={(event) => updateSetting("keepUploadsDays", Number(event.target.value))}
            />
          </label>
          <label className={checkboxClasses(settings.preferDownloadLinks)}>
            <input
              className="mt-1 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500/30"
              type="checkbox"
              checked={settings.preferDownloadLinks}
              onChange={(event) => updateSetting("preferDownloadLinks", event.target.checked)}
            />
            <span className="block text-sm leading-6 text-slate-700">Prefer signed download links when the backend exposes them</span>
          </label>
        </SettingSection>

        <SettingSection title="Processing defaults" description="Workflow defaults for new work sessions.">
          <label>
            <span className={labelClasses()}>Processing concurrency</span>
            <input
              className={inputClasses()}
              type="number"
              min={1}
              max={16}
              value={settings.processingConcurrency}
              onChange={(event) => updateSetting("processingConcurrency", Number(event.target.value))}
            />
          </label>
          <label>
            <span className={labelClasses()}>Default survey type</span>
            <select className={inputClasses()} value={settings.defaultSurveyType} onChange={(event) => updateSetting("defaultSurveyType", event.target.value)}>
              <option value="GNSS_TRAVERSE">GNSS Traverse</option>
              <option value="LIDAR">LiDAR</option>
              <option value="DRONE_PHOTOGRAMMETRY">Drone Photogrammetry</option>
              <option value="TOTAL_STATION">Total Station</option>
              <option value="HYBRID">Hybrid</option>
            </select>
          </label>
          <label className={checkboxClasses(settings.autoOpenOutputs)}>
            <input
              className="mt-1 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500/30"
              type="checkbox"
              checked={settings.autoOpenOutputs}
              onChange={(event) => updateSetting("autoOpenOutputs", event.target.checked)}
            />
            <span className="block text-sm leading-6 text-slate-700">Open outputs context after processing completes</span>
          </label>
        </SettingSection>

        <SettingSection
          title="Auth and account"
          description="Current access mode for this workspace."
          note="Authentication state is environment-driven; this page reports status but does not mutate account credentials."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <div className={statCardTone("soft")}>
              <span className="block text-xs font-medium uppercase tracking-[0.14em] text-slate-500">Clerk publishable key</span>
              <strong className="mt-2 block text-base font-semibold text-slate-900">{import.meta.env.VITE_CLERK_PUBLISHABLE_KEY ? "Configured" : "Missing"}</strong>
            </div>
            <div className={statCardTone("soft")}>
              <span className="block text-xs font-medium uppercase tracking-[0.14em] text-slate-500">Session mode</span>
              <strong className="mt-2 block text-base font-semibold text-slate-900">{import.meta.env.VITE_CLERK_PUBLISHABLE_KEY ? "Authenticated" : "Development fallback"}</strong>
            </div>
          </div>
        </SettingSection>

        <SettingSection
          title="Appearance"
          description="Local presentation preferences."
          note="Appearance controls are local-only and do not affect other users."
        >
          <label>
            <span className={labelClasses()}>Appearance mode</span>
            <select className={inputClasses()} value={settings.appearanceMode} onChange={(event) => updateSetting("appearanceMode", event.target.value)}>
              <option value="Earth light">Earth light</option>
              <option value="Field contrast">Field contrast</option>
              <option value="Review neutral">Review neutral</option>
            </select>
          </label>
        </SettingSection>
      </div>

      <section className="space-y-5 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="space-y-1">
          <strong className="block text-lg font-semibold text-slate-900">Environment and system status</strong>
          <span className="block text-sm leading-6 text-slate-500">Runtime visibility from the current client and API.</span>
        </div>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {environmentStatus.map((item) => (
            <div key={item.label} className={statCardTone("soft")}>
              <span className="block text-xs font-medium uppercase tracking-[0.14em] text-slate-500">{item.label}</span>
              <span className={`mt-3 ${statusTone(item.healthy)}`}>{item.value}</span>
            </div>
          ))}
        </div>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {systemStats.map((item) => (
            <div key={item.label} className={statCardTone("soft")}>
              <span className="block text-xs font-medium uppercase tracking-[0.14em] text-slate-500">{item.label}</span>
              <strong className="mt-2 block text-lg font-semibold text-slate-900">{item.value}</strong>
            </div>
          ))}
        </div>
        <div className={noteClasses()}>
          These settings are real local controls saved in browser storage. They do not mutate backend environment variables or infrastructure.
        </div>
      </section>
    </div>
  );
}
