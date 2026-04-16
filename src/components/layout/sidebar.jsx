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
    `group relative flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium
   transition-all duration-300
   ${
     isActive
       ? "bg-yellow-400 text-black shadow-md"
       : "text-gray-300 hover:bg-yellow-400/10 hover:text-yellow-300"
   }`;

  const navItems = [
    { to: "/admin/dashboard", icon: FiHome, label: "Dashboard" },
    { to: "/admin/generate-receipt", icon: FiGrid, label: "Create Services" },
    // {
    //   to: "/admin/membership-types",
    //   icon: FiAward,
    //   label: "Membership Plans",
    // },
    // { to: "/admin/users", icon: FiUsers, label: "Users" },
    // { to: "/admin/view-receipts", icon: FiCreditCard, label: "View Receipts" },
    // {
    //   to: "/admin/post-notification",
    //   icon: FiUploadCloud,
    //   label: "Notification",
    // },
  ];

  return (
    <aside
      className={`fixed top-0 left-0 h-screen bg-gradient-to-b from-[#0f172a] via-[#1e293b] to-[#020617]
      border-r border-gray-800 transition-all duration-300 z-40
      ${isOpen ? "w-64" : "w-20"}`}
    >
      {/* 🔥 LOGO */}
      <div className="h-16 flex items-center justify-center border-b border-gray-800">
        <div className="flex items-center gap-2">
          {/* <img
            src={logo}
            alt="logo"
            className={`transition-all duration-300 ${
              isOpen ? "w-10 h-10" : "w-8 h-8"
            }`}
          /> */}

          {isOpen && (
            <span className="text-yellow-400 font-semibold text-sm">
              All In One Home Services
            </span>
          )}
        </div>
      </div>

      {/* 🔥 NAVIGATION */}
      <nav className="mt-4 px-2 space-y-1">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} className={linkClasses}>
            {/* Icon */}
            <Icon
              className={`text-lg shrink-0 transition-all duration-300
                group-hover:scale-110 group-hover:rotate-3
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

            {/* Tooltip */}
            {!isOpen && (
              <span
                className="pointer-events-none absolute left-full ml-3
                rounded-md bg-green-900 px-3 py-1.5 text-xs text-white
                opacity-0 scale-95 shadow-lg
                transition-all duration-200
                group-hover:opacity-100 group-hover:scale-100"
              >
                {label}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* 🔥 FOOTER */}
      {isOpen && (
        <div className="absolute bottom-0 w-full px-6 py-4 text-xs text-green-300 border-t border-green-800">
          © {new Date().getFullYear()} All In One Home Services
        </div>
      )}
    </aside>
  );
};

export default Sidebar;
