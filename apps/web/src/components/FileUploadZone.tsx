import { useState } from "react";
import type { InputFile } from "@geosurvey-ai/shared";
import { useNotifications } from "../context/NotificationContext";
import { apiPost, apiUpload } from "../lib/api";

type Props = {
  jobId: string;
  onUploadComplete: (file: InputFile) => void;
  showStartProcessingButton?: boolean;
};

const acceptedExts = [".las", ".laz", ".tif", ".tiff", ".csv", ".shp", ".dxf", ".pdf", ".jpg"];

type UploadQueueItem = {
  file: File;
  id: string;
  progress: number;
  status: "ready" | "uploading" | "uploaded" | "error";
  message: string;
};

function formatFileSize(sizeBytes: number) {
  if (sizeBytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(sizeBytes / 1024))} KB`;
  }
  return `${(sizeBytes / (1024 * 1024)).toFixed(2)} MB`;
}

function queueStatusClasses(status: UploadQueueItem["status"]) {
  if (status === "uploaded") {
    return "inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-emerald-700";
  }

  if (status === "uploading") {
    return "inline-flex items-center rounded-full border border-sky-200 bg-sky-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-sky-700";
  }

  if (status === "error") {
    return "inline-flex items-center rounded-full border border-rose-200 bg-rose-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-rose-700";
  }

  return "inline-flex items-center rounded-full border border-slate-200 bg-slate-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-600";
}

export function FileUploadZone({ jobId, onUploadComplete, showStartProcessingButton = true }: Props) {
  const { addNotification } = useNotifications();
  const [queue, setQueue] = useState<UploadQueueItem[]>([]);
  const [processing, setProcessing] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const runUpload = async (item: UploadQueueItem) => {
    setQueue((current) => current.map((entry) => entry.id === item.id ? { ...entry, status: "uploading", message: "Uploading", progress: 0 } : entry));
    try {
      const inputFile = await apiUpload(jobId, item.file, (pct) => {
        setQueue((current) => current.map((entry) => entry.id === item.id ? { ...entry, progress: pct } : entry));
      });
      setQueue((current) => current.map((entry) => entry.id === item.id ? { ...entry, progress: 100, status: "uploaded", message: "Uploaded" } : entry));
      onUploadComplete(inputFile);
      setFeedback("Files uploaded successfully. Next: start processing when you're ready.");
      addNotification({
        title: "File uploaded",
        message: `${item.file.name} is ready for processing.`,
        tone: "success",
        href: `/jobs/${jobId}`,
        source: "uploads",
        toast: true
      });
    } catch (error) {
      setQueue((current) => current.map((entry) => entry.id === item.id ? { ...entry, status: "error", message: error instanceof Error ? error.message : "Upload failed" } : entry));
      setFeedback("One or more files need attention before processing can continue.");
      addNotification({
        title: "Upload failed",
        message: error instanceof Error ? error.message : "Upload failed",
        tone: "error",
        href: `/jobs/${jobId}`,
        source: "uploads"
      });
    }
  };

  const queueFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) {
      return;
    }

    const nextItems = Array.from(files).map((file) => {
      const isValid = acceptedExts.some((ext) => file.name.toLowerCase().endsWith(ext));
      return {
        file,
        id: `${file.name}-${file.size}-${file.lastModified}`,
        progress: 0,
        status: isValid ? "ready" : "error",
        message: isValid ? "Ready to upload" : "Unsupported format"
      } satisfies UploadQueueItem;
    });

    setQueue((current) => [...current, ...nextItems]);
    const validItems = nextItems.filter((item) => item.status === "ready");
    const invalidCount = nextItems.length - validItems.length;
    if (invalidCount > 0) {
      setFeedback(`${invalidCount} file${invalidCount === 1 ? "" : "s"} couldn't be uploaded because the format is not supported.`);
    }

    for (const item of validItems) {
      await runUpload(item);
    }
  };

  const hasUploadedFile = queue.some((item) => item.status === "uploaded");
  const canStartProcessing = hasUploadedFile && !queue.some((item) => item.status === "uploading");

  return (
    <div className="space-y-5" data-tour="upload-zone">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="space-y-1">
          <strong className="block text-lg font-semibold text-slate-900">Upload input files</strong>
          <span className="block text-sm leading-6 text-slate-500">Add source files first, then continue directly into processing and AI review.</span>
        </div>
        <label className="table-action cursor-pointer">
          Browse files
          <input hidden multiple type="file" onChange={(event) => void queueFiles(event.target.files)} />
        </label>
      </div>
      <label
        className="flex min-h-[12rem] cursor-pointer flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-slate-50/70 px-6 py-8 text-center transition hover:border-slate-400 hover:bg-slate-100/70"
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          void queueFiles(event.dataTransfer.files);
        }}
      >
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 text-sm font-semibold tracking-[0.18em] text-white">
          UP
        </div>
        <strong className="text-base font-semibold text-slate-900">Drag and drop survey files here</strong>
        <span className="mt-2 max-w-[28rem] text-sm leading-6 text-slate-500">Supported: LAS, LAZ, TIFF, CSV, SHP, DXF, PDF, JPG</span>
      </label>
      {feedback ? (
        <div className="rounded-2xl border border-slate-200 bg-slate-50/80 px-4 py-3 text-sm leading-6 text-slate-600">{feedback}</div>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm leading-6 text-slate-500">
          Accepted formats: {acceptedExts.join(", ")}
        </div>
      )}
      {queue.length > 0 ? (
        <div className="space-y-3">
          {queue.map((item) => (
            <div key={item.id} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div className="space-y-1">
                  <strong className="block text-sm font-semibold text-slate-900">{item.file.name}</strong>
                  <span className="block text-sm leading-6 text-slate-500">{formatFileSize(item.file.size)}</span>
                </div>
                <span className={queueStatusClasses(item.status)}>{item.message}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                <span className="block h-full rounded-full bg-emerald-600 transition-[width] duration-300" style={{ width: `${item.progress}%` }} />
              </div>
              <div className="flex flex-wrap justify-end gap-2">
                {item.status === "error" && acceptedExts.some((ext) => item.file.name.toLowerCase().endsWith(ext)) ? (
                  <button type="button" onClick={() => void runUpload(item)}>
                    Retry
                  </button>
                ) : null}
                <button type="button" onClick={() => setQueue((current) => current.filter((entry) => entry.id !== item.id))}>
                  Remove
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : null}
      {showStartProcessingButton ? (
        <button
          className="button-primary"
          disabled={processing || !canStartProcessing}
          onClick={async () => {
            setProcessing(true);
            try {
              await apiPost(`/api/jobs/${jobId}/process`, {});
              setFeedback("Processing started. Next: monitor progress and review AI insights when the run completes.");
              addNotification({
                title: "Processing started",
                message: "The job has been queued for processing.",
                tone: "info",
                href: `/jobs/${jobId}?tab=Processing`,
                source: "processing"
              });
            } catch (error) {
              const message = error instanceof Error ? error.message : "Unable to start processing.";
              setFeedback(message);
              addNotification({
                title: "Processing could not start",
                message,
                tone: "error",
                href: `/jobs/${jobId}`,
                source: "processing"
              });
            } finally {
              setProcessing(false);
            }
          }}
        >
          {processing ? "Starting..." : canStartProcessing ? "Next: Start Processing" : "Upload valid files to continue"}
        </button>
      ) : null}
    </div>
  );
}
