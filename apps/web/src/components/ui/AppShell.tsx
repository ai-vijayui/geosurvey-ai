import type { ReactNode } from "react";

type AppShellProps = {
  sidebar: ReactNode;
  topbar: ReactNode;
  children: ReactNode;
};

export function AppShell({ sidebar, topbar, children }: AppShellProps) {
  return (
    <div className="app-shell reference-shell ui-compact">
      <div className="app-shell__frame reference-shell__frame ui-app-shell">
        {sidebar}
        <section className="main-column reference-content ui-app-main min-w-0">
          {topbar}
          <div className="main-scroll-area reference-main">
            <div className="reference-main__content min-w-0">
              <main>{children}</main>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
