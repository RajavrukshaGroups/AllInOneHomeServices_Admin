import { FiMenu, FiLogOut } from "react-icons/fi";
import { logoutAdmin } from "../../utils/auth";

const Header = ({ toggleSidebar }) => {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-6 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 shadow-[0_4px_20px_-6px_rgba(0,0,0,0.05)]">
      {/* LEFT SECTION */}
      <div className="flex items-center gap-5">
        {/* Hamburger Menu Button */}
        <button
          onClick={toggleSidebar}
          className="group relative flex items-center justify-center w-10 h-10 rounded-xl text-slate-500 hover:text-amber-600 hover:bg-amber-50/80 transition-all duration-200"
          aria-label="Toggle sidebar"
        >
          <FiMenu
            size={22}
            className="transition-transform group-hover:scale-110"
          />
        </button>

        {/* Brand Title with subtle accent */}
        <div className="hidden md:flex items-center gap-2">
          <span className="w-1.5 h-5 bg-gradient-to-b from-amber-400 to-amber-500 rounded-full"></span>
          <h1 className="text-lg font-semibold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
            All In One Home Services
          </h1>
        </div>
      </div>

      {/* RIGHT SECTION */}
      <div className="flex items-center gap-3">
        {/* Optional subtle divider - purely decorative */}
        <div className="hidden sm:block w-px h-6 bg-slate-200"></div>

        {/* Logout Button */}
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
      </div>
    </header>
  );
};

export default Header;
