import type { ReactNode } from "react";

type Props = {
  title: string;
  tone?: "tip" | "info" | "warning" | "success";
  children: ReactNode;
};

export function TipBox({ title, tone = "tip", children }: Props) {
  return (
    <aside className={`tip-box tip-box--${tone}`}>
      <strong>{title}</strong>
      <div>{children}</div>
    </aside>
  );
}
