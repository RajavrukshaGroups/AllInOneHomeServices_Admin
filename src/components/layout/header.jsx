import { FiMenu, FiLogOut } from "react-icons/fi";
import { logoutAdmin } from "../../utils/auth";

const Header = ({ toggleSidebar }) => {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-6 bg-white/80 backdrop-blur-md border-b border-green-200 shadow-sm">
      {/* LEFT */}
      <div className="flex items-center gap-4">
        {/* Hamburger */}
        <button
          onClick={toggleSidebar}
          className="text-green-700 hover:text-green-900 transition"
        >
          <FiMenu size={22} />
        </button>

        {/* Title */}
        <h1 className="hidden md:block text-lg font-semibold text-green-800">
          Admin Dashboard
        </h1>
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-4">
        {/* Logout Button */}
        <button
          onClick={logoutAdmin}
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-black bg-yellow-500 rounded-lg hover:bg-yellow-600 transition shadow-sm"
        >
          <FiLogOut size={16} />
          Logout
        </button>
      </div>
    </header>
  );
};

export default Header;
