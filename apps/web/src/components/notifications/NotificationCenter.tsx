import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useNotifications } from "../../context/NotificationContext";

function formatTime(value: string) {
  return new Date(value).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit"
  });
}

function toneClass(tone: "info" | "success" | "warning" | "error") {
  return `notification-item notification-item-${tone}`;
}

export function NotificationCenter() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const { notifications, unreadCount, markRead, markAllRead, clearNotifications, removeNotification } = useNotifications();

  const preview = useMemo(() => notifications.slice(0, 12), [notifications]);

  return (
    <div className="notification-center">
      <button type="button" className={`notification-bell${open ? " active" : ""}`} onClick={() => setOpen((value) => !value)} aria-label="Open notifications">
        <span className="notification-bell__icon">Alerts</span>
        {unreadCount > 0 ? <span className="notification-bell__count">{unreadCount > 9 ? "9+" : unreadCount}</span> : null}
      </button>

      {open ? (
        <div className="notification-popover">
          <div className="notification-popover__header">
            <div className="stack" style={{ gap: "0.2rem" }}>
              <strong>Notifications</strong>
              <span className="text-muted">{unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}</span>
            </div>
            <div className="row">
              <button type="button" className="table-action" onClick={() => markAllRead()}>
                Mark all read
              </button>
              <button type="button" className="table-action" onClick={() => clearNotifications()}>
                Clear
              </button>
            </div>
          </div>

          <div className="notification-popover__list">
            {preview.length === 0 ? (
              <div className="notification-empty">
                <strong>No notifications yet</strong>
                <span className="text-muted">Job progress alerts, failures, and key workflow updates will appear here.</span>
              </div>
            ) : (
              preview.map((item) => (
                <div key={item.id} className={toneClass(item.tone)}>
                  <button
                    type="button"
                    className={`notification-item__body${item.read ? "" : " unread"}`}
                    onClick={() => {
                      markRead(item.id);
                      setOpen(false);
                      if (item.href) {
                        navigate(item.href);
                      }
                    }}
                  >
                    <div className="row" style={{ justifyContent: "space-between", alignItems: "flex-start" }}>
                      <strong>{item.title}</strong>
                      <span className="text-muted">{formatTime(item.createdAt)}</span>
                    </div>
                    <span>{item.message}</span>
                  </button>
                  <button type="button" className="notification-item__dismiss" onClick={() => removeNotification(item.id)}>
                    Dismiss
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
