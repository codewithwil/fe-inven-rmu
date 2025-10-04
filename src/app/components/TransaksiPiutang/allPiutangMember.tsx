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

interface Payment {
  payAmountId: number;
  amount: string;
  date: string;
  paymentType: number;
}

export interface Debt {
  debtId: number;
  partner_id: number;
  amount: string;
  paid: string;
  status: number;
  created_at: string;
  updated_at: string;
  total_paid: string;
  partner: Member;
  payments: Payment[];
}

interface PaginationMeta {
  current_page: number;
  data: Debt[];
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}

interface Props {
  onEdit: (trx: Debt) => void;
}

const AllPiutangMember: React.FC<Props> = ({ onEdit }) => {
  const [debts, setDebts] = useState<Debt[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 500);

  const API_URL = process.env.NEXT_PUBLIC_API_URL + "/transactions/receivableMember";
  const token = localStorage.getItem("admin_token");

  const fetchDebts = async () => {
    try {
      const res = await axios.get(
        `${API_URL}?page=${page}&search=${debouncedSearch}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // res.data.data.debts adalah objek paginasi
      const paginationData = res.data.data.debts;
      setDebts(paginationData.data); // array Debt
      setPagination({
        current_page: paginationData.current_page,
        last_page: paginationData.last_page,
        per_page: paginationData.per_page,
        total: paginationData.total,
        from: paginationData.from,
        to: paginationData.to,
        data: paginationData.data,
      });
    } catch (error) {
      console.error("Error fetching:", error);
    }
  };


  useEffect(() => {
    fetchDebts();
  }, [page, debouncedSearch]);

  const getStatus = (status: number) => {
    return status === 1 ? "LUNAS" : "BELUM LUNAS";
  };

  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
      title: "Yakin hapus?",
      text: "Piutang ini akan dihapus permanen.",
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
        `${API_URL}/delete/${id}`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Swal.fire({
        icon: "success",
        title: "Berhasil",
        text: "Piutang berhasil dihapus",
        timer: 2000,
        showConfirmButton: false,
      });

      fetchDebts();
    } catch (error) {
      console.error("Gagal hapus piutang:", error);
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: "Terjadi kesalahan saat menghapus piutang",
      });
    }
  };

  return (
    <div className="p-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">Daftar Piutang Member</h2>
          <input
            type="text"
            placeholder="Cari member..."
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
                <th className="px-4 py-3 border">Total Hutang</th>
                <th className="px-4 py-3 border">Terbayar</th>
                <th className="px-4 py-3 border">Status</th>
                <th className="px-4 py-3 border">Tanggal</th>
                <th className="px-4 py-3 border text-center">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {debts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center text-gray-500 py-6">
                    Belum ada data piutang.
                  </td>
                </tr>
              ) : (
                debts.map((debt, index) => (
                  <tr
                    key={debt.debtId}
                    className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                  >
                    <td className="px-4 py-3 border text-gray-700">
                      {pagination?.from ? pagination.from + index : index + 1}
                    </td>
                    <td className="px-4 py-3 border">
                      <div className="font-medium text-gray-800">{debt.partner?.name}</div>
                      <div className="text-xs text-gray-500">{debt.partner?.memberCode}</div>
                    </td>
                    <td className="px-4 py-3 border text-gray-700">Rp {debt.amount}</td>
                    <td className="px-4 py-3 border text-gray-700">Rp {debt.paid}</td>
                    <td className="px-4 py-3 border text-gray-700">{getStatus(debt.status)}</td>
                    <td className="px-4 py-3 border text-gray-700">
                      {new Date(debt.created_at).toLocaleDateString("id-ID")}
                    </td>
                    <td className="px-4 py-3 border text-center space-x-2">
                      <button
                        onClick={() => onEdit(debt)}
                        className="px-3 py-1 text-sm bg-yellow-500 hover:bg-yellow-600 text-white rounded"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(debt.debtId)}
                        className="px-3 py-1 text-sm bg-red-500 hover:bg-red-600 text-white rounded"
                      >
                        Hapus
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

export default AllPiutangMember;
