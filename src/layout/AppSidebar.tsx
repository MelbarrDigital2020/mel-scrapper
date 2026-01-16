import { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  FiHome,
  FiUsers,
  FiBriefcase,
  FiChevronLeft,
} from "react-icons/fi";

export default function AppSidebar() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`
        h-full relative flex flex-col
        ${collapsed ? "w-20" : "w-64"}
        bg-background
        border-r border-border-light
        transition-all duration-300 ease-in-out
        shadow-[2px_0_12px_rgba(0,0,0,0.04)]
      `}
    >
      {/* Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-border-light">
        {!collapsed && (
          <span className="text-lg font-semibold tracking-tight">
            Mel-DemandScraper
          </span>
        )}

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 rounded-lg hover:bg-background-section transition"
        >
          <FiChevronLeft
            className={`transition-transform duration-300 ${
              collapsed ? "rotate-180" : ""
            }`}
          />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        <SidebarItem to="dashboard" icon={<FiHome />} label="Dashboard" collapsed={collapsed} />
        <SidebarItem to="contacts" icon={<FiUsers />} label="Contacts" collapsed={collapsed} />
        <SidebarItem to="companies" icon={<FiBriefcase />} label="Companies" collapsed={collapsed} />
      </nav>
    </aside>
  );
}

/* ---------------------------------------
   Sidebar Item (animations + tooltip)
---------------------------------------- */
function SidebarItem({
  to,
  icon,
  label,
  collapsed,
}: {
  to: string;
  icon: React.ReactNode;
  label: string;
  collapsed: boolean;
}) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `
        group relative flex items-center gap-3
        px-3 py-3 rounded-xl
        transition-all duration-200
        ${
          isActive
            ? "bg-primary text-white shadow-sm"
            : "text-text-secondary hover:bg-background-section hover:text-text-primary"
        }
      `
      }
    >
      {/* Icon */}
      <span className="text-xl shrink-0">{icon}</span>

      {/* Label */}
      <span
        className={`
          text-sm font-medium whitespace-nowrap
          transition-all duration-300
          ${
            collapsed
              ? "opacity-0 translate-x-2 pointer-events-none"
              : "opacity-100 translate-x-0"
          }
        `}
      >
        {label}
      </span>

      {/* Tooltip (only when collapsed) */}
      {collapsed && (
        <span
          className="
            absolute left-full ml-3 px-3 py-1.5
            rounded-md text-xs font-medium
            bg-text-primary text-background
            opacity-0 scale-95
            group-hover:opacity-100 group-hover:scale-100
            transition-all duration-200
            pointer-events-none
            shadow-lg
            whitespace-nowrap
          "
        >
          {label}
        </span>
      )}
    </NavLink>
  );
}
