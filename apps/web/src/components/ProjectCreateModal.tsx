import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNotifications } from "../context/NotificationContext";
import { apiPost } from "../lib/api";

type ProjectRecord = {
  id: string;
  name: string;
  description?: string | null;
  surveyJobs?: Array<{ id: string; name: string; status: string; type: string }>;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: (project: ProjectRecord) => void;
};

const emptyForm = {
  name: "",
  client: "",
  location: ""
};

export function ProjectCreateModal({ isOpen, onClose, onCreated }: Props) {
  const queryClient = useQueryClient();
  const { addNotification } = useNotifications();
  const [form, setForm] = useState(emptyForm);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const createProject = useMutation({
    mutationFn: () => apiPost<ProjectRecord>("/api/projects", form),
    onSuccess: async (project) => {
      await queryClient.invalidateQueries({ queryKey: ["projects"] });
      setForm(emptyForm);
      setErrorMessage(null);
      addNotification({
        title: "Project created",
        message: `${project.name} is ready for jobs and uploads.`,
        tone: "success",
        href: `/jobs?projectId=${project.id}`,
        source: "projects"
      });
      onCreated?.(project);
      onClose();
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : "We couldn't create the project. Try again.";
      setErrorMessage(message);
      addNotification({
        title: "Project creation failed",
        message,
        tone: "error",
        source: "projects"
      });
    }
  });

  if (!isOpen) {
    return null;
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(event) => event.stopPropagation()}>
        <div className="modal-panel__header">
          <div className="modal-panel__header-copy">
            <strong>Create project</strong>
            <span className="text-muted">Start with a project so every job, upload, and report has a clear home.</span>
          </div>
          <button className="icon-button icon-button-ghost" onClick={onClose} aria-label="Close create project modal" title="Close">
            <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true">
              <path d="M6.7 5.3 12 10.6l5.3-5.3 1.4 1.4L13.4 12l5.3 5.3-1.4 1.4L12 13.4l-5.3 5.3-1.4-1.4L10.6 12 5.3 6.7l1.4-1.4Z" />
            </svg>
          </button>
        </div>

        <div className="modal-panel__body">
          <div className="form-grid">
            <label className="field field-wide">
              <span>Project name</span>
              <input
                autoFocus
                value={form.name}
                onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                placeholder="North Ridge Boundary Survey"
              />
            </label>
            <label className="field">
              <span>Client</span>
              <input
                value={form.client}
                onChange={(event) => setForm((current) => ({ ...current, client: event.target.value }))}
                placeholder="Optional"
              />
            </label>
            <label className="field">
              <span>Location</span>
              <input
                value={form.location}
                onChange={(event) => setForm((current) => ({ ...current, location: event.target.value }))}
                placeholder="Optional"
              />
            </label>
          </div>

          <div className="inline-note">
            Once the project is created, you can immediately create jobs, upload files, and process outputs without leaving the flow.
          </div>

          {errorMessage ? <div className="error-text">{errorMessage}</div> : null}
        </div>

        <div className="modal-panel__footer">
          <button className="button-secondary" onClick={onClose}>Cancel</button>
          <button className="button-primary" disabled={!form.name.trim() || createProject.isPending} onClick={() => createProject.mutate()}>
            {createProject.isPending ? "Creating..." : "Create project"}
          </button>
        </div>
      </div>
    </div>
  );
}
