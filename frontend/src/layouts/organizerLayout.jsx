import React, { useState, useEffect } from "react";
import Sidebar from "../components/dashBoardComponents/sideBar";
import Topbar from "../components/dashBoardComponents/topBar";
import { Outlet } from "react-router-dom";

export default function OrganizerLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const handleRoute = () => setSidebarOpen(false);
    window.addEventListener("popstate", handleRoute);
    return () => window.removeEventListener("popstate", handleRoute);
  }, []);

  return (
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar
        panel="organizer"
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col">
        <Topbar panel="organizer" onToggleSidebar={() => setSidebarOpen((s) => !s)} />

        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-screen-xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
