import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/axios";
import { isAdminLoggedIn } from "../../utils/auth";
import { toast } from "react-toastify";
import logo from "../../assets/logo.png";
import { FiEye, FiEyeOff } from "react-icons/fi";

const AdminLogin = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (isAdminLoggedIn()) {
      navigate("/admin/dashboard", { replace: true });
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!email || !password) {
      toast.error("Email and password are required");
      setLoading(false);
      return;
    }

    try {
      const res = await api.post("/admin/login", {
        email,
        password,
      });

      localStorage.setItem("adminToken", res.data.token);
      toast.success("Login successful");

      navigate("/admin/dashboard", { replace: true });
    } catch (err) {
      const message =
        err.response?.data?.message || "Invalid email or password";

      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f172a] via-[#1e293b] to-[#facc15] px-4">
      {" "}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 border border-gray-200 transition-all duration-300">
        {/* LOGO */}
        {/* <div className="flex justify-center mb-3">
          <img
            src={logo}
            alt="SLCMS Logo"
            className="w-20 h-20 object-contain"
          />
        </div> */}

        {/* TITLE */}
        <h1 className="text-2xl font-bold text-gray-800 text-center mb-1">
          Admin Login
        </h1>

        <p className="text-gray-500 text-center mb-6 text-sm">
          All In One Home Services
        </p>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* EMAIL */}
          <div>
            <label className="block text-gray-600 text-sm mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-white text-gray-800 border border-gray-300 focus:outline-none focus:border-green-600 placeholder-gray-400"
              placeholder="admin@slcms.com"
            />
          </div>

          {/* PASSWORD */}
          <div>
            <label className="block text-gray-600 text-sm mb-1">Password</label>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 pr-10 rounded-lg bg-white text-gray-800 border border-gray-300 focus:outline-none focus:border-green-600 placeholder-gray-400"
                placeholder="••••••••"
              />

              {/* Eye Icon */}
              <span
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-gray-500 cursor-pointer hover:text-green-600 transition"
              >
                {showPassword ? <FiEyeOff size={18} /> : <FiEye size={18} />}
              </span>
            </div>
          </div>

          {/* BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 rounded-lg bg-yellow-500 hover:bg-yellow-600 transition text-black font-semibold disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>

        {/* FOOTER */}
        <p className="text-xs text-gray-400 text-center mt-6">
          © {new Date().getFullYear()} All In One Home Services – Admin Panel
        </p>
      </div>
    </div>
  );
};

export default AdminLogin;
