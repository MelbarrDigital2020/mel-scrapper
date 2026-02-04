import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import AppSidebar from "./AppSidebar";
import AppNavbar from "./AppNavbar";
import AppBody from "./AppBody";

export default function AppLayout() {
  // Code For auto Collapse
  const { pathname } = useLocation();

  const autoCollapsed = useMemo(() => {
    return (
      pathname.startsWith("/app/contacts") ||
      pathname.startsWith("/app/companies") ||
      pathname.startsWith("/app/settings") ||
      pathname.startsWith("/app/dashboard")
    );
  }, [pathname]);

  const [collapsed, setCollapsed] = useState(autoCollapsed);

  // track if user manually toggled
  const userToggled = useRef(false);

  // toggle from navbar
  const handleToggle = () => {
    userToggled.current = true;
    setCollapsed((v) => !v);
  };

  // react to route change
  useEffect(() => {
    if (!userToggled.current) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setCollapsed(autoCollapsed);
    }
  }, [autoCollapsed]);
  // Code For auto Collapse END

  return (
    <div className="h-screen w-screen overflow-hidden flex bg-background text-text-primary">
      <AppSidebar collapsed={collapsed} />

      <div className="flex flex-col flex-1 h-full overflow-hidden">
        <AppNavbar collapsed={collapsed} onToggleSidebar={handleToggle} />
        <AppBody />
      </div>
    </div>
  );
}
