import type { ButtonHTMLAttributes, PropsWithChildren } from "react";
import { cn } from "./cn";

type ButtonVariant = "primary" | "secondary" | "ghost";

type ButtonProps = PropsWithChildren<
  ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: ButtonVariant;
    fullWidth?: boolean;
  }
>;

function buttonClass(variant: ButtonVariant, fullWidth?: boolean) {
  return cn(
    "ui-button",
    `ui-button--${variant}`,
    fullWidth && "ui-button--full"
  );
}

export function PrimaryButton({ className, fullWidth, variant, ...props }: ButtonProps) {
  return <button className={cn(buttonClass("primary", fullWidth), className)} {...props} />;
}

export function SecondaryButton({ className, fullWidth, variant, ...props }: ButtonProps) {
  return <button className={cn(buttonClass("secondary", fullWidth), className)} {...props} />;
}

export function GhostButton({ className, fullWidth, variant, ...props }: ButtonProps) {
  return <button className={cn(buttonClass("ghost", fullWidth), className)} {...props} />;
}

export function getButtonClass(variant: ButtonVariant, fullWidth?: boolean) {
  return buttonClass(variant, fullWidth);
}
