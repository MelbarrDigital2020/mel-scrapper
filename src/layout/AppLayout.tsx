import AppSidebar from "./AppSidebar";
import AppNavbar from "./AppNavbar";
import AppBody from "./AppBody";

export default function AppLayout() {
  return (
    <div className="h-screen w-screen overflow-hidden flex bg-background text-text-primary">
      <AppSidebar />

      <div className="flex flex-col flex-1 h-full overflow-hidden">
        <AppNavbar />
        <AppBody />
      </div>
    </div>
  );
}