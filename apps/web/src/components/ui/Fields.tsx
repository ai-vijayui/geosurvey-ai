import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes } from "react";
import { AppIcon, type AppIconName } from "./AppIcon";
import { cn } from "./cn";

type SearchInputProps = InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  icon?: AppIconName;
  containerClassName?: string;
};

export function SearchInput({ label, icon = "search", className, containerClassName, ...props }: SearchInputProps) {
  return (
    <label className={cn("ui-field", containerClassName)}>
      {label ? <span className="ui-field__label">{label}</span> : null}
      <span className="ui-search-input">
        <span className="ui-search-input__icon" aria-hidden="true">
          <AppIcon name={icon} />
        </span>
        <input className={cn("ui-input ui-input--search", className)} {...props} />
      </span>
    </label>
  );
}

type SelectFieldProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label?: string;
  containerClassName?: string;
  children: ReactNode;
};

export function SelectField({ label, className, containerClassName, children, ...props }: SelectFieldProps) {
  return (
    <label className={cn("ui-field", containerClassName)}>
      {label ? <span className="ui-field__label">{label}</span> : null}
      <span className="ui-select">
        <select className={cn("ui-input ui-input--select", className)} {...props}>
          {children}
        </select>
        <span className="ui-select__icon" aria-hidden="true">
          <AppIcon name="chevron-down" />
        </span>
      </span>
    </label>
  );
}
