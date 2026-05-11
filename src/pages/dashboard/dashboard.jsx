import { useEffect, useState } from "react";
import AdminLayout from "../../components/layout/adminLayout";
import api from "../../api/axios";
import {
  FiUsers,
  FiCreditCard,
  FiGrid,
  FiAward,
  FiTrendingUp,
  FiClock,
  FiCheckCircle,
  FiAlertCircle,
  FiActivity,
  FiPieChart,
} from "react-icons/fi";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    try {
      const res = await api.get("/booking/fetch-overall-details");
      setStats(res.data.data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  // Prepare data for payment status pie chart
  const paymentChartData = stats
    ? [
        {
          name: "Pending",
          value: stats.payments?.pending || 0,
          color: "#f43f5e",
        },
        {
          name: "Partially Paid",
          value: stats.payments?.partiallyPaid || 0,
          color: "#f59e0b",
        },
        { name: "Paid", value: stats.payments?.paid || 0, color: "#10b981" },
      ]
    : [];

  // Prepare data for work progress pie chart
  const progressChartData = stats
    ? [
        {
          name: "Not Started",
          value: stats.progress?.notStarted || 0,
          color: "#64748b",
        },
        {
          name: "Assigned",
          value: stats.progress?.assigned || 0,
          color: "#3b82f6",
        },
        {
          name: "In Progress",
          value: stats.progress?.inProgress || 0,
          color: "#f59e0b",
        },
        {
          name: "Completed",
          value: stats.progress?.completed || 0,
          color: "#10b981",
        },
        {
          name: "Cancelled",
          value: stats.progress?.cancelled || 0,
          color: "#ef4444",
        },
      ]
    : [];

  // Calculate totals for percentage display
  const totalPayments = paymentChartData.reduce(
    (sum, item) => sum + item.value,
    0,
  );
  const totalProgress = progressChartData.reduce(
    (sum, item) => sum + item.value,
    0,
  );

  // Custom tooltip for charts – shows value and percentage
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const total =
        data.name === "Pending" ||
        data.name === "Partially Paid" ||
        data.name === "Paid"
          ? totalPayments
          : totalProgress;
      const percentage =
        total > 0 ? ((data.value / total) * 100).toFixed(1) : 0;
      return (
        <div className="rounded-lg bg-white px-4 py-2 shadow-lg border border-gray-100">
          <p className="text-sm font-semibold text-gray-800">{data.name}</p>
          <p className="text-2xl font-bold" style={{ color: data.color }}>
            {data.value.toLocaleString()}
          </p>
          <p className="text-xs text-gray-500">{percentage}% of total</p>
        </div>
      );
    }
    return null;
  };

  // Custom legend formatter to include counts
  const renderLegendText = (value, entry) => {
    const { color } = entry;
    let count = 0;
    let total = 0;
    if (paymentChartData.some((d) => d.name === value)) {
      const item = paymentChartData.find((d) => d.name === value);
      count = item?.value || 0;
      total = totalPayments;
    } else {
      const item = progressChartData.find((d) => d.name === value);
      count = item?.value || 0;
      total = totalProgress;
    }
    const percent = total > 0 ? ((count / total) * 100).toFixed(0) : 0;
    return (
      <span className="text-sm text-gray-700">
        {value}{" "}
        <span className="font-semibold" style={{ color }}>
          ({count.toLocaleString()} • {percent}%)
        </span>
      </span>
    );
  };

  // Skeleton Loader Component (improved text placeholders)
  const StatSkeleton = () => (
    <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-lg shadow-gray-200/50 transition-all duration-300">
      <div className="flex items-center gap-4">
        <div className="h-12 w-12 animate-pulse rounded-xl bg-gradient-to-br from-gray-200 to-gray-100"></div>
        <div className="flex-1">
          <div className="mb-2 h-3 w-20 animate-pulse rounded bg-gray-200"></div>
          <div className="h-7 w-24 animate-pulse rounded bg-gray-200"></div>
        </div>
      </div>
    </div>
  );

  const PaymentSkeleton = () => (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-lg shadow-gray-200/50">
      <div className="mb-5 h-6 w-36 animate-pulse rounded bg-gray-200"></div>
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="flex items-center justify-between rounded-xl bg-gray-50 p-4"
          >
            <div className="h-4 w-24 animate-pulse rounded bg-gray-200"></div>
            <div className="h-6 w-12 animate-pulse rounded bg-gray-200"></div>
          </div>
        ))}
      </div>
    </div>
  );

  const ProgressSkeleton = () => (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-lg shadow-gray-200/50">
      <div className="mb-5 h-6 w-36 animate-pulse rounded bg-gray-200"></div>
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="flex items-center justify-between rounded-xl bg-gray-50 p-4"
          >
            <div className="h-4 w-24 animate-pulse rounded bg-gray-200"></div>
            <div className="h-6 w-12 animate-pulse rounded bg-gray-200"></div>
          </div>
        ))}
      </div>
    </div>
  );

  const ChartSkeleton = () => (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-lg shadow-gray-200/50">
      <div className="mb-5 flex items-center gap-2 border-b border-gray-100 pb-3">
        <div className="h-8 w-8 animate-pulse rounded-lg bg-gray-200"></div>
        <div className="h-6 w-40 animate-pulse rounded bg-gray-200"></div>
      </div>
      <div className="flex h-64 items-center justify-center">
        <div className="h-40 w-40 animate-pulse rounded-full bg-gray-200"></div>
      </div>
    </div>
  );

  return (
    <AdminLayout>
      <div className="space-y-8 bg-gradient-to-br from-gray-50 via-white to-gray-50 p-6 md:p-8">
        {/* 🔥 Welcome Section */}
        <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-amber-500 p-8 text-white shadow-xl transition-all duration-500 hover:shadow-2xl">
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10 blur-3xl"></div>
          <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-amber-400/20 blur-3xl"></div>
          <div className="relative z-10">
            <div className="mb-3 flex items-center gap-2">
              <div className="rounded-full bg-white/20 p-2 backdrop-blur-sm">
                <FiActivity className="text-xl" />
              </div>
              <span className="text-sm font-medium tracking-wide text-amber-200">
                Admin Dashboard
              </span>
            </div>
            <h1 className="mb-2 text-3xl font-bold tracking-tight md:text-4xl">
              Welcome back! 👋
            </h1>
            <p className="text-sm text-gray-200 md:text-base">
              Manage services, bookings, and operations seamlessly from one
              intelligent dashboard.
            </p>
          </div>
        </div>

        {/* 🔥 About Section */}
        <div className="relative rounded-2xl border border-gray-100 bg-white/80 p-6 shadow-lg shadow-gray-200/50 backdrop-blur-sm transition-all duration-300 hover:shadow-xl">
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-amber-500/5 to-transparent"></div>
          <div className="relative flex items-start gap-3">
            <div className="rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 p-2 text-white shadow-md">
              <FiTrendingUp className="text-lg" />
            </div>
            <div>
              <h2 className="mb-2 text-xl font-bold text-gray-800">
                About MK Home Services
              </h2>
              <p className="text-sm leading-relaxed text-gray-600">
                MK Home Services is a comprehensive platform designed to
                simplify and manage home service bookings such as cleaning,
                plumbing, painting, and maintenance. We connect trusted
                professionals with customers for seamless, reliable service
                delivery.
              </p>
            </div>
          </div>
        </div>

        {/* 🔥 Stats Grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {loading ? (
            <>
              <StatSkeleton />
              <StatSkeleton />
              <StatSkeleton />
              <StatSkeleton />
            </>
          ) : (
            <>
              <div className="group relative transform rounded-2xl border border-gray-100 bg-white p-5 shadow-lg shadow-gray-200/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-amber-500/0 to-amber-500/0 transition-all duration-300 group-hover:from-amber-500/5 group-hover:to-amber-500/10"></div>
                <div className="relative flex items-center gap-4">
                  <div className="rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 p-3 text-white shadow-md transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg">
                    <FiGrid className="text-xl" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Total Services
                    </p>
                    <h3 className="text-2xl font-bold tracking-tight text-gray-800">
                      {stats?.totalServices?.toLocaleString() || 0}
                    </h3>
                  </div>
                </div>
              </div>

              <div className="group relative transform rounded-2xl border border-gray-100 bg-white p-5 shadow-lg shadow-gray-200/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/0 to-blue-500/0 transition-all duration-300 group-hover:from-blue-500/5 group-hover:to-blue-500/10"></div>
                <div className="relative flex items-center gap-4">
                  <div className="rounded-xl bg-gradient-to-br from-blue-400 to-blue-600 p-3 text-white shadow-md transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg">
                    <FiUsers className="text-xl" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Total Customers
                    </p>
                    <h3 className="text-2xl font-bold tracking-tight text-gray-800">
                      {stats?.totalCustomers?.toLocaleString() || 0}
                    </h3>
                  </div>
                </div>
              </div>

              <div className="group relative transform rounded-2xl border border-gray-100 bg-white p-5 shadow-lg shadow-gray-200/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-emerald-500/0 to-emerald-500/0 transition-all duration-300 group-hover:from-emerald-500/5 group-hover:to-emerald-500/10"></div>
                <div className="relative flex items-center gap-4">
                  <div className="rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 p-3 text-white shadow-md transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg">
                    <FiCreditCard className="text-xl" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Total Bookings
                    </p>
                    <h3 className="text-2xl font-bold tracking-tight text-gray-800">
                      {stats?.totalBookings?.toLocaleString() || 0}
                    </h3>
                  </div>
                </div>
              </div>

              <div className="group relative transform rounded-2xl border border-gray-100 bg-white p-5 shadow-lg shadow-gray-200/50 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-500/0 to-purple-500/0 transition-all duration-300 group-hover:from-purple-500/5 group-hover:to-purple-500/10"></div>
                <div className="relative flex items-center gap-4">
                  <div className="rounded-xl bg-gradient-to-br from-purple-400 to-purple-600 p-3 text-white shadow-md transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg">
                    <FiAward className="text-xl" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-500">
                      Total Revenue
                    </p>
                    <h3 className="text-2xl font-bold tracking-tight text-gray-800">
                      ₹{stats?.totalRevenue?.toLocaleString("en-IN") || 0}
                    </h3>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* 🔥 Pie Charts Section with improved labels */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {loading ? (
            <>
              <ChartSkeleton />
              <ChartSkeleton />
            </>
          ) : (
            stats && (
              <>
                {/* Payment Status Pie Chart */}
                <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-lg shadow-gray-200/50 transition-all duration-300 hover:shadow-xl">
                  <div className="mb-5 flex items-center justify-between border-b border-gray-100 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="rounded-lg bg-amber-100 p-2 text-amber-600">
                        <FiPieChart className="text-lg" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-800">
                        Payment Distribution
                      </h3>
                    </div>
                    <div className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-full">
                      Total: {totalPayments.toLocaleString()}
                    </div>
                  </div>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={paymentChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={2}
                        dataKey="value"
                        label={({ name, percent }) =>
                          `${name}: ${(percent * 100).toFixed(0)}%`
                        }
                        labelLine={false}
                      >
                        {paymentChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                      <Legend
                        verticalAlign="bottom"
                        height={36}
                        iconType="circle"
                        formatter={renderLegendText}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Work Progress Pie Chart */}
                <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-lg shadow-gray-200/50 transition-all duration-300 hover:shadow-xl">
                  <div className="mb-5 flex items-center justify-between border-b border-gray-100 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="rounded-lg bg-blue-100 p-2 text-blue-600">
                        <FiTrendingUp className="text-lg" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-800">
                        Work Progress Breakdown
                      </h3>
                    </div>
                    <div className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-full">
                      Total: {totalProgress.toLocaleString()}
                    </div>
                  </div>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={progressChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={2}
                        dataKey="value"
                        label={({ name, percent }) =>
                          `${name}: ${(percent * 100).toFixed(0)}%`
                        }
                        labelLine={false}
                      >
                        {progressChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                      <Legend
                        verticalAlign="bottom"
                        height={36}
                        iconType="circle"
                        formatter={renderLegendText}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </>
            )
          )}
        </div>

        {/* 🔥 Additional Stats Section – now includes percentage indicators */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {loading ? (
            <>
              <PaymentSkeleton />
              <ProgressSkeleton />
            </>
          ) : (
            stats && (
              <>
                {/* PAYMENT STATUS - List View with percentages */}
                <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-lg shadow-gray-200/50 transition-all duration-300 hover:shadow-xl">
                  <div className="mb-5 flex items-center gap-2 border-b border-gray-100 pb-3">
                    <div className="rounded-lg bg-amber-100 p-2 text-amber-600">
                      <FiCreditCard className="text-lg" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-800">
                      Payment Status Overview
                    </h3>
                  </div>
                  <div className="space-y-3">
                    <div className="group flex transform items-center justify-between rounded-xl bg-gradient-to-r from-rose-50 to-white p-4 transition-all duration-300 hover:scale-[1.02] hover:shadow-md">
                      <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-rose-100 p-2 text-rose-600">
                          <FiClock className="text-sm" />
                        </div>
                        <span className="font-semibold text-rose-700">
                          Pending Payments
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-2xl font-bold text-rose-800">
                          {stats.payments?.pending?.toLocaleString() || 0}
                        </span>
                        <span className="ml-2 text-xs text-rose-600 font-medium">
                          (
                          {totalPayments > 0
                            ? (
                                (stats.payments?.pending / totalPayments) *
                                100
                              ).toFixed(1)
                            : 0}
                          %)
                        </span>
                      </div>
                    </div>
                    <div className="group flex transform items-center justify-between rounded-xl bg-gradient-to-r from-amber-50 to-white p-4 transition-all duration-300 hover:scale-[1.02] hover:shadow-md">
                      <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-amber-100 p-2 text-amber-600">
                          <FiAlertCircle className="text-sm" />
                        </div>
                        <span className="font-semibold text-amber-700">
                          Partially Paid
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-2xl font-bold text-amber-800">
                          {stats.payments?.partiallyPaid?.toLocaleString() || 0}
                        </span>
                        <span className="ml-2 text-xs text-amber-600 font-medium">
                          (
                          {totalPayments > 0
                            ? (
                                (stats.payments?.partiallyPaid /
                                  totalPayments) *
                                100
                              ).toFixed(1)
                            : 0}
                          %)
                        </span>
                      </div>
                    </div>
                    <div className="group flex transform items-center justify-between rounded-xl bg-gradient-to-r from-emerald-50 to-white p-4 transition-all duration-300 hover:scale-[1.02] hover:shadow-md">
                      <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-emerald-100 p-2 text-emerald-600">
                          <FiCheckCircle className="text-sm" />
                        </div>
                        <span className="font-semibold text-emerald-700">
                          Completed Payments
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-2xl font-bold text-emerald-800">
                          {stats.payments?.paid?.toLocaleString() || 0}
                        </span>
                        <span className="ml-2 text-xs text-emerald-600 font-medium">
                          (
                          {totalPayments > 0
                            ? (
                                (stats.payments?.paid / totalPayments) *
                                100
                              ).toFixed(1)
                            : 0}
                          %)
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* WORK PROGRESS - List View with percentages */}
                <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-lg shadow-gray-200/50 transition-all duration-300 hover:shadow-xl">
                  <div className="mb-5 flex items-center gap-2 border-b border-gray-100 pb-3">
                    <div className="rounded-lg bg-blue-100 p-2 text-blue-600">
                      <FiTrendingUp className="text-lg" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-800">
                      Work Progress Tracker
                    </h3>
                  </div>
                  <div className="space-y-3">
                    <div className="group flex transform items-center justify-between rounded-xl bg-gradient-to-r from-slate-50 to-white p-4 transition-all duration-300 hover:scale-[1.02] hover:shadow-md">
                      <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-slate-100 p-2 text-slate-600">
                          <FiClock className="text-sm" />
                        </div>
                        <span className="font-semibold text-slate-700">
                          Not Started
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-2xl font-bold text-slate-800">
                          {stats.progress?.notStarted?.toLocaleString() || 0}
                        </span>
                        <span className="ml-2 text-xs text-slate-600 font-medium">
                          (
                          {totalProgress > 0
                            ? (
                                (stats.progress?.notStarted / totalProgress) *
                                100
                              ).toFixed(1)
                            : 0}
                          %)
                        </span>
                      </div>
                    </div>
                    <div className="group flex transform items-center justify-between rounded-xl bg-gradient-to-r from-blue-50 to-white p-4 transition-all duration-300 hover:scale-[1.02] hover:shadow-md">
                      <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-blue-100 p-2 text-blue-600">
                          <FiUsers className="text-sm" />
                        </div>
                        <span className="font-semibold text-blue-700">
                          Assigned
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-2xl font-bold text-blue-800">
                          {stats.progress?.assigned?.toLocaleString() || 0}
                        </span>
                        <span className="ml-2 text-xs text-blue-600 font-medium">
                          (
                          {totalProgress > 0
                            ? (
                                (stats.progress?.assigned / totalProgress) *
                                100
                              ).toFixed(1)
                            : 0}
                          %)
                        </span>
                      </div>
                    </div>
                    <div className="group flex transform items-center justify-between rounded-xl bg-gradient-to-r from-amber-50 to-white p-4 transition-all duration-300 hover:scale-[1.02] hover:shadow-md">
                      <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-amber-100 p-2 text-amber-600">
                          <FiActivity className="text-sm" />
                        </div>
                        <span className="font-semibold text-amber-700">
                          In Progress
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-2xl font-bold text-amber-800">
                          {stats.progress?.inProgress?.toLocaleString() || 0}
                        </span>
                        <span className="ml-2 text-xs text-amber-600 font-medium">
                          (
                          {totalProgress > 0
                            ? (
                                (stats.progress?.inProgress / totalProgress) *
                                100
                              ).toFixed(1)
                            : 0}
                          %)
                        </span>
                      </div>
                    </div>
                    <div className="group flex transform items-center justify-between rounded-xl bg-gradient-to-r from-emerald-50 to-white p-4 transition-all duration-300 hover:scale-[1.02] hover:shadow-md">
                      <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-emerald-100 p-2 text-emerald-600">
                          <FiCheckCircle className="text-sm" />
                        </div>
                        <span className="font-semibold text-emerald-700">
                          Completed
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-2xl font-bold text-emerald-800">
                          {stats.progress?.completed?.toLocaleString() || 0}
                        </span>
                        <span className="ml-2 text-xs text-emerald-600 font-medium">
                          (
                          {totalProgress > 0
                            ? (
                                (stats.progress?.completed / totalProgress) *
                                100
                              ).toFixed(1)
                            : 0}
                          %)
                        </span>
                      </div>
                    </div>
                    <div className="group flex transform items-center justify-between rounded-xl bg-gradient-to-r from-rose-50 to-white p-4 transition-all duration-300 hover:scale-[1.02] hover:shadow-md">
                      <div className="flex items-center gap-3">
                        <div className="rounded-lg bg-rose-100 p-2 text-rose-600">
                          <FiAlertCircle className="text-sm" />
                        </div>

                        <span className="font-semibold text-rose-700">
                          Cancelled Tasks
                        </span>
                      </div>

                      <div className="text-right">
                        <span className="text-2xl font-bold text-rose-800">
                          {stats.progress?.cancelled?.toLocaleString() || 0}
                        </span>

                        <span className="ml-2 text-xs font-medium text-rose-600">
                          (
                          {totalProgress > 0
                            ? (
                                (stats.progress?.cancelled / totalProgress) *
                                100
                              ).toFixed(1)
                            : 0}
                          %)
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default Dashboard;
