"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import FullPageLoader from "../Preloader/FullPageLoader";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Pagination from "../Pagination/Pagination";
import { useDebounce } from "../../hooks/useDebounce";

type Supplier = {
  supplierId: number;
  supplierUniqueId?: string;
  suppliercode?: string;
  name: string;
  contactPerson: string;
  phone: string | number;
  email?: string;
  address: string;
  city?: string;
  posCode?: string | number;
  type: number;
  taxNumber?: string | number;
  paymentTerms: number;
  bankName?: string;
  bankNo?: string | number;
  notes?: string;
  status: number;
};

type SupplierFormData = {
  // Step 1
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  type: number;
  paymentTerms: number;
  // Step 2
  address: string;
  city: string;
  posCode: string;
  taxNumber: string;
  // Step 3
  bankName: string;
  bankNo: string;
  notes: string;
  status: number;
};

const defaultForm: SupplierFormData = {
  name: "",
  contactPerson: "",
  phone: "",
  email: "",
  type: 1,
  paymentTerms: 1,
  address: "",
  city: "",
  posCode: "",
  taxNumber: "",
  bankName: "",
  bankNo: "",
  notes: "",
  status: 1,
};

const InputSupplierStep: React.FC = () => {
  const [formData, setFormData] = useState<SupplierFormData>(defaultForm);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [page, setPage] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const debouncedSearch = useDebounce(searchTerm, 500);

  const [step, setStep] = useState<number>(1);
  const API_URL = process.env.NEXT_PUBLIC_API_URL + "/resources/supplier";
  const token   = localStorage.getItem("admin_token");

  const fetchSuppliers = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}?page=${page}&search=${debouncedSearch}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = res.data?.data?.supplier;
      if (data && Array.isArray(data)) {
        setSuppliers(data);
        setPagination(null);
      } else if (data && data.data) {
        setSuppliers(data.data || []);
        setPagination(data);
      } else {
        setSuppliers([]);
        setPagination(null);
      }
    } catch (err) {
      console.error("Error fetching suppliers:", err);
      toast.error("Gagal memuat supplier");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, [page, debouncedSearch]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    if (name === "type" || name === "paymentTerms" || name === "status") {
      setFormData((p) => ({ ...p, [name]: Number(value) }));
    } else {
      setFormData((p) => ({ ...p, [name]: value }));
    }
  };

  const validateStep = (s: number) => {
    if (s === 1) {
      if (!formData.name.trim()) {
        toast.error("Nama supplier wajib diisi.");
        return false;
      }
      if (!formData.contactPerson.trim()) {
        toast.error("Contact person wajib diisi.");
        return false;
      }
      if (!formData.phone.trim()) {
        toast.error("Nomor telepon wajib diisi.");
        return false;
      }
      return true;
    }
    if (s === 2) {
      if (!formData.address.trim()) {
        toast.error("Alamat wajib diisi.");
        return false;
      }
      return true;
    }
    return true;
  };

  const goNext = () => {
    if (validateStep(step)) {
      setStep((s) => Math.min(3, s + 1));
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const goPrev = () => {
    setStep((s) => Math.max(1, s - 1));
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!validateStep(1) || !validateStep(2)) {
      return;
    }

    const payload: any = {
      name: formData.name,
      contactPerson: formData.contactPerson,
      phone: formData.phone,
      email: formData.email || null,
      address: formData.address,
      city: formData.city || null,
      posCode: formData.posCode || null,
      type: Number(formData.type),
      taxNumber: formData.taxNumber || null,
      paymentTerms: Number(formData.paymentTerms),
      bankName: formData.bankName || null,
      bankNo: formData.bankNo || null,
      notes: formData.notes || null,
      status: Number(formData.status),
    };

    try {
      if (editingId) {
        const res = await axios.post(`${API_URL}/update/${editingId}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const updatedSupplier = res.data.data.supplier;
        setSuppliers((prev) =>
          prev.map((sup) =>
            sup.supplierId === editingId ? updatedSupplier : sup
          )
        );

        toast.success("Supplier berhasil diperbarui!");
      } else {
        const res = await axios.post(`${API_URL}/store`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const newSupplier = res.data.data.supplier;
        setSuppliers((prev) => [...prev, newSupplier]);

        toast.success("Supplier berhasil ditambahkan!");
      }
      resetForm();
      setStep(1);
    } catch (err: any) {
      console.error("Error saving supplier:", err);
      toast.error(err?.response?.data?.message || "Gagal menyimpan supplier");
    } finally {
      setLoading(false);
    }
  };


  const handleEdit = (sup: Supplier) => {
    setFormData({
      name: sup.name || "",
      contactPerson: sup.contactPerson || "",
      phone: String(sup.phone || ""),
      email: sup.email || "",
      type: sup.type ?? 1,
      paymentTerms: sup.paymentTerms ?? 1,
      address: sup.address || "",
      city: sup.city || "",
      posCode: String(sup.posCode ?? ""),
      taxNumber: String(sup.taxNumber ?? ""),
      bankName: sup.bankName || "",
      bankNo: String(sup.bankNo ?? ""),
      notes: sup.notes || "",
      status: sup.status ?? 1,
    });
    setEditingId(sup.supplierId);
    setStep(1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Yakin ingin menghapus supplier ini?")) return;
    try {
      await axios.post(`${API_URL}/delete/${id}`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setSuppliers((prev) => prev.filter((s) => s.supplierId !== id));

      toast.success("Supplier dihapus");
    } catch (err) {
      console.error("Delete error:", err);
      toast.error("Gagal menghapus supplier");
    }
  };


  const resetForm = () => {
    setFormData(defaultForm);
    setEditingId(null);
    setStep(1);
  };

  const filteredSuppliers = suppliers.filter((s) => {
    const q = searchTerm.toLowerCase();
    return (
      s.name?.toLowerCase().includes(q) ||
      String(s.supplierUniqueId || "").toLowerCase().includes(q) ||
      s.contactPerson?.toLowerCase().includes(q) ||
      String(s.phone || "").toLowerCase().includes(q)
    );
  });

  if (loading) return <FullPageLoader message="Memuat supplier..." />;

  return (
    <div className="p-6">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">
              {editingId ? `Edit Supplier ${formData.name}` : "Input Supplier Baru (Step Form)"}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {editingId ? "Ubah data supplier yang dipilih" : "Isi data supplier langkah per langkah"}
            </p>
          </div>

          <div className="px-6 pt-6 pb-4">
            <div className="flex items-center space-x-4">
              <div className={`flex items-center px-3 py-1 rounded-full ${step === 1 ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-700"}`}>
                Step 1
              </div>
              <div className={`flex items-center px-3 py-1 rounded-full ${step === 2 ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-700"}`}>
                Step 2
              </div>
              <div className={`flex items-center px-3 py-1 rounded-full ${step === 3 ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-700"}`}>
                Step 3
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 border-t border-gray-100">
            {step === 1 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nama Supplier *</label>
                  <input name="name" value={formData.name} onChange={handleInputChange}  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nama Penanggung Jawab *</label>
                  <input name="contactPerson" value={formData.contactPerson} onChange={handleInputChange}  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nomor Telepon *</label>
                  <input name="phone" value={formData.phone} onChange={handleInputChange}  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input name="email" value={formData.email} onChange={handleInputChange}  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Supplier</label>
                  <select name="type" value={formData.type} onChange={handleInputChange}  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black">
                    <option value={1}>Distributor</option>
                    <option value={2}>Manufaktur</option>
                    <option value={3}>Wholesaler</option>
                    <option value={4}>Supplier Lokal</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Pembayaran</label>
                  <select name="paymentTerms" value={formData.paymentTerms} onChange={handleInputChange}  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black">
                    <option value={1}>Cash</option>
                    <option value={2}>Net 7</option>
                    <option value={3}>Net 14</option>
                    <option value={4}>Net 30</option>
                    <option value={5}>Net 45</option>
                    <option value={6}>Net 60</option>
                  </select>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Alamat *</label>
                  <textarea name="address" value={formData.address} onChange={handleInputChange} rows={3}  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kota</label>
                  <input name="city" value={formData.city} onChange={handleInputChange}  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kode Pos</label>
                  <input name="posCode" value={formData.posCode} onChange={handleInputChange}  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">NPWP</label>
                  <input name="taxNumber" value={formData.taxNumber} onChange={handleInputChange}  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black" />
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nama Bank</label>
                  <input name="bankName" value={formData.bankName} onChange={handleInputChange}  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nomor Rekening</label>
                  <input name="bankNo" value={formData.bankNo} onChange={handleInputChange}  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black" />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Catatan</label>
                  <textarea name="notes" value={formData.notes} onChange={handleInputChange} rows={3}  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black" />
                </div>
              </div>
            )}

            <div className="mt-6 flex justify-between">
              <div>
                {step > 1 && (
                  <button type="button" onClick={goPrev} className="px-4 py-2 border rounded mr-2">
                    Kembali
                  </button>
                )}
              </div>

              <div>
                {step < 3 && (
                  <button type="button" onClick={goNext} className="px-4 py-2 bg-blue-500 text-white rounded">
                    Berikutnya
                  </button>
                )}

                {step === 3 && (
                  <>
                    <button type="button" onClick={resetForm} className="px-4 py-2 border rounded mr-2">
                      Reset
                    </button>
                    <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded">
                      {editingId ? "Update Supplier" : "Simpan Supplier"}
                    </button>
                  </>
                )}
              </div>
            </div>
          </form>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Daftar Supplier</h3>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari supplier..."
              className="px-3 py-2 border rounded text-black"
            />
          </div>

          <div className="overflow-x-auto">
            {suppliers.length === 0 ? (
              <p className="text-gray-500">Belum ada supplier.</p>
            ) : (
              <table className="w-full table-auto border-collapse text-sm">
                <thead>
                  <tr className="bg-gray-100 text-gray-700">
                    <th className="border px-3 py-2">No</th>
                    <th className="border px-3 py-2">Kode</th>
                    <th className="border px-3 py-2">Nama</th>
                    <th className="border px-3 py-2">Contact</th>
                    <th className="border px-3 py-2">Phone</th>
                    <th className="border px-3 py-2">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredSuppliers.map((sup, idx) => (
                    <tr key={sup.supplierId} className="hover:bg-gray-50 text-gray-700">
                      <td className="border px-3 py-2">{(pagination?.from || 0) + idx + 1}</td>
                      <td className="border px-3 py-2">{sup.supplierUniqueId || sup.suppliercode}</td>
                      <td className="border px-3 py-2">{sup.name}</td>
                      <td className="border px-3 py-2">{sup.contactPerson}</td>
                      <td className="border px-3 py-2">{sup.phone}</td>
                      <td className="border px-3 py-2 text-center space-x-2">
                        <button onClick={() => handleEdit(sup)} className="px-3 py-1 bg-yellow-400 text-white rounded">
                          Edit
                        </button>
                        <button onClick={() => handleDelete(sup.supplierId)} className="px-3 py-1 bg-red-500 text-white rounded">
                          Hapus
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {pagination && (
            <div className="mt-4">
              <Pagination currentPage={pagination.current_page} lastPage={pagination.last_page} onPageChange={(p) => setPage(p)} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InputSupplierStep;
