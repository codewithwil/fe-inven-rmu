"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import FullPageLoader from "../../Preloader/FullPageLoader";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Pagination from "../../Pagination/Pagination";
import { useDebounce } from "../../../hooks/useDebounce";

interface Admin {
  adminId: number;
  user_id: number;
  name: string;
  phone: string;
  created_at: string;
  updated_at: string;
  file?: string | null;
  user?: {
    email: string;
  };
}

interface AdminFormData {
  email: string;
  password: string;
  name: string;
  phone: string;
}

const InputAdmin: React.FC = () => {
  const [formData, setFormData] = useState<AdminFormData>({
    email: "",
    password: "",
    name: "",
    phone: "",
  });
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 500);

  const API_URL = process.env.NEXT_PUBLIC_API_URL + "/people/admin";
  const token = localStorage.getItem("admin_token");

  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${API_URL}?page=${page}&search=${debouncedSearch}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setAdmins(res.data.data.admins.data || []);
      setPagination(res.data.data.admins);
    } catch (error) {
      console.error("Error fetching admins:", error);
      toast.error("Gagal memuat admin");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, [page, debouncedSearch]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingId) {
        const res = await axios.post(
          `${API_URL}/update/${editingId}`,
          formData,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const updatedAdmin = res.data.data.admin;
        setAdmins((prev) =>
          prev.map((a) => (a.adminId === editingId ? updatedAdmin : a))
        );

        toast.success("Admin berhasil diperbarui!");
      } else {
        const res = await axios.post(`${API_URL}/store`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const newAdmin = res.data.data.admin;
        setAdmins((prev) => [...prev, newAdmin]);
        toast.success("Admin berhasil ditambahkan!");
      }
      resetForm();
    } catch (error: any) {
      console.error("Error submitting form:", error);
      toast.error(error.response?.data?.message || "Gagal simpan admin");
    }
  };

  const handleEdit = (admin: Admin) => {
    setFormData({
      email: admin.user?.email || "",
      password: "",
      name: admin.name,
      phone: admin.phone,
    });
    setEditingId(admin.adminId);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Yakin ingin menghapus admin ini?")) return;
    try {
      await axios.post(
        `${API_URL}/delete/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setAdmins((prev) => prev.filter((a) => a.adminId !== id));
      toast.success("Admin berhasil dihapus!");
    } catch (error: any) {
      console.error("Error deleting admin:", error);
      toast.error(error.response?.data?.message || "Gagal menghapus admin");
    }
  };

  const resetForm = () => {
    setFormData({ email: "", password: "", name: "", phone: "" });
    setEditingId(null);
  };

  const filteredAdmins = admins.filter(
    (a) =>
      a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.user?.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <FullPageLoader message="Memuat admin..." />;

  return (
    <div className="p-6">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />

      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">
              {editingId ? "Edit Admin" : "Input Admin Baru"}
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-black"
                placeholder="Masukkan email"
                required
              />
            </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password *
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-black"
                  placeholder="Minimal 8 karakter"
                  
                />
              </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nama *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-black"
                placeholder="Masukkan nama admin"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                No. HP *
              </label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-black"
                placeholder="Masukkan nomor HP"
                required
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Reset Form
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
              >
                {editingId ? "Update Admin" : "Simpan Admin"}
              </button>
            </div>
          </form>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-800">Daftar Admin</h2>
            <input
              type="text"
              placeholder="Cari admin..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-black"
            />
          </div>

          <div className="overflow-x-auto p-6">
            {admins.length === 0 ? (
              <p className="text-gray-500">Belum ada admin.</p>
            ) : (
              <table className="w-full table-auto border-collapse border border-gray-300 text-left">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 px-4 py-2">No</th>
                    <th className="border border-gray-300 px-4 py-2">Nama</th>
                    <th className="border border-gray-300 px-4 py-2">Email</th>
                    <th className="border border-gray-300 px-4 py-2">No. HP</th>
                    <th className="border border-gray-300 px-4 py-2 text-center">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredAdmins.map((admin, index) => (
                    <tr key={admin.adminId} className="hover:bg-gray-50">
                      <td className="border border-gray-300 px-4 py-2">
                        {(pagination?.from || 0) + index}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {admin.name}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {admin.user?.email || "-"}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {admin.phone}
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-center space-x-2">
                        <button
                          onClick={() => handleEdit(admin)}
                          className="px-3 py-1 bg-yellow-400 text-white rounded hover:bg-yellow-500"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(admin.adminId)}
                          className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                        >
                          Hapus
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
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

export default InputAdmin;
