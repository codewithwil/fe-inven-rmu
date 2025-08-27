/*
API ENDPOINTS DOCUMENTATION FOR BACKEND IMPLEMENTATION:

1. GET /api/member-transactions
   Description: Get transaction data grouped by member unique-id with regional filtering
   Headers: Authorization: Bearer {token}
   Query Parameters:
   - wilayah: string (optional) - Filter by region code (BDG, KBG, etc.)
   - startDate: string (YYYY-MM-DD) (optional)
   - endDate: string (YYYY-MM-DD) (optional)
   - uniqueId: string (optional) - Search specific member ID
   - transactionType: "all" | "purchase" | "payment" | "refund" (optional, default: "all")
   - minAmount: number (optional)
   - maxAmount: number (optional)
   - sortBy: "uniqueId" | "totalTransactions" | "totalAmount" | "lastTransaction" (optional, default: "totalTransactions")
   - sortOrder: "asc" | "desc" (optional, default: "desc")
   - page: number (optional, default: 1)
   - pageSize: number (optional, default: 50)
   
   Response: {
     data: [
       {
         uniqueId: string,
         memberName: string,
         wilayah: string,
         wilayahName: string,
         phoneNumber: string,
         totalTransactions: number,
         totalAmount: number,
         totalPurchaseAmount: number,
         totalPaymentAmount: number,
         totalRefundAmount: number,
         firstTransactionDate: string,
         lastTransactionDate: string,
         averageTransactionAmount: number,
         monthlyTransactionCount: number,
         transactions: [
           {
             id: string,
             transactionDate: string,
             transactionType: string,
             amount: number,
             description: string,
             status: string
           }
         ]
       }
     ],
     pagination: {
       currentPage: number,
       totalPages: number,
       totalItems: number,
       itemsPerPage: number
     },
     summary: {
       totalMembers: number,
       totalTransactions: number,
       totalAmount: number,
       averageTransactionPerMember: number,
       regionalDistribution: {
         [wilayah: string]: {
           memberCount: number,
           transactionCount: number,
           totalAmount: number
         }
       }
     }
   }

2. GET /api/member-transactions/export
   Description: Export member transaction data to CSV
   Headers: Authorization: Bearer {token}
   Query Parameters: Same as above
   Response: CSV file download

3. GET /api/regions
   Description: Get list of available regions
   Headers: Authorization: Bearer {token}
   Response: {
     data: [
       {
         code: string,
         name: string,
         memberCount: number
       }
     ]
   }

ERROR RESPONSES:
- 400: Invalid filter parameters
- 401: Unauthorized (invalid token)
- 500: Server error
*/

"use client";

import React, { useState, useEffect } from "react";
import { Calendar, Download, Filter, Search, RefreshCw, Users, TrendingUp, DollarSign, MapPin, FileText, Eye, EyeOff, Clock, CreditCard } from "lucide-react";

interface Transaction {
  id: string;
  transactionDate: string;
  transactionType: string;
  amount: number;
  description: string;
  status: string;
}

interface MemberTransaction {
  uniqueId: string;
  memberName: string;
  wilayah: string;
  wilayahName: string;
  phoneNumber: string;
  totalTransactions: number;
  totalAmount: number;
  totalPurchaseAmount: number;
  totalPaymentAmount: number;
  totalRefundAmount: number;
  firstTransactionDate: string;
  lastTransactionDate: string;
  averageTransactionAmount: number;
  monthlyTransactionCount: number;
  transactions: Transaction[];
}

interface Region {
  code: string;
  name: string;
  memberCount: number;
}

interface ReportSummary {
  totalMembers: number;
  totalTransactions: number;
  totalAmount: number;
  averageTransactionPerMember: number;
  regionalDistribution: {
    [wilayah: string]: {
      memberCount: number;
      transactionCount: number;
      totalAmount: number;
    };
  };
}

interface Pagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

interface Filters {
  wilayah: string;
  startDate: string;
  endDate: string;
  uniqueId: string;
  transactionType: "all" | "purchase" | "payment" | "refund";
  minAmount: string;
  maxAmount: string;
  sortBy: "uniqueId" | "totalTransactions" | "totalAmount" | "lastTransaction";
  sortOrder: "asc" | "desc";
}

const LaporanTransaksiUniqueIdPage: React.FC = () => {
  const [memberTransactions, setMemberTransactions] = useState<MemberTransaction[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [summary, setSummary] = useState<ReportSummary>({
    totalMembers: 0,
    totalTransactions: 0,
    totalAmount: 0,
    averageTransactionPerMember: 0,
    regionalDistribution: {},
  });
  const [pagination, setPagination] = useState<Pagination>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 50,
  });
  const [filters, setFilters] = useState<Filters>({
    wilayah: "",
    startDate: "",
    endDate: "",
    uniqueId: "",
    transactionType: "all",
    minAmount: "",
    maxAmount: "",
    sortBy: "totalTransactions",
    sortOrder: "desc",
  });
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [apiStatus, setApiStatus] = useState<string>("");

  useEffect(() => {
    loadRegions();
    loadMemberTransactions();
  }, []);

  const loadRegions = async () => {
    try {
      const response = await fetch("/api/regions", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("admin_token")}`,
        },
      });

      if (response.ok) {
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const result = await response.json();
          setRegions(result.data || []);
          setApiStatus("API Connected");
        } else {
          console.log("Regions API not available, using demo data");
          setRegions([
            { code: "BDG", name: "Bandung", memberCount: 0 },
            { code: "KBG", name: "Kabupaten Bandung", memberCount: 0 },
            { code: "KBB", name: "Kabupaten Bandung Barat", memberCount: 0 },
            { code: "KBT", name: "Kabupaten Bandung Timur", memberCount: 0 },
            { code: "CMH", name: "Cimahi", memberCount: 0 },
            { code: "GRT", name: "Garut", memberCount: 0 },
            { code: "SMD", name: "Sumedang", memberCount: 0 },
            { code: "TSM", name: "Tasikmalaya", memberCount: 0 },
          ]);
          setApiStatus("API Not Available - Demo Mode");
        }
      } else {
        console.log("Regions API endpoint not found");
        setRegions([
          { code: "BDG", name: "Bandung", memberCount: 0 },
          { code: "KBG", name: "Kabupaten Bandung", memberCount: 0 },
          { code: "KBB", name: "Kabupaten Bandung Barat", memberCount: 0 },
          { code: "KBT", name: "Kabupaten Bandung Timur", memberCount: 0 },
          { code: "CMH", name: "Cimahi", memberCount: 0 },
          { code: "GRT", name: "Garut", memberCount: 0 },
          { code: "SMD", name: "Sumedang", memberCount: 0 },
          { code: "TSM", name: "Tasikmalaya", memberCount: 0 },
        ]);
        setApiStatus("API Not Available - Demo Mode");
      }
    } catch (error) {
      console.error("Error loading regions:", error);
      setRegions([
        { code: "BDG", name: "Bandung", memberCount: 0 },
        { code: "KBG", name: "Kabupaten Bandung", memberCount: 0 },
        { code: "KBB", name: "Kabupaten Bandung Barat", memberCount: 0 },
        { code: "KBT", name: "Kabupaten Bandung Timur", memberCount: 0 },
        { code: "CMH", name: "Cimahi", memberCount: 0 },
        { code: "GRT", name: "Garut", memberCount: 0 },
        { code: "SMD", name: "Sumedang", memberCount: 0 },
        { code: "TSM", name: "Tasikmalaya", memberCount: 0 },
      ]);
      setApiStatus("API Not Available - Demo Mode");
    }
  };

  const loadMemberTransactions = async (page: number = 1) => {
    setIsLoading(true);

    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        pageSize: pagination.itemsPerPage.toString(),
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
      });

      // Add filters to query params
      if (filters.wilayah) queryParams.append("wilayah", filters.wilayah);
      if (filters.startDate) queryParams.append("startDate", filters.startDate);
      if (filters.endDate) queryParams.append("endDate", filters.endDate);
      if (filters.uniqueId) queryParams.append("uniqueId", filters.uniqueId);
      if (filters.transactionType !== "all") queryParams.append("transactionType", filters.transactionType);
      if (filters.minAmount) queryParams.append("minAmount", filters.minAmount);
      if (filters.maxAmount) queryParams.append("maxAmount", filters.maxAmount);

      const response = await fetch(`/api/member-transactions?${queryParams.toString()}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("admin_token")}`,
        },
      });

      if (response.ok) {
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const result = await response.json();
          setMemberTransactions(result.data || []);
          setPagination(result.pagination || pagination);
          setSummary(result.summary || summary);
        } else {
          console.log("Member transactions API not available, using empty data");
          setMemberTransactions([]);
          setPagination({
            currentPage: 1,
            totalPages: 1,
            totalItems: 0,
            itemsPerPage: 50,
          });
          setSummary({
            totalMembers: 0,
            totalTransactions: 0,
            totalAmount: 0,
            averageTransactionPerMember: 0,
            regionalDistribution: {},
          });
        }
      } else {
        console.log("Member transactions API endpoint not found");
        setMemberTransactions([]);
        setPagination({
          currentPage: 1,
          totalPages: 1,
          totalItems: 0,
          itemsPerPage: 50,
        });
        setSummary({
          totalMembers: 0,
          totalTransactions: 0,
          totalAmount: 0,
          averageTransactionPerMember: 0,
          regionalDistribution: {},
        });
      }
    } catch (error) {
      console.error("Error loading member transactions:", error);
      setMemberTransactions([]);
      setPagination({
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: 50,
      });
      setSummary({
        totalMembers: 0,
        totalTransactions: 0,
        totalAmount: 0,
        averageTransactionPerMember: 0,
        regionalDistribution: {},
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (key: keyof Filters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const applyFilters = () => {
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
    loadMemberTransactions(1);
  };

  const resetFilters = () => {
    setFilters({
      wilayah: "",
      startDate: "",
      endDate: "",
      uniqueId: "",
      transactionType: "all",
      minAmount: "",
      maxAmount: "",
      sortBy: "totalTransactions",
      sortOrder: "desc",
    });
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
    loadMemberTransactions(1);
  };

  const handlePageChange = (page: number) => {
    loadMemberTransactions(page);
  };

  const toggleRowExpansion = (uniqueId: string) => {
    const newExpandedRows = new Set(expandedRows);
    if (newExpandedRows.has(uniqueId)) {
      newExpandedRows.delete(uniqueId);
    } else {
      newExpandedRows.add(uniqueId);
    }
    setExpandedRows(newExpandedRows);
  };

  const exportToCSV = async () => {
    setIsExporting(true);

    try {
      const queryParams = new URLSearchParams();

      // Add all current filters to export
      if (filters.wilayah) queryParams.append("wilayah", filters.wilayah);
      if (filters.startDate) queryParams.append("startDate", filters.startDate);
      if (filters.endDate) queryParams.append("endDate", filters.endDate);
      if (filters.uniqueId) queryParams.append("uniqueId", filters.uniqueId);
      if (filters.transactionType !== "all") queryParams.append("transactionType", filters.transactionType);
      if (filters.minAmount) queryParams.append("minAmount", filters.minAmount);
      if (filters.maxAmount) queryParams.append("maxAmount", filters.maxAmount);
      queryParams.append("sortBy", filters.sortBy);
      queryParams.append("sortOrder", filters.sortOrder);

      const response = await fetch(`/api/member-transactions/export?${queryParams.toString()}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("admin_token")}`,
        },
      });

      if (response.ok) {
        const contentType = response.headers.get("content-type");
        if (contentType && (contentType.includes("text/csv") || contentType.includes("application/octet-stream"))) {
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.style.display = "none";
          a.href = url;
          a.download = `laporan-transaksi-unique-id-${new Date().getTime()}.csv`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
          alert("File CSV berhasil didownload!");
        } else {
          console.log("Export API not available - CSV export not supported");
          alert("Fitur export CSV tidak tersedia karena API belum terpasang");
        }
      } else {
        console.log("Export API endpoint not found");
        alert("Fitur export CSV tidak tersedia karena API belum terpasang");
      }
    } catch (error) {
      console.error("Error exporting data:", error);
      alert("Fitur export CSV tidak tersedia karena API belum terpasang");
    } finally {
      setIsExporting(false);
    }
  };

  const getTransactionTypeBadge = (type: string) => {
    const typeMap: { [key: string]: { label: string; color: string } } = {
      purchase: { label: "Pembelian", color: "bg-blue-100 text-blue-800 border-blue-200" },
      payment: { label: "Pembayaran", color: "bg-green-100 text-green-800 border-green-200" },
      refund: { label: "Refund", color: "bg-red-100 text-red-800 border-red-200" },
      transfer: { label: "Transfer", color: "bg-purple-100 text-purple-800 border-purple-200" },
    };

    const typeInfo = typeMap[type.toLowerCase()] || { label: type, color: "bg-gray-100 text-gray-800 border-gray-200" };

    return <span className={`px-2 py-1 text-xs font-medium rounded-full border ${typeInfo.color}`}>{typeInfo.label}</span>;
  };

  const getStatusBadge = (status: string) => {
    const statusMap: { [key: string]: { label: string; color: string } } = {
      completed: { label: "Selesai", color: "bg-green-100 text-green-800 border-green-200" },
      pending: { label: "Pending", color: "bg-yellow-100 text-yellow-800 border-yellow-200" },
      cancelled: { label: "Dibatalkan", color: "bg-red-100 text-red-800 border-red-200" },
      processing: { label: "Diproses", color: "bg-blue-100 text-blue-800 border-blue-200" },
    };

    const statusInfo = statusMap[status.toLowerCase()] || { label: status, color: "bg-gray-100 text-gray-800 border-gray-200" };

    return <span className={`px-2 py-1 text-xs font-medium rounded-full border ${statusInfo.color}`}>{statusInfo.label}</span>;
  };

  const getActivityLevel = (transactionCount: number) => {
    if (transactionCount >= 20) {
      return { level: "Sangat Aktif", color: "text-green-600", bgColor: "bg-green-100" };
    } else if (transactionCount >= 10) {
      return { level: "Aktif", color: "text-blue-600", bgColor: "bg-blue-100" };
    } else if (transactionCount >= 5) {
      return { level: "Sedang", color: "text-yellow-600", bgColor: "bg-yellow-100" };
    } else if (transactionCount >= 1) {
      return { level: "Kurang Aktif", color: "text-orange-600", bgColor: "bg-orange-100" };
    } else {
      return { level: "Tidak Aktif", color: "text-red-600", bgColor: "bg-red-100" };
    }
  };

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold text-gray-800">Laporan Transaksi Per Unique ID</h2>
                <p className="text-sm text-gray-600 mt-1">Kontrol transaksi anggota berdasarkan wilayah dan unique ID</p>
                {filters.startDate && filters.endDate && (
                  <p className="text-xs text-blue-600 mt-1">
                    Periode: {new Date(filters.startDate).toLocaleDateString("id-ID")} - {new Date(filters.endDate).toLocaleDateString("id-ID")}
                  </p>
                )}
                {apiStatus && <p className={`text-xs mt-1 ${apiStatus.includes("Not Available") ? "text-orange-600" : "text-green-600"}`}>Status: {apiStatus}</p>}
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
                  onClick={() => loadMemberTransactions(pagination.currentPage)}
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
          {showFilters && (
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Wilayah */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Wilayah</label>
                  <select
                    value={filters.wilayah}
                    onChange={(e) => handleFilterChange("wilayah", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black text-sm"
                  >
                    <option value="">Semua Wilayah</option>
                    {regions.map((region) => (
                      <option key={region.code} value={region.code}>
                        {region.name} ({region.code}) - {region.memberCount} anggota
                      </option>
                    ))}
                  </select>
                </div>

                {/* Unique ID */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Unique ID</label>
                  <input
                    type="text"
                    value={filters.uniqueId}
                    onChange={(e) => handleFilterChange("uniqueId", e.target.value)}
                    placeholder="Cari by Unique ID (ex: BDG-0001)"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black text-sm"
                  />
                </div>

                {/* Transaction Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Transaksi</label>
                  <select
                    value={filters.transactionType}
                    onChange={(e) => handleFilterChange("transactionType", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black text-sm"
                  >
                    <option value="all">Semua Transaksi</option>
                    <option value="purchase">Pembelian</option>
                    <option value="payment">Pembayaran</option>
                    <option value="refund">Refund</option>
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

                {/* Min Amount */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Jumlah Minimum</label>
                  <input
                    type="number"
                    value={filters.minAmount}
                    onChange={(e) => handleFilterChange("minAmount", e.target.value)}
                    placeholder="Minimal transaksi"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black text-sm"
                  />
                </div>

                {/* Max Amount */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Jumlah Maksimum</label>
                  <input
                    type="number"
                    value={filters.maxAmount}
                    onChange={(e) => handleFilterChange("maxAmount", e.target.value)}
                    placeholder="Maksimal transaksi"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black text-sm"
                  />
                </div>

                {/* Sort By */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Urutkan Berdasarkan</label>
                  <select
                    value={filters.sortBy}
                    onChange={(e) => handleFilterChange("sortBy", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black text-sm"
                  >
                    <option value="uniqueId">Unique ID</option>
                    <option value="totalTransactions">Total Transaksi</option>
                    <option value="totalAmount">Total Nilai</option>
                    <option value="lastTransaction">Transaksi Terakhir</option>
                  </select>
                </div>

                {/* Sort Order */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Urutan</label>
                  <select
                    value={filters.sortOrder}
                    onChange={(e) => handleFilterChange("sortOrder", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black text-sm"
                  >
                    <option value="desc">Tertinggi ke Terendah</option>
                    <option value="asc">Terendah ke Tertinggi</option>
                  </select>
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex items-center">
                  <Users className="w-8 h-8 text-blue-500" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">Total Anggota</p>
                    <p className="text-lg font-semibold text-black">{summary.totalMembers.toLocaleString("id-ID")}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex items-center">
                  <FileText className="w-8 h-8 text-green-500" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">Total Transaksi</p>
                    <p className="text-lg font-semibold text-black">{summary.totalTransactions.toLocaleString("id-ID")}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex items-center">
                  <DollarSign className="w-8 h-8 text-purple-500" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">Total Nilai</p>
                    <p className="text-lg font-semibold text-black">Rp {summary.totalAmount.toLocaleString("id-ID")}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex items-center">
                  <TrendingUp className="w-8 h-8 text-orange-500" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">Avg per Anggota</p>
                    <p className="text-lg font-semibold text-black">{summary.averageTransactionPerMember.toFixed(1)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Regional Distribution */}
            {Object.keys(summary.regionalDistribution).length > 0 && (
              <div className="mt-4">
                <h3 className="text-sm font-medium text-gray-800 mb-3">Distribusi Wilayah</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {Object.entries(summary.regionalDistribution).map(([wilayah, data]) => (
                    <div key={wilayah} className="bg-white p-3 rounded-lg border border-gray-200">
                      <div className="flex items-center">
                        <MapPin className="w-5 h-5 text-blue-500" />
                        <div className="ml-2">
                          <p className="text-xs font-medium text-gray-600">{wilayah}</p>
                          <p className="text-sm font-semibold text-black">{data.memberCount} anggota</p>
                          <p className="text-xs text-gray-500">{data.transactionCount} transaksi</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unique ID / Anggota</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Wilayah</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Transaksi</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Nilai</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rata-rata</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aktivitas</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Transaksi Terakhir</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Detail</th>
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
                ) : memberTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                      {apiStatus.includes("Not Available") ? (
                        <div className="space-y-2">
                          <p>Tidak ada data - API backend belum tersedia</p>
                          <p className="text-xs text-orange-600">Silakan implementasikan API endpoints untuk melihat data lengkap</p>
                        </div>
                      ) : (
                        "Tidak ada data transaksi anggota"
                      )}
                    </td>
                  </tr>
                ) : (
                  memberTransactions.map((member) => {
                    const activityLevel = getActivityLevel(member.totalTransactions);
                    const isExpanded = expandedRows.has(member.uniqueId);

                    return (
                      <React.Fragment key={member.uniqueId}>
                        <tr className="hover:bg-gray-50">
                          <td className="px-4 py-3">
                            <div className="text-sm font-medium text-black">{member.uniqueId}</div>
                            <div className="text-sm text-gray-900">{member.memberName}</div>
                            <div className="text-xs text-gray-500">{member.phoneNumber}</div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center">
                              <MapPin className="w-4 h-4 text-blue-500 mr-1" />
                              <div>
                                <div className="text-sm font-medium text-black">{member.wilayah}</div>
                                <div className="text-xs text-gray-500">{member.wilayahName}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-sm font-medium text-black">{member.totalTransactions}</div>
                            <div className="text-xs text-gray-500">{member.monthlyTransactionCount}/bulan</div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-sm font-medium text-green-600">Rp {member.totalAmount.toLocaleString("id-ID")}</div>
                            <div className="text-xs text-blue-500">Pembelian: Rp {member.totalPurchaseAmount.toLocaleString("id-ID")}</div>
                            <div className="text-xs text-green-500">Pembayaran: Rp {member.totalPaymentAmount.toLocaleString("id-ID")}</div>
                            {member.totalRefundAmount > 0 && <div className="text-xs text-red-500">Refund: Rp {member.totalRefundAmount.toLocaleString("id-ID")}</div>}
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-sm font-medium text-black">Rp {member.averageTransactionAmount.toLocaleString("id-ID")}</div>
                          </td>
                          <td className="px-4 py-3">
                            <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${activityLevel.bgColor} ${activityLevel.color}`}>{activityLevel.level}</div>
                            <div className="text-xs text-gray-500 mt-1">{member.firstTransactionDate && `Sejak ${new Date(member.firstTransactionDate).toLocaleDateString("id-ID")}`}</div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="text-sm text-black">{member.lastTransactionDate ? new Date(member.lastTransactionDate).toLocaleDateString("id-ID") : "-"}</div>
                            <div className="text-xs text-gray-500">{member.lastTransactionDate && `${Math.floor((new Date().getTime() - new Date(member.lastTransactionDate).getTime()) / (1000 * 60 * 60 * 24))} hari lalu`}</div>
                          </td>
                          <td className="px-4 py-3">
                            <button onClick={() => toggleRowExpansion(member.uniqueId)} className="flex items-center text-blue-600 hover:text-blue-800 text-sm">
                              {isExpanded ? <EyeOff className="w-4 h-4 mr-1" /> : <Eye className="w-4 h-4 mr-1" />}
                              {isExpanded ? "Tutup" : "Lihat"}
                            </button>
                          </td>
                        </tr>

                        {/* Expanded Row - Transaction Details */}
                        {isExpanded && (
                          <tr>
                            <td colSpan={8} className="px-4 py-4 bg-gray-50">
                              <div className="space-y-4">
                                <h4 className="text-sm font-medium text-gray-800">Detail Transaksi - {member.uniqueId}</h4>

                                {member.transactions && member.transactions.length > 0 ? (
                                  <div className="overflow-x-auto">
                                    <table className="min-w-full bg-white rounded-lg border border-gray-200">
                                      <thead className="bg-gray-100">
                                        <tr>
                                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Tanggal</th>
                                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Jenis</th>
                                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Jumlah</th>
                                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Deskripsi</th>
                                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                        </tr>
                                      </thead>
                                      <tbody className="divide-y divide-gray-200">
                                        {member.transactions.map((transaction) => (
                                          <tr key={transaction.id} className="hover:bg-gray-50">
                                            <td className="px-3 py-2">
                                              <div className="flex items-center">
                                                <Clock className="w-4 h-4 text-gray-400 mr-2" />
                                                <div>
                                                  <div className="text-sm text-black">{new Date(transaction.transactionDate).toLocaleDateString("id-ID")}</div>
                                                  <div className="text-xs text-gray-500">{new Date(transaction.transactionDate).toLocaleTimeString("id-ID")}</div>
                                                </div>
                                              </div>
                                            </td>
                                            <td className="px-3 py-2">{getTransactionTypeBadge(transaction.transactionType)}</td>
                                            <td className="px-3 py-2">
                                              <div className="flex items-center">
                                                <CreditCard className="w-4 h-4 text-green-500 mr-2" />
                                                <span className="text-sm font-medium text-green-600">Rp {transaction.amount.toLocaleString("id-ID")}</span>
                                              </div>
                                            </td>
                                            <td className="px-3 py-2">
                                              <div className="text-sm text-black">{transaction.description}</div>
                                            </td>
                                            <td className="px-3 py-2">{getStatusBadge(transaction.status)}</td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                ) : (
                                  <div className="text-center py-4 text-gray-500">
                                    <FileText className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                                    <p>Belum ada detail transaksi</p>
                                  </div>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Menampilkan {(pagination.currentPage - 1) * pagination.itemsPerPage + 1} - {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} dari {pagination.totalItems} anggota
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

          {/* Usage Insights */}
          <div className="px-6 py-4 bg-blue-50 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-800 mb-3">Insight Penggunaan</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Anggota Aktif:</h4>
                <ul className="text-gray-600 space-y-1">
                  <li>• Lebih dari 10 transaksi per periode</li>
                  <li>• Transaksi rutin setiap bulan</li>
                  <li>• Nilai transaksi konsisten</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Monitoring:</h4>
                <ul className="text-gray-600 space-y-1">
                  <li>• Pantau anggota tidak aktif lebih dari 3 bulan</li>
                  <li>• Identifikasi pola transaksi bermasalah</li>
                  <li>• Analisis distribusi regional untuk ekspansi</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LaporanTransaksiUniqueIdPage;
