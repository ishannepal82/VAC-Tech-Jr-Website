import { Routes, Route } from "react-router-dom";
import AdminLayout from "./components/AdminLayout";
import AdminDashboard from "./pages/AdminDashboard";
import AdminMembers from "./pages/AdminMembers";
import AdminEvents from "./pages/AdminEvents";
import AdminAbout from "./pages/AdminAbout";
import AdminProjects from "./pages/AdminProjects";
import AdminCommunity from "./pages/AdminCommunity";
import AdminPolls from "./pages/AdminPolls";
import AdminSettings from "./pages/AdminSettings";
import AdminDataProvider from "./context/AdminDataProvider";

export default function AdminRoutes() {
  return (
    <AdminDataProvider>
      <Routes>
        <Route path="/" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="members" element={<AdminMembers />} />
          <Route path="about" element={<AdminAbout />} />
          <Route path="event" element={<AdminEvents />} />
          <Route path="projects" element={<AdminProjects />} />
          <Route path="communitys" element={<AdminCommunity />} />
          <Route path="polls" element={<AdminPolls />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>
      </Routes>
    </AdminDataProvider>
  );
}