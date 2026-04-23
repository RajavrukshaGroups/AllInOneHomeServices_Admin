import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import AdminLayout from "../../components/layout/adminLayout";
import api from "../../api/axios";
import TimeSlotScheduler from "./timeSlotScheduler";
import TimeSlotCalendar from "./timeSlotCalender";

const ScheduleTimeSlots = () => {
  const { serviceId } = useParams();

  const [service, setService] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showScheduler, setShowScheduler] = useState(false);
  const [allSlots, setAllSlots] = useState([]);
  const [editData, setEditData] = useState(null);

  const fetchService = async () => {
    try {
      const res = await api.get(`/timeslots/get-service/${serviceId}`);
      console.log("response", res.data.data);

      setService(res.data.data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllSlots = async () => {
    try {
      const res = await api.get(
        `/timeslots/get-all-timeslots?serviceId=${serviceId}`,
      );

      setAllSlots(res.data.data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchService();
    fetchAllSlots();
  }, [serviceId]);

  const formatTime = (timeRange) => {
    const [start, end] = timeRange.split("-");

    const format = (time) => {
      let [hour, minute] = time.split(":");
      hour = parseInt(hour);
      const ampm = hour >= 12 ? "PM" : "AM";
      const formattedHour = hour % 12 || 12;
      return `${formattedHour}:${minute} ${ampm}`;
    };

    return `${format(start)} - ${format(end)}`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  };

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/40 p-4 md:p-8">
        {/* Header Section with Premium Accent */}
        <div className="max-w-7xl mx-auto mb-10">
          <div className="flex items-center gap-4">
            <div className="h-12 w-1.5 bg-gradient-to-b from-indigo-500 via-purple-500 to-pink-500 rounded-full animate-pulse"></div>
            <div>
              <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600 bg-clip-text text-transparent">
                Schedule Time Slots
              </h1>
              <p className="text-slate-500 mt-2 text-sm font-medium ml-1">
                Configure availability for this premium service
              </p>
            </div>
          </div>
        </div>

        {/* Loading State – Premium Spinner */}
        {loading ? (
          <div className="max-w-7xl mx-auto">
            <div className="backdrop-blur-xl bg-white/40 rounded-3xl shadow-2xl p-12 flex flex-col items-center justify-center space-y-5 border border-white/50">
              <div className="relative">
                <div className="w-20 h-20 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-8 h-8 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-full animate-ping opacity-75"></div>
                </div>
              </div>
              <p className="text-slate-700 font-semibold text-lg tracking-wide">
                Fetching service details...
              </p>
            </div>
          </div>
        ) : service ? (
          /* Main Premium Card */
          <div className="max-w-7xl mx-auto animate-fade-in-up">
            <div className="group relative bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden border border-white/50 transition-all duration-500 hover:shadow-3xl hover:scale-[1.01]">
              {/* Animated Gradient Border (top) */}
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-700 origin-left"></div>

              <div className="flex flex-col lg:flex-row">
                {/* LEFT SECTION – IMAGES + KEY FEATURES (Luxury Styling) */}
                <div className="lg:w-1/2 bg-gradient-to-br from-slate-50/80 to-indigo-50/40 p-8 md:p-10 space-y-8">
                  {/* Gallery Section */}
                  {service.images?.length > 0 ? (
                    <div className="space-y-5">
                      {/* Main Image with Glass Overlay */}
                      <div className="relative overflow-hidden rounded-2xl shadow-2xl group/image">
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover/image:opacity-100 transition-opacity duration-500 z-10"></div>
                        <img
                          src={service.images[0]}
                          alt={service.name}
                          className="w-full h-80 md:h-96 object-cover transform transition duration-700 group-hover/image:scale-110"
                        />
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4 translate-y-full group-hover/image:translate-y-0 transition-transform duration-500">
                          <p className="text-white text-sm font-medium">
                            Preview
                          </p>
                        </div>
                      </div>

                      {/* Thumbnails with Glow Effect */}
                      {service.images.length > 1 && (
                        <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin">
                          {service.images.slice(1, 5).map((img, i) => (
                            <div
                              key={i}
                              className="flex-shrink-0 rounded-xl overflow-hidden border-2 border-white shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 cursor-pointer ring-offset-2 hover:ring-2 hover:ring-indigo-400"
                            >
                              <img
                                src={img}
                                alt={`thumb-${i}`}
                                className="w-24 h-24 object-cover"
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-96 bg-white/60 backdrop-blur-sm rounded-2xl border-2 border-dashed border-slate-300">
                      <div className="text-7xl mb-4 opacity-70">🖼️</div>
                      <p className="text-slate-500 font-medium">
                        No visuals yet
                      </p>
                    </div>
                  )}

                  {/* Key Features – Elevated */}
                  {service.keyFeatures?.length > 0 && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-1 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full"></div>
                        <h3 className="text-xl font-bold text-slate-800 tracking-tight">
                          Signature Features
                        </h3>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {service.keyFeatures.map((feature, i) => (
                          <div
                            key={i}
                            className="flex items-center gap-3 text-sm text-slate-700 bg-white/70 backdrop-blur-sm rounded-xl p-3 border border-slate-100 shadow-md hover:shadow-lg transition-all duration-300 group/feature"
                          >
                            <span className="text-indigo-500 text-lg group-hover/feature:scale-110 transition-transform">
                              ✦
                            </span>
                            <span className="font-medium">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* RIGHT SECTION – DETAILS (Luxury Typography & Cards) */}
                <div className="lg:w-1/2 p-8 md:p-10 space-y-8 bg-white/50 backdrop-blur-sm">
                  {/* Service Name & Premium Badges */}
                  <div className="space-y-4">
                    <h2 className="text-3xl md:text-4xl font-extrabold text-slate-800 leading-tight tracking-tight">
                      {service.name}
                    </h2>

                    <div className="flex flex-wrap gap-3">
                      {service.pricingType === "fixed" && service.price && (
                        <span className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-50 to-emerald-100 text-emerald-800 px-4 py-2 rounded-full text-sm font-bold shadow-md border border-emerald-200">
                          <span className="text-base">💎</span> ₹{service.price}
                        </span>
                      )}
                      {service.pricingType === "per_sqft" && (
                        <span className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-50 to-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-bold shadow-md border border-blue-200">
                          <span className="text-base">📐</span> ₹
                          {service.basePricePerSqft} / sqft
                        </span>
                      )}
                      {service.duration && (
                        <span className="inline-flex items-center gap-2 bg-slate-100 text-slate-700 px-4 py-2 rounded-full text-sm font-medium shadow-sm">
                          <span>⏱️</span> {service.duration} mins
                        </span>
                      )}
                      {service.rating > 0 && (
                        <span className="inline-flex items-center gap-2 bg-amber-50 text-amber-700 px-4 py-2 rounded-full text-sm font-semibold shadow-sm border border-amber-200">
                          <span className="text-amber-500">★</span>{" "}
                          {service.rating} ({service.totalReviews})
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Description – Elegant Blockquote */}
                  {service.description && (
                    <div className="relative bg-gradient-to-r from-slate-50 to-white rounded-2xl p-5 border-l-8 border-indigo-400 shadow-inner">
                      <p className="text-slate-700 leading-relaxed text-base italic">
                        “{service.description}”
                      </p>
                    </div>
                  )}

                  {/* Options – Premium Cards with Hover Effects */}
                  {service.options?.length > 0 && (
                    <div className="space-y-5">
                      <div className="flex items-center gap-2">
                        <div className="h-6 w-1 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full"></div>
                        <h3 className="text-xl font-bold text-slate-800 tracking-tight">
                          Customization Options
                        </h3>
                      </div>
                      <div className="space-y-4">
                        {service.options.map((option, idx) => (
                          <div
                            key={idx}
                            className="group/opt bg-white rounded-2xl p-5 border border-slate-200 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                          >
                            <h4 className="text-base font-extrabold text-indigo-700 mb-4 tracking-wide uppercase flex items-center gap-2">
                              <span className="text-lg">✨</span> {option.name}
                            </h4>
                            <div className="space-y-3">
                              {option.values.map((value, i) => (
                                <div
                                  key={i}
                                  className="flex justify-between items-center py-3 px-4 bg-slate-50 rounded-xl border border-slate-100 hover:bg-white transition-colors"
                                >
                                  <span className="text-slate-800 font-medium">
                                    {value.label}
                                  </span>
                                  <span className="text-emerald-700 font-bold text-base bg-emerald-50 px-3 py-1 rounded-full shadow-sm">
                                    ₹{value.price}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* 🔥 PROFESSIONAL SCHEDULE BUTTON */}
                  <div className="mt-6">
                    <button
                      onClick={() => {
                        setShowScheduler((prev) => !prev);
                      }}
                      className="w-full py-3.5 rounded-xl font-semibold text-white text-base tracking-wide 
bg-gradient-to-r from-slate-800 to-indigo-600 
shadow-md hover:shadow-xl 
transition-all duration-300 
hover:-translate-y-[1px] active:translate-y-[1px]
focus:outline-none focus:ring-2 focus:ring-indigo-400/50"
                    >
                      <span className="flex items-center justify-center gap-2">
                        ⏱ Schedule Time Slot
                      </span>
                    </button>
                  </div>

                  {allSlots.length > 0 && (
                    <div className="mt-8 bg-white rounded-2xl p-6 shadow-lg border">
                      <h3 className="text-lg font-bold mb-4">
                        Configured Time Slots
                      </h3>

                      <div className="space-y-4">
                        {allSlots.map((item) => (
                          <div
                            key={item._id}
                            className="border rounded-xl p-4 flex justify-between items-start"
                          >
                            {/* LEFT */}
                            <div>
                              <p className="font-semibold text-slate-800">
                                📅 {formatDate(item.date)}
                              </p>

                              {item.isBlocked ? (
                                <p className="text-red-500 text-sm mt-1">
                                  🚫 Blocked Day
                                </p>
                              ) : (
                                <div className="mt-2 space-y-1 text-sm text-slate-600">
                                  {item.slots.map((slot, i) => (
                                    <p key={i}>
                                      ⏱ {formatTime(slot.time)} — Capacity:{" "}
                                      {slot.capacity}
                                    </p>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* RIGHT (EDIT BUTTON) */}
                            <button
                              onClick={() => {
                                setEditData(item); // 🔥 pass full slot config
                                setShowScheduler(true);
                              }}
                              className="text-indigo-600 text-sm font-medium"
                            >
                              Edit
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Footer Meta – Premium Touch */}
                  <div className="pt-6 mt-4 border-t border-slate-200">
                    <div className="flex items-center justify-between text-xs text-slate-500 uppercase tracking-wider">
                      <span className="font-mono">ID: {serviceId}</span>
                      <span className="flex items-center gap-2">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        Active Service
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Premium Error State */
          <div className="max-w-7xl mx-auto">
            <div className="backdrop-blur-md bg-red-50/80 rounded-3xl p-12 text-center border border-red-200 shadow-xl">
              <div className="text-7xl mb-5">🔍</div>
              <p className="text-red-700 font-bold text-2xl tracking-tight">
                Service Unavailable
              </p>
              <p className="text-red-500 mt-2">
                The requested service could not be located
              </p>
            </div>
          </div>
        )}
      </div>

      {/* {showScheduler && (
        <TimeSlotCalendar
          serviceId={serviceId}
          editData={editData} // 🔥 IMPORTANT
          onClose={() => {
            setShowScheduler(false);
            setEditData(null);
            fetchAllSlots(); // refresh after edit
          }}
        />
      )} */}
      {showScheduler &&
        (editData ? (
          <TimeSlotScheduler
            serviceId={serviceId}
            selectedDate={editData.date}
            editData={editData}
            onClose={() => {
              setShowScheduler(false);
              setEditData(null);
              fetchAllSlots();
            }}
          />
        ) : (
          <TimeSlotCalendar
            serviceId={serviceId}
            onClose={() => {
              setShowScheduler(false);
              fetchAllSlots();
            }}
          />
        ))}
      {/* Custom keyframes for buzz and pulse */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes buzzPulse {
          0% {
            transform: scale(1);
            box-shadow:
              0 0 5px rgba(245, 87, 108, 0.4),
              0 0 10px rgba(245, 87, 108, 0.2);
          }
          25% {
            transform: scale(1.02) translateX(1px) rotate(0.5deg);
            box-shadow:
              0 0 20px rgba(245, 87, 108, 0.8),
              0 0 30px rgba(245, 87, 108, 0.4);
          }
          50% {
            transform: scale(1.02) translateX(-1px) rotate(-0.5deg);
            box-shadow:
              0 0 25px rgba(245, 87, 108, 1),
              0 0 35px rgba(245, 87, 108, 0.5);
          }
          75% {
            transform: scale(1.02) translateX(1px) rotate(0.5deg);
            box-shadow:
              0 0 20px rgba(245, 87, 108, 0.8),
              0 0 30px rgba(245, 87, 108, 0.4);
          }
          100% {
            transform: scale(1);
            box-shadow:
              0 0 5px rgba(245, 87, 108, 0.4),
              0 0 10px rgba(245, 87, 108, 0.2);
          }
        }
        .animate-fade-in-up {
          animation: fadeInUp 0.6s ease-out forwards;
        }
      `}</style>
    </AdminLayout>
  );
};

export default ScheduleTimeSlots;
