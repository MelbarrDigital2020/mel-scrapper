import { useState } from "react";
import {
  FiBell,
  FiChevronDown,
  FiSun,
  FiMoon,
} from "react-icons/fi";

export default function AppNavbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dark, setDark] = useState(
    document.documentElement.classList.contains("dark")
  );

  const toggleTheme = () => {
    document.documentElement.classList.toggle("dark");
    setDark(!dark);
  };

  return (
    <header className="
      h-16 bg-background border-b border-border-light
      px-6 flex items-center justify-between
      backdrop-blur supports-[backdrop-filter]:bg-background/80
      shadow
    ">
      {/* Left */}
      <span className="text-sm text-text-secondary">
        Hello, <b className="text-text-primary">Mel 👋</b>
      </span>

      {/* Right */}
      <div className="flex items-center gap-4 relative">
        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          className="
            p-2 rounded-lg
            text-text-secondary hover:text-text-primary
            hover:bg-background-section
            transition
          "
        >
          {dark ? <FiSun size={18} /> : <FiMoon size={18} />}
        </button>

        {/* Notifications */}
        <button className="relative p-2 rounded-lg hover:bg-background-section transition">
          <FiBell className="text-xl text-text-secondary hover:text-text-primary" />
          <span className="absolute top-1.5 right-1.5 text-[10px] bg-primary text-white px-1.5 rounded-full">
            2
          </span>
        </button>

        {/* User */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="
            flex items-center gap-2
            p-1.5 rounded-lg
            hover:bg-background-section transition
          "
        >
          <img
            src="https://i.pravatar.cc/40"
            className="w-8 h-8 rounded-full border border-border-light"
          />
          <span className="text-sm font-medium hidden sm:block">
            Mel
          </span>
          <FiChevronDown className="text-text-secondary" />
        </button>

        {/* Dropdown */}
        {menuOpen && (
          <div
            className="
              absolute right-0 top-14 w-48
              bg-background-card border border-border-light
              rounded-xl shadow-lg
              overflow-hidden z-50
            "
          >
            <DropdownItem label="Settings" />
            <DropdownItem label="Logout" danger />
          </div>
        )}
      </div>
    </header>
  );
}

function DropdownItem({
  label,
  danger,
}: {
  label: string;
  danger?: boolean;
}) {
  return (
    <div
      className={`
        px-4 py-3 text-sm cursor-pointer
        transition
        ${
          danger
            ? "text-error hover:bg-error/10"
            : "text-text-primary hover:bg-background-section"
        }
      `}
    >
      {label}
    </div>
  );
}
