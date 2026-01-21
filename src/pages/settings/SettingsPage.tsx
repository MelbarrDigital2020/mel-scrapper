import React, { useEffect, useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { FiUser, FiShield, FiBell } from "react-icons/fi";
import api from "../../services/api";
import type { User } from "../../types/user";

export type SettingsOutletContext = {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
};

export default function SettingsPage() {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await api.get("/auth/me");
        setUser(res.data.user);
      } catch {
        navigate("/login", { replace: true });
      }
    };

    fetchUser();
  }, [navigate]);

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-gray-900 dark:border-gray-800 p-4">
        <h2 className="mb-4 text-xs font-semibold text-gray-500 dark:text-gray-400">
          SETTINGS
        </h2>

        <ul className="space-y-1 text-sm">
          <SidebarLink to="profile" icon={<FiUser />} label="My Profile" />
          <SidebarLink to="security" icon={<FiShield />} label="Security" />
          <SidebarLink
            to="notifications"
            icon={<FiBell />}
            label="Notifications"
          />
        </ul>
      </aside>

      {/* Content */}
      <main className="flex-1 p-8 shadow-sm text-gray-900 dark:text-gray-100">
        {/* ✅ PASS USER TO ALL SETTINGS CHILD ROUTES */}
        <Outlet context={{ user, setUser } satisfies SettingsOutletContext} />
      </main>
    </div>
  );
}

/* Sidebar Link */
function SidebarLink({
  to,
  icon,
  label,
}: {
  to: string;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <NavLink
      to={to}
      end
      className={({ isActive }) => `
        flex items-center gap-3 cursor-pointer
        px-3 py-2 transition
        border-b-2
        ${
          isActive
            ? "border-blue-400 text-blue-600 bg-blue-50 dark:border-blue-400 dark:text-blue-400 dark:bg-blue-500/10"
            : "border-transparent text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
        }
      `}
    >
      {icon}
      {label}
    </NavLink>
  );
}
