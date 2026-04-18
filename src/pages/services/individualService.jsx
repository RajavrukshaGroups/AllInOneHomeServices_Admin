import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import AdminLayout from "../../components/layout/adminLayout";
import api from "../../api/axios";
import { FiLoader, FiArrowLeft } from "react-icons/fi";

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

  return (
    <AdminLayout>
      <div className="p-6 text-white min-h-screen">
        {/* 🔙 Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-sm text-gray-400 hover:text-amber-400 mb-4"
        >
          <FiArrowLeft /> Back
        </button>

        {/* 🔄 LOADING */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <FiLoader className="animate-spin text-amber-400 text-3xl mb-2" />
            <p className="text-gray-400">Loading services...</p>
          </div>
        ) : (
          <>
            {/* ❌ NOT CATEGORY */}
            {parent?.type !== "category" ? (
              <div className="text-center py-20">
                <h2 className="text-xl text-red-400">This is not a category</h2>
                <p className="text-gray-400 mt-2">
                  Please select a category to view services
                </p>
              </div>
            ) : (
              <>
                {/* 🔥 CATEGORY TITLE */}
                <h1 className="text-3xl font-bold mb-8 text-amber-400">
                  {parent?.name}
                </h1>

                {/* 🚫 NO SERVICES */}
                {children.length === 0 ? (
                  <div className="text-center py-16 text-gray-500">
                    No services found under this category
                  </div>
                ) : (
                  /* 🧩 SERVICES GRID */
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {children.map((item) => (
                      <div
                        key={item._id}
                        className="bg-gray-900 border border-gray-700 rounded-xl overflow-hidden shadow hover:shadow-lg hover:border-amber-400/30 transition-all duration-300"
                      >
                        {/* IMAGE */}
                        <div className="h-40 bg-gray-800">
                          {item.images?.[0] ? (
                            <img
                              src={item.images[0]}
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full text-gray-500 text-sm">
                              No Image
                            </div>
                          )}
                        </div>

                        {/* CONTENT */}
                        <div className="p-4 space-y-2">
                          <h2 className="text-lg font-semibold text-white">
                            {item.name}
                          </h2>

                          {/* PRICE */}
                          {item.pricingType === "fixed" && item.price && (
                            <p className="text-green-400 font-medium">
                              ₹{item.price}
                            </p>
                          )}

                          {/* PER SQFT */}
                          {item.pricingType === "per_sqft" && (
                            <p className="text-blue-400 text-sm">
                              ₹{item.basePricePerSqft} / sqft
                            </p>
                          )}

                          {/* DURATION */}
                          {item.duration && (
                            <p className="text-xs text-gray-400">
                              Duration: {item.duration} mins
                            </p>
                          )}

                          {/* OPTIONS */}
                          {item.options?.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {item.options.map((opt, idx) => (
                                <span
                                  key={idx}
                                  className="text-xs bg-gray-800 border border-gray-600 px-2 py-0.5 rounded"
                                >
                                  {opt.name}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </AdminLayout>
  );
};

export default IndividualService;
