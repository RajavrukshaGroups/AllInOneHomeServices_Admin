import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AdminLayout from "../../components/layout/adminLayout";
import api from "../../api/axios";
import {
  FiLoader,
  FiArrowLeft,
  FiDollarSign,
  FiClock,
  FiTag,
  FiChevronRight,
  FiImage,
  FiPhoneCall,
} from "react-icons/fi";

const IndividualService = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [parent, setParent] = useState(null);
  const [children, setChildren] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchService = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/services/ind-service/${id}`);
      setParent(res.data.parent);
      setChildren(res.data.children);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchService();
  }, [id]);

  // 🔥 RECURSIVE RENDER FUNCTION
  const renderServices = (services) => {
    return services.map((item) => (
      <div key={item._id}>
        {/* PREMIUM CARD */}
        <div
          onClick={() => {
            // 👉 navigate deeper if has children
            if (item.children?.length > 0) {
              navigate(`/admin/services/${item._id}`);
            }
          }}
          className="group relative bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700/50 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl hover:border-amber-500/40 transition-all duration-500 cursor-pointer backdrop-blur-sm"
        >
          {/* Subtle gradient overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-0" />

          {/* IMAGE SECTION */}
          <div className="relative h-48 overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900">
            {item.images?.[0] ? (
              <img
                src={item.images[0]}
                alt={item.name}
                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out"
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <FiImage className="text-4xl mb-2 opacity-50" />
                <span className="text-xs font-medium">No Image</span>
              </div>
            )}
            {/* Pricing Type Badge */}
            <div className="absolute top-3 right-3 z-10">
              {item.pricingType === "fixed" && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 backdrop-blur-md border border-emerald-500/30">
                  <FiDollarSign className="w-3 h-3" /> Fixed
                </span>
              )}
              {item.pricingType === "per_sqft" && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 backdrop-blur-md border border-blue-500/30">
                  <FiTag className="w-3 h-3" /> Per SqFt
                </span>
              )}
            </div>
          </div>

          {/* CONTENT */}
          <div className="relative z-10 p-5 space-y-3">
            <h2 className="text-xl font-bold text-white tracking-tight group-hover:text-amber-400 transition-colors duration-300 line-clamp-1">
              {item.name}
            </h2>

            {/* PRICE & DURATION ROW */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              {item.pricingType === "fixed" && item.price && (
                <div className="flex items-center gap-1.5 bg-gray-800/50 px-3 py-1 rounded-full">
                  <FiDollarSign className="text-emerald-400 text-sm" />
                  <span className="text-emerald-400 font-bold text-lg">
                    ₹{item.price}
                  </span>
                </div>
              )}

              {item.pricingType === "per_sqft" && (
                <div className="flex items-center gap-1.5 bg-gray-800/50 px-3 py-1 rounded-full">
                  <FiTag className="text-blue-400 text-sm" />
                  <span className="text-blue-400 font-semibold">
                    ₹{item.basePricePerSqft}
                    <span className="text-xs text-gray-400 ml-1">/ sqft</span>
                  </span>
                </div>
              )}

              {item.duration && (
                <div className="flex items-center gap-1.5 text-gray-400 text-sm bg-gray-800/30 px-3 py-1 rounded-full">
                  <FiClock className="text-amber-400" />
                  <span>{item.duration} mins</span>
                </div>
              )}
            </div>

            {/* OPTIONS */}
            {/* 🔥 OPTIONS WITH VALUES (MAIN FIX) */}
            {item.options?.length > 0 && (
              <div className="mt-4 space-y-3">
                {item.options.map((opt, idx) => (
                  <div
                    key={idx}
                    className="bg-gray-800/40 p-3 rounded-lg border border-gray-700"
                  >
                    {/* OPTION NAME */}
                    <p className="text-sm font-semibold text-amber-400 mb-2">
                      {opt.name}
                    </p>

                    {/* VALUES */}
                    <div className="grid grid-cols-1 gap-2">
                      {opt.values.map((val, i) => (
                        <div
                          key={i}
                          className="flex justify-between items-center bg-gray-900 px-3 py-2 rounded-md border border-gray-700 hover:border-amber-400/30 transition"
                        >
                          <span className="text-sm text-gray-300">
                            {val.label}
                          </span>

                          <span className="text-sm font-bold text-green-400">
                            ₹{val.price}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* 👉 CHILD INDICATOR */}
            {/* 🔥 SCHEDULE TITLE LOGIC */}

            {/* ✅ NO CHILDREN → SHOW TITLE IN MAIN CARD */}
            {(!item.children || item.children.length === 0) && (
              <div className="mt-4 pt-3 border-t border-gray-700/50">
                <button
                  onClick={(e) => {
                    e.stopPropagation(); // 🔥 prevent card click
                    navigate(`/admin/schedule-slots/${item._id}`);
                  }}
                  className="text-sm font-semibold text-amber-400 tracking-wide hover:text-amber-300 transition"
                >
                  Schedule Time Slots →
                </button>
              </div>
            )}

            {/* 👉 CHILD INDICATOR */}
            {item.children?.length > 0 && (
              <div className="mt-3 pt-2 border-t border-gray-700/50 flex items-center justify-between">
                <span className="text-xs text-amber-400 font-medium flex items-center gap-1">
                  {item.children.length} Sub Services
                </span>
                <span className="text-xs text-amber-400/80 flex items-center gap-1 group-hover:gap-2 transition-all duration-300">
                  View details <FiChevronRight className="text-sm" />
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    ));
  };

  return (
    <AdminLayout>
      <div className="p-6 md:p-8 text-white min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-900">
        {/* 🔙 BACK BUTTON - PREMIUM */}
        <button
          onClick={() => navigate(-1)}
          className="group flex items-center gap-2 text-sm font-medium text-gray-300 hover:text-amber-400 transition-all duration-300 mb-6 bg-white/5 backdrop-blur-sm px-4 py-2 rounded-full border border-white/10 hover:border-amber-400/30 hover:bg-white/10"
        >
          <FiArrowLeft className="group-hover:-translate-x-1 transition-transform duration-200" />
          Back
        </button>

        {/* 🔥 BREADCRUMB - ELEGANT */}
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-3">
          <span
            className="hover:text-amber-400 transition-colors cursor-pointer"
            onClick={() => navigate("/admin/services")}
          >
            Services
          </span>
          <FiChevronRight className="text-xs" />
          <span className="text-amber-400 font-medium">
            {parent?.name || "Loading..."}
          </span>
        </div>

        {/* 🔄 LOADING - REFINED */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32">
            <div className="relative">
              <div className="absolute inset-0 rounded-full bg-amber-400/20 blur-xl animate-pulse" />
              <FiLoader className="animate-spin text-amber-400 text-4xl relative z-10" />
            </div>
            <p className="text-gray-400 mt-4 font-medium tracking-wide">
              Loading exquisite services...
            </p>
          </div>
        ) : (
          <>
            {/* 🔥 TITLE SECTION */}
            <div className="mb-10 relative">
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-amber-400 to-amber-200 bg-clip-text text-transparent">
                {parent?.name}
              </h1>
              <div className="absolute -bottom-3 left-0 w-24 h-1 bg-gradient-to-r from-amber-500 to-amber-300 rounded-full" />
            </div>

            {/* 🚫 EMPTY STATE */}
            {children.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <div className="bg-gray-800/30 rounded-full p-6 mb-4">
                  <FiImage className="text-5xl text-gray-500" />
                </div>
                <h3 className="text-xl font-semibold text-gray-300 mb-2">
                  No Services Found
                </h3>
                <p className="text-gray-500 max-w-md">
                  There are no services currently listed under this category.
                </p>
              </div>
            ) : (
              /* 🧩 GRID - ENHANCED */
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-7 auto-rows-fr">
                {renderServices(children)}
              </div>
            )}
          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default IndividualService;
