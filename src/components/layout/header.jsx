import { FiMenu, FiLogOut } from "react-icons/fi";
import { logoutAdmin } from "../../utils/auth";

const Header = ({ toggleSidebar }) => {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-6 bg-[#0f172a]/90 backdrop-blur-md border-b border-gray-800 shadow-sm">
      {/* LEFT */}
      <div className="flex items-center gap-4">
        {/* Hamburger */}
        <button
          onClick={toggleSidebar}
          className="text-gray-300 hover:text-yellow-400 transition"
        >
          <FiMenu size={22} />
        </button>

        {/* Title */}
        <h1 className="hidden md:block text-lg font-semibold text-white">
          All In One Home Services
        </h1>
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-4">
        {/* Logout Button */}
        <button
          onClick={logoutAdmin}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-black bg-yellow-400 rounded-lg hover:bg-yellow-500 transition shadow-md"
        >
          <FiLogOut size={16} />
          Logout
        </button>
      </div>
    </header>
  );
};

export default Header;
