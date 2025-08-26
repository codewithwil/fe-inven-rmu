/*
API ENDPOINTS DOCUMENTATION FOR BACKEND IMPLEMENTATION:

1. GET /api/return-items
   Description: Get return items with filters
   Headers: Authorization: Bearer {token}
   Query Parameters:
   - returnType: "expired" | "consignment" | "all" (optional)
   - startDate: string (YYYY-MM-DD) (optional)
   - endDate: string (YYYY-MM-DD) (optional)
   - supplierId: string (optional)
   - status: "pending" | "processed" | "cancelled" | "all" (optional)
   - barcode: string (optional)
   - page: number (optional, default: 1)
   - limit: number (optional, default: 50)
   
   Response: {
     data: [
       {
         id: string,
         returnId: string,
         barcode: string,
         itemName: string,
         quantity: number,
         unitPrice: number,
         totalValue: number,
         returnType: "expired" | "consignment",
         status: "pending" | "processed" | "cancelled",
         reason: string,
         supplierName: string,
         supplierId: string,
         expiryDate: string (for expired items),
         consignmentEndDate: string (for consignment items),
         returnDate: string,
         processedDate: string | null,
         processedBy: string | null,
         notes: string,
         createdAt: string,
         updatedAt: string
       }
     ],
     pagination: {
       currentPage: number,
       totalPages: number,
       totalItems: number,
       itemsPerPage: number
     },
     summary: {
       totalValue: number,
       expiredValue: number,
       consignmentValue: number,
       pendingCount: number,
       processedCount: number
     }
   }

2. GET /api/suppliers
   Description: Get list of suppliers for filter dropdown
   Headers: Authorization: Bearer {token}
   Response: {
     data: [
       {
         id: string,
         name: string,
         code: string
       }
     ]
   }

3. POST /api/return-items/export
   Description: Export return items to CSV
   Headers: Authorization: Bearer {token}, Content-Type: application/json
   Body: {
     returnType: string,
     startDate: string,
     endDate: string,
     supplierId: string,
     status: string,
     barcode: string
   }
   Response: CSV file download

ERROR RESPONSES:
- 400: Invalid filter parameters
- 401: Unauthorized (invalid token)
- 500: Server error
*/

"use client";

import React, { useState, useEffect } from "react";
import { Calendar, Download, Filter, Search, RefreshCw, FileText, Package, AlertTriangle } from "lucide-react";

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

interface Pagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
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
  const [pagination, setPagination] = useState<Pagination>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 50,
  });
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

  useEffect(() => {
    loadSuppliers();
    loadReturnItems();
  }, []);

  const loadSuppliers = async () => {
    try {
      const response = await fetch("/api/suppliers", {
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

  const loadReturnItems = async (page: number = 1) => {
    setIsLoading(true);

    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: pagination.itemsPerPage.toString(),
      });

      // Add filters to query params
      if (filters.returnType !== "all") queryParams.append("returnType", filters.returnType);
      if (filters.startDate) queryParams.append("startDate", filters.startDate);
      if (filters.endDate) queryParams.append("endDate", filters.endDate);
      if (filters.supplierId) queryParams.append("supplierId", filters.supplierId);
      if (filters.status !== "all") queryParams.append("status", filters.status);
      if (filters.barcode) queryParams.append("barcode", filters.barcode);

      const response = await fetch(`/api/return-items?${queryParams.toString()}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("admin_token")}`,
        },
      });

      if (response.ok) {
        const result = await response.json();
        setReturnItems(result.data || []);
        setPagination(result.pagination || pagination);
        setSummary(result.summary || summary);
      } else {
        const error = await response.json();
        alert(`Error: ${error.message || "Gagal memuat data"}`);
      }
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
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
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
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
    loadReturnItems(1);
  };

  const handlePageChange = (page: number) => {
    loadReturnItems(page);
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
      };

      const response = await fetch("/api/return-items/export", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("admin_token")}`,
        },
        body: JSON.stringify(exportData),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.style.display = "none";
        a.href = url;
        a.download = `laporan-barang-return-${new Date().getTime()}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        alert("File CSV berhasil didownload!");
      } else {
        const error = await response.json();
        alert(`Error: ${error.message || "Gagal mengekspor data"}`);
      }
    } catch (error) {
      console.error("Error exporting data:", error);
      alert("Terjadi kesalahan saat mengekspor data");
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

    return <span className={`px-2 py-1 text-xs font-medium rounded-full border ${statusStyles[status as keyof typeof statusStyles]}`}>{statusLabels[status as keyof typeof statusLabels]}</span>;
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

    return <span className={`px-2 py-1 text-xs font-medium rounded-full border ${typeStyles[type as keyof typeof typeStyles]}`}>{typeLabels[type as keyof typeof typeLabels]}</span>;
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
          {pagination.totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Menampilkan {(pagination.currentPage - 1) * pagination.itemsPerPage + 1} - {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} dari {pagination.totalItems} data
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={pagination.currentPage <= 1}
                    className="px-3 py-2 text-sm text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>

                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    const page = pagination.currentPage - 2 + i;
                    if (page < 1 || page > pagination.totalPages) return null;
                    return (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={`px-3 py-2 text-sm border rounded-md ${page === pagination.currentPage ? "bg-blue-500 text-white border-blue-500" : "text-gray-700 border-gray-300 hover:bg-gray-50"}`}
                      >
                        {page}
                      </button>
                    );
                  })}

                  <button
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={pagination.currentPage >= pagination.totalPages}
                    className="px-3 py-2 text-sm text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LaporanBarangReturnPage;
