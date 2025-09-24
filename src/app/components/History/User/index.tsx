"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import FullPageLoader from "../../Preloader/FullPageLoader";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Pagination from "../../Pagination/Pagination";
import { useDebounce } from "../../../hooks/useDebounce";

interface UserInfo {
  id: number;
  email: string;
  role: string;
  admin?: {
    adminId: number;
    name: string;
    phone: string;
  };
}

interface ActivityLog {
  activityLogId: number;
  user_id: number;
  action: number;
  model: string;
  model_id: number;
  description: string | null;
  data: any;
  ip_address: string;
  user_agent: string;
  created_at: string;
  user: UserInfo;
}

interface UserPagination {
  current_page: number;
  data: ActivityLog[];
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}

const AllHistoryUser: React.FC = () => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [pagination, setPagination] = useState<UserPagination | null>(null);
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 500);
  const [loading, setLoading] = useState(false);

  const API_URL = process.env.NEXT_PUBLIC_API_URL + "/history/user";
  const token = localStorage.getItem("admin_token");

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${API_URL}?page=${page}&search=${debouncedSearch}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const userData: UserPagination = res.data.data.user;
      setLogs(userData.data);
      setPagination(userData);

      if (debouncedSearch) {
        if (userData.data.length > 0) {
          toast.success(
            `Ditemukan ${userData.data.length} hasil untuk "${debouncedSearch}"`
          );
        } else {
          toast.info(`Tidak ada hasil untuk "${debouncedSearch}"`);
        }
      }
    } catch (error) {
      console.error("Error fetching history user:", error);
      toast.error("Gagal memuat riwayat aktivitas user");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, debouncedSearch]);

  if (loading) return <FullPageLoader message="Memuat riwayat aktivitas..." />;

  const getActionLabel = (action: number) => {
    switch (action) {
      case 1:
        return "CREATE";
      case 2:
        return "UPDATE";
      case 3:
        return "DELETE";
      default:
        return "OTHER";
    }
  };

  return (
    <div className="p-6">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />

      <div className="max-w-7xl mx-auto space-y-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">
                Riwayat Aktivitas User
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Semua aktivitas yang dilakukan user di sistem
              </p>
            </div>
            {/* Search box */}
            <input
              type="text"
              placeholder="Cari deskripsi/model..."
              value={searchTerm}
              onChange={(e) => {
                setPage(1);
                setSearchTerm(e.target.value);
              }}
              className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring focus:ring-blue-200"
            />
          </div>

          <div className="overflow-x-auto p-6">
            {logs.length === 0 ? (
              <p className="text-gray-500">Belum ada riwayat aktivitas.</p>
            ) : (
              <table className="w-full table-auto border-collapse border border-gray-300 text-left text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 px-4 py-2">No</th>
                    <th className="border border-gray-300 px-4 py-2">User</th>
                    <th className="border border-gray-300 px-4 py-2">Email</th>
                    <th className="border border-gray-300 px-4 py-2">Action</th>
                    <th className="border border-gray-300 px-4 py-2">
                      Deskripsi
                    </th>
                    <th className="border border-gray-300 px-4 py-2">
                      IP Address
                    </th>
                    <th className="border border-gray-300 px-4 py-2">Tanggal</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log, index) => (
                    <tr key={log.activityLogId} className="hover:bg-gray-50">
                      <td className="border border-gray-300 px-4 py-2">
                        {pagination?.from
                          ? pagination.from + index
                          : index + 1}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {log.user?.admin?.name || "-"}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {log.user?.email}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        <span
                          className={`px-2 py-1 rounded text-xs font-semibold ${
                            log.action === 1
                              ? "bg-green-100 text-green-800"
                              : log.action === 2
                              ? "bg-blue-100 text-blue-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {getActionLabel(log.action)}
                        </span>
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {log.description || "-"}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {log.ip_address}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {new Date(log.created_at).toLocaleString("id-ID")}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* Pagination */}
            {pagination && (
              <Pagination
                currentPage={pagination.current_page}
                lastPage={pagination.last_page}
                onPageChange={(pageNumber) => setPage(pageNumber)}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllHistoryUser;
