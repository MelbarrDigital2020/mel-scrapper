import { Outlet } from "react-router-dom";

export default function AppBody() {
  return (
    <main className="flex-1 overflow-y-auto overflow-x-hidden bg-background-section app-scroll p-2">
      <div className="bg-background p-4 rounded-lg shadow">
        <Outlet />
      </div>
    </main>
  );
}
