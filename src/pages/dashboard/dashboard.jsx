import AdminLayout from "../../components/layout/adminLayout";
import { FiUsers, FiCreditCard, FiGrid, FiAward } from "react-icons/fi";

const Dashboard = () => {
  return (
    <AdminLayout>
      <div className="p-6 space-y-6">
        {/* 🔥 Welcome Section */}
        <div className="bg-gradient-to-r from-green-600 to-green-800 text-white rounded-xl p-6 shadow">
          <h1 className="text-2xl font-bold mb-1">
            Welcome to SLCMS Admin Panel 👋
          </h1>
          {/* <p className="text-sm text-green-100">
            Manage students, memberships, payments, and notifications
            efficiently.
          </p> */}
        </div>

        {/* 🔥 Stats Cards */}
        {/* <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow p-5 border border-gray-100 hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <h2 className="text-sm text-gray-500">Total Users</h2>
              <FiUsers className="text-green-600 text-xl" />
            </div>
            <p className="text-2xl font-bold text-gray-800 mt-2">1,240</p>
          </div>

          <div className="bg-white rounded-xl shadow p-5 border border-gray-100 hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <h2 className="text-sm text-gray-500">Categories</h2>
              <FiGrid className="text-green-600 text-xl" />
            </div>
            <p className="text-2xl font-bold text-gray-800 mt-2">18</p>
          </div>

          <div className="bg-white rounded-xl shadow p-5 border border-gray-100 hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <h2 className="text-sm text-gray-500">Membership Plans</h2>
              <FiAward className="text-green-600 text-xl" />
            </div>
            <p className="text-2xl font-bold text-gray-800 mt-2">6</p>
          </div>

          <div className="bg-white rounded-xl shadow p-5 border border-gray-100 hover:shadow-md transition">
            <div className="flex items-center justify-between">
              <h2 className="text-sm text-gray-500">Payments</h2>
              <FiCreditCard className="text-green-600 text-xl" />
            </div>
            <p className="text-2xl font-bold text-gray-800 mt-2">₹2.4L</p>
          </div>
        </div> */}

        {/* 🔥 Info Section */}
        <div className="bg-white rounded-xl shadow p-6 border border-gray-100">
          <h2 className="text-lg font-semibold text-green-800 mb-2">
            About SLCMS
          </h2>
          <p className="text-gray-600 text-sm leading-relaxed">
            Sri Lakshmi College of Management and Science is committed to
            delivering excellence in education and empowering students with
            knowledge, skills, and values. This admin panel helps manage
            institutional operations efficiently, ensuring smooth workflows and
            better decision-making.
          </p>
        </div>
      </div>
    </AdminLayout>
  );
};

export default Dashboard;
