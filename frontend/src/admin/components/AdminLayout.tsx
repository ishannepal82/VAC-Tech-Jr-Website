import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import { Menu, X } from "lucide-react"; 

export default function AdminLayout() {
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="min-h-screen bg-[#0f172a] font-poppins text-white">
   
      <Sidebar isOpen={isSidebarOpen} />

      <main className="md:ml-64 transition-all duration-300">
        
     
        <div className="md:hidden flex justify-start p-4">
            <button onClick={toggleSidebar} className="z-50 text-white">
                {isSidebarOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
        </div>
      

        <div className="p-6">
          <div className="mt-6">
   
            <Outlet />
          </div>
        </div>
      </main>
      
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={toggleSidebar}
        ></div>
      )}
    </div>
  );
}