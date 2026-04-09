import type { PropsWithChildren, ReactNode } from "react";
import { cn } from "./cn";

type TableContainerProps = PropsWithChildren<{
  mobileCards?: ReactNode;
  className?: string;
}>;

export function TableContainer({ children, mobileCards, className }: TableContainerProps) {
  return (
    <div className={cn("ui-table-container", className)}>
      {mobileCards ? <div className="ui-table-container__mobile">{mobileCards}</div> : null}
      <div className="ui-table-container__desktop">{children}</div>
    </div>
  );
}
