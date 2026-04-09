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

const navItems = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/ai", label: "AI Workspace" },
  { to: "/projects", label: "Projects" },
  { to: "/jobs", label: "Jobs" },
  { to: "/gnss", label: "GNSS Intake" },
  { to: "/processing", label: "Processing" },
  { to: "/reports", label: "Reports" },
  { to: "/settings", label: "Settings" }
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

function LayoutShell() {
  const authEnabled = Boolean(import.meta.env.VITE_CLERK_PUBLISHABLE_KEY);
  const navigate = useNavigate();
  const location = useLocation();
  const { mobileOpen, setMobileOpen } = useAiPanelState();
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
          <div className="grid h-full content-start gap-5">
            <div className="reference-brand">
              <div className="reference-brand__mark">GS</div>
              <div className="grid gap-0.5">
                <div className="reference-brand__title">GEOSURVEY</div>
                <div className="reference-brand__copy">Operational survey workspace</div>
              </div>
            </div>

            <div className="reference-profile">
              <div className="reference-profile__avatar">GS</div>
              <div className="grid gap-0.5">
                <strong className="text-sm text-slate-900">Survey Lead</strong>
                <span className="text-xs text-slate-500">{authEnabled ? "Authenticated session" : "Local development mode"}</span>
              </div>
            </div>

            <nav className="reference-nav">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  className={({ isActive }) => `reference-nav-link ${isActive ? "active" : ""}`}
                  to={item.to}
                >
                  <span className="reference-nav-dot" />
                  {item.label}
                </NavLink>
              ))}
            </nav>

            <div className="reference-promo">
              <strong className="text-2xl leading-tight">Keep every survey moving.</strong>
              <p>{nextAction.body}</p>
              <button className="button-primary w-full" onClick={runPrimaryAction}>
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
              <select className="min-h-[42px] w-[220px] rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 outline-none" aria-label="Recent project switcher" value={activeProjectId ?? ""} onChange={(event) => handleProjectSwitch(event.target.value)}>
                {projects.length === 0 ? <option value="">No projects yet</option> : null}
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
              <button type="button" className="button-secondary" onClick={() => navigate("/processing")}>
                Processing {dashboardQuery.data?.activeJobs ? `(${dashboardQuery.data.activeJobs})` : ""}
              </button>
              <button type="button" className="button-secondary" onClick={() => setIsCreateProjectOpen(true)}>
                New Project
              </button>
              <button type="button" className="button-primary" onClick={() => navigate("/jobs?createJob=1")}>
                New Job
              </button>
              <button
                type="button"
                className="button-ghost ai-mobile-trigger"
                onClick={() => navigate("/ai")}
              >
                Ask AI
              </button>
              <NotificationCenter />
              {authEnabled ? <UserButton /> : <span className="status-badge">Dev mode</span>}
            </div>
          </header>

          <div className="main-scroll-area reference-main">
            <div className={`reference-main__content min-w-0 ${showShellAiPanel ? "reference-main__content--with-panel" : ""}`}>
              <main>
                <Outlet />
              </main>
            </div>
          </div>
        </section>

        {showShellAiPanel ? (
          <aside className="right-ai-panel reference-panel min-h-0">
            <FixedAiPanel />
          </aside>
        ) : null}
      </div>
      {mobileOpen ? <button type="button" className="ai-sidebar-backdrop" aria-label="Close AI panel" onClick={() => setMobileOpen(false)} /> : null}
      {mobileOpen ? (
        <div className="ai-mobile-sheet">
          <FixedAiPanel mobile onCloseMobile={() => setMobileOpen(false)} />
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
