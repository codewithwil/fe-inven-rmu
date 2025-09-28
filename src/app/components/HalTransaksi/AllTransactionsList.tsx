"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import Pagination from "../Pagination/Pagination";
import { useDebounce } from "../../hooks/useDebounce";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

interface Member {
  memberId: number;
  memberCode: string;
  name: string;
  phone: string;
}

interface Product {
  productId: number;
  name: string;
  barcode: string;
  sku: string;
}

interface OutItem {
  outItemId: number;
  qty: number;
  price: string;
  total: string;
  product: Product;
}

export interface OutProduct {
  outProductId: number;
  member_id: number;
  purchaseDate: string;
  purchaseType: number;
  subtotal: string;
  created_at: string;
  member: Member;
  items: OutItem[];
}

interface PaginationMeta {
  current_page: number;
  data: OutProduct[];
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}

interface Props {
  onEdit: (trx: OutProduct) => void;
}

const AllTransactionsList: React.FC<Props> = ({ onEdit }) => {
  const [outProducts, setOutProducts] = useState<OutProduct[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 500);

  const API_URL = process.env.NEXT_PUBLIC_API_URL + "/transactions/outProduct";
  const token = localStorage.getItem("admin_token");

  const fetchOutProducts = async () => {
    try {
      const res = await axios.get(
        `${API_URL}?page=${page}&search=${debouncedSearch}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const data: PaginationMeta = res.data.data.returns;
      setOutProducts(data.data);
      setPagination(data);
    } catch (error) {
      console.error("Error fetching:", error);
    }
  };

  useEffect(() => {
    fetchOutProducts();
  }, [page, debouncedSearch]);

  const getPurchaseType = (type: number) => {
    switch (type) {
      case 1: return "CASH";
      case 2: return "TRANSFER";
      case 3: return "HUTANG";
      default: return "LAINNYA";
    }
  };

  const handlePrint = async (out: OutProduct) => {

    const url =
      out.purchaseType === 3
        ? `${process.env.NEXT_PUBLIC_API_URL}/transactions/outProduct/printInvoice/${out.outProductId}`
        : `${process.env.NEXT_PUBLIC_API_URL}/transactions/outProduct/printReceipt/${out.outProductId}`;

    try {
      const res = await fetch(url, {
        method: "GET",
        headers: {
          Accept: "application/pdf",
          Authorization: `Bearer ${localStorage.getItem("admin_token")}`,
        },
      });

      if (!res.ok) {
        throw new Error("Gagal download PDF");
      }

      const blob = await res.blob();
      const fileURL = window.URL.createObjectURL(blob);

      window.open(fileURL, "_blank");

    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan saat mengambil PDF");
    }
  };

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: "Yakin hapus?",
      text: "Transaksi ini akan dihapus permanen.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Ya, hapus",
      cancelButtonText: "Batal",
    });

    if (!result.isConfirmed) return;

    try {
      await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/transactions/outProduct/delete/${id}`,
        {},
        { headers: { Authorization: `Bearer ${localStorage.getItem("admin_token")}` } }
      );

      Swal.fire({
        icon: "success",
        title: "Berhasil",
        text: "Transaksi berhasil dihapus",
        timer: 2000,
        showConfirmButton: false,
      });

      fetchOutProducts();
    } catch (error) {
      console.error("Gagal hapus transaksi:", error);
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: "Terjadi kesalahan saat menghapus transaksi",
      });
    }
  };

  return (
    <div className="p-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">Daftar Transaksi Produk</h2>
          <input
            type="text"
            placeholder="Cari member/produk..."
            value={searchTerm}
            onChange={(e) => { setPage(1); setSearchTerm(e.target.value); }}
            className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:ring focus:ring-blue-200"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left border-collapse">
            <thead>
              <tr className="bg-gray-100 text-gray-700">
                <th className="px-4 py-3 border">No</th>
                <th className="px-4 py-3 border">Member</th>
                <th className="px-4 py-3 border">Produk</th>
                <th className="px-4 py-3 border">Subtotal</th>
                <th className="px-4 py-3 border">Jenis</th>
                <th className="px-4 py-3 border">Tanggal</th>
                <th className="px-4 py-3 border text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {outProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center text-gray-500 py-6">
                    Belum ada data transaksi.
                  </td>
                </tr>
              ) : (
                outProducts.map((out, index) => (
                  <tr
                    key={out.outProductId}
                    className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                  >
                    <td className="px-4 py-3 border text-gray-700">
                      {pagination?.from ? pagination.from + index : index + 1}
                    </td>
                    <td className="px-4 py-3 border">
                      <div className="font-medium text-gray-800">{out.member?.name}</div>
                      <div className="text-xs text-gray-500">{out.member?.memberCode}</div>
                    </td>
                    <td className="px-4 py-3 border">
                      {out.items.map(item => (
                        <div key={item.outItemId} className="text-gray-700">
                          {item.product?.name} ({item.qty} x Rp{item.price})
                        </div>
                      ))}
                    </td>
                    <td className="px-4 py-3 border font-semibold text-gray-800">
                      Rp {out.subtotal}
                    </td>
                    <td className="px-4 py-3 border">{getPurchaseType(out.purchaseType)}</td>
                    <td className="px-4 py-3 border">
                      {new Date(out.purchaseDate).toLocaleString("id-ID")}
                    </td>
                    <td className="px-4 py-3 border text-center space-x-2">
                      <button
                        onClick={() => onEdit(out)}
                        className="px-3 py-1 text-sm bg-yellow-500 hover:bg-yellow-600 text-white rounded"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(out.outProductId)}
                        className="px-3 py-1 text-sm bg-red-500 hover:bg-red-600 text-white rounded"
                      >
                        Hapus
                      </button>
                      <button
                        onClick={() => handlePrint(out)}
                        className="px-3 py-1 text-sm bg-blue-500 hover:bg-blue-600 text-white rounded"
                      >
                        Print
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {pagination && (
            <div className="p-4">
              <Pagination
                currentPage={pagination.current_page}
                lastPage={pagination.last_page}
                onPageChange={(num) => setPage(num)}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AllTransactionsList;
