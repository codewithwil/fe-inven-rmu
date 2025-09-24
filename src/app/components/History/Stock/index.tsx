"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import FullPageLoader from "../../Preloader/FullPageLoader";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Pagination from "../../Pagination/Pagination"; 
import { useDebounce } from "../../../hooks/useDebounce";

interface Product {
  productId: number;
  barcode: string;
  name: string;
  sku: string;
  unit: string;
}

interface Stock {
  stockMovId: number;
  quantity: string;
  unit: string;
  unit_cost: string;
  type: number;
  created_at: string;
  product: Product;
}

interface StockPagination {
  current_page: number;
  data: Stock[];
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}

const AllHistoryStock: React.FC = () => {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [pagination, setPagination] = useState<StockPagination | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 500); 

  const API_URL = process.env.NEXT_PUBLIC_API_URL + "/history/stock";
  const token = localStorage.getItem("admin_token");

  const fetchStocks = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}?page=${page}&search=${debouncedSearch}`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { page, search },
      });

    const stockData: any = res.data.data.stock;
      setStocks(stockData.data);
      setPagination(null);
      if (debouncedSearch) {
        if (stockData.data.length > 0) {
          toast.success(`Ditemukan ${stockData.data.length} hasil untuk "${debouncedSearch}"`);
        } else {
          toast.info(`Tidak ada hasil untuk "${debouncedSearch}"`);
        }
      }
    } catch (error) {
      console.error("Error fetching stock:", error);
      toast.error("Gagal memuat riwayat stok");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStocks();
  }, [page]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1); // reset ke page 1 saat cari
    fetchStocks();
  };

  if (loading) return <FullPageLoader message="Memuat data stok..." />;

  const getTypeLabel = (type: number) => {
    switch (type) {
      case 1:
        return "IN";
      case 2:
        return "OUT";
      default:
        return "UNKNOWN";
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
                Riwayat Pergerakan Stok
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Semua aktivitas masuk/keluar stok produk
              </p>
            </div>
            {/* Search box */}
            <form onSubmit={handleSearch} className="flex items-center space-x-2">
              <input
                type="text"
                placeholder="Cari produk/sku..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:outline-none focus:ring focus:ring-blue-200"
              />
              <button
                type="submit"
                className="bg-blue-600 text-white text-sm px-4 py-1 rounded-lg hover:bg-blue-700"
              >
                Cari
              </button>
            </form>
          </div>

          <div className="overflow-x-auto p-6">
            {stocks.length === 0 ? (
              <p className="text-gray-500">Belum ada riwayat stok.</p>
            ) : (
              <table className="w-full table-auto border-collapse border border-gray-300 text-left text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 px-4 py-2">No</th>
                    <th className="border border-gray-300 px-4 py-2">Barcode Produk</th>
                    <th className="border border-gray-300 px-4 py-2">Produk</th>
                    <th className="border border-gray-300 px-4 py-2">SKU</th>
                    <th className="border border-gray-300 px-4 py-2">Qty</th>
                    <th className="border border-gray-300 px-4 py-2">Satuan</th>
                    <th className="border border-gray-300 px-4 py-2">Harga</th>
                    <th className="border border-gray-300 px-4 py-2">Tipe</th>
                    <th className="border border-gray-300 px-4 py-2">Tanggal</th>
                  </tr>
                </thead>
                <tbody>
                  {stocks.map((s, index) => (
                    <tr key={s.stockMovId} className="hover:bg-gray-50">
                      <td className="border border-gray-300 px-4 py-2">
                        {pagination?.from ? pagination.from + index : index + 1}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {s.product?.barcode || "-"}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {s.product?.name || "-"}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {s.product?.sku || "-"}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {s.quantity}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {s.unit}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        Rp {parseFloat(s.unit_cost).toLocaleString("id-ID")}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        <span
                          className={`px-2 py-1 rounded text-xs font-semibold ${
                            s.type === 1
                              ? "bg-green-100 text-green-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {getTypeLabel(s.type)}
                        </span>
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {new Date(s.created_at).toLocaleString("id-ID")}
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

export default AllHistoryStock;
