import { UserButton } from "@clerk/clerk-react";
import { useQuery } from "@tanstack/react-query";
import React, { useMemo, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { AiPanelProvider, useAiPanelState } from "../context/AiPanelContext";
import { apiGet, type PaginatedResponse } from "../lib/api";
import { FixedAiPanel } from "./ai/FixedAiPanel";
import { NotificationCenter } from "./notifications/NotificationCenter";
import { ToastViewport } from "./notifications/ToastViewport";
import { ProjectCreateModal } from "./ProjectCreateModal";

type IconName =
  | "dashboard"
  | "ai"
  | "projects"
  | "jobs"
  | "gnss"
  | "processing"
  | "reports"
  | "settings"
  | "help"
  | "search"
  | "plus"
  | "spark";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: "dashboard" as const },
  { to: "/ai", label: "AI Workspace", icon: "ai" as const },
  { to: "/projects", label: "Projects", icon: "projects" as const },
  { to: "/jobs", label: "Jobs", icon: "jobs" as const },
  { to: "/gnss", label: "GNSS Intake", icon: "gnss" as const },
  { to: "/processing", label: "Processing", icon: "processing" as const },
  { to: "/reports", label: "Reports", icon: "reports" as const },
  { to: "/settings", label: "Settings", icon: "settings" as const },
  { to: "/help", label: "Help & Learning", icon: "help" as const }
];

type ProjectRecord = {
  id: string;
  name: string;
  surveyJobs?: Array<{ id: string; name: string; status: string; type: string }>;
};

type DashboardStats = {
  activeJobs: number;
  recentInsights: Array<{ id: string; category: string; severity: string; message: string; confidence: number; job?: { name?: string } }>;
  jobsByStatus: Record<string, number>;
};

type JobSummary = {
  id: string;
  name: string;
  projectId: string;
  status: string;
  type: string;
};

function getNextAction(projectCount: number, jobCount: number, activeJobs: number) {
  if (projectCount === 0) {
    return {
      title: "Create your first project",
      body: "Projects unlock the full workflow: jobs, uploads, processing, review, and export.",
      actionLabel: "New Project",
      actionType: "project" as const
    };
  }
  if (jobCount === 0) {
    return {
      title: "Create a job to start surveying",
      body: "Create a job inside a project so you can upload files and start processing.",
      actionLabel: "New Job",
      actionType: "job" as const
    };
  }
  if (activeJobs === 0) {
    return {
      title: "Continue a job and start processing",
      body: "Upload survey files, validate the source set, and run the processing pipeline.",
      actionLabel: "Open Jobs",
      actionType: "jobs" as const
    };
  }
  return {
    title: "Review live processing and AI findings",
    body: "Monitor active workflows, then review outputs and AI insights as soon as they complete.",
    actionLabel: "Open Processing",
    actionType: "processing" as const
  };
}

function ShellIcon({ name }: { name: IconName }) {
  const paths: Record<IconName, string> = {
    dashboard: "M4 5.5A1.5 1.5 0 0 1 5.5 4h5A1.5 1.5 0 0 1 12 5.5v5a1.5 1.5 0 0 1-1.5 1.5h-5A1.5 1.5 0 0 1 4 10.5v-5Zm8 0A1.5 1.5 0 0 1 13.5 4h5A1.5 1.5 0 0 1 20 5.5v2A1.5 1.5 0 0 1 18.5 9h-5A1.5 1.5 0 0 1 12 7.5v-2Zm0 8A1.5 1.5 0 0 1 13.5 12h5a1.5 1.5 0 0 1 1.5 1.5v5a1.5 1.5 0 0 1-1.5 1.5h-5a1.5 1.5 0 0 1-1.5-1.5v-5ZM4 16.5A4.5 4.5 0 0 1 8.5 12H10a2 2 0 1 1 0 4H8.5A.5.5 0 0 0 8 16.5V18a2 2 0 1 1-4 0v-1.5Z",
    ai: "M12 3 4 7.5v9L12 21l8-4.5v-9L12 3Zm0 2.3 5.8 3.2L12 11.7 6.2 8.5 12 5.3Zm-6 4.9 5 2.8v5.7l-5-2.8v-5.7Zm7 5.7V13l5-2.8v5.7l-5 2.8Z",
    projects: "M4 7.5A2.5 2.5 0 0 1 6.5 5h11A2.5 2.5 0 0 1 20 7.5v9a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 16.5v-9Zm3 1.5h10M7 11h5",
    jobs: "M6.5 4h11A2.5 2.5 0 0 1 20 6.5v11a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 17.5v-11A2.5 2.5 0 0 1 6.5 4ZM8 8h8M8 12h8M8 16h5",
    gnss: "M12 4v4m0 8v4M4 12h4m8 0h4m-2.5-5.5 1.5 1.5m-12 8 1.5 1.5m0-11 1.5 1.5m8 8 1.5 1.5M12 9.5A2.5 2.5 0 1 1 9.5 12 2.5 2.5 0 0 1 12 9.5Z",
    processing: "M12 5v3m0 8v3M5 12H2m20 0h-3m-1.2-5.8-2.1 2.1M8.3 15.7l-2.1 2.1m0-11.6 2.1 2.1m7.4 7.4 2.1 2.1M12 9a3 3 0 1 1-3 3 3 3 0 0 1 3-3Z",
    reports: "M7 4h7l5 5v9.5A2.5 2.5 0 0 1 16.5 21h-9A2.5 2.5 0 0 1 5 18.5v-12A2.5 2.5 0 0 1 7.5 4H7Zm5 1.5V9h3.5M8 12h8M8 15.5h8M8 19h5",
    settings: "M12 8.8A3.2 3.2 0 1 1 8.8 12 3.2 3.2 0 0 1 12 8.8Zm7.4 3.2-.9-.5a6.7 6.7 0 0 0-.5-1.3l.5-.9a1 1 0 0 0-.2-1.2l-1.2-1.2a1 1 0 0 0-1.2-.2l-.9.5c-.4-.2-.8-.4-1.3-.5l-.5-.9a1 1 0 0 0-1-.6h-1.6a1 1 0 0 0-1 .6l-.5.9c-.5.1-.9.3-1.3.5l-.9-.5a1 1 0 0 0-1.2.2L5.7 8.1a1 1 0 0 0-.2 1.2l.5.9c-.2.4-.4.8-.5 1.3l-.9.5a1 1 0 0 0-.6 1v1.6a1 1 0 0 0 .6 1l.9.5c.1.5.3.9.5 1.3l-.5.9a1 1 0 0 0 .2 1.2l1.2 1.2a1 1 0 0 0 1.2.2l.9-.5c.4.2.8.4 1.3.5l.5.9a1 1 0 0 0 1 .6h1.6a1 1 0 0 0 1-.6l.5-.9c.5-.1.9-.3 1.3-.5l.9.5a1 1 0 0 0 1.2-.2l1.2-1.2a1 1 0 0 0 .2-1.2l-.5-.9c.2-.4.4-.8.5-1.3l.9-.5a1 1 0 0 0 .6-1V13a1 1 0 0 0-.6-1Z",
    help: "M12 21a9 9 0 1 1 9-9 9 9 0 0 1-9 9Zm0-5.2h.01M9.8 9.2a2.4 2.4 0 1 1 4 1.8c-.8.6-1.3 1-1.3 2v.3",
    search: "m20 20-3.8-3.8M10.8 17a6.2 6.2 0 1 1 0-12.4 6.2 6.2 0 0 1 0 12.4Z",
    plus: "M12 5v14M5 12h14",
    spark: "M12 2.8 14 8l5.2 2-5.2 2-2 5.2-2-5.2-5.2-2L10 8l2-5.2Z"
  };

  return (
    <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true">
      <path d={paths[name]} />
    </svg>
  );
}

function LayoutShell() {
  const authEnabled = Boolean(import.meta.env.VITE_CLERK_PUBLISHABLE_KEY);
  const navigate = useNavigate();
  const location = useLocation();
  const { desktopOpen, setDesktopOpen, mobileOpen, setMobileOpen } = useAiPanelState();
  const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);
  const [search, setSearch] = useState("");

  const projectsQuery = useQuery({
    queryKey: ["projects", "list"],
    queryFn: () => apiGet<ProjectRecord[]>("/api/projects")
  });
  const jobsQuery = useQuery({
    queryKey: ["layout", "jobs"],
    queryFn: () => apiGet<PaginatedResponse<JobSummary[]>>("/api/jobs?limit=6")
  });
  const dashboardQuery = useQuery({
    queryKey: ["layout", "dashboard"],
    queryFn: () => apiGet<DashboardStats>("/api/dashboard/stats")
  });

  const projects = projectsQuery.data ?? [];
  const jobs = jobsQuery.data?.data ?? [];
  const projectCount = projects.length;
  const jobCount = jobsQuery.data?.pagination.total ?? jobs.length;
  const nextAction = getNextAction(projectCount, jobCount, dashboardQuery.data?.activeJobs ?? 0);
  const showShellAiPanel = !location.pathname.startsWith("/ai");
  const activeProjectId = useMemo(() => {
    const remembered = typeof window !== "undefined" ? window.localStorage.getItem("geosurvey_last_project_id") : null;
    return remembered && projects.some((project) => project.id === remembered) ? remembered : projects[0]?.id;
  }, [projects]);

  function handleProjectSwitch(projectId: string) {
    if (typeof window !== "undefined") {
      window.localStorage.setItem("geosurvey_last_project_id", projectId);
    }
    navigate(`/jobs?projectId=${projectId}`);
  }

  function runPrimaryAction() {
    if (nextAction.actionType === "project") {
      setIsCreateProjectOpen(true);
      return;
    }
    if (nextAction.actionType === "job") {
      navigate("/jobs?createJob=1");
      return;
    }
    if (nextAction.actionType === "processing") {
      navigate("/processing");
      return;
    }
    navigate("/jobs");
  }

  function openAiPanel() {
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      setMobileOpen(true);
      return;
    }
    setDesktopOpen(true);
  }

  return (
    <div className="app-shell reference-shell ui-compact">
      <ProjectCreateModal
        isOpen={isCreateProjectOpen}
        onClose={() => setIsCreateProjectOpen(false)}
        onCreated={(project) => {
          if (typeof window !== "undefined") {
            window.localStorage.setItem("geosurvey_last_project_id", project.id);
          }
          navigate(`/jobs?projectId=${project.id}&createJob=1`);
        }}
      />
      <div className="app-shell__frame reference-shell__frame">
        <aside className="left-sidebar reference-sidebar z-20">
          <div className="grid h-full grid-rows-[auto_auto_1fr_auto] content-start gap-5">
            <div className="reference-brand">
              <div className="reference-brand__mark">GS</div>
              <div className="grid gap-0.5">
                <div className="reference-brand__title">GEOSURVEY</div>
                <div className="reference-brand__copy">Operational survey workspace</div>
              </div>
            </div>

            <div className="reference-profile">
              <div className="grid gap-3 w-full">
                <div className="grid gap-1">
                  <div className="reference-profile__label">
                    <span className="reference-profile__label-icon" aria-hidden="true">
                      <ShellIcon name="projects" />
                    </span>
                    <strong className="text-sm text-slate-900">Project workspace</strong>
                  </div>
                  <span className="text-xs text-slate-500">
                    {projects.length === 0
                      ? "Create a project to organize jobs and outputs."
                      : authEnabled
                        ? "Switch the active project workspace."
                        : "Switch the current development project."}
                  </span>
                </div>
                <select
                  className="min-h-[42px] w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none"
                  aria-label="Project switcher"
                  value={activeProjectId ?? ""}
                  onChange={(event) => handleProjectSwitch(event.target.value)}
                >
                  {projects.length === 0 ? <option value="">No projects yet</option> : null}
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <nav className="reference-nav">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  className={({ isActive }) => `reference-nav-link ${isActive ? "active" : ""}`}
                  to={item.to}
                >
                  <span className="reference-nav-icon" aria-hidden="true">
                    <ShellIcon name={item.icon} />
                  </span>
                  <span className="reference-nav-label">{item.label}</span>
                </NavLink>
              ))}
            </nav>

            <div className="reference-promo">
              <span className="reference-promo__eyebrow">Recommended next step</span>
              <strong className="text-2xl leading-tight">Keep every survey moving.</strong>
              <p>{nextAction.body}</p>
              <button className="button-primary w-full" onClick={runPrimaryAction}>
                <span className="button-icon" aria-hidden="true">
                  <ShellIcon name="spark" />
                </span>
                {nextAction.actionLabel}
              </button>
            </div>
          </div>
        </aside>

        <section className="main-column reference-content min-w-0">
          <header className="topbar reference-header">
            <div className="reference-header__brand">
              <span className="reference-header__eyebrow">{location.pathname.startsWith("/jobs/") ? "Job workspace" : "Operations workspace"}</span>
              <strong className="reference-header__title">Live Survey Operations</strong>
            </div>

            <div className="reference-header__search">
              <span className="reference-header__search-icon" aria-hidden="true">
                <ShellIcon name="search" />
              </span>
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    navigate(`/jobs?q=${encodeURIComponent(search.trim())}`);
                  }
                }}
                placeholder="Search jobs, projects, reports, or outputs"
              />
            </div>

            <div className="reference-header__actions">
              <button type="button" className="button-primary" onClick={() => navigate("/jobs?createJob=1")}>
                <span className="button-icon" aria-hidden="true">
                  <ShellIcon name="plus" />
                </span>
                New Job
              </button>
              <button
                type="button"
                className={`icon-toolbar-button${desktopOpen || mobileOpen ? " active" : ""}`}
                onClick={openAiPanel}
                aria-label="Open AI chat panel"
                title="Open AI chat panel"
              >
                <span className="icon-toolbar-button__glyph" aria-hidden="true">
                  <ShellIcon name="ai" />
                </span>
              </button>
              <NotificationCenter />
              {authEnabled ? <UserButton /> : <span className="status-badge">Dev mode</span>}
            </div>
          </header>

          <div className="main-scroll-area reference-main">
            <div className="reference-main__content min-w-0">
              <main>
                <Outlet />
              </main>
            </div>
          </div>
        </section>
      </div>
      {showShellAiPanel && desktopOpen ? <button type="button" className="ai-desktop-backdrop" aria-label="Close AI panel" onClick={() => setDesktopOpen(false)} /> : null}
      {showShellAiPanel && desktopOpen ? (
        <aside className="ai-desktop-overlay" aria-label="AI chat panel">
          <FixedAiPanel onClose={() => setDesktopOpen(false)} />
        </aside>
      ) : null}
      {mobileOpen ? <button type="button" className="ai-sidebar-backdrop" aria-label="Close AI panel" onClick={() => setMobileOpen(false)} /> : null}
      {mobileOpen ? (
        <div className="ai-mobile-sheet">
          <FixedAiPanel mobile onClose={() => setMobileOpen(false)} />
        </div>
      ) : null}
      <ToastViewport />
    </div>
  );
}

export function Layout() {
  return (
    <AiPanelProvider>
      <LayoutShell />
    </AiPanelProvider>
  );
}
