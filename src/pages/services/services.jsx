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
  FiLoader, // added for spinner
} from "react-icons/fi";
import imageCompression from "browser-image-compression";

const CreateServices = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState([]); // flattened for parent dropdown
  const [treeData, setTreeData] = useState([]); // hierarchical for display
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
  });
  const [imagePreviews, setImagePreviews] = useState([]);
  const [imageFiles, setImageFiles] = useState([]);
  const [isDragging, setIsDragging] = useState(false);
  const [bhkSelections, setBhkSelections] = useState({});

  // Loading states
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // Fetch both flattened and tree data
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
      await fetchServices(); // refresh after delete
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
        } else {
          formData.append(key, form[key]);
        }
      });

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
      await fetchServices(); // refresh list
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
          className={`group flex items-center gap-3 py-3 px-4 rounded-xl transition-all duration-300 ${
            editingId === item._id
              ? "bg-amber-500/10 border border-amber-500/30 shadow-[0_0_0_1px_rgba(245,158,11,0.1)]"
              : "hover:bg-gray-800/40 border border-transparent hover:border-gray-700/50"
          }`}
          style={{ marginLeft: `${level * 24}px` }}
        >
          <button
            type="button"
            onClick={() => hasChildren && toggleExpand(item._id)}
            className={`w-5 h-5 flex items-center justify-center rounded-md transition-all ${
              hasChildren
                ? "text-gray-500 hover:text-amber-400 hover:bg-amber-400/10"
                : "text-gray-600"
            }`}
            disabled={!hasChildren}
          >
            {hasChildren ? (
              isExpanded ? (
                <FiChevronDown className="w-4 h-4" />
              ) : (
                <FiChevronRight className="w-4 h-4" />
              )
            ) : null}
          </button>

          {isCategory ? (
            <FiFolder className="w-5 h-5 text-amber-400/80" />
          ) : (
            <FiPackage className="w-5 h-5 text-blue-400/80" />
          )}

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span
                onClick={() => {
                  if (item.type === "category") {
                    navigate(`/admin/services/${item._id}`);
                  }
                }}
                className={`font-medium truncate ${
                  item.type === "category"
                    ? "text-gray-200 cursor-pointer hover:text-amber-400"
                    : "text-gray-500 cursor-not-allowed"
                }`}
              >
                {item.name}
              </span>
              {!isCategory && item.price && (
                <span className="text-xs font-medium text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full border border-emerald-400/20">
                  ₹{item.price}
                </span>
              )}
              {!isCategory && item.duration && (
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <FiClock className="w-3 h-3" />
                  {item.duration} min
                </span>
              )}
            </div>
            {item.options?.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1">
                {item.options.slice(0, 3).map((opt, idx) => (
                  <span
                    key={idx}
                    className="text-xs bg-gray-800 text-gray-300 px-2 py-0.5 rounded-full border border-gray-700"
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
              <div className="flex gap-1">
                {item.images.slice(0, 3).map((img, i) => (
                  <img
                    key={i}
                    src={img}
                    className="w-10 h-10 rounded-lg object-cover"
                    alt="service"
                  />
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              type="button"
              onClick={() => handleEdit(item)}
              className="p-2 text-gray-400 hover:text-amber-400 hover:bg-amber-400/10 rounded-lg transition-all"
              title="Edit"
              disabled={submitting || loading || isDeleting}
            >
              <FiEdit2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => handleDelete(item._id, hasChildren)}
              className="p-2 text-gray-400 hover:text-rose-400 hover:bg-rose-400/10 rounded-lg transition-all"
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

        {hasChildren && isExpanded && (
          <div className="border-l border-amber-500/20 ml-6">
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
    return [];
  };

  return (
    <AdminLayout>
      <div className="min-h-screen bg-[#0B0E14] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-gray-900 via-[#0B0E14] to-black py-10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Premium Header */}
          <div className="mb-10 relative">
            <div className="absolute -top-20 left-0 w-72 h-72 bg-amber-500/10 rounded-full blur-[100px] -z-10" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-amber-200 via-amber-400 to-amber-200 bg-clip-text text-transparent tracking-tight">
              Service Management
            </h1>
            <p className="text-gray-400 mt-2 text-lg font-light">
              Craft and curate your service catalog with precision
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Column: Form */}
            <div id="service-form">
              <div className="bg-gray-900/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-800 overflow-hidden sticky top-6 transition-all hover:shadow-amber-500/5">
                <div className="p-6 sm:p-8 space-y-6">
                  <div>
                    <h2 className="text-2xl font-semibold text-white flex items-center gap-2">
                      {editingId ? "Edit Service" : "Create New Service"}
                      <span className="text-xs font-normal text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20">
                        {editingId ? "Editing" : "New"}
                      </span>
                    </h2>
                    {editingId && (
                      <button
                        type="button"
                        onClick={resetForm}
                        className="text-sm text-amber-400 hover:text-amber-300 mt-2 transition-colors"
                        disabled={submitting}
                      >
                        ← Switch to create mode
                      </button>
                    )}
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Name & Type */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-300">
                          Service Name <span className="text-rose-400">*</span>
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Home Deep Cleaning"
                          value={form.name}
                          onChange={(e) =>
                            setForm({ ...form, name: e.target.value })
                          }
                          className="w-full px-4 py-3 rounded-xl bg-gray-800/50 border border-gray-700 text-white placeholder-gray-500 focus:bg-gray-800 focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all outline-none shadow-sm"
                          required
                          disabled={submitting}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm text-gray-300">
                          Service Image
                        </label>
                        <div
                          onDragOver={(e) => {
                            e.preventDefault();
                            setIsDragging(true);
                          }}
                          onDragLeave={() => setIsDragging(false)}
                          onDrop={handleDrop}
                          className={`p-6 rounded-xl border-2 border-dashed transition-all ${
                            isDragging
                              ? "border-amber-400 bg-amber-400/10"
                              : "border-gray-700 bg-gray-800/30"
                          } ${submitting ? "opacity-50 pointer-events-none" : ""}`}
                        >
                          <p className="text-sm text-gray-400 text-center">
                            Drag & Drop Images Here
                          </p>

                          <div className="text-center mt-2">
                            <label className="cursor-pointer text-amber-400 underline">
                              Browse Files
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
                          </div>
                        </div>
                        {imagePreviews.length === 0 && (
                          <p className="text-xs text-gray-500 mt-1">
                            Upload up to 5 images (JPG, PNG, GIF – Max 2MB each)
                          </p>
                        )}
                        {imagePreviews.length > 0 && (
                          <div className="flex flex-wrap gap-3 mt-4">
                            {imagePreviews.map((img, index) => (
                              <div key={index} className="relative w-24 h-24">
                                <img
                                  src={img}
                                  alt="preview"
                                  className="w-full h-full object-cover rounded-lg border border-gray-700"
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
                                  className="absolute top-1 right-1 bg-black/70 text-white rounded-full p-1 hover:bg-red-500"
                                  disabled={submitting}
                                >
                                  <FiX size={12} />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-300">
                          Service Type
                        </label>
                        <div className="relative">
                          <select
                            value={form.type}
                            onChange={(e) =>
                              setForm({ ...form, type: e.target.value })
                            }
                            className="w-full px-4 py-3 rounded-xl bg-gray-800/50 border border-gray-700 text-white focus:bg-gray-800 focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all outline-none appearance-none"
                            disabled={submitting}
                          >
                            <option value="category">Category (Group)</option>
                            <option value="service">Service (Bookable)</option>
                          </select>
                          <FiChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                        </div>
                      </div>
                      {form.type === "service" && (
                        <>
                          <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-300">
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
                              <option value="fixed">Fixed Price</option>
                              <option value="per_sqft">Per Sqft</option>
                            </select>
                          </div>

                          {form.pricingType === "per_sqft" && (
                            <div className="space-y-2">
                              <label className="text-sm font-medium text-gray-300">
                                Price per Sqft (₹)
                              </label>
                              <input
                                type="number"
                                value={form.basePricePerSqft}
                                onChange={(e) =>
                                  setForm({
                                    ...form,
                                    basePricePerSqft: e.target.value,
                                  })
                                }
                                className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:ring-2 focus:ring-amber-500/50 transition-all outline-none"
                                disabled={submitting}
                              />
                            </div>
                          )}
                        </>
                      )}
                    </div>

                    {/* Parent */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-300">
                        Parent Service (Optional)
                      </label>
                      <div className="relative">
                        <select
                          value={form.parentId}
                          onChange={(e) =>
                            setForm({ ...form, parentId: e.target.value })
                          }
                          className="w-full px-4 py-3 rounded-xl bg-gray-800/50 border border-gray-700 text-white focus:bg-gray-800 focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all outline-none appearance-none"
                          disabled={submitting}
                        >
                          <option value="">None (Top Level)</option>
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

                    {/* Price & Duration */}
                    {form.type === "service" &&
                      form.pricingType === "fixed" && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-300">
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
                                  setForm({ ...form, price: e.target.value })
                                }
                                className="w-full pl-8 pr-4 py-3 rounded-xl bg-gray-800/50 border border-gray-700 text-white placeholder-gray-500 focus:bg-gray-800 focus:ring-2 focus:ring-amber-500/50 transition-all outline-none"
                                disabled={submitting}
                              />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <label className="block text-sm font-medium text-gray-300">
                              Duration (minutes)
                            </label>
                            <input
                              type="number"
                              placeholder="e.g. 60"
                              value={form.duration}
                              onChange={(e) =>
                                setForm({ ...form, duration: e.target.value })
                              }
                              className="w-full px-4 py-3 rounded-xl bg-gray-800/50 border border-gray-700 text-white placeholder-gray-500 focus:bg-gray-800 focus:ring-2 focus:ring-amber-500/50 transition-all outline-none"
                              disabled={submitting}
                            />
                          </div>
                        </div>
                      )}

                    {/* Options */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="block text-sm font-medium text-gray-300">
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
                          className="bg-gray-800/40 backdrop-blur-sm rounded-xl border border-gray-700 p-4 space-y-3"
                        >
                          <div className="flex items-start gap-3">
                            <select
                              value={opt.name}
                              onChange={(e) => {
                                const updated = [...form.options];
                                updated[i].name = e.target.value;
                                updated[i].values = [];
                                setForm({ ...form, options: updated });
                              }}
                              className="flex-1 px-3 py-2 rounded-lg bg-gray-900/50 border border-gray-700 text-white focus:ring-2 focus:ring-amber-500/50 transition-all outline-none text-sm"
                              disabled={submitting}
                            >
                              <option value="">Select Option</option>
                              <option value="BHK">BHK</option>
                              <option value="Painting Type">
                                Painting Type
                              </option>
                            </select>
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
                              <FiX className="w-4 h-4" />
                            </button>
                          </div>

                          <div>
                            <p className="text-xs font-medium text-gray-400 mb-2">
                              Quick Add
                            </p>
                            <div className="flex flex-wrap gap-2">
                              {getQuickOptions(opt.name?.trim()).map((val) => (
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

                                    // 🔥 track BHK selection
                                    setBhkSelections((prev) => ({
                                      ...prev,
                                      [val]: prev[val] || {
                                        type: "",
                                        price: 0,
                                      },
                                    }));

                                    setForm({ ...form, options: updated });
                                  }}
                                  className="px-3 py-1 text-sm font-medium rounded-full bg-gray-900/50 border border-gray-700 text-gray-300 hover:bg-amber-400/10 hover:border-amber-400/30 hover:text-amber-300 transition-all"
                                  disabled={submitting}
                                >
                                  {val}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* 🔥 BHK TYPE SELECTION UI */}
                          {opt.name?.toLowerCase() === "bhk" &&
                            Object.keys(bhkSelections).map((bhk) => (
                              <div
                                key={bhk}
                                className="mt-3 p-3 bg-gray-900/40 rounded-lg border border-gray-700"
                              >
                                <p className="text-sm font-semibold text-amber-400 mb-2">
                                  {bhk}
                                </p>

                                <div className="flex gap-2 mb-2">
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
                                          [bhk]: {
                                            ...prev[bhk],
                                            type,
                                          },
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

                                        setForm({ ...form, options: updated });
                                      }}
                                      className={`px-3 py-1 rounded-full text-sm border ${
                                        bhkSelections[bhk]?.type === type
                                          ? "bg-amber-500 text-white"
                                          : "bg-gray-800 text-gray-300 border-gray-600"
                                      }`}
                                    >
                                      {type}
                                    </button>
                                  ))}
                                </div>

                                {bhkSelections[bhk]?.type && (
                                  <input
                                    type="number"
                                    placeholder="Enter price"
                                    value={bhkSelections[bhk]?.price || ""}
                                    onChange={(e) => {
                                      const price = Number(e.target.value);

                                      setBhkSelections((prev) => ({
                                        ...prev,
                                        [bhk]: {
                                          ...prev[bhk],
                                          price,
                                        },
                                      }));

                                      const updated = [...form.options];
                                      const label = `${bhk} - ${bhkSelections[bhk].type}`;

                                      const index = updated[i].values.findIndex(
                                        (v) => v.label === label,
                                      );

                                      if (index !== -1) {
                                        updated[i].values[index].price = price;
                                      }

                                      setForm({ ...form, options: updated });
                                    }}
                                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white"
                                  />
                                )}
                              </div>
                            ))}

                          {opt.values.map((val, j) => (
                            <div
                              key={j}
                              className="flex items-center gap-2 px-3 py-2 bg-gray-900/50 rounded-lg border border-gray-700"
                            >
                              <span className="text-sm font-medium text-gray-200 flex-1">
                                {val.label}
                              </span>
                              <input
                                type="number"
                                placeholder="₹"
                                value={val.price || ""}
                                onChange={(e) => {
                                  const updated = [...form.options];
                                  updated[i].values[j].price = Number(
                                    e.target.value,
                                  );
                                  setForm({ ...form, options: updated });
                                }}
                                className="w-20 px-2 py-1 text-sm bg-gray-800 border border-gray-600 rounded text-white placeholder-gray-500 focus:ring-1 focus:ring-amber-500/50 outline-none"
                                disabled={submitting}
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const updated = [...form.options];
                                  updated[i].values.splice(j, 1);
                                  setForm({ ...form, options: updated });
                                }}
                                className="text-gray-500 hover:text-rose-400 transition-colors"
                                disabled={submitting}
                              >
                                <FiX size={14} />
                              </button>
                            </div>
                          ))}

                          <input
                            placeholder="Type custom value and press Enter"
                            className="w-full px-3 py-2 rounded-lg bg-gray-900/50 border border-gray-700 text-white placeholder-gray-500 focus:ring-2 focus:ring-amber-500/50 outline-none text-sm transition-all"
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

                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={submitting}
                        className="w-full px-8 py-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-semibold rounded-xl shadow-lg shadow-amber-500/20 hover:shadow-amber-500/30 transform hover:-translate-y-0.5 transition-all duration-200 focus:ring-4 focus:ring-amber-500/30 outline-none disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0 flex items-center justify-center gap-2"
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
                          className="w-full mt-3 px-8 py-3 text-gray-300 hover:text-white text-sm font-medium rounded-xl border border-gray-700 hover:bg-gray-800/50 transition-all"
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

            {/* Right Column: Service List */}
            <div>
              <div className="bg-gray-900/80 backdrop-blur-xl rounded-3xl shadow-2xl border border-gray-800 overflow-hidden transition-all hover:shadow-amber-500/5">
                <div className="p-6 sm:p-8">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-semibold text-white flex items-center gap-2">
                      <FiLayers className="text-amber-400" />
                      Existing Services
                    </h2>
                    <button
                      type="button"
                      onClick={() => setExpandedIds(new Set())}
                      className="text-sm text-gray-400 hover:text-amber-400 transition-colors"
                      disabled={loading}
                    >
                      Collapse All
                    </button>
                  </div>

                  {loading ? (
                    <div className="flex flex-col items-center justify-center py-16 text-gray-500">
                      <FiLoader className="w-10 h-10 animate-spin text-amber-400 mb-3" />
                      <p>Loading services...</p>
                    </div>
                  ) : treeData.length === 0 ? (
                    <div className="text-center py-16 text-gray-500">
                      <FiPackage className="w-12 h-12 mx-auto mb-3 opacity-30" />
                      <p>No services yet. Create your first service!</p>
                    </div>
                  ) : (
                    <div className="max-h-[700px] overflow-y-auto pr-2 space-y-1 custom-scrollbar">
                      {treeData.map((item) => renderTreeItem(item))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default CreateServices;
