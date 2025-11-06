import { Menu, UserCircle } from "lucide-react";

interface HeaderProps {
  toggleSidebar: () => void;
  title: string;
}

export default function Header({ toggleSidebar, title }: HeaderProps) {
  return (
    <header className="flex items-center justify-between p-6 bg-[#1e293b] text-white rounded-t-lg">
      <div className="flex items-center">
        <button
          onClick={toggleSidebar}
          className="md:hidden mr-4 text-gray-300"
        >
          <Menu size={24} />
        </button>
        <h1 className="text-2xl font-bold text-[#9cc9ff]">{title}</h1>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-gray-300">Admin</span>
        <UserCircle size={32} className="text-[#5ea4ff]" />
      </div>
    </header>
  );
}
