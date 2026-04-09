import type { ReactNode } from "react";

type RightRailPanelProps = {
  title: string;
  children: ReactNode;
};

export function RightRailPanel({ title, children }: RightRailPanelProps) {
  return (
    <section className="ui-right-rail-panel">
      <div className="ui-right-rail-panel__header">
        <strong>{title}</strong>
      </div>
      <div className="ui-right-rail-panel__body">{children}</div>
    </section>
  );
}
