"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import FullPageLoader from "../Preloader/FullPageLoader";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Pagination from "../Pagination/Pagination";
import { useDebounce } from "../../hooks/useDebounce";
interface Category {
  categoryId: number;
  name: string;
  status: number;
  created_at: string | null;
  updated_at: string | null;
}

interface CategoryFormData {
  name: string;
}

const InputKategori: React.FC = () => {
  const [formData, setFormData] = useState<CategoryFormData>({ name: "" });
  const [categories, setCategories] = useState<Category[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 500); 

  const API_URL = process.env.NEXT_PUBLIC_API_URL + "/resources/category";
  const token = localStorage.getItem("admin_token");

const fetchCategories = async () => {
  setLoading(true);
  try {
    const res = await axios.get(`${API_URL}?page=${page}&search=${debouncedSearch}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    setCategories(res.data.data.category.data || []);
    setPagination(res.data.data.category);
  } catch (error) {
    console.error("Error fetching categories:", error);
    toast.error("Gagal memuat kategori");
  } finally {
    setLoading(false);
  }
};


  useEffect(() => {
    fetchCategories();
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

        const updatedCat = res.data.data.category;
        setCategories((prev) =>
          prev.map((cat) =>
            cat.categoryId === editingId ? updatedCat : cat
          )
        );

        toast.success("Kategori berhasil diperbarui!");
      } else {
        const res = await axios.post(`${API_URL}/store`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const newCategory = res.data.data.category;
        setCategories((prev) => [...prev, newCategory]);
        toast.success("Kategori berhasil ditambahkan!");
      }
      resetForm();
    } catch (error: any) {
      console.error("Error submitting form:", error);
      toast.error(error.response?.data?.message || "Gagal simpan kategori");
    }
  };

  const handleEdit = (cat: Category) => {
    setFormData({ name: cat.name });
    setEditingId(cat.categoryId);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Yakin ingin menghapus kategori ini?")) return;
    try {
      await axios.post(
        `${API_URL}/delete/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setCategories((prev) => prev.filter((cat) => cat.categoryId !== id));

      toast.success("Kategori berhasil dihapus!");
    } catch (error: any) {
      console.error("Error deleting category:", error);
      toast.error(error.response?.data?.message || "Gagal menghapus kategori");
    }
  };


  const resetForm = () => {
    setFormData({ name: "" });
    setEditingId(null);
  };

  const filteredCategories = categories.filter((cat) =>
    cat.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <FullPageLoader message="Memuat kategori..." />;

  return (
    <div className="p-6">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />

      <div className="max-w-4xl mx-auto space-y-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">
              {editingId ? "Edit Kategori" : "Input Kategori Baru"}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {editingId
                ? "Ubah kategori yang dipilih"
                : "Tambahkan kategori baru"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Nama Kategori *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                placeholder="Masukkan nama kategori"
                required
              />
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                Reset Form
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                {editingId ? "Update Kategori" : "Simpan Kategori"}
              </button>
            </div>
          </form>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-800">
              Daftar Kategori
            </h2>
            <input
              type="text"
              placeholder="Cari kategori..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
            />
          </div>

          <div className="overflow-x-auto p-6">
            {categories.length === 0 ? (
              <p className="text-gray-500">Belum ada kategori.</p>
            ) : (
              <table className="w-full table-auto border-collapse border border-gray-300 text-left">
                <thead>
                  <tr className="bg-gray-100 text-gray-700">
                    <th className="border border-gray-300 px-4 py-2">No</th>
                    <th className="border border-gray-300 px-4 py-2">
                      Nama Kategori
                    </th>
                    <th className="border border-gray-300 px-4 py-2 text-center">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCategories.map((cat, index) => (
                    <tr key={cat.categoryId} className="hover:bg-gray-50 text-gray-700">
                      <td className="border border-gray-300 px-4 py-2">
                        {(pagination.from || 1) + index}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {cat.name}
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-center space-x-2">
                        <button
                          onClick={() => handleEdit(cat)}
                          className="px-3 py-1 bg-yellow-400 text-white rounded hover:bg-yellow-500"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(cat.categoryId)}
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

export default InputKategori;
