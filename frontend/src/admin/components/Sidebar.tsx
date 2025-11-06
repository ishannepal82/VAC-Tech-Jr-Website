import { NavLink, useNavigate } from "react-router-dom";

import {
  LayoutDashboard,
  Info,
  Calendar,
  Lightbulb,
  Globe2,
  BarChart3,
  Users,
  Settings,
  LogOut,
} from "lucide-react";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", path: "/admin" },
  { icon: Info, label: "About Page", path: "/admin/about" },
  { icon: Calendar, label: "Events", path: "/admin/event" },
  { icon: Lightbulb, label: "Projects", path: "/admin/projects" },
  { icon: Globe2, label: "Community", path: "/admin/Community" },
  { icon: BarChart3, label: "Polls", path: "/admin/polls" },
  { icon: Users, label: "Members", path: "/admin/members" },
  { icon: Settings, label: "Settings", path: "/admin/settings" },
];

export default function Sidebar({ isOpen }: { isOpen: boolean }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Add your logout logic here
    console.log("Logging out...");
    navigate("/"); // Redirect to home page after logout
  };

  return (
    <aside
      className={`fixed top-0 left-0 z-40 h-screen w-64 bg-[#0a1a33] text-white font-poppins transition-transform md:translate-x-0 ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="flex items-center justify-center h-20 border-b border-gray-700"></div>
      <nav className="flex-grow p-4">
        <ul>
          {navItems.map((item) => (
            <li key={item.label}>
              <NavLink
                to={item.path}
                end // Use 'end' for the Dashboard link to only match the exact path
                className={({ isActive }) =>
                  `flex items-center px-4 py-3 my-1 rounded-lg transition-colors duration-200 ${
                    isActive
                      ? "bg-[#2563eb] text-white"
                      : "text-gray-300 hover:bg-[#1a2f55] hover:text-white"
                  }`
                }
              >
                <item.icon className="w-5 h-5 mr-3" />
                <span>{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
      <div className="absolute bottom-0 w-full p-4 border-t border-gray-700">
        <button
          onClick={handleLogout}
          className="flex items-center w-full px-4 py-3 text-gray-300 rounded-lg hover:bg-red-600/50 hover:text-white transition-colors duration-200"
        >
          <LogOut className="w-5 h-5 mr-3" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
