import AdminLayout from "../../components/layout/adminLayout";
import { FiUsers, FiCreditCard, FiGrid, FiAward } from "react-icons/fi";

const Dashboard = () => {
  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        {/* 🔥 Welcome Section */}
        <div className="bg-gradient-to-r from-[#0f172a] via-[#1e293b] to-[#facc15] text-white rounded-xl p-6 shadow">
          <h1 className="text-2xl font-bold mb-1">
            Welcome to All In One Home Services Admin Panel 👋
          </h1>
          <p className="text-sm text-gray-200">
            Manage services, bookings, and operations seamlessly.
          </p>
        </div>

        {/* 🔥 About Section */}
        <div className="bg-white rounded-xl shadow p-6 border border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">
            About All In One Home Services
          </h2>
          <p className="text-gray-600 text-sm leading-relaxed">
            All In One Home Services is a platform designed to simplify and
            manage home service bookings such as cleaning, plumbing, painting,
            and maintenance. This admin panel allows you to efficiently manage
            services, pricing, bookings, and customer interactions — ensuring a
            smooth and reliable experience for both customers and service
            providers.
          </p>
        </div>

        {/* 🔥 Quick Stats (Optional but Recommended) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <FiGrid className="text-yellow-500 text-xl" />
              <div>
                <p className="text-sm text-gray-500">Services</p>
                <h3 className="text-lg font-semibold text-gray-800">--</h3>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <FiUsers className="text-yellow-500 text-xl" />
              <div>
                <p className="text-sm text-gray-500">Customers</p>
                <h3 className="text-lg font-semibold text-gray-800">--</h3>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <FiCreditCard className="text-yellow-500 text-xl" />
              <div>
                <p className="text-sm text-gray-500">Bookings</p>
                <h3 className="text-lg font-semibold text-gray-800">--</h3>
              </div>
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <FiAward className="text-yellow-500 text-xl" />
              <div>
                <p className="text-sm text-gray-500">Revenue</p>
                <h3 className="text-lg font-semibold text-gray-800">₹ --</h3>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Dashboard;
