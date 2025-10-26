import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";

// REMOVED: import AdminDashboard from "../pages/AdminDashboard";

// Helper to get a title from the path

export default function AdminLayout() {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="min-h-screen bg-[#0f172a] font-poppins text-white">
      <Sidebar isOpen={isSidebarOpen} />

      <main className="md:ml-64 transition-all duration-300">
        <div className="p-6">
          <div className="mt-6">
            <Outlet />
          </div>
        </div>
      </main>
      {/* This part for mobile overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={toggleSidebar}
        ></div>
      )}
    </div>
  );
}
