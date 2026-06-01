
// src/layouts/MainLayout.jsx
import React, { useState, useEffect } from "react";
import Sidebar from '../components/dashBoardComponents/sideBar'
import Topbar from '../components/dashBoardComponents/topBar'
import { Outlet } from "react-router-dom";

export default function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // optional: close sidebar on route change (if you use react-router hooks)
  useEffect(() => {
    const handleRoute = () => setSidebarOpen(false);
    window.addEventListener("popstate", handleRoute);
    return () => window.removeEventListener("popstate", handleRoute);
  }, []);

  return (
    // don't force a fixed viewport height here – allow page to grow
    <div className="flex bg-gray-50 min-h-screen">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col">
        <Topbar onToggleSidebar={() => setSidebarOpen((s) => !s)} />

        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-screen-xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

