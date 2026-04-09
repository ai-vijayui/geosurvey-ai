import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FixedAiPanel } from "../components/ai/FixedAiPanel";
import { AppIcon } from "../components/ui/AppIcon";
import { getButtonClass, PrimaryButton } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { SearchInput } from "../components/ui/Fields";
import { PageHeader } from "../components/ui/PageHeader";
import { SectionHeader } from "../components/ui/SectionHeader";
import { useAiPanelState } from "../context/AiPanelContext";
import { buildAiViewContext } from "../hooks/useAiContext";
import { apiGet, type PaginatedResponse } from "../lib/api";

type JobSummary = {
  id: string;
  name: string;
  status: string;
  type: string;
};

function formatStatus(type: string, status: string) {
  return `${type.replaceAll("_", " ")} / ${status}`;
}

function buildPreview(value: string) {
  const normalized = value.trim();
  if (!normalized) {
    return "";
  }
  return normalized.length > 56 ? `${normalized.slice(0, 56)}...` : normalized;
}

function formatThreadLabel(key: string, jobs: JobSummary[], preview: string) {
  if (key === "general") {
    return {
      title: "General assistant",
      subtitle: "Workspace-wide guidance, reports, exports, and next steps."
    };
  }

  if (key.startsWith("general:")) {
    return {
      title: preview || "New chat",
      subtitle: "General GeoSurvey assistant conversation."
    };
  }

  const jobId = key.replace(/^job:/, "");
  const job = jobs.find((item) => item.id === jobId);

  return {
    title: job?.name ?? "Survey job conversation",
    subtitle: job ? formatStatus(job.type, job.status) : `Job ${jobId}`
  };
}

export function AiWorkspaceHubPage() {
  const {
    getThreadKeys,
    getThread,
    setThread,
    clearThread,
  } = useAiPanelState();
  const [selectedKey, setSelectedKey] = useState<string>("general");
  const [search, setSearch] = useState("");

  const jobsQuery = useQuery({
    queryKey: ["ai-workspace", "jobs"],
    queryFn: () => apiGet<PaginatedResponse<JobSummary[]>>("/api/jobs?limit=50")
  });

  const jobs = jobsQuery.data?.data ?? [];
  const allThreadKeys = useMemo(() => {
    const threadKeys = getThreadKeys();
    const keys = threadKeys.includes("general") ? threadKeys : ["general", ...threadKeys];
    return Array.from(new Set(keys));
  }, [getThreadKeys]);
  const filteredThreadKeys = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) {
      return allThreadKeys;
    }

    return allThreadKeys.filter((key) => {
      const messages = getThread(key);
      const preview = buildPreview(messages.find((message) => message.role === "user")?.content ?? messages[messages.length - 1]?.content ?? "");
      const meta = formatThreadLabel(key, jobs, preview);
      return `${meta.title} ${meta.subtitle} ${preview}`.toLowerCase().includes(term);
    });
  }, [allThreadKeys, getThread, jobs, search]);

  const activeKey = filteredThreadKeys.includes(selectedKey) ? selectedKey : filteredThreadKeys[0] ?? "general";
  const activeJobId = activeKey.startsWith("job:") ? activeKey.replace(/^job:/, "") : null;
  const context = {
    ...buildAiViewContext({
      route: activeJobId ? `/jobs/${activeJobId}` : "/ai",
      page: "AI Workspace",
      jobId: activeJobId
    }),
    threadKey: activeKey,
    title: "Geo Assistant",
    subtitle: activeJobId ? "Survey job assistant" : "GeoSurvey workspace assistant"
  };
  const activeMessages = getThread(activeKey);
  const activePreview = buildPreview(activeMessages.find((message) => message.role === "user")?.content ?? activeMessages[activeMessages.length - 1]?.content ?? "");
  const activeMeta = formatThreadLabel(activeKey, jobs, activePreview);

  function handleNewChat() {
    const key = `general:${Date.now()}`;
    setThread(key, []);
    setSelectedKey(key);
  }

  return (
    <div className="reference-page ai-workspace-page">
      <PageHeader
        title="AI Workspace"
        subtitle="Work across commands, chat history, and job-specific guidance from one assistant workspace."
      />
      <div className="ai-studio-layout">
      <aside className="ai-studio-sidebar">
        <div className="ai-studio-sidebar__brand">
          <div className="ai-studio-sidebar__mark">
            <AppIcon name="ai" />
          </div>
          <div className="stack" style={{ gap: "0.18rem" }}>
            <strong>Geo Assistant</strong>
            <span className="text-muted">Command workspace</span>
          </div>
        </div>

        <PrimaryButton type="button" className="ai-studio-sidebar__new" onClick={handleNewChat}>New chat</PrimaryButton>

        <SearchInput value={search} onChange={(event) => setSearch(event.target.value)} label="Search chats" placeholder="Search recent chats" />

        <div className="ai-studio-sidebar__section">
          <span className="ai-studio-sidebar__label">Recent</span>
          <div className="ai-studio-thread-list">
            {filteredThreadKeys.map((key) => {
              const messages = getThread(key);
              const preview = buildPreview(messages.find((message) => message.role === "user")?.content ?? messages[messages.length - 1]?.content ?? "");
              const meta = formatThreadLabel(key, jobs, preview);
              const selected = key === activeKey;

              return (
                <button key={key} type="button" className={`ai-studio-thread${selected ? " active" : ""}`} onClick={() => setSelectedKey(key)}>
                  <div className="stack" style={{ gap: "0.28rem" }}>
                    <strong>{meta.title}</strong>
                    <span className="text-muted">{meta.subtitle}</span>
                    {preview ? <span className="text-muted">{preview}</span> : null}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </aside>

      <section className="ai-studio-main">
        <div className="ai-studio-main__topbar">
          <div className="stack" style={{ gap: "0.18rem" }}>
            <strong className="ai-studio-main__title">{activeMeta.title}</strong>
            <span className="text-muted">{activeMeta.subtitle}</span>
          </div>

          <div className="ai-studio-main__actions">
            {activeJobId ? (
              <Link className={getButtonClass("secondary")} to={`/jobs/${activeJobId}`}>
                Open related job
              </Link>
            ) : null}
            <button type="button" className={getButtonClass("ghost")} onClick={() => clearThread(activeKey)}>
              Clear chat
            </button>
          </div>
        </div>

        <Card className="ai-studio-panel">
          <FixedAiPanel contextOverride={context} />
        </Card>
      </section>
      </div>
    </div>
  );
}
