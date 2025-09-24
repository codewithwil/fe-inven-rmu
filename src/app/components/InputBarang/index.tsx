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
}

interface Supplier {
  supplierId: number;
  name: string;
}

interface FileData {
  filesId: number;
  path: string;
  original_name: string;
  mime_type: string;
}

interface Product {
  productId: number;
  name: string;
  barcode: string;
  invoiceNo?: string;
  expireDate?: string;
  type: 1 | 2 | 3;
  typePurchase: 1 | 2;
  purchase_price: number;
  selling_price: number;
  qty: number;
  min_stock?: number;
  max_stock?: number;
  description?: string;
  unit: string;
  photo_url?: string;   
  file?: FileData;      
  category?: Category;
  supplier?: Supplier;
}


interface FormData {
  category_id: number | "";
  supplier_id: number | "";
  barcode: string;
  invoiceNo: string;
  expireDate: string;
  name: string;
  type: 1 | 2 | 3;
  purchase_price: number;
  selling_price: number;
  typePurchase: 1 | 2;
  unit: "pcs" | "gram" | "kg" | "ml";
  description: string;
  photo: File | null;
  qty: number;
  min_stock: number;
  max_stock: number;
}

const InputBarang: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    category_id: "",
    supplier_id: "",
    barcode: "",
    invoiceNo: "",
    expireDate: "",
    name: "",
    type: 1,
    purchase_price: 0,
    selling_price: 0,
    typePurchase: 1,
    unit: "pcs",
    description: "",
    photo: null,
    qty: 0,
    min_stock: 0,
    max_stock: 0,
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 500);

  const API_URL     = process.env.NEXT_PUBLIC_API_URL;
  const STORAGE_URL = process.env.NEXT_PUBLIC_API_STORAGE;
  const token       = localStorage.getItem("admin_token");

  useEffect(() => {
    const fetchMaster = async () => {
      try {
        const catRes = await axios.get(`${API_URL}/resources/category?all=true`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCategories(catRes.data.data.category || []);

        const supRes = await axios.get(`${API_URL}/resources/supplier?all=true`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setSuppliers(supRes.data.data.supplier || []);
      } catch (err) {
        console.error("Gagal load kategori/supplier", err);
        toast.error("Gagal memuat kategori/supplier");
      }
    };
    fetchMaster();
  }, []);

  // load barang
  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `${API_URL}/resources/product?page=${page}&search=${debouncedSearch}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setProducts(res.data.data.product.data || []);
      setPagination(res.data.data.product);
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Gagal memuat barang");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [page, debouncedSearch]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        ["purchase_price", "selling_price", "qty", "min_stock", "max_stock"].includes(name)
          ? Number(value)
          : value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFormData((prev) => ({ ...prev, photo: e.target.files![0] }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const payload = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== null && value !== "") {
          payload.append(key, value as any);
        }
      });

      if (editingId) {
        const res = await axios.post(
          `${API_URL}/resources/product/update/${editingId}`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );
        const updated = res.data.data.product;
         setProducts((prev) =>
          prev.map((p) => (p.productId === editingId ? updated : p))
        );

        toast.success("Barang berhasil diperbarui!");
      } else {
        const res = await axios.post(`${API_URL}/resources/product/store`, payload, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        });
        const newProduct = res.data.data.product;
        setProducts((prev) => [newProduct, ...prev]);
        toast.success("Barang berhasil ditambahkan!");
      }

      resetForm();
      fetchProducts();
    } catch (error: any) {
      console.error("Error submit barang:", error);
      toast.error(error.response?.data?.message || "Gagal simpan barang");
    }
  };

  const handleEdit = (prod: Product) => {
    setFormData({
      category_id: prod.category?.categoryId || "",
      supplier_id: prod.supplier?.supplierId || "",
      barcode: prod.barcode || "",
      invoiceNo: (prod as any).invoiceNo || "", 
      expireDate: (prod as any).expireDate || "", 
      name: prod.name || "",
      type: (prod as any).type || 1,
      purchase_price: prod.purchase_price || 0,
      selling_price: prod.selling_price || 0,
      typePurchase: (prod as any).typePurchase || 1,
      unit: (prod.unit as any) || "pcs",
      description: (prod as any).description || "",
      photo: null, 
      qty: prod.qty || 0,
      min_stock: (prod as any).min_stock || 0,
      max_stock: (prod as any).max_stock || 0,
    });
    setEditingId(prod.productId);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Yakin ingin menghapus barang ini?")) return;
    try {
      await axios.post(
        `${API_URL}/resources/product/delete/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setProducts((prev) => prev.filter((p) => p.productId !== id));
      toast.success("Barang berhasil dihapus!");
    } catch (error: any) {
      console.error("Error deleting product:", error);
      toast.error(error.response?.data?.message || "Gagal menghapus barang");
    }
  };

  const resetForm = () => {
    setFormData({
      category_id: "",
      supplier_id: "",
      barcode: "",
      invoiceNo: "",
      expireDate: "",
      name: "",
      type: 1,
      purchase_price: 0,
      selling_price: 0,
      typePurchase: 1,
      unit: "pcs",
      description: "",
      photo: null,
      qty: 0,
      min_stock: 0,
      max_stock: 0,
    });
    setEditingId(null);
  };

  // Tambahin handler
const handleBarcodeBlur = async () => {
  if (!formData.barcode) return;

  try {
    const res = await axios.get(
      `${API_URL}/resources/product?search=${formData.barcode}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const found = res.data.data.product.data.find(
      (p: Product) => p.barcode === formData.barcode
    );

    if (found) {
      // Prefill data form dari produk lama
      setFormData((prev) => ({
        ...prev,
        category_id: found.category_id || "",
        supplier_id: found.supplier_id || "",
        name: found.name || "",
        invoiceNo: found.invoiceNo || "",
        expireDate: found.expireDate || "",
        type: (found as any).type || 1,
        purchase_price: Number(found.purchase_price) || 0,
        selling_price: Number(found.selling_price) || 0,
        typePurchase: (found as any).typePurchase || 1,
        unit: (found.unit as any) || "pcs",
        description: (found.description as any) || "",
        qty: found.qty || 0,
        min_stock: (found.min_stock as any) || 0,
        max_stock: (found.max_stock as any) || 0,
        // photo tetap null karena user bisa upload ulang
      }));
      toast.info("Data produk sebelumnya berhasil dimuat!");
    }
  } catch (err) {
    console.error("Gagal cek barcode:", err);
  }
};


  if (loading) return <FullPageLoader message="Memuat barang..." />;

  return (
    <div className="p-6">
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar />

      <div className="max-w-6xl mx-auto space-y-6">
        {/* Form Barang */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">
              {editingId ? "Edit Barang" : "Input Barang Baru"}
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Kategori & Supplier */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label>Kategori *</label>
                <select
                  name="category_id"
                  value={formData.category_id}
                  onChange={handleInputChange}
                  className="w-full border rounded p-2"
                  required
                >
                  <option value="">Pilih Kategori</option>
                  {categories.map((c) => (
                    <option key={c.categoryId} value={c.categoryId}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label>Supplier *</label>
                <select
                  name="supplier_id"
                  value={formData.supplier_id}
                  onChange={handleInputChange}
                  className="w-full border rounded p-2"
                  required
                >
                  <option value="">Pilih Supplier</option>
                  {suppliers.map((s) => (
                    <option key={s.supplierId} value={s.supplierId}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Nama & Barcode */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label>Nama Barang *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full border rounded p-2"
                  required
                />
              </div>
              <div>
                <label>Barcode *</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    name="barcode"
                    value={formData.barcode}
                    onChange={handleInputChange}
                    className="w-full border rounded p-2"
                    required
                  />
                  <button
                    type="button"
                    onClick={handleBarcodeBlur}
                    className="px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                  >
                    Cari
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label>Jenis Barang *</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="w-full border rounded p-2"
                >
                  <option value={1}>Tunai</option>
                  <option value={2}>Beli Putus</option>
                  <option value={3}>Konsinyasi</option>
                </select>
              </div>

              <div>
                <label>Jenis Pembelian *</label>
                <select
                  name="typePurchase"
                  value={formData.typePurchase}
                  onChange={handleInputChange}
                  className="w-full border rounded p-2"
                >
                  <option value={1}>Cash</option>
                  <option value={2}>Hutang</option>
                </select>
              </div>
            </div>

            {/* Tanggal Expire & Invoice */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label>Tanggal Expire *</label>
                <input
                  type="date"
                  name="expireDate"
                  value={formData.expireDate}
                  onChange={handleInputChange}
                  className="w-full border rounded p-2"
                  required
                />
              </div>
              <div>
                <label>Invoice No *</label>
                <input
                  type="text"
                  name="invoiceNo"
                  value={formData.invoiceNo}
                  onChange={handleInputChange}
                  className="w-full border rounded p-2"
                  required
                />
              </div>
            </div>

            {/* Stok Minimum & Maksimum */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label>Stok Minimum</label>
                <input
                  type="number"
                  name="min_stock"
                  value={formData.min_stock}
                  onChange={handleInputChange}
                  className="w-full border rounded p-2"
                />
              </div>
              <div>
                <label>Stok Maksimum</label>
                <input
                  type="number"
                  name="max_stock"
                  value={formData.max_stock}
                  onChange={handleInputChange}
                  className="w-full border rounded p-2"
                />
              </div>
            </div>

            {/* Deskripsi */}
            <div>
              <label>Deskripsi</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="w-full border rounded p-2"
              />
            </div>

            {/* Harga */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label>Harga Beli *</label>
                <input
                  type="number"
                  name="purchase_price"
                  value={formData.purchase_price}
                  onChange={handleInputChange}
                  className="w-full border rounded p-2"
                  required
                />
              </div>
              <div>
                <label>Harga Jual *</label>
                <input
                  type="number"
                  name="selling_price"
                  value={formData.selling_price}
                  onChange={handleInputChange}
                  className="w-full border rounded p-2"
                  required
                />
              </div>
            </div>

            {/* Qty & Satuan */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label>Qty *</label>
                <input
                  type="number"
                  name="qty"
                  value={formData.qty}
                  onChange={handleInputChange}
                  className="w-full border rounded p-2"
                />
              </div>
              <div>
                <label>Satuan *</label>
                <select
                  name="unit"
                  value={formData.unit}
                  onChange={handleInputChange}
                  className="w-full border rounded p-2"
                >
                  <option value="pcs">PCS</option>
                  <option value="gram">Gram</option>
                  <option value="kg">Kilogram</option>
                  <option value="ml">Mililiter</option>
                </select>
              </div>
            </div>

            {/* Foto */}
            <div>
              <label>Foto</label>
              <input type="file" accept="image/*" onChange={handleFileChange} />
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 border rounded"
              >
                Reset
              </button>
              <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded">
                {editingId ? "Update Barang" : "Simpan Barang"}
              </button>
            </div>
          </form>
        </div>

        {/* Tabel Barang */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-800">Daftar Barang</h2>
            <input
              type="text"
              placeholder="Cari barang..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-black"
            />
          </div>

          <div className="overflow-x-auto p-6">
            {products.length === 0 ? (
              <p className="text-gray-500">Belum ada barang.</p>
            ) : (
              <table className="w-full border border-gray-300">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="px-3 py-2 border">No</th>
                    <th className="px-3 py-2 border">Foto</th>
                    <th className="px-3 py-2 border">Barcode</th>
                    <th className="px-3 py-2 border">Nama</th>
                    <th className="px-3 py-2 border">Kategori</th>
                    <th className="px-3 py-2 border">Supplier</th>
                    <th className="px-3 py-2 border">Harga Beli</th>
                    <th className="px-3 py-2 border">Harga Jual</th>
                    <th className="px-3 py-2 border">Stok</th>
                    <th className="px-3 py-2 border text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((prod, index) => (
                    <tr key={prod.productId} className="hover:bg-gray-50">
                      <td className="px-3 py-2 border">{(pagination.from || 1) + index}</td>
                      <td className="px-3 py-2 border">
                        {prod.file && (
                      <img
                        src={`${STORAGE_URL}/${prod.file.path}`}
                        alt={prod.name}
                        className="h-32 w-32 object-cover rounded"
                      />

                        )}
                      </td>
                      <td className="px-3 py-2 border">{prod.barcode}</td>
                      <td className="px-3 py-2 border">{prod.name}</td>
                      <td className="px-3 py-2 border">{prod.category?.name}</td>
                      <td className="px-3 py-2 border">{prod.supplier?.name}</td>
                      <td className="px-3 py-2 border">{prod.purchase_price}</td>
                      <td className="px-3 py-2 border">{prod.selling_price}</td>
                      <td className="px-3 py-2 border">{prod.qty}</td>
                      <td className="px-3 py-2 border text-center space-x-2">
                        <button
                          onClick={() => handleEdit(prod)}
                          className="px-3 py-1 bg-yellow-400 text-white rounded hover:bg-yellow-500"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(prod.productId)}
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

export default InputBarang;
