import { NavLink } from "react-router-dom";
import {
  FiHome,
  FiUsers,
  FiCreditCard,
  FiGrid,
  FiAward,
  FiUploadCloud,
} from "react-icons/fi";
import logo from "../../assets/logo.png";

const Sidebar = ({ isOpen }) => {
  const linkClasses = ({ isActive }) =>
    `group relative flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium
     transition-all duration-300
     ${
       isActive
         ? "bg-amber-50 text-amber-700 border border-amber-200/60 shadow-sm"
         : "text-slate-600 hover:bg-slate-50/80 hover:text-slate-800"
     }`;

  const navItems = [
    { to: "/admin/dashboard", icon: FiHome, label: "Dashboard" },
    { to: "/admin/services", icon: FiGrid, label: "Create Services" },
  ];

  return (
    <aside
      className={`fixed top-0 left-0 h-screen bg-white/80 backdrop-blur-xl
      border-r border-slate-200/60 shadow-[4px_0_20px_-6px_rgba(0,0,0,0.05)]
      transition-all duration-300 z-40
      ${isOpen ? "w-64" : "w-20"}`}
    >
      {/* LOGO SECTION */}
      <div className="h-16 flex items-center justify-center border-b border-slate-200/60">
        <div className="flex items-center gap-2">
          {isOpen ? (
            <>
              <span className="w-1.5 h-5 bg-gradient-to-b from-amber-400 to-amber-500 rounded-full"></span>
              <span className="text-slate-800 font-semibold text-sm">
                All In One Home Services
              </span>
            </>
          ) : (
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center text-white font-bold shadow-sm">
              A
            </div>
          )}
        </div>
      </div>

      {/* NAVIGATION */}
      <nav className="mt-6 px-3 space-y-1">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} className={linkClasses}>
            {/* Icon */}
            <Icon
              className={`text-lg shrink-0 transition-all duration-300
                group-hover:scale-110
                ${isOpen ? "ml-0" : "mx-auto"}
              `}
            />

            {/* Label */}
            <span
              className={`whitespace-nowrap transition-all duration-300
                ${
                  isOpen
                    ? "opacity-100 translate-x-0"
                    : "opacity-0 -translate-x-4 w-0 overflow-hidden"
                }
              `}
            >
              {label}
            </span>

            {/* Tooltip for collapsed state */}
            {!isOpen && (
              <span
                className="pointer-events-none absolute left-full ml-3
                rounded-lg bg-white px-3 py-1.5 text-xs font-medium text-slate-700
                opacity-0 shadow-lg border border-slate-200
                transition-all duration-200
                group-hover:opacity-100"
              >
                {label}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* FOOTER */}
      {isOpen && (
        <div className="absolute bottom-0 w-full px-6 py-4 text-xs text-slate-500 border-t border-slate-200/60">
          © {new Date().getFullYear()} All In One Home Services
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
