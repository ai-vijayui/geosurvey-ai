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
import { AppShell } from "./ui/AppShell";
import { AppIcon, type AppIconName } from "./ui/AppIcon";
import { getButtonClass } from "./ui/Button";
import { SidebarNavItem } from "./ui/SidebarNavItem";
import { SidebarSection } from "./ui/SidebarSection";

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
    <>
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
      <AppShell
        sidebar={(
          <aside className="left-sidebar reference-sidebar ui-sidebar z-20">
            <div className="grid h-full grid-rows-[auto_auto_1fr_auto] content-start gap-5">
              <div className="reference-brand ui-brand-lockup">
                <div className="reference-brand__mark">GS</div>
                <div className="grid gap-0.5">
                  <div className="reference-brand__title">GEOSURVEY</div>
                  <div className="reference-brand__copy">Operational survey workspace</div>
                </div>
              </div>

              <SidebarSection title="Workspace" className="reference-profile ui-sidebar-section--workspace">
                <div className="grid gap-3 w-full">
                  <div className="grid gap-1">
                    <div className="reference-profile__label">
                      <span className="reference-profile__label-icon" aria-hidden="true">
                        <AppIcon name="projects" />
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
                    className="ui-input ui-input--select"
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
              </SidebarSection>

              <SidebarSection title="Navigation">
                <nav className="reference-nav">
                  {navItems.map((item) => (
                    <SidebarNavItem
                      key={item.to}
                      to={item.to}
                      label={item.label}
                      icon={<AppIcon name={item.icon as AppIconName} />}
                      secondary={item.to === "/gnss" || item.to === "/processing"}
                    />
                  ))}
                </nav>
              </SidebarSection>

              <div className="reference-promo ui-sidebar-promo">
                <span className="reference-promo__eyebrow">Recommended next step</span>
                <strong className="text-2xl leading-tight">Keep every survey moving.</strong>
                <p>{nextAction.body}</p>
                <button className={getButtonClass("primary", true)} onClick={runPrimaryAction}>
                  <span className="button-icon" aria-hidden="true">
                    <AppIcon name="spark" />
                  </span>
                  {nextAction.actionLabel}
                </button>
              </div>
            </div>
          </aside>
        )}
        topbar={(
          <header className="topbar reference-header ui-topbar">
            <div className="reference-header__brand">
              <span className="reference-header__eyebrow">{location.pathname.startsWith("/jobs/") ? "Job workspace" : "Operations workspace"}</span>
              <strong className="reference-header__title">Live Survey Operations</strong>
            </div>

            <div className="reference-header__search">
              <span className="reference-header__search-icon" aria-hidden="true">
                <AppIcon name="search" />
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
              <button type="button" className={getButtonClass("primary")} onClick={() => navigate("/jobs?createJob=1")}>
                <span className="button-icon" aria-hidden="true">
                  <AppIcon name="plus" />
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
                  <AppIcon name="ai" />
                </span>
              </button>
              <NotificationCenter />
              {authEnabled ? <UserButton /> : <span className="ui-status-badge ui-status-badge--info">Dev mode</span>}
            </div>
          </header>
        )}
      >
        <Outlet />
      </AppShell>
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
    </>
  );
}

export function Layout() {
  return (
    <AiPanelProvider>
      <LayoutShell />
    </AiPanelProvider>
  );
}
