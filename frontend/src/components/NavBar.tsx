import { useMemo, useState, useRef, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { HashLink } from "react-router-hash-link";
import { MailIcon, ChevronDown, LogOut, LayoutDashboard, Settings } from "lucide-react";
import Notification from "./Notification";
import { useCurrentUser } from "../hooks/useCurrentUser";

interface NavLinkListProps {
  onLinkClick?: () => void;
  onMailClick?: () => void;
}

const NavLinkList = ({ onLinkClick, onMailClick }: NavLinkListProps) => {
  const linkClassName =
    "text-white/40 hover:text-white/60 focus:text-white transition-colors duration-300";

  const handleClick = () => {
    if (onLinkClick) {
      onLinkClick();
    }
  };

  return (
    <>
      <NavLink to="/home" className={linkClassName} onClick={handleClick}>
        Home
      </NavLink>
      <HashLink
        smooth
        to="/home#about"
        className={linkClassName}
        onClick={handleClick}
      >
        About Us
      </HashLink>
      <NavLink to="/events" className={linkClassName} onClick={handleClick}>
        Events
      </NavLink>
      <NavLink
        to="/ProjectsSection"
        className={linkClassName}
        onClick={handleClick}
      >
        Projects
      </NavLink>
      <NavLink to="/community" className={linkClassName} onClick={handleClick}>
        Community
      </NavLink>
<<<<<<< HEAD
      <NavLink to="/dashboard" className={linkClassName} onClick={handleClick}>
        Dashboard
      </NavLink>
      <NavLink to="/admin" className={linkClassName} onClick={handleClick}>
        Panel
      </NavLink>
=======
>>>>>>> c13fbccf4f3d28853b13699a5cda93435f4e8212

      <button
        className={linkClassName}
        onClick={onMailClick}
        aria-label="Open notifications"
      >
        <MailIcon size={30} />
      </button>
    </>
  );
};

const getInitials = (name?: string): string =>
  name
    ?.split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "U";

const NavBar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);
  const [openMail, setOpenMail] = useState<boolean>(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [isLoggingOut, setIsLoggingOut] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user, isLoading, refresh } = useCurrentUser(); // Changed from 'refetch' to 'refresh'
  const navigate = useNavigate();

  const userInitials = useMemo(() => getInitials(user?.name), [user?.name]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      const response = await fetch('http://127.0.0.1:5000/api/auth/logout', {
        method: 'POST',
        credentials: 'include', // Important: includes cookies
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        // Refresh user state to clear it
        await refresh(); // Changed from 'refetch' to 'refresh'
        
        // Redirect to home or login page
        navigate('/home');
        
        // Show success message (optional)
        console.log('Logged out successfully');
      } else {
        const data = await response.json();
        console.error('Logout failed:', data.msg || 'Unknown error');
        // Optionally show error toast/notification
      }
    } catch (error) {
      console.error('Logout error:', error);
      // Optionally show error toast/notification
    } finally {
      setIsLoggingOut(false);
      setIsDropdownOpen(false);
    }
  };

  return (
    <>
      <nav className="sticky top-0 z-50 py-4 bg-transparent backdrop-blur-lg">
        <div className="flex items-center justify-between px-6 md:px-14">
          <div className="flex gap-x-2 items-center">
            <img
              src="/vac_tech_jr_logo.jpg"
              alt="logo"
              className="h-10 w-10 object-contain rounded-full"
            />
            <p className="text-xl font-semibold text-white">Vac Tech Jr</p>
          </div>

          <div className="hidden lg:flex items-center gap-10">
            <div className="flex gap-x-14 cursor-pointer">
              <NavLinkList onMailClick={() => setOpenMail(true)} />
            </div>

            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-full px-3 py-1.5 hover:bg-white/10 transition-colors"
                  disabled={isLoggingOut}
                >
                  <div className="h-10 w-10 rounded-full bg-[#5ea4ff] text-[#0a1a33] font-semibold flex items-center justify-center">
                    {userInitials}
                  </div>
                  <div className="flex flex-col text-left">
                    <span className="text-sm font-semibold text-white">
                      {user.name}
                    </span>
                    <span className="text-xs text-white/60">
                      {user.role || user.email}
                    </span>
                  </div>
                  <ChevronDown
                    size={20}
                    className={`text-white/60 transition-transform duration-200 ${
                      isDropdownOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-[#0a1a33] border border-white/10 rounded-lg shadow-xl overflow-hidden">
                    <NavLink
                      to="/dashboard"
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-white/80 hover:bg-white/5 hover:text-white transition-colors"
                    >
                      <LayoutDashboard size={18} />
                      <span>Dashboard</span>
                    </NavLink>
                    <NavLink
                      to="/admin"
                      onClick={() => setIsDropdownOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-white/80 hover:bg-white/5 hover:text-white transition-colors"
                    >
                      <Settings size={18} />
                      <span>Admin Panel</span>
                    </NavLink>
                    <div className="border-t border-white/10"></div>
                    <button
                      onClick={handleLogout}
                      disabled={isLoggingOut}
                      className="flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors w-full text-left disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <LogOut size={18} className={isLoggingOut ? "animate-spin" : ""} />
                      <span>{isLoggingOut ? 'Logging out...' : 'Logout'}</span>
                    </button>
                  </div>
                )}
              </div>
            ) : isLoading ? (
              <div className="h-10 w-32 rounded-full bg-white/10 animate-pulse" />
            ) : (
              <button 
                className="cursor-pointer font-semibold text-primary border-2 rounded-lg px-4 py-2 border-white text-white hover:bg-white hover:text-[#0a1a33] transition"
                onClick={() => navigate('/auth')}
              >
                Get Started
              </button>
            )}
          </div>

          <div className="lg:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-white focus:outline-none"
              aria-label="Toggle menu"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                {isMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16m-7 6h7"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="lg:hidden mt-4">
            <div className="flex flex-col items-center gap-y-6 py-8 bg-transparent">
              <NavLinkList
                onLinkClick={() => setIsMenuOpen(false)}
                onMailClick={() => {
                  setOpenMail(true);
                  setIsMenuOpen(false);
                }}
              />
              {user ? (
                <div className="w-full px-6">
                  <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl px-3 py-2">
                    <div className="h-10 w-10 rounded-full bg-[#5ea4ff] text-[#0a1a33] font-semibold flex items-center justify-center">
                      {userInitials}
                    </div>
                    <div className="flex flex-col text-left flex-1">
                      <span className="text-sm font-semibold text-white">
                        {user.name}
                      </span>
                      <span className="text-xs text-white/60">
                        {user.role || user.email}
                      </span>
                    </div>
                  </div>
                  
                  <div className="mt-3 flex flex-col gap-2">
                    <NavLink
                      to="/dashboard"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-white/80 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                    >
                      <LayoutDashboard size={18} />
                      <span>Dashboard</span>
                    </NavLink>
                    <NavLink
                      to="/admin"
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-white/80 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                    >
                      <Settings size={18} />
                      <span>Admin Panel</span>
                    </NavLink>
                    <button
                      onClick={() => {
                        handleLogout();
                        setIsMenuOpen(false);
                      }}
                      disabled={isLoggingOut}
                      className="flex items-center gap-3 px-4 py-3 text-red-400 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <LogOut size={18} className={isLoggingOut ? "animate-spin" : ""} />
                      <span>{isLoggingOut ? 'Logging out...' : 'Logout'}</span>
                    </button>
                  </div>
                </div>
              ) : isLoading ? (
                <div className="h-10 w-32 rounded-full bg-white/10 animate-pulse" />
              ) : (
                <button 
                  className="cursor-pointer font-semibold text-primary border-2 rounded-lg px-4 py-2 border-white text-white hover:bg-white hover:text-[#0a1a33] transition" 
                  onClick={() => navigate('/auth')}
                >
                  Get Started
                </button>
              )}
            </div>
          </div>
        )}
      </nav>

      {openMail && <Notification onClose={() => setOpenMail(false)} />}
    </>
  );
};

export default NavBar;