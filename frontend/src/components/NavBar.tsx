import { useMemo, useState } from "react";
import { NavLink } from "react-router-dom";
import { HashLink } from "react-router-hash-link";
import { MailIcon } from "lucide-react";
import Notification from "./Notification";
import { useCurrentUser } from "../hooks/useCurrentUser";

const NavLinkList = ({ onLinkClick, onMailClick }: any) => {
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
      <NavLink to="/dashboard" className={linkClassName} onClick={handleClick}>
        Dashboard
      </NavLink>
      <NavLink to="/admin" className={linkClassName} onClick={handleClick}>
        Panel
      </NavLink>

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

const getInitials = (name?: string) =>
  name
    ?.split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "U";

const NavBar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [openMail, setOpenMail] = useState(false);
  const { user, isLoading } = useCurrentUser();

  const userInitials = useMemo(() => getInitials(user?.name), [user?.name]);

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
              <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-full px-3 py-1.5">
                <div className="h-10 w-10 rounded-full bg-[#5ea4ff] text-[#0a1a33] font-semibold flex items-center justify-center">
                  {userInitials}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-white">
                    {user.name}
                  </span>
                  <span className="text-xs text-white/60">
                    {user.role || user.email}
                  </span>
                </div>
              </div>
            ) : isLoading ? (
              <div className="h-10 w-32 rounded-full bg-white/10 animate-pulse" />
            ) : (
              <button className="cursor-pointer font-semibold text-primary border-2 rounded-lg px-4 py-2 border-white text-white hover:bg-white hover:text-[#0a1a33] transition">
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
                <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-2xl px-3 py-2 mt-4">
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
                </div>
              ) : isLoading ? (
                <div className="h-10 w-32 rounded-full bg-white/10 animate-pulse" />
              ) : (
                <button className="cursor-pointer font-semibold text-primary border-2 rounded-lg px-4 py-2 border-white text-white hover:bg-white hover:text-[#0a1a33] transition">
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
