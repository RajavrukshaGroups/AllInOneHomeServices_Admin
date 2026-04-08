import { useEffect, useState } from "react";
import AdminLayout from "../../components/layout/adminLayout";
import api from "../../api/axios";
import { FiEdit, FiEye } from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const ViewReceipts = () => {
  const navigate = useNavigate();
  const [receipts, setReceipts] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const formatDate = (date) => {
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();

    return `${day}/${month}/${year}`;
  };

  const fetchReceipts = async () => {
    try {
      const res = await api.get(
        `/admin/fetch-all-receipts?page=${page}&search=${search}`,
      );

      setReceipts(res.data.data);
      setTotalPages(res.data.totalPages);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchReceipts();
  }, [page, search]);

  return (
    <AdminLayout>
      <div className="p-6">
        {/* 🔥 HEADER */}
        <h1 className="text-2xl font-bold text-green-800 mb-4">All Receipts</h1>

        {/* 🔍 SEARCH */}
        <input
          type="text"
          placeholder="Search by name / receipt no / course"
          className="w-full mb-4 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
          value={search}
          onChange={(e) => {
            setPage(1);
            setSearch(e.target.value);
          }}
        />

        {/* 📋 TABLE */}
        <div className="overflow-x-auto bg-white rounded-xl shadow border border-gray-100">
          <table className="w-full text-sm">
            <thead className="bg-green-700 text-white">
              <tr>
                <th className="p-3 text-left">Receipt No</th>
                <th className="p-3 text-left">Name</th>
                <th className="p-3 text-left">Course</th>
                <th className="p-3 text-left">Year</th>
                <th className="p-3 text-left">Amount</th>
                <th className="p-3 text-left">Date</th>
                <th className="p-3 text-left">Action</th>
                <th className="p-3">View</th>
              </tr>
            </thead>

            <tbody>
              {receipts.length > 0 ? (
                receipts.map((item) => (
                  <tr
                    key={item._id}
                    className="border-b hover:bg-green-50 transition"
                  >
                    <td className="p-3 font-medium text-green-800">
                      {item.receiptNumber}
                    </td>
                    <td className="p-3">{item.name}</td>
                    <td className="p-3">{item.course}</td>
                    <td className="p-3">{item.year}</td>
                    <td className="p-3 font-semibold text-green-700">
                      ₹ {item.totalAmount}
                    </td>
                    <td className="p-3">
                      <span className="bg-green-50 text-green-700 px-2 py-1 rounded-md text-xs font-medium">
                        {formatDate(item.receiptDate)}
                      </span>
                    </td>

                    {/* ✏️ EDIT */}
                    <td className="p-3">
                      <button
                        onClick={() =>
                          navigate(`/admin/generate-receipt/${item._id}`)
                        }
                        className="text-green-700 hover:text-green-900 transition"
                      >
                        <FiEdit size={18} />
                      </button>
                    </td>
                    <td className="p-3">
                      <button
                        onClick={() =>
                          window.open(
                            // `http://localhost:11000/admin/view-receipt/${item._id}`,
                            `https://server.bouncyboxstudio.in/admin/view-receipt/${item._id}`,
                            "_blank",
                          )
                        }
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <FiEye size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="text-center p-4 text-gray-500">
                    No receipts found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* 🔥 PAGINATION */}
        <div className="flex justify-center mt-4 gap-2">
          <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
          >
            Prev
          </button>

          <span className="px-4 py-1 font-medium">
            Page {page} of {totalPages}
          </span>

          <button
            disabled={page === totalPages}
            onClick={() => setPage(page + 1)}
            className="px-3 py-1 bg-green-600 text-white rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>
    </AdminLayout>
  );
};

export default ViewReceipts;
