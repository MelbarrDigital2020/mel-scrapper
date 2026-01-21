import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiBell,
  FiChevronDown,
  FiChevronLeft,
  FiSun,
  FiMoon,
  FiSettings,
  FiLogOut,
} from "react-icons/fi";
import api from "../services/api";
import defaultImage from "../assets/default_avatar.jpg";

// Logged In User Type
type User = {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  avatar_url?: string | null;
};

export default function AppNavbar({
  collapsed,
  onToggleSidebar,
}: {
  collapsed: boolean;
  onToggleSidebar: () => void;
}) {
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);
  const [notifyOpen, setNotifyOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  const userRef = useRef<HTMLDivElement>(null);
  const notifyRef = useRef<HTMLDivElement>(null);

  // Get Logged in User Information
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

  // Theme with persistence */
  const [dark, setDark] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("theme") === "dark";
  });

  // Dark Mode persistence
  useEffect(() => {
    if (dark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [dark]);

  const toggleTheme = () => setDark((v) => !v);

  // Close dropdowns on outside click */
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userRef.current && !userRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }

      if (notifyRef.current && !notifyRef.current.contains(e.target as Node)) {
        setNotifyOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Navigation handlers */
  const goToSettings = () => {
    setMenuOpen(false);
    navigate("/app/settings");
  };

  // ----- Handle Logout -------
  const handleLogout = async () => {
    try {
      await api.post("/auth/logout");
      navigate("/login", { replace: true });
    } catch {
      alert("Logout failed. Please try again.");
    }
  };

  return (
    <header className="h-16 bg-background border-b border-border-light px-4 flex items-center justify-between shadow">
      {/* LEFT */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-lg hover:bg-background-section transition"
        >
          <FiChevronLeft
            className={`transition-transform ${collapsed ? "rotate-180" : ""}`}
          />
        </button>

        <span className="text-sm hidden sm:block">
          Hello, <b>{user?.first_name || "User"} 👋</b>
        </span>
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-4 relative">
        {/* 🌗 Theme */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg hover:bg-background-section transition"
        >
          {dark ? <FiSun /> : <FiMoon />}
        </button>

        {/* 🔔 Notifications */}
        <div ref={notifyRef} className="relative">
          <button
            onClick={() => setNotifyOpen((v) => !v)}
            className={`
              relative p-2 rounded-lg transition
              ${
                notifyOpen
                  ? "bg-primary/10 text-primary"
                  : "hover:bg-background-section text-text-secondary"
              }
            `}
          >
            <FiBell className="text-xl" />
            <span className="absolute top-1 right-1 text-[10px] bg-primary text-white px-1.5 rounded-full">
              2
            </span>
          </button>

          {notifyOpen && (
            <div className="absolute right-0 top-12 w-96 bg-background-card border border-border-light rounded-2xl shadow-xl z-50 overflow-hidden">
              <NotificationItem
                title="New contact added"
                description="John Doe was added to Contacts"
                time="2m ago"
                unread
              />
              <NotificationItem
                title="Company updated"
                description="Melbarr ITES profile information updated"
                time="1h ago"
              />

              <button className="w-full py-3 text-sm font-medium text-primary hover:bg-background-section transition">
                View all notifications
              </button>
            </div>
          )}
        </div>

        {/* 👤 User */}
        <div ref={userRef} className="relative">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-background-section transition"
          >
            <img
              src={user?.avatar_url || defaultImage}
              className="w-8 h-8 rounded-full border"
              alt="User avatar"
            />
            <span className="hidden sm:block">
              {user?.first_name || "User"}
            </span>
            <FiChevronDown />
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-12 w-48 bg-background-card border border-border-light rounded shadow-lg z-50">
              <DropdownItem
                label="Settings"
                icon={<FiSettings size={16} />}
                onClick={goToSettings}
              />
              <DropdownItem
                label="Logout"
                icon={<FiLogOut size={16} />}
                danger
                onClick={handleLogout}
              />
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

/* Dropdown item */
function DropdownItem({
  label,
  icon,
  danger,
  onClick,
}: {
  label: string;
  icon?: React.ReactNode;
  danger?: boolean;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={`
        flex items-center gap-3
        px-4 py-3 text-sm
        cursor-pointer transition
        ${
          danger
            ? "text-error hover:bg-error/10"
            : "hover:bg-background-section text-text-primary"
        }
      `}
    >
      <span className="text-lg">{icon}</span>
      <span className="flex-1">{label}</span>
    </div>
  );
}

/* Notification item */
function NotificationItem({
  title,
  description,
  time,
  unread,
}: {
  title: string;
  description: string;
  time: string;
  unread?: boolean;
}) {
  return (
    <div className="flex gap-3 px-4 py-3 hover:bg-background-section cursor-pointer transition">
      {unread && (
        <span className="mt-2 w-2 h-2 rounded-full bg-primary shrink-0" />
      )}

      <div className="flex-1">
        <div className="flex justify-between items-start gap-2">
          <p className="text-sm font-medium">{title}</p>
          <span className="text-xs text-text-muted">{time}</span>
        </div>
        <p className="text-xs text-text-secondary mt-0.5">{description}</p>
      </div>
    </div>
  );
}
