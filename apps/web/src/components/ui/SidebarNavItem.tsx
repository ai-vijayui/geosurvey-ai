import type { ReactNode } from "react";
import { NavLink } from "react-router-dom";
import { cn } from "./cn";

type SidebarNavItemProps = {
  to: string;
  label: string;
  icon: ReactNode;
  secondary?: boolean;
};

export function SidebarNavItem({ to, label, icon, secondary = false }: SidebarNavItemProps) {
  return (
    <NavLink to={to} className={({ isActive }) => cn("ui-sidebar-nav-item", secondary && "ui-sidebar-nav-item--secondary", isActive && "active")}>
      <span className="ui-sidebar-nav-item__icon" aria-hidden="true">
        {icon}
      </span>
      <span className="ui-sidebar-nav-item__label">{label}</span>
    </NavLink>
  );
}
