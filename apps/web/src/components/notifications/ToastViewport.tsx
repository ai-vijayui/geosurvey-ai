import { useNotifications } from "../../context/NotificationContext";

function toastClasses(tone: "info" | "success" | "warning" | "error") {
  if (tone === "success") {
    return "notification-toast notification-toast-success";
  }
  if (tone === "warning") {
    return "notification-toast notification-toast-warning";
  }
  if (tone === "error") {
    return "notification-toast notification-toast-error";
  }
  return "notification-toast notification-toast-info";
}

export function ToastViewport() {
  const { toasts, dismissToast } = useNotifications();

  if (toasts.length === 0) {
    return null;
  }

  return (
    <div className="notification-toast-viewport" aria-live="polite" aria-atomic="true">
      {toasts.map((toast) => (
        <div key={toast.id} className={toastClasses(toast.tone)}>
          <div className="stack" style={{ gap: "0.2rem" }}>
            <strong>{toast.title}</strong>
            {toast.message ? <span>{toast.message}</span> : null}
          </div>
          <button type="button" className="icon-button" onClick={() => dismissToast(toast.id)}>
            Close
          </button>
        </div>
      ))}
    </div>
  );
}
