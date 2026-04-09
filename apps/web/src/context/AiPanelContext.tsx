import { createContext, useContext, useEffect, useMemo, useState, type PropsWithChildren } from "react";
import type { AiResponseBlock, ConfirmationAction } from "../features/ai-command/types";

export type AiMessage = {
  role: "user" | "assistant";
  content: string;
  blocks?: AiResponseBlock[];
  pendingConfirmation?: ConfirmationAction | null;
};
export type AiFolder = { id: string; name: string };

const STORAGE_KEY = "geosurvey_ai_workspace_state";

type AiPanelContextValue = {
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
  getThread: (key: string) => AiMessage[];
  getThreadKeys: () => string[];
  setThread: (key: string, messages: AiMessage[] | ((current: AiMessage[]) => AiMessage[])) => void;
  clearThread: (key: string) => void;
  folders: AiFolder[];
  createFolder: (name: string) => void;
  deleteFolder: (id: string) => void;
  getThreadFolder: (key: string) => string | null;
  setThreadFolder: (key: string, folderId: string | null) => void;
};

const AiPanelContext = createContext<AiPanelContextValue | null>(null);

export function AiPanelProvider({ children }: PropsWithChildren) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [threads, setThreads] = useState<Record<string, AiMessage[]>>({});
  const [folders, setFolders] = useState<AiFolder[]>([]);
  const [threadFolders, setThreadFolders] = useState<Record<string, string | null>>({});

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return;
    }

    try {
      const parsed = JSON.parse(raw) as {
        threads?: Record<string, AiMessage[]>;
        folders?: AiFolder[];
        threadFolders?: Record<string, string | null>;
      };

      setThreads(parsed.threads ?? {});
      setFolders(parsed.folders ?? []);
      setThreadFolders(parsed.threadFolders ?? {});
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        threads,
        folders,
        threadFolders
      })
    );
  }, [threads, folders, threadFolders]);

  const value = useMemo<AiPanelContextValue>(
    () => ({
      mobileOpen,
      setMobileOpen,
      getThread: (key) => threads[key] ?? [],
      getThreadKeys: () => Object.keys(threads),
      setThread: (key, messages) => {
        setThreads((current) => ({
          ...current,
          [key]: typeof messages === "function" ? messages(current[key] ?? []) : messages
        }));
      },
      clearThread: (key) => {
        setThreads((current) => ({ ...current, [key]: [] }));
      },
      folders,
      createFolder: (name) => {
        const trimmed = name.trim();
        if (!trimmed) {
          return;
        }

        setFolders((current) => [...current, { id: `folder_${Date.now()}`, name: trimmed }]);
      },
      deleteFolder: (id) => {
        setFolders((current) => current.filter((folder) => folder.id !== id));
        setThreadFolders((current) => {
          const next = { ...current };
          for (const key of Object.keys(next)) {
            if (next[key] === id) {
              next[key] = null;
            }
          }
          return next;
        });
      },
      getThreadFolder: (key) => threadFolders[key] ?? null,
      setThreadFolder: (key, folderId) => {
        setThreadFolders((current) => ({ ...current, [key]: folderId }));
      }
    }),
    [folders, mobileOpen, threadFolders, threads]
  );

  return <AiPanelContext.Provider value={value}>{children}</AiPanelContext.Provider>;
}

export function useAiPanelState() {
  const context = useContext(AiPanelContext);
  if (!context) {
    throw new Error("useAiPanelState must be used within AiPanelProvider");
  }
  return context;
}
