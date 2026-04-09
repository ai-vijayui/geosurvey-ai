import type { HTMLAttributes, PropsWithChildren } from "react";
import { cn } from "./cn";

type CardVariant = "default" | "soft" | "accent";

type CardProps = PropsWithChildren<
  HTMLAttributes<HTMLDivElement> & {
    variant?: CardVariant;
  }
>;

export function Card({ className, variant = "default", ...props }: CardProps) {
  return <div className={cn("ui-card", `ui-card--${variant}`, className)} {...props} />;
}
