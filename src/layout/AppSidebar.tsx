import { NavLink } from "react-router-dom";
import {
  FiHome,
  FiUsers,
  FiBriefcase,
  FiSettings,
  FiDownload,
  FiTarget,
  FiTrendingUp,
} from "react-icons/fi";

import logoFull from "../assets/logo.png";
import logoIcon from "../assets/logo-icon.png";
import logoFullWhite from "../assets/logo-white.png";
import logoIconWhite from "../assets/logo-icon-white.png";

export default function AppSidebar({ collapsed }: { collapsed: boolean }) {
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
      <div className="h-16 flex items-center justify-center px-4 border-b border-border-light">
        <div
          className="
            flex items-center justify-center
            h-10 w-full
            rounded-md
            bg-background
            transition-all duration-300
          "
        >
          {/* Light theme logo */}
          <img
            src={collapsed ? logoIcon : logoFull}
            alt="Mel DemandScraper"
            className="w-full transition-all duration-300 dark:hidden"
          />

          {/* Dark theme logo */}
          <img
            src={collapsed ? logoIconWhite : logoFullWhite}
            alt="Mel DemandScraper"
            className="w-full transition-all duration-300 hidden dark:block"
          />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-1">
        <SidebarItem
          to="dashboard"
          icon={<FiHome />}
          label="Dashboard"
          collapsed={collapsed}
        />
        <SidebarItem
          to="contacts"
          icon={<FiUsers />}
          label="Contacts"
          collapsed={collapsed}
        />
        <SidebarItem
          to="companies"
          icon={<FiBriefcase />}
          label="Companies"
          collapsed={collapsed}
        />
        <SidebarItem
          to="debounce"
          icon={<FiTarget />}
          label="Debounce"
          collapsed={collapsed}
        />
        <SidebarItem
          to="intentbase"
          icon={<FiTrendingUp />}
          label="Intent Base"
          collapsed={collapsed}
        />
        <SidebarItem
          to="export-history"
          icon={<FiDownload />}
          label="Export History"
          collapsed={collapsed}
        />
        <SidebarItem
          to="settings"
          icon={<FiSettings />}
          label="Settings"
          collapsed={collapsed}
        />
      </nav>
    </aside>
  );
}

/* ---------------- Sidebar Item ---------------- */
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
        group relative flex items-center
        transition-colors duration-200
        ${
          isActive
            ? "bg-primary/10 text-primary"
            : "text-text-secondary hover:bg-background-section hover:text-text-primary"
        }
        `
      }
    >
      {({ isActive }) => (
        <>
          {/* Active left bar */}
          {isActive && (
            <span className="absolute left-0 top-0 h-full w-1 bg-primary" />
          )}

          <div className="flex items-center gap-3 px-4 py-3 w-full">
            <span className="text-xl shrink-0">{icon}</span>

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
          </div>

          {/* Tooltip */}
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
        </>
      )}
    </NavLink>
  );
}
