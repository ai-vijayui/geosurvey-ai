import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FixedAiPanel } from "../components/ai/FixedAiPanel";
import { useAiPanelState } from "../context/AiPanelContext";
import { buildAiViewContext } from "../hooks/useAiContext";
import { apiGet, type PaginatedResponse } from "../lib/api";

type JobSummary = {
  id: string;
  name: string;
  status: string;
  type: string;
};

function formatThreadLabel(key: string, jobs: JobSummary[]) {
  if (key === "general") {
    return {
      title: "General assistant",
      subtitle: "Workspace-wide guidance, reports, exports, and next steps.",
      href: "/ai"
    };
  }

  const jobId = key.replace(/^job:/, "");
  const job = jobs.find((item) => item.id === jobId);

  return {
    title: job?.name ?? "Survey job conversation",
    subtitle: job ? `${job.type.replaceAll("_", " ")} / ${job.status}` : `Job ${jobId}`,
    href: `/jobs/${jobId}`
  };
}

export function AiWorkspacePage() {
  const { getThreadKeys, getThread, clearThread } = useAiPanelState();
  const threadKeys = getThreadKeys().filter((key) => getThread(key).length > 0);
  const [selectedKey, setSelectedKey] = useState<string>("general");
  const jobsQuery = useQuery({
    queryKey: ["ai-workspace", "jobs"],
    queryFn: () => apiGet<PaginatedResponse<JobSummary[]>>("/api/jobs?limit=50")
  });

  const jobs = jobsQuery.data?.data ?? [];
  const allThreadKeys = useMemo(() => {
    const keys = threadKeys.includes("general") ? threadKeys : ["general", ...threadKeys];
    return Array.from(new Set(keys));
  }, [threadKeys]);

  const activeKey = allThreadKeys.includes(selectedKey) ? selectedKey : allThreadKeys[0] ?? "general";
  const activeJobId = activeKey.startsWith("job:") ? activeKey.replace(/^job:/, "") : null;
  const context = buildAiViewContext({
    route: activeJobId ? `/jobs/${activeJobId}` : "/ai",
    page: "AI Workspace",
    jobId: activeJobId
  });

  return (
    <div className="page-grid">
      <div className="page-header">
        <div className="page-header-copy">
          <h1 className="page-title">AI Workspace</h1>
          <p className="page-description">Manage your general assistant conversation and each survey job’s AI chat history in one place.</p>
        </div>
      </div>

      <div className="ai-workspace-layout">
        <section className="card stack ai-history-card">
          <div className="section-title">
            <div className="stack" style={{ gap: "0.2rem" }}>
              <strong>Conversation history</strong>
              <span className="text-muted">Switch between the general assistant and saved job-specific threads.</span>
            </div>
          </div>

          <div className="ai-history-list">
            {allThreadKeys.map((key) => {
              const meta = formatThreadLabel(key, jobs);
              const messages = getThread(key);
              const lastMessage = messages[messages.length - 1]?.content ?? "No messages yet";
              const selected = key === activeKey;

              return (
                <button key={key} type="button" className={`ai-history-item${selected ? " active" : ""}`} onClick={() => setSelectedKey(key)}>
                  <div className="stack" style={{ gap: "0.25rem" }}>
                    <strong>{meta.title}</strong>
                    <span className="text-muted">{meta.subtitle}</span>
                    <span className="text-muted">{lastMessage.slice(0, 110)}{lastMessage.length > 110 ? "..." : ""}</span>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="row">
            <button type="button" className="button-secondary" onClick={() => clearThread(activeKey)}>
              Clear selected
            </button>
            {activeJobId ? (
              <Link className="table-action" to={`/jobs/${activeJobId}`}>
                Open related job
              </Link>
            ) : null}
          </div>
        </section>

        <div className="ai-workspace-panel">
          <FixedAiPanel contextOverride={context} />
        </div>
      </div>
    </div>
  );
}
