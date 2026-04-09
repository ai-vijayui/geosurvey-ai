import { createContext, useContext, useEffect, useMemo, useRef, useState, type PropsWithChildren } from "react";
import { useQuery } from "@tanstack/react-query";
import { apiGet, type PaginatedResponse } from "../lib/api";

type NotificationTone = "info" | "success" | "warning" | "error";

export type NotificationItem = {
  id: string;
  title: string;
  message: string;
  tone: NotificationTone;
  createdAt: string;
  read: boolean;
  href?: string;
  source?: string;
};

export type ToastItem = {
  id: string;
  title: string;
  message?: string;
  tone: NotificationTone;
};

type NotificationInput = {
  title: string;
  message: string;
  tone?: NotificationTone;
  href?: string;
  source?: string;
  toast?: boolean;
};

type JobWatchRecord = {
  id: string;
  name: string;
  status: string;
  updatedAt: string;
};

type NotificationContextValue = {
  notifications: NotificationItem[];
  toasts: ToastItem[];
  unreadCount: number;
  addNotification: (input: NotificationInput) => void;
  pushToast: (input: Omit<ToastItem, "id">) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
  dismissToast: (id: string) => void;
};

const NOTIFICATION_STORAGE_KEY = "geosurvey_notifications";
const JOB_SNAPSHOT_STORAGE_KEY = "geosurvey_notification_job_snapshot";

const NotificationContext = createContext<NotificationContextValue | null>(null);

function createId(prefix: string) {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function NotificationProvider({ children }: PropsWithChildren) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const initializedRef = useRef(false);
  const snapshotRef = useRef<Record<string, { status: string; updatedAt: string }>>({});

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    try {
      const rawNotifications = window.localStorage.getItem(NOTIFICATION_STORAGE_KEY);
      const rawSnapshot = window.localStorage.getItem(JOB_SNAPSHOT_STORAGE_KEY);

      if (rawNotifications) {
        setNotifications(JSON.parse(rawNotifications) as NotificationItem[]);
      }
      if (rawSnapshot) {
        snapshotRef.current = JSON.parse(rawSnapshot) as Record<string, { status: string; updatedAt: string }>;
      }
    } catch {
      window.localStorage.removeItem(NOTIFICATION_STORAGE_KEY);
      window.localStorage.removeItem(JOB_SNAPSHOT_STORAGE_KEY);
    } finally {
      initializedRef.current = true;
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !initializedRef.current) {
      return;
    }
    window.localStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(notifications));
  }, [notifications]);

  function dismissToast(id: string) {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }

  function pushToast(input: Omit<ToastItem, "id">) {
    const id = createId("toast");
    setToasts((current) => [...current, { ...input, id }]);
    if (typeof window !== "undefined") {
      window.setTimeout(() => dismissToast(id), 4200);
    }
  }

  function addNotification(input: NotificationInput) {
    const item: NotificationItem = {
      id: createId("notification"),
      title: input.title,
      message: input.message,
      tone: input.tone ?? "info",
      createdAt: new Date().toISOString(),
      read: false,
      href: input.href,
      source: input.source
    };
    let inserted = false;
    setNotifications((current) => {
      const duplicate = current.find((entry) =>
        entry.title === item.title &&
        entry.message === item.message &&
        entry.href === item.href &&
        Date.now() - new Date(entry.createdAt).getTime() < 60_000
      );
      if (duplicate) {
        return current;
      }
      inserted = true;
      return [item, ...current].slice(0, 80);
    });
    if (input.toast !== false && inserted) {
      pushToast({ title: input.title, message: input.message, tone: input.tone ?? "info" });
    }
  }

  const jobsQuery = useQuery({
    queryKey: ["notifications", "jobs-watch"],
    queryFn: () => apiGet<PaginatedResponse<JobWatchRecord[]>>("/api/jobs?limit=100"),
    refetchInterval: 15_000
  });

  useEffect(() => {
    const jobs = jobsQuery.data?.data;
    if (!jobs || !initializedRef.current) {
      return;
    }

    const nextSnapshot = jobs.reduce<Record<string, { status: string; updatedAt: string }>>((accumulator, job) => {
      accumulator[job.id] = { status: job.status, updatedAt: job.updatedAt };
      return accumulator;
    }, {});

    if (Object.keys(snapshotRef.current).length === 0) {
      snapshotRef.current = nextSnapshot;
      if (typeof window !== "undefined") {
        window.localStorage.setItem(JOB_SNAPSHOT_STORAGE_KEY, JSON.stringify(nextSnapshot));
      }
      return;
    }

    for (const job of jobs) {
      const previous = snapshotRef.current[job.id];
      if (!previous || previous.status === job.status) {
        continue;
      }

      if (job.status === "COMPLETED") {
        addNotification({
          title: "Job completed",
          message: `${job.name} finished processing and is ready for review.`,
          tone: "success",
          href: `/jobs/${job.id}`,
          source: "processing"
        });
      } else if (job.status === "FAILED") {
        addNotification({
          title: "Job failed",
          message: `${job.name} needs attention before processing can continue.`,
          tone: "error",
          href: `/jobs/${job.id}`,
          source: "processing"
        });
      } else if (job.status === "REVIEW" && previous.status === "PROCESSING") {
        addNotification({
          title: "Job ready for review",
          message: `${job.name} has moved into review with new outputs available.`,
          tone: "info",
          href: `/jobs/${job.id}`,
          source: "processing"
        });
      }
    }

    snapshotRef.current = nextSnapshot;
    if (typeof window !== "undefined") {
      window.localStorage.setItem(JOB_SNAPSHOT_STORAGE_KEY, JSON.stringify(nextSnapshot));
    }
  }, [jobsQuery.data]);

  const value = useMemo<NotificationContextValue>(
    () => ({
      notifications,
      toasts,
      unreadCount: notifications.filter((item) => !item.read).length,
      addNotification,
      pushToast,
      markRead: (id) => setNotifications((current) => current.map((item) => (item.id === id ? { ...item, read: true } : item))),
      markAllRead: () => setNotifications((current) => current.map((item) => ({ ...item, read: true }))),
      removeNotification: (id) => setNotifications((current) => current.filter((item) => item.id !== id)),
      clearNotifications: () => setNotifications([]),
      dismissToast
    }),
    [notifications, toasts]
  );

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within NotificationProvider");
  }
  return context;
}
