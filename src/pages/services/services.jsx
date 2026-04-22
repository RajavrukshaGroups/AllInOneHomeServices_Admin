import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../../components/layout/adminLayout";
import api from "../../api/axios";
import { toast } from "react-toastify";
import {
  FiPlus,
  FiX,
  FiChevronDown,
  FiChevronRight,
  FiEdit2,
  FiTrash2,
  FiFolder,
  FiPackage,
  FiDollarSign,
  FiClock,
  FiLayers,
  FiUpload,
  FiLoader,
  FiTag,
  FiGrid,
  FiList,
} from "react-icons/fi";
import imageCompression from "browser-image-compression";

const CreateServices = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [treeData, setTreeData] = useState([]);
  const [expandedIds, setExpandedIds] = useState(new Set());
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    name: "",
    parentId: "",
    type: "service",
    price: "",
    duration: "",
    pricingType: "fixed",
    basePricePerSqft: "",
    options: [],
    description: "",
    keyFeatures: [],
    rating: "",
    totalReviews: "",
  });
  const [imagePreviews, setImagePreviews] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [bhkSelections, setBhkSelections] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const res = await api.get("/services/fetch");
      const tree = res.data;
      setTreeData(tree);
      setServices(flattenTree(tree));
    } catch (err) {
      toast.error("Failed to fetch services");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const flattenTree = (data, level = 0) => {
    let result = [];
    data.forEach((item) => {
      result.push({
        _id: item._id,
        name: `${"— ".repeat(level)}${item.name}`,
      });
      if (item.children) {
        result = result.concat(flattenTree(item.children, level + 1));
      }
    });
    return result;
  };

  const addOption = () => {
    setForm({
      ...form,
      options: [...form.options, { name: "", values: [] }],
    });
  };

  const resetForm = () => {
    setForm({
      name: "",
      parentId: "",
      type: "service",
      price: "",
      duration: "",
      pricingType: "fixed",
      basePricePerSqft: "",
      options: [],
      description: "",
      keyFeatures: [],
      rating: "",
      totalReviews: "",
    });
    setEditingId(null);
    setImagePreviews([]);
    setImageFiles([]);
  };

  const handleEdit = (service) => {
    setEditingId(service._id);
    setForm({
      name: service.name || "",
      parentId: service.parentId || "",
      type: service.type || "service",
      price: service.price || "",
      duration: service.duration || "",
      pricingType: service.pricingType || "fixed",
      basePricePerSqft: service.basePricePerSqft || "",
      options: service.options
        ? service.options.map((opt) => ({
            name: opt.name,
            values: opt.values.map((v) =>
              typeof v === "string" ? { label: v, price: 0 } : v,
            ),
          }))
        : [],
      description: service.description || "",
      keyFeatures: service.keyFeatures || [],
      rating: service.rating || "",
      totalReviews: service.totalReviews || "",
    });
    setImagePreviews(service.images || []);
    setImageFiles([]);
    document
      .getElementById("service-form")
      ?.scrollIntoView({ behavior: "smooth" });
  };

  const handleDelete = async (id, hasChildren) => {
    if (hasChildren) {
      toast.error("Cannot delete a service that has sub-services");
      return;
    }
    if (!window.confirm("Are you sure you want to delete this service?"))
      return;
    setDeletingId(id);
    try {
      await api.delete(`/services/delete/${id}`);
      toast.success("Service deleted");
      await fetchServices();
      if (editingId === id) resetForm();
    } catch (err) {
      toast.error(err.response?.data?.message || "Delete failed");
    } finally {
      setDeletingId(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const formData = new FormData();
      Object.keys(form).forEach((key) => {
        if (key === "options") {
          formData.append("options", JSON.stringify(form.options));
        } else if (key === "keyFeatures") {
          formData.append("keyFeatures", JSON.stringify(form.keyFeatures));
        } else {
          formData.append(key, form[key]);
        }
      });
      formData.append("existingImages", JSON.stringify(imagePreviews));
      if (form.parentId) {
        formData.set("parentId", form.parentId);
      }
      imageFiles.forEach((file) => {
        formData.append("images", file);
      });
      if (editingId) {
        await api.put(`/services/update/${editingId}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Service updated successfully");
      } else {
        await api.post("/services/create", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Service created successfully");
      }
      resetForm();
      await fetchServices();
    } catch (err) {
      toast.error(
        editingId ? "Error updating service" : "Error creating service",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const toggleExpand = (id) => {
    const newSet = new Set(expandedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setExpandedIds(newSet);
  };

  const compressImage = async (file) => {
    try {
      const options = {
        maxSizeMB: 0.5,
        maxWidthOrHeight: 1024,
        useWebWorker: true,
      };
      const compressedFile = await imageCompression(file, options);
      return compressedFile;
    } catch (error) {
      console.log("Compression error:", error);
      return file;
    }
  };

  const handleFiles = (files) => {
    if (imageFiles.length + files.length > 5) {
      toast.error("Max 5 images allowed");
      return;
    }
    Promise.all(files.map((file) => compressImage(file))).then((results) => {
      const previews = results.map((file) => URL.createObjectURL(file));
      setImageFiles((prev) => [...prev, ...results]);
      setImagePreviews((prev) => [...prev, ...previews]);
    });
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const renderTreeItem = (item, level = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedIds.has(item._id);
    const isCategory = item.type === "category";
    const isDeleting = deletingId === item._id;

    return (
      <div key={item._id} className="select-none">
        <div
          className={`group relative flex items-center gap-3 py-3.5 px-5 rounded-2xl transition-all duration-300 ${
            editingId === item._id
              ? "bg-gradient-to-r from-amber-500/15 to-amber-500/5 border border-amber-400/40 shadow-[0_0_15px_-5px_rgba(245,158,11,0.3)]"
              : "bg-white/5 backdrop-blur-sm border border-white/5 hover:bg-white/10 hover:border-amber-400/30 hover:shadow-lg hover:-translate-y-0.5"
          }`}
          style={{ marginLeft: `${level * 24}px` }}
        >
          {/* Expand/collapse button */}
          <button
            type="button"
            onClick={() => hasChildren && toggleExpand(item._id)}
            className={`w-6 h-6 flex items-center justify-center rounded-full transition-all ${
              hasChildren
                ? "text-gray-400 hover:text-amber-400 hover:bg-amber-400/20"
                : "text-gray-600 cursor-default"
            }`}
            disabled={!hasChildren}
          >
            {hasChildren &&
              (isExpanded ? (
                <FiChevronDown className="w-4 h-4" />
              ) : (
                <FiChevronRight className="w-4 h-4" />
              ))}
          </button>

          {/* Icon with gradient background */}
          <div className="flex-shrink-0">
            {isCategory ? (
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 flex items-center justify-center text-amber-400 shadow-inner">
                <FiFolder className="w-5 h-5" />
              </div>
            ) : (
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/10 flex items-center justify-center text-blue-400 shadow-inner">
                <FiPackage className="w-5 h-5" />
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span
                onClick={() => {
                  if (item.type === "category") {
                    navigate(`/admin/services/${item._id}`);
                  }
                }}
                className={`font-semibold truncate transition-colors ${
                  item.type === "category"
                    ? "text-gray-100 cursor-pointer hover:text-amber-400"
                    : "text-gray-300"
                }`}
              >
                {item.name}
              </span>
              {/* ⭐ Rating Display */}
              {!isCategory && item.rating > 0 && (
                <div className="flex items-center gap-2 mt-1">
                  <div className="text-amber-400 text-xs">
                    {"★".repeat(Math.floor(item.rating))}
                    {item.rating % 1 !== 0 && "½"}
                  </div>
                  <span className="text-xs text-gray-400">
                    {item.rating} ({item.totalReviews || 0})
                  </span>
                </div>
              )}
              {!isCategory && item.price && (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-300 bg-emerald-400/10 px-2 py-0.5 rounded-full border border-emerald-400/20">
                  <FiDollarSign className="w-3 h-3" />₹{item.price}
                </span>
              )}
              {!isCategory && item.duration && (
                <span className="inline-flex items-center gap-1 text-xs text-gray-400">
                  <FiClock className="w-3 h-3" />
                  {item.duration} min
                </span>
              )}
            </div>
            {item.options?.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {item.options.slice(0, 3).map((opt, idx) => (
                  <span
                    key={idx}
                    className="text-xs bg-gray-800/60 text-gray-300 px-2 py-0.5 rounded-full border border-gray-700"
                  >
                    {opt.name}: {opt.values.length}
                  </span>
                ))}
                {item.options.length > 3 && (
                  <span className="text-xs text-gray-500 font-medium">
                    +{item.options.length - 3}
                  </span>
                )}
              </div>
            )}
            {item.images?.length > 0 && (
              <div className="flex gap-1.5 mt-2">
                {item.images.slice(0, 3).map((img, i) => (
                  <img
                    key={i}
                    src={img}
                    className="w-8 h-8 rounded-md object-cover ring-1 ring-white/20"
                    alt="service"
                  />
                ))}
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              type="button"
              onClick={() => handleEdit(item)}
              className="p-2 text-gray-400 hover:text-amber-400 hover:bg-amber-400/10 rounded-xl transition-all"
              title="Edit"
              disabled={submitting || loading || isDeleting}
            >
              <FiEdit2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => handleDelete(item._id, hasChildren)}
              className="p-2 text-gray-400 hover:text-rose-400 hover:bg-rose-400/10 rounded-xl transition-all"
              title="Delete"
              disabled={submitting || loading || isDeleting}
            >
              {isDeleting ? (
                <FiLoader className="w-4 h-4 animate-spin" />
              ) : (
                <FiTrash2 className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Children container */}
        {hasChildren && isExpanded && (
          <div className="ml-6 border-l-2 border-amber-500/30 pl-3 mt-1 space-y-1">
            {item.children.map((child) => renderTreeItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  const getQuickOptions = (name) => {
    const key = name?.trim().toLowerCase();
    if (key === "bhk") return ["1BHK", "2BHK", "3BHK", "4BHK"];
    if (key === "painting type") {
      return [
        "Single Coat + With Primer",
        "Single Coat + Without Primer",
        "Double Coat + With Primer",
        "Double Coat + Without Primer",
      ];
    }
    if (key === "cleaning") {
      return ["Vacant", "Occupied", "Project Completion"];
    }
    return [];
  };

  return (
    <AdminLayout>
      <div className="min-h-screen bg-[#0A0C10]">
        <div className="relative overflow-hidden">
          {/* Background accents */}
          <div className="absolute top-0 -left-48 w-96 h-96 bg-amber-500/20 rounded-full blur-[120px] -z-10" />
          <div className="absolute bottom-0 -right-48 w-96 h-96 bg-amber-500/10 rounded-full blur-[120px] -z-10" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
            {/* Header */}
            <div className="mb-12 text-center lg:text-left">
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200 bg-clip-text text-transparent tracking-tight">
                Service Studio
              </h1>
              <p className="text-gray-400 mt-3 text-lg max-w-2xl mx-auto lg:mx-0">
                Design, organize, and manage your service catalog with elegance.
              </p>
            </div>

            {/* Two column layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Form Section - unchanged */}
              <div id="service-form">
                <div className="sticky top-6 bg-gray-900/40 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden transition-all duration-300 hover:shadow-amber-500/5">
                  <div className="p-6 md:p-8">
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h2 className="text-2xl font-semibold text-white flex items-center gap-2">
                          {editingId ? (
                            <>
                              <FiEdit2 className="text-amber-400" />
                              Edit Service
                            </>
                          ) : (
                            <>
                              <FiPlus className="text-amber-400" />
                              Create New
                            </>
                          )}
                        </h2>
                        <p className="text-gray-400 text-sm mt-1">
                          {editingId
                            ? "Update service details below"
                            : "Add a fresh service to your catalog"}
                        </p>
                      </div>
                      {editingId && (
                        <button
                          type="button"
                          onClick={resetForm}
                          className="text-sm text-amber-400 hover:text-amber-300 transition-colors flex items-center gap-1"
                          disabled={submitting}
                        >
                          <FiX className="w-4 h-4" /> Cancel edit
                        </button>
                      )}
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                      {/* Service Name & Type */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-1.5">
                          <label className="text-sm font-medium text-gray-300 flex items-center gap-1">
                            Service Name{" "}
                            <span className="text-amber-400">*</span>
                          </label>
                          <input
                            type="text"
                            placeholder="e.g., Premium Deep Cleaning"
                            value={form.name}
                            onChange={(e) =>
                              setForm({ ...form, name: e.target.value })
                            }
                            className="w-full px-4 py-3 rounded-xl bg-gray-800/50 border border-gray-700 text-white placeholder-gray-500 focus:bg-gray-800 focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all outline-none"
                            required
                            disabled={submitting}
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-sm font-medium text-gray-300">
                            Service Type
                          </label>
                          <div className="relative">
                            <select
                              value={form.type}
                              onChange={(e) =>
                                setForm({ ...form, type: e.target.value })
                              }
                              className="w-full px-4 py-3 rounded-xl bg-black border border-gray-700 text-white appearance-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all outline-none"
                              disabled={submitting}
                            >
                              <option value="category">
                                📁 Category (Group)
                              </option>
                              <option value="service">
                                ✨ Service (Bookable)
                              </option>
                            </select>
                            <FiChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                          </div>
                        </div>
                      </div>

                      {/* Image Upload */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                          <FiUpload className="text-amber-400" />
                          Service Images
                          <span className="text-xs text-gray-500 font-normal">
                            (max 5)
                          </span>
                        </label>
                        <div
                          onDragOver={(e) => {
                            e.preventDefault();
                            setIsDragging(true);
                          }}
                          onDragLeave={() => setIsDragging(false)}
                          onDrop={handleDrop}
                          className={`relative p-8 rounded-xl border-2 border-dashed transition-all ${
                            isDragging
                              ? "border-amber-400 bg-amber-400/10"
                              : "border-gray-700 bg-gray-800/20"
                          } ${submitting ? "opacity-50 pointer-events-none" : ""}`}
                        >
                          <div className="text-center">
                            <FiUpload className="w-10 h-10 mx-auto text-gray-500 mb-3" />
                            <p className="text-gray-400">
                              Drag & drop images here, or{" "}
                              <label className="cursor-pointer text-amber-400 hover:underline">
                                browse
                                <input
                                  type="file"
                                  multiple
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) =>
                                    handleFiles(Array.from(e.target.files))
                                  }
                                  disabled={submitting}
                                />
                              </label>
                            </p>
                            <p className="text-xs text-gray-500 mt-2">
                              Supports JPG, PNG, GIF (up to 2MB each)
                            </p>
                          </div>
                        </div>

                        {imagePreviews.length > 0 && (
                          <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mt-4">
                            {imagePreviews.map((img, index) => (
                              <div key={index} className="relative group">
                                <img
                                  src={img}
                                  alt="preview"
                                  className="w-full h-24 object-cover rounded-lg border border-gray-700"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    const newPreviews = [...imagePreviews];
                                    const newFiles = [...imageFiles];
                                    newPreviews.splice(index, 1);
                                    newFiles.splice(index, 1);
                                    setImagePreviews(newPreviews);
                                    setImageFiles(newFiles);
                                  }}
                                  className="absolute top-1 right-1 bg-black/80 rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-rose-500"
                                  disabled={submitting}
                                >
                                  <FiX size={12} />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Parent Service */}
                      <div className="space-y-1.5">
                        <label className="text-sm font-medium text-gray-300">
                          Parent Service (Optional)
                        </label>
                        <div className="relative">
                          <select
                            value={form.parentId}
                            onChange={(e) =>
                              setForm({ ...form, parentId: e.target.value })
                            }
                            className="w-full px-4 py-3 rounded-xl bg-black border border-gray-700 text-white appearance-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all outline-none"
                            disabled={submitting}
                          >
                            <option value="">— None (Top Level) —</option>
                            {services
                              .filter((s) => s._id !== editingId)
                              .map((s) => (
                                <option key={s._id} value={s._id}>
                                  {s.name}
                                </option>
                              ))}
                          </select>
                          <FiChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                        </div>
                      </div>

                      {/* Service-specific fields */}
                      {form.type === "service" && (
                        <>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-1.5">
                              <label className="text-sm font-medium text-gray-300">
                                Pricing Type
                              </label>
                              <select
                                value={form.pricingType}
                                onChange={(e) =>
                                  setForm({
                                    ...form,
                                    pricingType: e.target.value,
                                  })
                                }
                                className="w-full px-4 py-3 rounded-xl bg-gray-800/50 border border-gray-700 text-white focus:ring-2 focus:ring-amber-500/50 transition-all outline-none"
                                disabled={submitting}
                              >
                                <option value="fixed">💰 Fixed Price</option>
                                <option value="per_sqft">📐 Per Sqft</option>
                              </select>
                            </div>

                            {form.pricingType === "fixed" && (
                              <div className="space-y-1.5">
                                <label className="text-sm font-medium text-gray-300">
                                  Price (₹)
                                </label>
                                <div className="relative">
                                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                                    ₹
                                  </span>
                                  <input
                                    type="number"
                                    placeholder="0.00"
                                    value={form.price}
                                    onChange={(e) =>
                                      setForm({
                                        ...form,
                                        price: e.target.value,
                                      })
                                    }
                                    className="w-full pl-8 pr-4 py-3 rounded-xl bg-gray-800/50 border border-gray-700 text-white focus:ring-2 focus:ring-amber-500/50 transition-all outline-none"
                                    disabled={submitting}
                                  />
                                </div>
                              </div>
                            )}

                            {form.pricingType === "per_sqft" && (
                              <div className="space-y-1.5">
                                <label className="text-sm font-medium text-gray-300">
                                  Price per Sqft (₹)
                                </label>
                                <input
                                  type="number"
                                  placeholder="e.g., 25"
                                  value={form.basePricePerSqft}
                                  onChange={(e) =>
                                    setForm({
                                      ...form,
                                      basePricePerSqft: e.target.value,
                                    })
                                  }
                                  className="w-full px-4 py-3 rounded-xl bg-gray-800/50 border border-gray-700 text-white focus:ring-2 focus:ring-amber-500/50 transition-all outline-none"
                                  disabled={submitting}
                                />
                              </div>
                            )}

                            <div className="space-y-1.5">
                              <label className="text-sm font-medium text-gray-300">
                                Duration (minutes)
                              </label>
                              <div className="relative">
                                <FiClock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                  type="number"
                                  placeholder="e.g., 90"
                                  value={form.duration}
                                  onChange={(e) =>
                                    setForm({
                                      ...form,
                                      duration: e.target.value,
                                    })
                                  }
                                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-800/50 border border-gray-700 text-white placeholder-gray-500 focus:ring-2 focus:ring-amber-500/50 transition-all outline-none"
                                  disabled={submitting}
                                />
                              </div>
                            </div>
                          </div>

                          {/* Description */}
                          <div className="space-y-1.5">
                            <label className="text-sm font-medium text-gray-300">
                              Description
                            </label>
                            <textarea
                              value={form.description}
                              onChange={(e) =>
                                setForm({
                                  ...form,
                                  description: e.target.value,
                                })
                              }
                              rows={3}
                              placeholder="Describe what this service includes..."
                              className="w-full px-4 py-3 rounded-xl bg-gray-800/50 border border-gray-700 text-white placeholder-gray-500 focus:ring-2 focus:ring-amber-500/50 transition-all outline-none resize-none"
                              disabled={submitting}
                            />
                          </div>

                          {/* Key Features */}
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <label className="text-sm font-medium text-gray-300">
                                Key Features
                              </label>
                              <button
                                type="button"
                                onClick={() =>
                                  setForm({
                                    ...form,
                                    keyFeatures: [...form.keyFeatures, ""],
                                  })
                                }
                                className="text-sm text-amber-400 hover:text-amber-300 flex items-center gap-1 transition-colors"
                              >
                                <FiPlus className="w-4 h-4" /> Add Feature
                              </button>
                            </div>
                            <div className="space-y-2">
                              {form.keyFeatures.map((feature, index) => (
                                <div key={index} className="flex gap-2">
                                  <input
                                    type="text"
                                    value={feature}
                                    onChange={(e) => {
                                      const updated = [...form.keyFeatures];
                                      updated[index] = e.target.value;
                                      setForm({
                                        ...form,
                                        keyFeatures: updated,
                                      });
                                    }}
                                    placeholder="e.g., Eco‑friendly products"
                                    className="flex-1 px-4 py-2 rounded-lg bg-gray-800/50 border border-gray-700 text-white focus:ring-2 focus:ring-amber-500/50 transition-all outline-none"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const updated = [...form.keyFeatures];
                                      updated.splice(index, 1);
                                      setForm({
                                        ...form,
                                        keyFeatures: updated,
                                      });
                                    }}
                                    className="p-2 text-gray-400 hover:text-rose-400 transition-colors"
                                  >
                                    <FiX className="w-5 h-5" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* ⭐ Ratings Section */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-1.5">
                              <label className="text-sm font-medium text-gray-300">
                                Rating (0–5)
                              </label>
                              <input
                                type="number"
                                step="0.1"
                                min="0"
                                max="5"
                                value={form.rating}
                                onChange={(e) =>
                                  setForm({ ...form, rating: e.target.value })
                                }
                                placeholder="e.g., 4.5"
                                className="w-full px-4 py-3 rounded-xl bg-gray-800/50 border border-gray-700 text-white focus:ring-2 focus:ring-amber-500/50 outline-none"
                              />
                            </div>

                            <div className="space-y-1.5">
                              <label className="text-sm font-medium text-gray-300">
                                Total Reviews
                              </label>
                              <input
                                type="number"
                                min="0"
                                value={form.totalReviews}
                                onChange={(e) =>
                                  setForm({
                                    ...form,
                                    totalReviews: e.target.value,
                                  })
                                }
                                placeholder="e.g., 120"
                                className="w-full px-4 py-3 rounded-xl bg-gray-800/50 border border-gray-700 text-white focus:ring-2 focus:ring-amber-500/50 outline-none"
                              />
                            </div>
                          </div>
                        </>
                      )}

                      {/* Custom Options */}
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <label className="text-sm font-medium text-gray-300">
                            Custom Options
                          </label>
                          <button
                            type="button"
                            onClick={addOption}
                            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-amber-400 bg-amber-400/10 hover:bg-amber-400/20 rounded-xl border border-amber-400/30 transition-all"
                            disabled={submitting}
                          >
                            <FiPlus className="w-4 h-4" />
                            Add Option
                          </button>
                        </div>

                        {form.options.map((opt, i) => (
                          <div
                            key={i}
                            className="bg-gray-800/40 backdrop-blur-sm rounded-xl border border-gray-700 p-5 space-y-4"
                          >
                            <div className="flex items-start gap-3">
                              <div className="flex-1">
                                <select
                                  value={opt.name}
                                  onChange={(e) => {
                                    const updated = [...form.options];
                                    updated[i].name = e.target.value;
                                    updated[i].values = [];
                                    setForm({ ...form, options: updated });
                                  }}
                                  className="w-full px-4 py-2 rounded-lg bg-black border border-gray-700 text-white focus:ring-2 focus:ring-amber-500/50 transition-all outline-none"
                                  disabled={submitting}
                                >
                                  <option value="">Select option type</option>
                                  <option value="BHK">🏠 BHK</option>
                                  <option value="Painting Type">
                                    🎨 Painting Type
                                  </option>
                                  <option value="Cleaning">🧹 Cleaning</option>
                                </select>
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = [...form.options];
                                  updated.splice(i, 1);
                                  setForm({ ...form, options: updated });
                                }}
                                className="p-2 text-gray-400 hover:text-rose-400 hover:bg-rose-400/10 rounded-lg transition-all"
                                disabled={submitting}
                              >
                                <FiX className="w-5 h-5" />
                              </button>
                            </div>

                            {/* Quick add buttons */}
                            {opt.name && (
                              <div>
                                <p className="text-xs font-medium text-gray-400 mb-2">
                                  Quick add values
                                </p>
                                <div className="flex flex-wrap gap-2">
                                  {getQuickOptions(opt.name?.trim()).map(
                                    (val) => (
                                      <button
                                        type="button"
                                        key={val}
                                        onClick={() => {
                                          const updated = [...form.options];
                                          const exists = updated[i].values.find(
                                            (v) => v.label === val,
                                          );
                                          if (!exists) {
                                            updated[i].values.push({
                                              label: val,
                                              price: 0,
                                            });
                                          }
                                          setBhkSelections((prev) => ({
                                            ...prev,
                                            [val]: prev[val] || {
                                              type: "",
                                              price: 0,
                                            },
                                          }));
                                          setForm({
                                            ...form,
                                            options: updated,
                                          });
                                        }}
                                        className="px-3 py-1 text-sm rounded-full bg-gray-800/60 border border-gray-700 text-gray-300 hover:bg-amber-400/10 hover:border-amber-400/30 hover:text-amber-300 transition-all"
                                      >
                                        {val}
                                      </button>
                                    ),
                                  )}
                                </div>
                              </div>
                            )}

                            {/* BHK specific sub-options */}
                            {opt.name?.toLowerCase() === "bhk" &&
                              Object.keys(bhkSelections).map((bhk) => (
                                <div
                                  key={bhk}
                                  className="mt-3 p-4 bg-gray-900/50 rounded-lg border border-gray-700"
                                >
                                  <p className="text-sm font-semibold text-amber-400 mb-3">
                                    {bhk}
                                  </p>
                                  <div className="flex flex-wrap gap-2 mb-3">
                                    {[
                                      "Vacant",
                                      "Occupied",
                                      "Project Completion",
                                    ].map((type) => (
                                      <button
                                        key={type}
                                        type="button"
                                        onClick={() => {
                                          setBhkSelections((prev) => ({
                                            ...prev,
                                            [bhk]: { ...prev[bhk], type },
                                          }));
                                          const updated = [...form.options];
                                          const label = `${bhk} - ${type}`;
                                          const exists = updated[i].values.find(
                                            (v) => v.label === label,
                                          );
                                          if (!exists) {
                                            updated[i].values.push({
                                              label,
                                              price: 0,
                                            });
                                          }
                                          setForm({
                                            ...form,
                                            options: updated,
                                          });
                                        }}
                                        className={`px-3 py-1 rounded-full text-sm border transition-all ${
                                          bhkSelections[bhk]?.type === type
                                            ? "bg-amber-500 text-white border-amber-500"
                                            : "bg-gray-800 text-gray-300 border-gray-600 hover:border-amber-400"
                                        }`}
                                      >
                                        {type}
                                      </button>
                                    ))}
                                  </div>
                                  {bhkSelections[bhk]?.type && (
                                    <input
                                      type="number"
                                      placeholder="Enter price for this variant"
                                      value={bhkSelections[bhk]?.price || ""}
                                      onChange={(e) => {
                                        const price = Number(e.target.value);
                                        setBhkSelections((prev) => ({
                                          ...prev,
                                          [bhk]: { ...prev[bhk], price },
                                        }));
                                        const updated = [...form.options];
                                        const label = `${bhk} - ${bhkSelections[bhk].type}`;
                                        const idx = updated[i].values.findIndex(
                                          (v) => v.label === label,
                                        );
                                        if (idx !== -1)
                                          updated[i].values[idx].price = price;
                                        setForm({ ...form, options: updated });
                                      }}
                                      className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-600 text-white placeholder-gray-500 focus:ring-2 focus:ring-amber-500/50 outline-none"
                                    />
                                  )}
                                </div>
                              ))}

                            {/* Custom value list */}
                            {opt.values.map((val, j) => (
                              <div
                                key={j}
                                className="flex items-center gap-3 px-4 py-2 bg-gray-900/40 rounded-lg border border-gray-700"
                              >
                                <span className="text-sm font-medium text-gray-200 flex-1">
                                  {val.label}
                                </span>
                                <div className="relative">
                                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                                    ₹
                                  </span>
                                  <input
                                    type="number"
                                    placeholder="Price"
                                    value={val.price || ""}
                                    onChange={(e) => {
                                      const updated = [...form.options];
                                      updated[i].values[j].price = Number(
                                        e.target.value,
                                      );
                                      setForm({ ...form, options: updated });
                                    }}
                                    className="w-28 pl-7 pr-2 py-1.5 text-sm bg-gray-800 border border-gray-600 rounded-lg text-white focus:ring-1 focus:ring-amber-500/50 outline-none"
                                    disabled={submitting}
                                  />
                                </div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const updated = [...form.options];
                                    updated[i].values.splice(j, 1);
                                    setForm({ ...form, options: updated });
                                  }}
                                  className="text-gray-500 hover:text-rose-400 transition-colors"
                                >
                                  <FiX size={16} />
                                </button>
                              </div>
                            ))}

                            <input
                              placeholder="Type a custom value and press Enter"
                              className="w-full px-4 py-2 rounded-lg bg-gray-900/50 border border-gray-700 text-white placeholder-gray-500 focus:ring-2 focus:ring-amber-500/50 outline-none transition-all"
                              onKeyDown={(e) => {
                                if (e.key === "Enter") {
                                  e.preventDefault();
                                  const value = e.target.value.trim();
                                  if (!value) return;
                                  const updated = [...form.options];
                                  const exists = updated[i].values.find(
                                    (v) => v.label === value,
                                  );
                                  if (!exists) {
                                    updated[i].values.push({
                                      label: value,
                                      price: 0,
                                    });
                                  }
                                  setForm({ ...form, options: updated });
                                  e.target.value = "";
                                }
                              }}
                              disabled={submitting}
                            />
                          </div>
                        ))}
                      </div>

                      {/* Submit Buttons */}
                      <div className="pt-4 space-y-3">
                        <button
                          type="submit"
                          disabled={submitting}
                          className="w-full px-6 py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold rounded-xl shadow-lg shadow-amber-500/25 hover:shadow-amber-500/40 transform hover:-translate-y-0.5 transition-all duration-200 focus:ring-4 focus:ring-amber-500/30 outline-none disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                          {submitting ? (
                            <>
                              <FiLoader className="w-5 h-5 animate-spin" />
                              {editingId ? "Updating..." : "Creating..."}
                            </>
                          ) : editingId ? (
                            "Update Service"
                          ) : (
                            "Create Service"
                          )}
                        </button>
                        {editingId && (
                          <button
                            type="button"
                            onClick={resetForm}
                            className="w-full px-6 py-3 text-gray-300 hover:text-white text-sm font-medium rounded-xl border border-gray-700 hover:bg-gray-800/50 transition-all"
                            disabled={submitting}
                          >
                            Cancel Editing
                          </button>
                        )}
                      </div>
                    </form>
                  </div>
                </div>
              </div>

              {/* Service List Section - PREMIUM REDESIGN (only UI changes) */}
              <div>
                <div className="bg-gradient-to-br from-gray-900/50 to-gray-900/30 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden transition-all duration-300 hover:shadow-amber-500/10">
                  <div className="p-6 md:p-8">
                    <div className="flex items-center justify-between mb-8">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-amber-400/10 text-amber-400">
                          <FiLayers className="text-xl" />
                        </div>
                        <div>
                          <h2 className="text-xl font-bold text-white tracking-tight">
                            Existing Services
                          </h2>
                          <p className="text-xs text-gray-400 mt-0.5">
                            Manage your service hierarchy
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => setExpandedIds(new Set())}
                        className="group flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-300 bg-white/5 rounded-full border border-white/10 hover:bg-amber-400/10 hover:border-amber-400/30 hover:text-amber-400 transition-all"
                        disabled={loading}
                      >
                        <FiGrid className="w-3.5 h-3.5 group-hover:rotate-12 transition-transform" />
                        Collapse All
                      </button>
                    </div>

                    {loading ? (
                      <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                        <div className="relative">
                          <div className="absolute inset-0 rounded-full bg-amber-400/20 blur-xl animate-pulse" />
                          <FiLoader className="w-10 h-10 animate-spin text-amber-400 relative z-10" />
                        </div>
                        <p className="mt-4 text-sm font-medium">
                          Loading services...
                        </p>
                      </div>
                    ) : treeData.length === 0 ? (
                      <div className="text-center py-20 text-gray-500">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-800/50 flex items-center justify-center">
                          <FiPackage className="w-8 h-8 opacity-40" />
                        </div>
                        <p className="text-sm font-medium">No services yet</p>
                        <p className="text-xs text-gray-600 mt-1">
                          Start by creating one above
                        </p>
                      </div>
                    ) : (
                      <div className="max-h-[650px] overflow-y-auto pr-2 space-y-2 custom-scrollbar py-3">
                        {treeData.map((item) => renderTreeItem(item))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Custom scrollbar style */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255,255,255,0.03);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(245,158,11,0.5);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(245,158,11,0.8);
        }
      `}</style>
    </AdminLayout>
  );
};

export default CreateServices;
