import { useState } from "react";
import type { InputFile } from "@geosurvey-ai/shared";
import { Link } from "react-router-dom";
import { UploadHelpPanel } from "./help/UploadHelpPanel";
import { useNotifications } from "../context/NotificationContext";
import { AppIcon } from "./ui/AppIcon";
import { GhostButton, PrimaryButton, SecondaryButton, getButtonClass } from "./ui/Button";
import { StatusBadge } from "./ui/StatusBadge";
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
    return "success";
  }

  if (status === "uploading") {
    return "info";
  }

  if (status === "error") {
    return "error";
  }

  return "default";
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
      <UploadHelpPanel
        sampleLinks={[
          { label: "Sample GNSS CSV", href: "/samples/sample-gnss-points.csv" },
          { label: "Sample Guide", href: "/samples/README.txt" }
        ]}
        helpAnchor="/help#what-files-to-upload"
        demoQuery="/jobs?createJob=1&demoType=GNSS_TRAVERSE&demoName=Demo%20GNSS%20Land%20Survey"
      />

      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="space-y-1">
          <strong className="block text-lg font-semibold text-[var(--text-primary)]">Upload input files</strong>
          <span className="block text-sm leading-6 text-[var(--text-secondary)]">Add files first, then continue directly into processing and Smart Check review.</span>
        </div>
        <label className={`${getButtonClass("secondary")} cursor-pointer`}>
          Browse files
          <input hidden multiple type="file" onChange={(event) => void queueFiles(event.target.files)} />
        </label>
      </div>
      <label
        className="ui-upload-dropzone"
        onDragOver={(event) => event.preventDefault()}
        onDrop={(event) => {
          event.preventDefault();
          void queueFiles(event.dataTransfer.files);
        }}
      >
        <div className="ui-upload-dropzone__icon">
          <AppIcon name="upload" className="h-6 w-6" />
        </div>
        <strong className="text-base font-semibold text-[var(--text-primary)]">Drag and drop files here</strong>
        <span className="mt-2 max-w-[28rem] text-sm leading-6 text-[var(--text-secondary)]">CSV for point lists, JPG for photos, TIFF for map images, LAS or LAZ for 3D scan files, DXF or SHP for land drawings, PDF for notes.</span>
      </label>
      {feedback ? (
        <div className="ui-inline-note">{feedback}</div>
      ) : (
        <div className="ui-inline-note bg-[rgba(255,255,255,0.92)]">
          No file yet? Download a sample and test this page. <Link className="auth-shell__footer-link" to="/help#sample-files">Open sample files help</Link>
        </div>
      )}
      {queue.length > 0 ? (
        <div className="space-y-3">
          {queue.map((item) => (
            <div key={item.id} className="space-y-4 rounded-[16px] border border-[var(--border-subtle)] bg-[rgba(255,255,255,0.94)] p-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div className="space-y-1">
                  <strong className="block text-sm font-semibold text-[var(--text-primary)]">{item.file.name}</strong>
                  <span className="block text-sm leading-6 text-[var(--text-secondary)]">{formatFileSize(item.file.size)}</span>
                </div>
                <StatusBadge label={item.message} tone={queueStatusClasses(item.status) as "default" | "success" | "info" | "error"} />
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-[var(--bg-muted)]">
                <span className="block h-full rounded-full bg-[var(--accent)] transition-[width] duration-300" style={{ width: `${item.progress}%` }} />
              </div>
              <div className="flex flex-wrap justify-end gap-2">
                {item.status === "error" && acceptedExts.some((ext) => item.file.name.toLowerCase().endsWith(ext)) ? (
                  <SecondaryButton type="button" onClick={() => void runUpload(item)}>Retry</SecondaryButton>
                ) : null}
                <GhostButton type="button" onClick={() => setQueue((current) => current.filter((entry) => entry.id !== item.id))}>Remove</GhostButton>
              </div>
            </div>
          ))}
        </div>
      ) : null}
      {showStartProcessingButton ? (
        <PrimaryButton
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
        </PrimaryButton>
      ) : null}
    </div>
  );
}
