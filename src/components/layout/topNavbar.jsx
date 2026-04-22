import { NavLink } from "react-router-dom";
import { FiHome, FiGrid, FiMenu, FiLogOut } from "react-icons/fi";
import { useState } from "react";
import { logoutAdmin } from "../../utils/auth";

const TopNavbar = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navItems = [
    { to: "/admin/dashboard", icon: FiHome, label: "Dashboard" },
    { to: "/admin/services", icon: FiGrid, label: "Create Services" },
  ];

  const linkClasses = ({ isActive }) =>
    `flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all
     ${
       isActive
         ? "bg-amber-100 text-amber-700 shadow-sm"
         : "text-slate-600 hover:bg-slate-100"
     }`;

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
      <div className="flex items-center justify-between px-4 md:px-6 h-16">
        {/* LEFT - LOGO */}
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-5 bg-gradient-to-b from-amber-400 to-amber-500 rounded-full"></span>
          <span className="font-semibold text-slate-800 text-sm md:text-base">
            All In One Home Services
          </span>
        </div>

        {/* CENTER - DESKTOP NAV */}
        <nav className="hidden md:flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to} className={linkClasses}>
              <Icon className="text-lg" />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* RIGHT - ACTIONS */}
        <div className="flex items-center gap-3">
          <button
            onClick={logoutAdmin}
            className="group relative flex items-center gap-2.5 px-5 py-2.5 text-sm font-medium text-slate-700 bg-white/60 hover:bg-white rounded-xl border border-slate-200/80 shadow-sm hover:shadow-md transition-all duration-200 hover:border-amber-200"
          >
            <FiLogOut
              size={16}
              className="text-slate-500 group-hover:text-amber-600 transition-colors"
            />
            <span>Logout</span>
          </button>

          {/* MOBILE MENU BUTTON */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-slate-100"
          >
            <FiMenu size={20} />
          </button>
        </div>
      </div>

      {/* MOBILE MENU */}
      {mobileOpen && (
        <div className="md:hidden px-4 pb-4 space-y-2">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink key={to} to={to} className={linkClasses}>
              <Icon className="text-lg" />
              {label}
            </NavLink>
          ))}
        </div>
      )}
    </header>
  );
};

export default TopNavbar;
