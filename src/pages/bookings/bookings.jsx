import { useEffect, useState } from "react";
import AdminLayout from "../../components/layout/adminLayout";
import api from "../../api/axios";

const Bookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");

  // Modal state
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const fetchBookings = async (currentPage = 1, searchTerm = "") => {
    try {
      setLoading(true);
      const res = await api.get(
        `/booking/fetch-all-bookings?page=${currentPage}&search=${searchTerm}`,
      );
      setBookings(res.data.data);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings(page, search);
  }, [page]);

  const openModal = (booking) => {
    setSelectedBooking(booking);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedBooking(null);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // Status badge styling
  const getStatusStyles = (status) => {
    switch (status) {
      case "Confirmed":
        return "bg-emerald-100 text-emerald-800 ring-1 ring-emerald-200";
      case "Pending":
        return "bg-amber-100 text-amber-800 ring-1 ring-amber-200";
      case "Cancelled":
        return "bg-rose-100 text-rose-800 ring-1 ring-rose-200";
      default:
        return "bg-slate-100 text-slate-700 ring-1 ring-slate-200";
    }
  };

  const getProgressStyles = (status) => {
    switch (status) {
      case "Not Started":
        return "bg-slate-100 text-slate-700";

      case "Assigned":
        return "bg-blue-100 text-blue-700";

      case "In Progress":
        return "bg-amber-100 text-amber-700";

      case "Completed":
        return "bg-emerald-100 text-emerald-700";
      case "Cancelled":
        return "bg-rose-100 text-rose-700";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  const getPaymentStyles = (status) => {
    switch (status) {
      case "Pending":
        return "bg-rose-100 text-rose-700";

      case "Partially Paid":
        return "bg-amber-100 text-amber-700";

      case "Paid":
        return "bg-emerald-100 text-emerald-700";

      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  const updateBookingStatus = async (bookingId, payload) => {
    try {
      await api.put(`/booking/update-booking-status/${bookingId}`, payload);

      fetchBookings(page, search);

      // update modal state too
      if (selectedBooking && selectedBooking._id === bookingId) {
        setSelectedBooking({
          ...selectedBooking,
          ...payload,
        });
      }
    } catch (err) {
      console.log(err);
    }
  };

  const updateServiceStatus = async (bookingId, serviceIndex, payload) => {
    try {
      await api.put(
        `/booking/update-service-status/${bookingId}/${serviceIndex}`,
        payload,
      );

      fetchBookings(page, search);

      // Update modal state instantly
      if (selectedBooking && selectedBooking._id === bookingId) {
        const updatedServices = [...selectedBooking.services];

        updatedServices[serviceIndex] = {
          ...updatedServices[serviceIndex],
          ...payload,
        };

        setSelectedBooking({
          ...selectedBooking,
          services: updatedServices,
        });
      }
    } catch (err) {
      console.log(err);
    }
  };

  const cancelBooking = async (bookingId) => {
    try {
      await api.put(`/booking/update-booking-status/${bookingId}`, {
        bookingStatus: "Cancelled",
      });

      fetchBookings(page, search);

      if (selectedBooking && selectedBooking._id === bookingId) {
        setSelectedBooking({
          ...selectedBooking,
          bookingStatus: "Cancelled",
        });
      }
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <AdminLayout>
      <div className="min-h-screen bg-white p-6 md:p-8">
        {/* Header Section */}
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight text-slate-800 md:text-4xl">
                Bookings
              </h1>

              {!loading && (
                <div className="rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1">
                  <span className="text-xs font-semibold uppercase tracking-wide text-indigo-600">
                    Total Records
                  </span>

                  <span className="ml-2 text-sm font-bold text-indigo-800">
                    {bookings.length.toLocaleString()}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Search Bar with Icon */}
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
              <svg
                className="h-5 w-5 text-slate-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Search by ID, customer, service, status..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
                fetchBookings(1, e.target.value);
              }}
              className="w-full rounded-xl border-0 bg-white py-3 pl-11 pr-4 text-slate-700 shadow-sm ring-1 ring-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-500 md:w-96"
            />
          </div>
        </div>

        {/* Main Card */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-200/50">
          {loading ? (
            // Skeleton Loader
            <div className="p-8">
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="flex animate-pulse items-center gap-4"
                  >
                    <div className="h-12 w-12 rounded-full bg-slate-200"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 w-1/4 rounded bg-slate-200"></div>
                      <div className="h-3 w-1/2 rounded bg-slate-100"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : bookings.length === 0 ? (
            <div className="py-20 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
                <svg
                  className="h-8 w-8 text-slate-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-700">
                No bookings found
              </h3>
              <p className="mt-1 text-slate-500">
                Try adjusting your search or check back later.
              </p>
            </div>
          ) : (
            <>
              {/* Table - Responsive */}
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
                        Booking ID
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
                        Customer
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
                        Services
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
                        Total
                      </th>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
                        Booking Status
                      </th>
                      {/* <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
                        Work Progress
                      </th>

                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
                        Payment
                      </th> */}
                      <th className="px-6 py-4 text-left text-sm font-semibold text-slate-600">
                        Date
                      </th>
                      <th className="px-6 py-4 text-right text-sm font-semibold text-slate-600">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((booking, idx) => (
                      <tr
                        key={booking._id}
                        className="group border-b border-slate-100 transition-all hover:bg-slate-50/80"
                      >
                        <td className="px-6 py-5 font-mono text-sm font-semibold text-indigo-600">
                          {booking.bookingId}
                        </td>
                        <td className="px-6 py-5">
                          <div>
                            <p className="font-medium text-slate-800">
                              {booking.customer?.name}
                            </p>
                            <p className="text-sm text-slate-500">
                              {booking.customer?.phone}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-5">
                          <div className="space-y-2">
                            {booking.services?.map((service, i) => (
                              <div
                                key={i}
                                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2"
                              >
                                {/* Service Name */}
                                <div className="flex items-center justify-between gap-2">
                                  <p className="text-sm font-semibold text-slate-800">
                                    {service.serviceName}
                                  </p>

                                  <p className="text-xs font-bold text-emerald-600">
                                    ₹{service.totalPrice}
                                  </p>
                                </div>

                                {/* STATUS BADGES */}
                                <div className="mt-2 flex flex-wrap gap-2">
                                  {/* WORK STATUS */}
                                  <span
                                    className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${getProgressStyles(
                                      service.workProgress || "Not Started",
                                    )}`}
                                  >
                                    Work Status:{" "}
                                    {service.workProgress || "Not Started"}
                                  </span>

                                  {/* PAYMENT STATUS */}
                                  <span
                                    className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${getPaymentStyles(
                                      service.paymentStatus || "Pending",
                                    )}`}
                                  >
                                    Payment Status:{" "}
                                    {service.paymentStatus || "Pending"}
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-5 font-mono font-bold text-emerald-600">
                          ₹{booking.grandTotal.toLocaleString()}
                        </td>
                        <td className="px-6 py-5 text-center">
                          <span
                            className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${getStatusStyles(
                              booking.bookingStatus,
                            )}`}
                          >
                            {booking.bookingStatus}
                          </span>
                        </td>
                        {/* WORK PROGRESS */}
                        <td className="px-6 py-5 text-sm text-slate-500">
                          {formatDate(booking.createdAt)}
                        </td>
                        <td className="px-6 py-5 text-right">
                          <div className="flex items-center justify-end gap-2">
                            {/* VIEW DETAILS */}
                            <button
                              onClick={() => openModal(booking)}
                              className="rounded-lg bg-indigo-50 px-3 py-1.5 text-sm font-medium text-indigo-700 transition-all hover:bg-indigo-100 hover:shadow-sm"
                            >
                              View details
                            </button>

                            {/* CANCEL BOOKING */}
                            {booking.bookingStatus !== "Cancelled" ? (
                              <button
                                onClick={() => cancelBooking(booking._id)}
                                className="rounded-lg bg-rose-50 px-3 py-1.5 text-sm font-medium text-rose-700 transition-all hover:bg-rose-100 hover:shadow-sm"
                              >
                                Cancel
                              </button>
                            ) : (
                              <button
                                onClick={() =>
                                  updateBookingStatus(booking._id, {
                                    bookingStatus: "Confirmed",
                                  })
                                }
                                className="rounded-lg bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-700 transition-all hover:bg-emerald-100 hover:shadow-sm"
                              >
                                Revive
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50/30 px-6 py-4">
                <button
                  disabled={page === 1}
                  onClick={() => setPage((prev) => prev - 1)}
                  className="flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition-all hover:bg-slate-50 disabled:opacity-50 disabled:hover:bg-white"
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                  Previous
                </button>
                <p className="text-sm text-slate-600">
                  Page{" "}
                  <span className="font-semibold text-slate-800">{page}</span>{" "}
                  of{" "}
                  <span className="font-semibold text-slate-800">
                    {totalPages}
                  </span>
                </p>
                <button
                  disabled={page === totalPages}
                  onClick={() => setPage((prev) => prev + 1)}
                  className="flex items-center gap-1 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition-all hover:bg-slate-50 disabled:opacity-50 disabled:hover:bg-white"
                >
                  Next
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </div>
            </>
          )}
        </div>

        {/* Enhanced Modal */}
        {showModal && selectedBooking && (
          <div
            className="fixed inset-0 z-50 overflow-y-auto"
            aria-labelledby="modal-title"
            role="dialog"
            aria-modal="true"
          >
            {/* Backdrop with blur */}
            <div
              className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
              onClick={closeModal}
            ></div>

            {/* Modal panel */}
            <div className="flex min-h-full items-center justify-center p-4">
              <div className="relative w-full max-w-3xl transform overflow-hidden rounded-2xl bg-white shadow-2xl transition-all">
                {/* Gradient Header */}
                <div className="bg-gradient-to-r from-indigo-600 to-indigo-500 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="rounded-full bg-white/20 p-2">
                        <svg
                          className="h-5 w-5 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white">
                          Booking Details
                        </h3>
                        <p className="text-sm text-indigo-100">
                          Complete information about this booking
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={closeModal}
                      className="rounded-full p-1 text-white/80 transition hover:bg-white/20 hover:text-white"
                    >
                      <svg
                        className="h-6 w-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Modal Body */}
                <div className="max-h-[70vh] overflow-y-auto px-6 py-5">
                  {/* Booking ID & Status Card */}
                  <div className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200">
                    <div>
                      <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Booking ID
                      </p>
                      <p className="font-mono text-lg font-bold text-indigo-700">
                        {selectedBooking.bookingId}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Status
                      </p>
                      <span
                        className={`inline-block rounded-full px-3 py-1 text-sm font-semibold ${getStatusStyles(
                          selectedBooking.bookingStatus,
                        )}`}
                      >
                        {selectedBooking.bookingStatus}
                      </span>
                    </div>
                  </div>

                  {/* Customer Information */}
                  <div className="mb-6">
                    <h4 className="mb-3 flex items-center gap-2 text-base font-semibold text-slate-800">
                      <svg
                        className="h-5 w-5 text-indigo-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                      Customer Information
                    </h4>
                    <div className="grid grid-cols-1 gap-3 rounded-xl bg-white p-4 ring-1 ring-slate-200 md:grid-cols-2">
                      <div>
                        <span className="text-xs text-slate-500">Name</span>
                        <p className="font-medium text-slate-800">
                          {selectedBooking.customer?.name}
                        </p>
                      </div>
                      <div>
                        <span className="text-xs text-slate-500">Phone</span>
                        <p className="font-medium text-slate-800">
                          {selectedBooking.customer?.phone}
                        </p>
                      </div>
                      <div>
                        <span className="text-xs text-slate-500">Email</span>
                        <p className="font-medium text-slate-800">
                          {selectedBooking.customer?.email || "—"}
                        </p>
                      </div>
                      <div className="md:col-span-2">
                        <span className="text-xs text-slate-500">Address</span>
                        <p className="font-medium text-slate-800">
                          {selectedBooking.customer?.address}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Services Breakdown */}
                  <div className="mb-6">
                    <h4 className="mb-3 flex items-center gap-2 text-base font-semibold text-slate-800">
                      <svg
                        className="h-5 w-5 text-indigo-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={1.5}
                          d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                      Services & Pricing
                    </h4>
                    <div className="space-y-4">
                      {selectedBooking.services?.map((service, idx) => (
                        <div
                          key={idx}
                          className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:shadow-md"
                        >
                          {/* TOP */}
                          <div className="flex flex-wrap items-start justify-between gap-2 border-b border-slate-100 pb-2">
                            <h5 className="font-bold text-indigo-800">
                              {service.serviceName}
                            </h5>

                            <div className="flex items-center gap-3 text-xs text-slate-500">
                              <span>📅 {formatDate(service.selectedDate)}</span>

                              <span>
                                ⏰{" "}
                                {service.selectedSlot?.time
                                  ?.split("-")
                                  ?.map((time) => {
                                    let [hour, minute] = time.split(":");

                                    hour = parseInt(hour);

                                    const ampm = hour >= 12 ? "PM" : "AM";

                                    const formattedHour = hour % 12 || 12;

                                    return `${formattedHour}${
                                      minute !== "00" ? `:${minute}` : ""
                                    } ${ampm}`;
                                  })
                                  .join(" - ")}
                              </span>
                            </div>
                          </div>

                          {/* STATUS CONTROLS */}
                          <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* WORK PROGRESS */}
                            <div>
                              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                                Work Progress
                              </label>

                              <select
                                value={service.workProgress || "Not Started"}
                                onChange={(e) =>
                                  updateServiceStatus(
                                    selectedBooking._id,
                                    idx,
                                    {
                                      workProgress: e.target.value,
                                    },
                                  )
                                }
                                className={`w-full rounded-xl px-4 py-3 text-sm font-semibold border-0 outline-none ${getProgressStyles(
                                  service.workProgress,
                                )}`}
                              >
                                <option value="Not Started">Not Started</option>

                                <option value="Assigned">Assigned</option>

                                <option value="In Progress">In Progress</option>

                                <option value="Completed">Completed</option>

                                <option value="Cancelled">Cancelled</option>
                              </select>
                            </div>

                            {/* PAYMENT STATUS */}
                            <div>
                              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                                Payment Status
                              </label>

                              <select
                                value={service.paymentStatus || "Pending"}
                                onChange={(e) =>
                                  updateServiceStatus(
                                    selectedBooking._id,
                                    idx,
                                    {
                                      paymentStatus: e.target.value,
                                    },
                                  )
                                }
                                className={`w-full rounded-xl px-4 py-3 text-sm font-semibold border-0 outline-none ${getPaymentStyles(
                                  service.paymentStatus,
                                )}`}
                              >
                                <option value="Pending">Pending</option>

                                <option value="Partially Paid">
                                  Partially Paid
                                </option>

                                <option value="Paid">Paid</option>
                              </select>
                            </div>
                          </div>

                          {/* SELECTED OPTIONS */}
                          {service.selectedPriceOptions?.length > 0 && (
                            <div className="mt-4">
                              <p className="mb-1 text-xs font-semibold text-slate-600">
                                Selected options
                              </p>

                              <div className="space-y-1 rounded-lg bg-slate-50 p-2">
                                {service.selectedPriceOptions.map((opt, i) => (
                                  <div
                                    key={i}
                                    className="flex justify-between text-sm"
                                  >
                                    <span className="text-slate-600">
                                      {opt.title}
                                    </span>

                                    <span className="font-mono font-medium text-slate-800">
                                      ₹{opt.price}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* TOTAL */}
                          <div className="mt-4 flex justify-end border-t border-slate-100 pt-3">
                            <span className="text-sm font-semibold text-slate-700">
                              Service total:
                            </span>

                            <span className="ml-2 font-mono font-bold text-emerald-700">
                              ₹{service.totalPrice}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Grand Total */}
                  <div className="rounded-xl bg-gradient-to-r from-indigo-50 to-indigo-100 p-5 ring-1 ring-indigo-200">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-indigo-800">
                          Grand Total
                        </p>
                        <p className="text-3xl font-bold text-indigo-900">
                          ₹{selectedBooking.grandTotal.toLocaleString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-slate-500">Booked on</p>
                        <p className="text-sm font-medium text-slate-700">
                          {formatDate(selectedBooking.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="border-t border-slate-200 bg-slate-50 px-6 py-4 text-right">
                  <button
                    onClick={closeModal}
                    className="rounded-lg bg-indigo-600 px-5 py-2 font-medium text-white shadow-sm transition-all hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default Bookings;
