"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Calendar, Download, Search, RefreshCw, AlertTriangle } from "lucide-react";

// Types
interface SupplierDebtSimple {
  id: string;
  purchaseDate: string;
  invoiceNumber: string;
  itemName: string;
  quantity: number;
  unit: string;
  paymentStatus: "unpaid" | "partial" | "overdue" | "paid";
  paymentDeadline: string;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  daysOverdue: number;
  supplierName: string;
}

interface Filters {
  month: string;
  paymentStatus: "all" | "unpaid" | "partial" | "overdue" | "paid";
  search: string;
}

// Constants
const PAYMENT_STATUS = {
  unpaid: {
    label: "Belum Dibayar",
    color: "bg-red-100 text-red-800 border-red-200",
  },
  partial: {
    label: "Dibayar Sebagian",
    color: "bg-yellow-100 text-yellow-800 border-yellow-200",
  },
  overdue: {
    label: "Jatuh Tempo",
    color: "bg-orange-100 text-orange-800 border-orange-200",
  },
  paid: {
    label: "Lunas",
    color: "bg-green-100 text-green-800 border-green-200",
  },
} as const;

// Utility functions
const formatCurrency = (amount: number): string => `Rp ${amount.toLocaleString("id-ID")}`;

const calculateDaysOverdue = (deadline: string): number => {
  const due = new Date(deadline);
  const today = new Date();
  const diffTime = today.getTime() - due.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
};

const generateDemoData = (): SupplierDebtSimple[] => [
  {
    id: "1",
    purchaseDate: "2024-07-15",
    invoiceNumber: "INV-2024-001",
    itemName: "Bahan Baku Kain Cotton",
    quantity: 500,
    unit: "meter",
    paymentStatus: "overdue",
    paymentDeadline: "2024-08-15",
    totalAmount: 25000000,
    paidAmount: 0,
    remainingAmount: 25000000,
    daysOverdue: 13,
    supplierName: "PT Bahan Baku Utama",
  },
  {
    id: "2",
    purchaseDate: "2024-08-01",
    invoiceNumber: "INV-2024-002",
    itemName: "Mesin Jahit Industrial",
    quantity: 2,
    unit: "unit",
    paymentStatus: "partial",
    paymentDeadline: "2024-09-01",
    totalAmount: 15000000,
    paidAmount: 7500000,
    remainingAmount: 7500000,
    daysOverdue: 0,
    supplierName: "CV Peralatan Industri",
  },
  {
    id: "3",
    purchaseDate: "2024-08-10",
    invoiceNumber: "INV-2024-003",
    itemName: "Benang Polyester",
    quantity: 100,
    unit: "kg",
    paymentStatus: "unpaid",
    paymentDeadline: "2024-09-10",
    totalAmount: 8000000,
    paidAmount: 0,
    remainingAmount: 8000000,
    daysOverdue: 0,
    supplierName: "Toko Benang Jaya",
  },
  {
    id: "4",
    purchaseDate: "2024-07-20",
    invoiceNumber: "INV-2024-004",
    itemName: "Kancing Plastik",
    quantity: 10000,
    unit: "pcs",
    paymentStatus: "paid",
    paymentDeadline: "2024-08-20",
    totalAmount: 2500000,
    paidAmount: 2500000,
    remainingAmount: 0,
    daysOverdue: 0,
    supplierName: "UD Aksesoris Lengkap",
  },
  {
    id: "5",
    purchaseDate: "2024-06-30",
    invoiceNumber: "INV-2024-005",
    itemName: "Resleting Nilon",
    quantity: 2000,
    unit: "pcs",
    paymentStatus: "overdue",
    paymentDeadline: "2024-07-30",
    totalAmount: 5000000,
    paidAmount: 2000000,
    remainingAmount: 3000000,
    daysOverdue: 29,
    supplierName: "CV Resleting Prima",
  },
  {
    id: "6",
    purchaseDate: "2024-08-05",
    invoiceNumber: "INV-2024-006",
    itemName: "Pewarna Tekstil",
    quantity: 50,
    unit: "liter",
    paymentStatus: "unpaid",
    paymentDeadline: "2024-09-05",
    totalAmount: 12000000,
    paidAmount: 0,
    remainingAmount: 12000000,
    daysOverdue: 0,
    supplierName: "PT Kimia Warna Indah",
  },
];

// Custom hooks
const useApiCall = () => {
  const makeRequest = useCallback(async (url: string, options?: RequestInit) => {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          Authorization: `Bearer ${localStorage.getItem("admin_token")}`,
          ...options?.headers,
        },
      });

      if (response.ok) {
        const contentType = response.headers.get("content-type");
        return contentType?.includes("application/json") ? await response.json() : null;
      }
      return null;
    } catch (error) {
      console.error("API request failed:", error);
      return null;
    }
  }, []);

  return { makeRequest };
};

// Components
const PaymentStatusBadge: React.FC<{ status: string }> = React.memo(({ status }) => {
  const statusInfo = PAYMENT_STATUS[status.toLowerCase() as keyof typeof PAYMENT_STATUS];

  if (!statusInfo) {
    return <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full border bg-gray-100 text-gray-800 border-gray-200">{status}</span>;
  }

  return <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full border ${statusInfo.color}`}>{statusInfo.label}</span>;
});

// Main component
const LaporanHutangSupplierPage: React.FC = () => {
  const { makeRequest } = useApiCall();

  // State
  const [debts, setDebts] = useState<SupplierDebtSimple[]>([]);
  const [filteredDebts, setFilteredDebts] = useState<SupplierDebtSimple[]>([]);
  const [filters, setFilters] = useState<Filters>({
    month: new Date().toISOString().substring(0, 7),
    paymentStatus: "all",
    search: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [apiStatus, setApiStatus] = useState("API Not Available - Demo Mode");

  // API functions
  const loadSupplierDebts = useCallback(async () => {
    setIsLoading(true);

    try {
      const params = new URLSearchParams({
        month: filters.month,
        ...(filters.paymentStatus !== "all" && { paymentStatus: filters.paymentStatus }),
      });

      const result = await makeRequest(`/api/supplier-debts?${params.toString()}`);

      if (result?.data) {
        setDebts(result.data);
        setApiStatus("API Connected");
      } else {
        setDebts(generateDemoData());
        setApiStatus("API Not Available - Demo Mode");
      }
    } catch (error) {
      console.error("Error loading supplier debts:", error);
      setDebts(generateDemoData());
      setApiStatus("API Not Available - Demo Mode");
    } finally {
      setIsLoading(false);
    }
  }, [filters, makeRequest]);

  // Filter debts based on current filters
  useEffect(() => {
    let filtered = [...debts];

    // Filter by payment status
    if (filters.paymentStatus !== "all") {
      filtered = filtered.filter((debt) => debt.paymentStatus === filters.paymentStatus);
    }

    // Filter by search term
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter((debt) => debt.itemName.toLowerCase().includes(searchLower) || debt.invoiceNumber.toLowerCase().includes(searchLower) || debt.supplierName.toLowerCase().includes(searchLower));
    }

    setFilteredDebts(filtered);
  }, [debts, filters]);

  // Event handlers
  const handleFilterChange = useCallback((key: keyof Filters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const exportToCSV = useCallback(async () => {
    setIsExporting(true);

    try {
      const response = await fetch(`/api/supplier-debts/export?month=${filters.month}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("admin_token")}`,
        },
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.style.display = "none";
        a.href = url;
        a.download = `laporan-hutang-supplier-${filters.month}-${Date.now()}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        alert("File CSV berhasil didownload!");
      } else {
        alert("Fitur export CSV tidak tersedia karena API belum terpasang");
      }
    } catch (error) {
      console.error("Error exporting data:", error);
      alert("Fitur export CSV tidak tersedia karena API belum terpasang");
    } finally {
      setIsExporting(false);
    }
  }, [filters.month]);

  // Effects
  useEffect(() => {
    loadSupplierDebts();
  }, [loadSupplierDebts]);

  // Calculate summary
  const totalDebt = filteredDebts.reduce((sum, debt) => sum + debt.remainingAmount, 0);
  const overdueDebts = filteredDebts.filter((debt) => debt.paymentStatus === "overdue");
  const overdueAmount = overdueDebts.reduce((sum, debt) => sum + debt.remainingAmount, 0);

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-semibold text-gray-800">Laporan Hutang Supplier</h2>
                <p className="text-sm text-gray-600 mt-1">Daftar hutang pembelian barang kepada supplier</p>
                <p className={`text-xs mt-1 ${apiStatus.includes("Not Available") ? "text-orange-600" : "text-green-600"}`}>Status: {apiStatus}</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => loadSupplierDebts()}
                  disabled={isLoading}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center gap-2 disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
                  Muat Ulang
                </button>
                <button
                  onClick={exportToCSV}
                  disabled={isExporting}
                  className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 flex items-center gap-2 disabled:opacity-50"
                >
                  <Download className="w-4 h-4" />
                  {isExporting ? "Mengekspor..." : "Export CSV"}
                </button>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bulan</label>
                <input
                  type="month"
                  value={filters.month}
                  onChange={(e) => handleFilterChange("month", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status Pembayaran</label>
                <select
                  value={filters.paymentStatus}
                  onChange={(e) => handleFilterChange("paymentStatus", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black text-sm"
                >
                  <option value="all">Semua Status</option>
                  <option value="unpaid">Belum Dibayar</option>
                  <option value="partial">Dibayar Sebagian</option>
                  <option value="overdue">Jatuh Tempo</option>
                  <option value="paid">Lunas</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pencarian</label>
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                  placeholder="Cari nama barang, invoice, atau supplier..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black text-sm"
                />
              </div>

              <div className="flex items-end">
                <div className="grid grid-cols-2 gap-2 w-full">
                  <div className="text-center p-2 bg-white rounded border">
                    <div className="text-xs text-gray-500">Total Hutang</div>
                    <div className="text-sm font-semibold text-red-600">{formatCurrency(totalDebt)}</div>
                  </div>
                  <div className="text-center p-2 bg-white rounded border">
                    <div className="text-xs text-gray-500">Jatuh Tempo</div>
                    <div className="text-sm font-semibold text-orange-600">{overdueDebts.length} item</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal Pembelian</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Invoice</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama Barang</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Jumlah Unit</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status Pembayaran</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Deadline Pembayaran</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sisa Hutang</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {isLoading ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                      <div className="flex items-center justify-center">
                        <RefreshCw className="w-5 h-5 animate-spin mr-2" />
                        Memuat data...
                      </div>
                    </td>
                  </tr>
                ) : filteredDebts.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                      <div className="space-y-2">
                        <Calendar className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                        <p>Tidak ada data hutang supplier untuk filter yang dipilih</p>
                        {apiStatus.includes("Not Available") && <p className="text-xs text-orange-600">API backend belum tersedia - menampilkan data demo</p>}
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredDebts.map((debt) => (
                    <tr key={debt.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium text-black">{new Date(debt.purchaseDate).toLocaleDateString("id-ID")}</div>
                        <div className="text-xs text-gray-500">{debt.supplierName}</div>
                      </td>

                      <td className="px-4 py-3">
                        <div className="text-sm font-medium text-black">{debt.invoiceNumber}</div>
                      </td>

                      <td className="px-4 py-3">
                        <div className="text-sm font-medium text-black">{debt.itemName}</div>
                      </td>

                      <td className="px-4 py-3">
                        <div className="text-sm font-medium text-black">
                          {debt.quantity.toLocaleString("id-ID")} {debt.unit}
                        </div>
                        <div className="text-xs text-gray-500">Total: {formatCurrency(debt.totalAmount)}</div>
                      </td>

                      <td className="px-4 py-3">
                        <PaymentStatusBadge status={debt.paymentStatus} />
                        {debt.paidAmount > 0 && debt.paymentStatus === "partial" && <div className="text-xs text-green-600 mt-1">Dibayar: {formatCurrency(debt.paidAmount)}</div>}
                      </td>

                      <td className="px-4 py-3">
                        <div className="text-sm font-medium text-black">{new Date(debt.paymentDeadline).toLocaleDateString("id-ID")}</div>
                        {debt.daysOverdue > 0 && (
                          <div className="text-xs text-red-600 flex items-center mt-1">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            {debt.daysOverdue} hari terlambat
                          </div>
                        )}
                      </td>

                      <td className="px-4 py-3">
                        <div className={`text-sm font-semibold ${debt.remainingAmount > 0 ? "text-red-600" : "text-green-600"}`}>{formatCurrency(debt.remainingAmount)}</div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Footer Summary */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div className="flex justify-between items-center text-sm">
              <div className="text-gray-600">
                Menampilkan {filteredDebts.length} dari {debts.length} item hutang
              </div>
              <div className="flex gap-4">
                <span className="text-gray-600">
                  Total Hutang: <strong className="text-red-600">{formatCurrency(totalDebt)}</strong>
                </span>
                <span className="text-gray-600">
                  Jatuh Tempo: <strong className="text-orange-600">{formatCurrency(overdueAmount)}</strong>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LaporanHutangSupplierPage;
