import type { SVGProps } from "react";

export type AppIconName =
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
  | "spark"
  | "check"
  | "map"
  | "upload"
  | "review"
  | "download"
  | "link"
  | "chevron-down";

type Props = SVGProps<SVGSVGElement> & {
  name: AppIconName;
};

export function AppIcon({ name, className, ...props }: Props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      focusable="false"
      aria-hidden="true"
      className={className}
      {...props}
    >
      {renderIcon(name)}
    </svg>
  );
}

function renderIcon(name: AppIconName) {
  switch (name) {
    case "dashboard":
      return (
        <>
          <rect x="3.5" y="3.5" width="7" height="7" rx="2" />
          <rect x="13.5" y="3.5" width="7" height="4.5" rx="2" />
          <rect x="13.5" y="11.5" width="7" height="9" rx="2" />
          <rect x="3.5" y="13.5" width="7" height="7" rx="2" />
        </>
      );
    case "ai":
      return (
        <>
          <path d="M12 3.5 5.5 7v10L12 20.5 18.5 17V7Z" />
          <path d="M12 3.5V10" />
          <path d="M5.5 7 12 10l6.5-3" />
          <path d="M12 20.5V13" />
        </>
      );
    case "projects":
      return (
        <>
          <path d="M3.5 7.5a2 2 0 0 1 2-2h4l1.5 2h7.5a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2Z" />
          <path d="M3.5 9h17" />
        </>
      );
    case "jobs":
      return (
        <>
          <rect x="4" y="3.5" width="16" height="17" rx="2.5" />
          <path d="M8 8.5h8" />
          <path d="M8 12h8" />
          <path d="M8 15.5h5" />
        </>
      );
    case "gnss":
      return (
        <>
          <circle cx="12" cy="12" r="2.5" />
          <path d="M12 4v3" />
          <path d="M12 17v3" />
          <path d="M4 12h3" />
          <path d="M17 12h3" />
          <path d="m6.7 6.7 2.1 2.1" />
          <path d="m15.2 15.2 2.1 2.1" />
          <path d="m17.3 6.7-2.1 2.1" />
          <path d="m8.8 15.2-2.1 2.1" />
        </>
      );
    case "processing":
      return (
        <>
          <circle cx="12" cy="12" r="3" />
          <path d="M12 3.5v3" />
          <path d="M12 17.5v3" />
          <path d="M3.5 12h3" />
          <path d="M17.5 12h3" />
          <path d="m6.2 6.2 2.2 2.2" />
          <path d="m15.6 15.6 2.2 2.2" />
          <path d="m17.8 6.2-2.2 2.2" />
          <path d="m8.4 15.6-2.2 2.2" />
        </>
      );
    case "reports":
      return (
        <>
          <path d="M7 3.5h7l4.5 4.5v10a2.5 2.5 0 0 1-2.5 2.5H7A2.5 2.5 0 0 1 4.5 18V6A2.5 2.5 0 0 1 7 3.5Z" />
          <path d="M14 3.5V8h4.5" />
          <path d="M8 12h8" />
          <path d="M8 15.5h8" />
        </>
      );
    case "settings":
      return (
        <>
          <circle cx="12" cy="12" r="2.8" />
          <path d="M19.4 12a7.7 7.7 0 0 0-.1-1.2l2-1.5-2-3.4-2.4 1a8.4 8.4 0 0 0-2-.9l-.4-2.5h-4l-.4 2.5c-.7.2-1.4.5-2 .9l-2.4-1-2 3.4 2 1.5a7.7 7.7 0 0 0 0 2.4l-2 1.5 2 3.4 2.4-1c.6.4 1.3.7 2 .9l.4 2.5h4l.4-2.5c.7-.2 1.4-.5 2-.9l2.4 1 2-3.4-2-1.5c.1-.4.1-.8.1-1.2Z" />
        </>
      );
    case "help":
      return (
        <>
          <circle cx="12" cy="12" r="8.5" />
          <path d="M9.6 9.4a2.5 2.5 0 1 1 4.2 1.8c-.9.7-1.5 1.2-1.5 2.3" />
          <path d="M12 16.8h.01" />
        </>
      );
    case "search":
      return (
        <>
          <circle cx="10.5" cy="10.5" r="5.5" />
          <path d="m15 15 4.5 4.5" />
        </>
      );
    case "plus":
      return (
        <>
          <path d="M12 5v14" />
          <path d="M5 12h14" />
        </>
      );
    case "spark":
      return (
        <>
          <path d="M12 3.5 13.8 8.2 18.5 10 13.8 11.8 12 16.5 10.2 11.8 5.5 10 10.2 8.2Z" />
          <path d="m18.2 4.8.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7Z" />
        </>
      );
    case "check":
      return <path d="m5.5 12.5 4.2 4.2 8.8-9.2" />;
    case "map":
      return (
        <>
          <path d="M3.5 6.5 9 4l6 2.5 5.5-2v13L15 20l-6-2.5-5.5 2Z" />
          <path d="M9 4v13.5" />
          <path d="M15 6.5V20" />
        </>
      );
    case "upload":
      return (
        <>
          <path d="M12 15.5v-8" />
          <path d="m8.5 9 3.5-3.5L15.5 9" />
          <path d="M4.5 16.5v1A2.5 2.5 0 0 0 7 20h10a2.5 2.5 0 0 0 2.5-2.5v-1" />
        </>
      );
    case "review":
      return (
        <>
          <path d="M4.5 12s2.8-5 7.5-5 7.5 5 7.5 5-2.8 5-7.5 5-7.5-5-7.5-5Z" />
          <circle cx="12" cy="12" r="2.2" />
        </>
      );
    case "download":
      return (
        <>
          <path d="M12 5v8" />
          <path d="m8.5 10.5 3.5 3.5 3.5-3.5" />
          <path d="M4.5 16.5v1A2.5 2.5 0 0 0 7 20h10a2.5 2.5 0 0 0 2.5-2.5v-1" />
        </>
      );
    case "link":
      return (
        <>
          <path d="M10 14 8 16a3 3 0 0 1-4.2-4.2l2.7-2.7A3 3 0 0 1 10.7 9" />
          <path d="M14 10 16 8a3 3 0 1 1 4.2 4.2l-2.7 2.7A3 3 0 0 1 13.3 15" />
          <path d="m9 15 6-6" />
        </>
      );
    case "chevron-down":
      return <path d="m6.5 9.5 5.5 5 5.5-5" />;
    default:
      return null;
  }
}
