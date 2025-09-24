"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import FullPageLoader from "../../Preloader/FullPageLoader";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Pagination from "../../Pagination/Pagination";
import { useDebounce } from "../../../hooks/useDebounce";

interface Employee {
  employeeId: number;
  user_id: number;
  name: string;
  phone: string;
  address: string;
  gender: number;
  birthdate: string;
  hire_date: string;
  salary: number;
  status: number;
  created_at: string;
  updated_at: string;
  user?: {
    email: string;
  };
}

interface EmployeeFormData {
  email: string;
  password: string;
  name: string;
  phone: string;
  address: string;
  gender: number;
  birthdate: string;
  hire_date: string;
  salary: number;
}

const InputPetugas: React.FC = () => {
  const [formData, setFormData] = useState<EmployeeFormData>({
    email: "",
    password: "",
    name: "",
    phone: "",
    address: "",
    gender: 0,
    birthdate: "",
    hire_date: "",
    salary: 0,
  });
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 500);

    const API_URL = process.env.NEXT_PUBLIC_API_URL + "/people/employee";
  const token = localStorage.getItem("admin_token");

  const fetchEmployees = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${API_URL}?page=${page}&search=${debouncedSearch}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setEmployees(res.data.data.employee.data || []);
      setPagination(res.data.data.employee);
    } catch (error) {
      console.error("Error fetching employees:", error);
      toast.error("Gagal memuat data petugas");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, [page, debouncedSearch]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]:
        name === "gender" || name === "salary" ? Number(value) : value,
    });
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

        const updated = res.data.data.employee;
        setEmployees((prev) =>
          prev.map((e) => (e.employeeId === editingId ? updated : e))
        );

        toast.success("Petugas berhasil diperbarui!");
      } else {
        const res = await axios.post(`${API_URL}/store`, formData, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const newEmployee = res.data.data.employee;
        setEmployees((prev) => [...prev, newEmployee]);
        toast.success("Petugas berhasil ditambahkan!");
      }
      resetForm();
    } catch (error: any) {
      console.error("Error submitting form:", error);
      toast.error(error.response?.data?.message || "Gagal simpan petugas");
    }
  };

  const handleEdit = (employee: Employee) => {
    setFormData({
      email: employee.user?.email || "",
      password: "",
      name: employee.name,
      phone: employee.phone,
      address: employee.address,
      gender: employee.gender,
      birthdate: employee.birthdate,
      hire_date: employee.hire_date,
      salary: employee.salary,
    });
    setEditingId(employee.employeeId);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Yakin ingin menghapus petugas ini?")) return;
    try {
      await axios.post(
        `${API_URL}/delete/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setEmployees((prev) => prev.filter((e) => e.employeeId !== id));
      toast.success("Petugas berhasil dihapus!");
    } catch (error: any) {
      console.error("Error deleting employee:", error);
      toast.error(error.response?.data?.message || "Gagal menghapus petugas");
    }
  };

  const resetForm = () => {
    setFormData({
      email: "",
      password: "",
      name: "",
      phone: "",
      address: "",
      gender: 0,
      birthdate: "",
      hire_date: "",
      salary: 0,
    });
    setEditingId(null);
  };

  const filteredEmployees = employees.filter(
    (e) =>
      e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.user?.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <FullPageLoader message="Memuat data petugas..." />;

  return (
    <div className="p-6">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />

      <div className="max-w-5xl mx-auto space-y-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">
              {editingId ? "Edit Petugas" : "Input Petugas Baru"}
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
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
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password {editingId ? "(Opsional)" : "*"}
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
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Alamat *
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-black"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gender *
              </label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-black"
              >
                <option value={0}>Laki-laki</option>
                <option value={1}>Perempuan</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tanggal Lahir *
              </label>
              <input
                type="date"
                name="birthdate"
                value={formData.birthdate}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-black"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tanggal Masuk *
              </label>
              <input
                type="date"
                name="hire_date"
                value={formData.hire_date}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-black"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gaji *
              </label>
              <input
                type="number"
                name="salary"
                value={formData.salary}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-black"
                required
              />
            </div>

            <div className="md:col-span-2 flex justify-end space-x-3 pt-4 border-t border-gray-200">
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
                {editingId ? "Update Petugas" : "Simpan Petugas"}
              </button>
            </div>
          </form>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-800">Daftar Petugas</h2>
            <input
              type="text"
              placeholder="Cari petugas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-black"
            />
          </div>

          <div className="overflow-x-auto p-6">
            {employees.length === 0 ? (
              <p className="text-gray-500">Belum ada petugas.</p>
            ) : (
              <table className="w-full table-auto border-collapse border border-gray-300 text-left">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 px-4 py-2">No</th>
                    <th className="border border-gray-300 px-4 py-2">Nama</th>
                    <th className="border border-gray-300 px-4 py-2">Email</th>
                    <th className="border border-gray-300 px-4 py-2">No. HP</th>
                    <th className="border border-gray-300 px-4 py-2">Alamat</th>
                    <th className="border border-gray-300 px-4 py-2">Gender</th>
                    <th className="border border-gray-300 px-4 py-2">Gaji</th>
                    <th className="border border-gray-300 px-4 py-2 text-center">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEmployees.map((employee, index) => (
                    <tr key={employee.employeeId} className="hover:bg-gray-50">
                      <td className="border border-gray-300 px-4 py-2">
                        {(pagination?.from || 0) + index}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {employee.name}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {employee.user?.email || "-"}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {employee.phone}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {employee.address}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {employee.gender === 0 ? "Laki-laki" : "Perempuan"}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        Rp {employee.salary.toLocaleString("id-ID")}
                      </td>
                      <td className="border border-gray-300 px-4 py-2 text-center space-x-2">
                        <button
                          onClick={() => handleEdit(employee)}
                          className="px-3 py-1 bg-yellow-400 text-white rounded hover:bg-yellow-500"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(employee.employeeId)}
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

export default InputPetugas;
