"use client";

import axios from "axios";
import React, { useState, useEffect } from "react";
import Pagination from "../Pagination/Pagination";
import { useDebounce } from "../../hooks/useDebounce";
import {
  Calendar,
  Download,
  Filter,
  Search,
  RefreshCw,
  FileText,
  Package,
  AlertTriangle,
} from "lucide-react";

interface ReturnItem {
  id: string;
  returnId: string;
  barcode: string;
  itemName: string;
  quantity: number;
  unitPrice: number;
  totalValue: number;
  returnType: "expired" | "consignment";
  status: "pending" | "processed" | "cancelled";
  reason: string;
  supplierName: string;
  supplierId: string;
  expiryDate?: string;
  consignmentEndDate?: string;
  returnDate: string;
  processedDate?: string;
  processedBy?: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

interface Supplier {
  id: string;
  name: string;
  code: string;
}

interface ReportSummary {
  totalValue: number;
  expiredValue: number;
  consignmentValue: number;
  pendingCount: number;
  processedCount: number;
}


interface Filters {
  returnType: "expired" | "consignment" | "all";
  startDate: string;
  endDate: string;
  supplierId: string;
  status: "pending" | "processed" | "cancelled" | "all";
  barcode: string;
}

const LaporanBarangReturnPage: React.FC = () => {
  const [returnItems, setReturnItems] = useState<ReturnItem[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [summary, setSummary] = useState<ReportSummary>({
    totalValue: 0,
    expiredValue: 0,
    consignmentValue: 0,
    pendingCount: 0,
    processedCount: 0,
  });
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<any>(null);
  const [filters, setFilters] = useState<Filters>({
    returnType: "all",
    startDate: "",
    endDate: "",
    supplierId: "",
    status: "all",
    barcode: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const debouncedSearch = useDebounce(searchTerm, 500);
  const API_URL = process.env.NEXT_PUBLIC_API_URL + "/transactions/returnProduct/invoice";
  const token = localStorage.getItem("admin_token");
  useEffect(() => {
    loadSuppliers();
    loadReturnItems();
  }, []);

  const loadSuppliers = async () => {
    try {
      const response = await fetch("http://localhost:8000/api/resources/supplier", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("admin_token")}`,
        },
      });

      if (response.ok) {
        const result = await response.json();
        setSuppliers(result.data || []);
      }
    } catch (error) {
      console.error("Error loading suppliers:", error);
    }
  };

  // mapping API → ReturnItem
  const mapApiToReturnItem = (apiData: any): ReturnItem => {
    return {
      id: String(apiData.returnId),
      returnId: apiData.returnCode,
      barcode: apiData.product?.barcode || "-",
      itemName: apiData.product?.name || "-",
      quantity: parseFloat(apiData.qty),
      unitPrice: parseFloat(apiData.priceReturn),
      totalValue: parseFloat(apiData.payments?.[0]?.amount || "0"),
      returnType: apiData.typeReturn === 1 ? "consignment" : "expired",
      status:
        apiData.statusReturn === 1
          ? "pending"
          : apiData.statusReturn === 3
          ? "processed"
          : "cancelled",
      reason: apiData.notes || "",
      supplierName: apiData.product?.supplier?.name || "-",
      supplierId: String(apiData.product?.supplier?.supplierId || ""),
      expiryDate: apiData.product?.expireDate || undefined,
      consignmentEndDate: apiData.product?.consignmentEndDate || undefined,
      returnDate: apiData.returnDate,
      processedDate: apiData.processedDate || undefined,
      processedBy: apiData.processedBy || undefined,
      notes: apiData.notes || "",
      createdAt: apiData.created_at,
      updatedAt: apiData.updated_at,
    };
  };

const loadReturnItems = async (page: number = 1) => {
  setIsLoading(true);
  const limit = pagination?.itemsPerPage || 10; 
  try {
    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      search: debouncedSearch,
    });

    if (filters.returnType !== "all")
      queryParams.append("returnType", filters.returnType);
    if (filters.startDate) queryParams.append("startDate", filters.startDate);
    if (filters.endDate) queryParams.append("endDate", filters.endDate);
    if (filters.supplierId) queryParams.append("supplierId", filters.supplierId);
    if (filters.status !== "all") queryParams.append("status", filters.status);
    if (filters.barcode) queryParams.append("barcode", filters.barcode);

    const response = await axios.get(
      `${API_URL}?${queryParams.toString()}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("admin_token")}`,
        },
      }
    );

    const result = response.data;

    // 🔑 sesuaikan dengan struktur JSON
    const apiData = result.data?.returns?.original?.data;
    const apiItems = apiData?.data || [];
    const mapped = apiItems.map(mapApiToReturnItem);

    setReturnItems(mapped);
    setPagination(response.data.data.return);

    setReturnItems(mapped);
    setPagination(result.data?.returns?.original); // perbaiki sesuai struktur API

    // 🔥 hitung summary manual
    const summaryData = mapped.reduce(
      (acc: ReportSummary, item: ReturnItem) => {
        acc.totalValue += item.totalValue;

        if (item.returnType === "expired") {
          acc.expiredValue += item.totalValue;
        } else if (item.returnType === "consignment") {
          acc.consignmentValue += item.totalValue;
        }

        if (item.status === "pending") {
          acc.pendingCount += 1;
        } else if (item.status === "processed") {
          acc.processedCount += 1;
        }

        return acc;
      },
      {
        totalValue: 0,
        expiredValue: 0,
        consignmentValue: 0,
        pendingCount: 0,
        processedCount: 0,
      } as ReportSummary
    );



    setSummary(summaryData);
      } catch (error) {
        console.error("Error loading return items:", error);
        alert("Terjadi kesalahan saat memuat data");
      } finally {
        setIsLoading(false);
      }
    };


  const handleFilterChange = (key: keyof Filters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    setPagination(null);
    loadReturnItems(1);
  };

  const resetFilters = () => {
    setFilters({
      returnType: "all",
      startDate: "",
      endDate: "",
      supplierId: "",
      status: "all",
      barcode: "",
    });
   setPagination(null);
    loadReturnItems(1);
  };


  const exportToCSV = async () => {
    setIsExporting(true);

    try {
      const exportData = {
        returnType: filters.returnType,
        startDate: filters.startDate,
        endDate: filters.endDate,
        supplierId: filters.supplierId,
        status: filters.status,
        barcode: filters.barcode,
        search: debouncedSearch,
      };

      const res = await axios.post(
        `${API_URL}/export`,
        exportData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          responseType: "blob", 
        }
      );

      const blob = new Blob([res.data], { type: "text/csv" });
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `laporan-barang-return-${new Date().getTime()}.csv`;
      document.body.appendChild(a);
      a.click();

      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      alert("File CSV berhasil didownload!");
    } catch (error: any) {
      console.error("Error exporting data:", error);
      alert(
        `Terjadi kesalahan saat mengekspor data: ${
          error.response?.data?.message || error.message
        }`
      );
    } finally {
      setIsExporting(false);
    }
  };


  const getStatusBadge = (status: string) => {
    const statusStyles = {
      pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
      processed: "bg-green-100 text-green-800 border-green-200",
      cancelled: "bg-red-100 text-red-800 border-red-200",
    };

    const statusLabels = {
      pending: "Pending",
      processed: "Diproses",
      cancelled: "Dibatalkan",
    };

    return (
      <span
        className={`px-2 py-1 text-xs font-medium rounded-full border ${
          statusStyles[status as keyof typeof statusStyles]
        }`}
      >
        {statusLabels[status as keyof typeof statusLabels]}
      </span>
    );
  };

  const getReturnTypeBadge = (type: string) => {
    const typeStyles = {
      expired: "bg-red-100 text-red-800 border-red-200",
      consignment: "bg-blue-100 text-blue-800 border-blue-200",
    };

    const typeLabels = {
      expired: "Kadaluarsa",
      consignment: "Konsinyasi",
    };

    return (
      <span
        className={`px-2 py-1 text-xs font-medium rounded-full border ${
          typeStyles[type as keyof typeof typeStyles]
        }`}
      >
        {typeLabels[type as keyof typeof typeLabels]}
      </span>
    );
  };

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold text-gray-800">Laporan Barang Return</h2>
                <p className="text-sm text-gray-600 mt-1">Kadaluarsa dan Konsinyasi</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center gap-2"
                >
                  <Filter className="w-4 h-4" />
                  Filter
                </button>
                <button
                  onClick={() => loadReturnItems(pagination.currentPage)}
                  disabled={isLoading}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center gap-2 disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
                  Refresh
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
          {showFilters && (
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Return Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Return</label>
                  <select
                    value={filters.returnType}
                    onChange={(e) => handleFilterChange("returnType", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black text-sm"
                  >
                    <option value="all">Semua</option>
                    <option value="expired">Kadaluarsa</option>
                    <option value="consignment">Konsinyasi</option>
                  </select>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={filters.status}
                    onChange={(e) => handleFilterChange("status", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black text-sm"
                  >
                    <option value="all">Semua</option>
                    <option value="pending">Pending</option>
                    <option value="processed">Diproses</option>
                    <option value="cancelled">Dibatalkan</option>
                  </select>
                </div>

                {/* Supplier */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Supplier</label>
                  <select
                    value={filters.supplierId}
                    onChange={(e) => handleFilterChange("supplierId", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black text-sm"
                  >
                    <option value="">Semua Supplier</option>
                    {suppliers.map((supplier) => (
                      <option key={supplier.id} value={supplier.id}>
                        {supplier.name} ({supplier.code})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Start Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Mulai</label>
                  <input
                    type="date"
                    value={filters.startDate}
                    onChange={(e) => handleFilterChange("startDate", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black text-sm"
                  />
                </div>

                {/* End Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal Akhir</label>
                  <input
                    type="date"
                    value={filters.endDate}
                    onChange={(e) => handleFilterChange("endDate", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black text-sm"
                  />
                </div>

                {/* Barcode */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Barcode</label>
                  <input
                    type="text"
                    value={filters.barcode}
                    onChange={(e) => handleFilterChange("barcode", e.target.value)}
                    placeholder="Cari berdasarkan barcode"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black text-sm"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-4">
                <button onClick={applyFilters} className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 flex items-center gap-2">
                  <Search className="w-4 h-4" />
                  Terapkan Filter
                </button>
                <button onClick={resetFilters} className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2">
                  Reset
                </button>
              </div>
            </div>
          )}

          {/* Summary Cards */}
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex items-center">
                  <FileText className="w-8 h-8 text-blue-500" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">Total Nilai</p>
                    <p className="text-lg font-semibold text-black">Rp {summary.totalValue.toLocaleString("id-ID")}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex items-center">
                  <AlertTriangle className="w-8 h-8 text-red-500" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">Kadaluarsa</p>
                    <p className="text-lg font-semibold text-black">Rp {summary.expiredValue.toLocaleString("id-ID")}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex items-center">
                  <Package className="w-8 h-8 text-blue-500" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">Konsinyasi</p>
                    <p className="text-lg font-semibold text-black">Rp {summary.consignmentValue.toLocaleString("id-ID")}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex items-center">
                  <Calendar className="w-8 h-8 text-yellow-500" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">Pending</p>
                    <p className="text-lg font-semibold text-black">{summary.pendingCount}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex items-center">
                  <Download className="w-8 h-8 text-green-500" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">Diproses</p>
                    <p className="text-lg font-semibold text-black">{summary.processedCount}</p>
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
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Return ID</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Barang</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Jenis</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Qty</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nilai</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Supplier</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {isLoading ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                      <div className="flex items-center justify-center">
                        <RefreshCw className="w-5 h-5 animate-spin mr-2" />
                        Memuat data...
                      </div>
                    </td>
                  </tr>
                ) : returnItems.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                      Tidak ada data return barang
                    </td>
                  </tr>
                ) : (
                  returnItems.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium text-black">{item.returnId}</div>
                        <div className="text-xs text-gray-500">{item.barcode}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium text-black">{item.itemName}</div>
                        <div className="text-xs text-gray-500">{item.reason}</div>
                      </td>
                      <td className="px-4 py-3">{getReturnTypeBadge(item.returnType)}</td>
                      <td className="px-4 py-3 text-sm text-black">{item.quantity}</td>
                      <td className="px-4 py-3 text-sm text-black">Rp {item.totalValue.toLocaleString("id-ID")}</td>
                      <td className="px-4 py-3 text-sm text-black">{item.supplierName}</td>
                      <td className="px-4 py-3">{getStatusBadge(item.status)}</td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-black">{new Date(item.returnDate).toLocaleDateString("id-ID")}</div>
                        {item.returnType === "expired" && item.expiryDate && <div className="text-xs text-red-500">Exp: {new Date(item.expiryDate).toLocaleDateString("id-ID")}</div>}
                        {item.returnType === "consignment" && item.consignmentEndDate && <div className="text-xs text-blue-500">Akhir: {new Date(item.consignmentEndDate).toLocaleDateString("id-ID")}</div>}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

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
  );
};

export default LaporanBarangReturnPage;
