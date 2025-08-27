/*
API ENDPOINTS DOCUMENTATION FOR BACKEND IMPLEMENTATION:

1. GET /api/daily-transactions
   Description: Mendapatkan data transaksi harian dengan detail item
   Headers: Authorization: Bearer {token}
   Query Parameters:
   - startDate: string (YYYY-MM-DD) (wajib)
   - endDate: string (YYYY-MM-DD) (wajib)
   - categoryId: string (opsional)
   - supplierId: string (opsional)
   - itemId: string (opsional)
   - paymentMethod: "cash" | "transfer" | "credit" | "all" (opsional, default: "all")
   - transactionType: "sale" | "return" | "all" (opsional, default: "all")
   - cashierName: string (opsional)
   - minAmount: number (opsional)
   - maxAmount: number (opsional)
   - sortBy: "date" | "amount" | "quantity" | "profit" (opsional, default: "date")
   - sortOrder: "asc" | "desc" (opsional, default: "desc")
   - page: number (opsional, default: 1)
   - pageSize: number (opsional, default: 50)
   
   Response: {
     data: [
       {
         id: string,
         transactionNumber: string,
         date: string,
         time: string,
         cashierName: string,
         customerName: string | null,
         items: [
           {
             id: string,
             barcode: string,
             itemName: string,
             categoryName: string,
             supplierName: string,
             quantity: number,
             unitPrice: number,
             totalPrice: number,
             costPrice: number,
             profit: number,
             profitMargin: number
           }
         ],
         subtotal: number,
         discount: number,
         tax: number,
         totalAmount: number,
         totalProfit: number,
         paymentMethod: string,
         amountPaid: number,
         change: number,
         transactionType: "sale" | "return",
         notes: string | null,
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
       totalTransactions: number,
       totalRevenue: number,
       totalProfit: number,
       totalQuantity: number,
       averageTransaction: number,
       averageProfitMargin: number,
       topSellingItems: [
         {
           itemName: string,
           quantity: number,
           revenue: number
         }
       ],
       paymentMethodBreakdown: {
         cash: { count: number, amount: number },
         transfer: { count: number, amount: number },
         credit: { count: number, amount: number }
       },
       hourlyBreakdown: [
         {
           hour: number,
           transactionCount: number,
           revenue: number
         }
       ]
     },
     periods: {
       startDate: string,
       endDate: string,
       totalDays: number
     }
   }

2. GET /api/cashiers
   Description: Mendapatkan daftar kasir untuk dropdown filter
   Headers: Authorization: Bearer {token}
   Response: {
     data: [
       {
         id: string,
         name: string,
         employeeCode: string
       }
     ]
   }

3. POST /api/daily-transactions/export
   Description: Ekspor data transaksi harian ke CSV
   Headers: Authorization: Bearer {token}, Content-Type: application/json
   Body: {
     startDate: string,
     endDate: string,
     categoryId: string,
     supplierId: string,
     itemId: string,
     paymentMethod: string,
     transactionType: string,
     cashierName: string,
     minAmount: number,
     maxAmount: number,
     sortBy: string,
     sortOrder: string
   }
   Response: File CSV untuk didownload

ERROR RESPONSES:
- 400: Parameter filter tidak valid
- 401: Tidak diotorisasi (token tidak valid)
- 500: Error server
*/

"use client";

import React, { useState, useEffect } from "react";
import { Calendar, Download, Filter, Search, RefreshCw, TrendingUp, DollarSign, Package, Clock, Users, CreditCard, Receipt, Eye, EyeOff } from "lucide-react";

interface TransactionItem {
  id: string;
  barcode: string;
  itemName: string;
  categoryName: string;
  supplierName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  costPrice: number;
  profit: number;
  profitMargin: number;
}

interface DailyTransaction {
  id: string;
  transactionNumber: string;
  date: string;
  time: string;
  cashierName: string;
  customerName: string | null;
  items: TransactionItem[];
  subtotal: number;
  discount: number;
  tax: number;
  totalAmount: number;
  totalProfit: number;
  paymentMethod: string;
  amountPaid: number;
  change: number;
  transactionType: "sale" | "return";
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

interface Category {
  id: string;
  name: string;
  code: string;
}

interface Supplier {
  id: string;
  name: string;
  code: string;
}

interface Cashier {
  id: string;
  name: string;
  employeeCode: string;
}

interface TopSellingItem {
  itemName: string;
  quantity: number;
  revenue: number;
}

interface PaymentMethodBreakdown {
  cash: { count: number; amount: number };
  transfer: { count: number; amount: number };
  credit: { count: number; amount: number };
}

interface HourlyBreakdown {
  hour: number;
  transactionCount: number;
  revenue: number;
}

interface ReportSummary {
  totalTransactions: number;
  totalRevenue: number;
  totalProfit: number;
  totalQuantity: number;
  averageTransaction: number;
  averageProfitMargin: number;
  topSellingItems: TopSellingItem[];
  paymentMethodBreakdown: PaymentMethodBreakdown;
  hourlyBreakdown: HourlyBreakdown[];
}

interface Pagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

interface ReportPeriods {
  startDate: string;
  endDate: string;
  totalDays: number;
}

interface Filters {
  startDate: string;
  endDate: string;
  categoryId: string;
  supplierId: string;
  itemId: string;
  paymentMethod: "cash" | "transfer" | "credit" | "all";
  transactionType: "sale" | "return" | "all";
  cashierName: string;
  minAmount: string;
  maxAmount: string;
  sortBy: "date" | "amount" | "quantity" | "profit";
  sortOrder: "asc" | "desc";
}

const LaporanTransaksiHarianPage: React.FC = () => {
  const [transactions, setTransactions] = useState<DailyTransaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [cashiers, setCashiers] = useState<Cashier[]>([]);
  const [summary, setSummary] = useState<ReportSummary>({
    totalTransactions: 0,
    totalRevenue: 0,
    totalProfit: 0,
    totalQuantity: 0,
    averageTransaction: 0,
    averageProfitMargin: 0,
    topSellingItems: [],
    paymentMethodBreakdown: {
      cash: { count: 0, amount: 0 },
      transfer: { count: 0, amount: 0 },
      credit: { count: 0, amount: 0 },
    },
    hourlyBreakdown: [],
  });
  const [periods, setPeriods] = useState<ReportPeriods>({
    startDate: "",
    endDate: "",
    totalDays: 0,
  });
  const [pagination, setPagination] = useState<Pagination>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 50,
  });

  // Set tanggal default ke hari ini
  const today = new Date().toISOString().split("T")[0];
  const [filters, setFilters] = useState<Filters>({
    startDate: today,
    endDate: today,
    categoryId: "",
    supplierId: "",
    itemId: "",
    paymentMethod: "all",
    transactionType: "all",
    cashierName: "",
    minAmount: "",
    maxAmount: "",
    sortBy: "date",
    sortOrder: "desc",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [apiStatus, setApiStatus] = useState<string>("");
  const [expandedTransactions, setExpandedTransactions] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadCategories();
    loadSuppliers();
    loadCashiers();
    loadDailyTransactions();
  }, []);

  const loadCategories = async () => {
    try {
      const response = await fetch("/api/categories", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("admin_token")}`,
        },
      });

      if (response.ok) {
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const result = await response.json();
          setCategories(result.data || []);
          setApiStatus("API Tersambung");
        } else {
          console.log("API Kategori tidak tersedia, menggunakan data kosong");
          setCategories([]);
          setApiStatus("API Tidak Tersedia - Mode Demo");
        }
      } else {
        console.log("Endpoint API Kategori tidak ditemukan");
        setCategories([]);
        setApiStatus("API Tidak Tersedia - Mode Demo");
      }
    } catch (error) {
      console.error("Error memuat kategori:", error);
      setCategories([]);
      setApiStatus("API Tidak Tersedia - Mode Demo");
    }
  };

  const loadSuppliers = async () => {
    try {
      const response = await fetch("/api/suppliers", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("admin_token")}`,
        },
      });

      if (response.ok) {
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const result = await response.json();
          setSuppliers(result.data || []);
        } else {
          console.log("API Supplier tidak tersedia, menggunakan data kosong");
          setSuppliers([]);
        }
      } else {
        console.log("Endpoint API Supplier tidak ditemukan");
        setSuppliers([]);
      }
    } catch (error) {
      console.error("Error memuat supplier:", error);
      setSuppliers([]);
    }
  };

  const loadCashiers = async () => {
    try {
      const response = await fetch("/api/cashiers", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("admin_token")}`,
        },
      });

      if (response.ok) {
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const result = await response.json();
          setCashiers(result.data || []);
        } else {
          console.log("API Kasir tidak tersedia, menggunakan data kosong");
          setCashiers([]);
        }
      } else {
        console.log("Endpoint API Kasir tidak ditemukan");
        setCashiers([]);
      }
    } catch (error) {
      console.error("Error memuat kasir:", error);
      setCashiers([]);
    }
  };

  const loadDailyTransactions = async (page: number = 1) => {
    setIsLoading(true);

    try {
      const queryParams = new URLSearchParams({
        startDate: filters.startDate,
        endDate: filters.endDate,
        page: page.toString(),
        pageSize: pagination.itemsPerPage.toString(),
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
      });

      // Tambahkan filter ke query params
      if (filters.categoryId) queryParams.append("categoryId", filters.categoryId);
      if (filters.supplierId) queryParams.append("supplierId", filters.supplierId);
      if (filters.itemId) queryParams.append("itemId", filters.itemId);
      if (filters.paymentMethod !== "all") queryParams.append("paymentMethod", filters.paymentMethod);
      if (filters.transactionType !== "all") queryParams.append("transactionType", filters.transactionType);
      if (filters.cashierName) queryParams.append("cashierName", filters.cashierName);
      if (filters.minAmount) queryParams.append("minAmount", filters.minAmount);
      if (filters.maxAmount) queryParams.append("maxAmount", filters.maxAmount);

      const response = await fetch(`/api/daily-transactions?${queryParams.toString()}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("admin_token")}`,
        },
      });

      if (response.ok) {
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const result = await response.json();
          setTransactions(result.data || []);
          setPagination(result.pagination || pagination);
          setSummary(result.summary || summary);
          setPeriods(result.periods || periods);
        } else {
          console.log("API Transaksi harian tidak tersedia, menggunakan data kosong");
          setTransactions([]);
          setPagination({
            currentPage: 1,
            totalPages: 1,
            totalItems: 0,
            itemsPerPage: 50,
          });
          setSummary({
            totalTransactions: 0,
            totalRevenue: 0,
            totalProfit: 0,
            totalQuantity: 0,
            averageTransaction: 0,
            averageProfitMargin: 0,
            topSellingItems: [],
            paymentMethodBreakdown: {
              cash: { count: 0, amount: 0 },
              transfer: { count: 0, amount: 0 },
              credit: { count: 0, amount: 0 },
            },
            hourlyBreakdown: [],
          });
          setPeriods({
            startDate: "",
            endDate: "",
            totalDays: 0,
          });
        }
      } else {
        console.log("Endpoint API Transaksi harian tidak ditemukan");
        setTransactions([]);
        setPagination({
          currentPage: 1,
          totalPages: 1,
          totalItems: 0,
          itemsPerPage: 50,
        });
        setSummary({
          totalTransactions: 0,
          totalRevenue: 0,
          totalProfit: 0,
          totalQuantity: 0,
          averageTransaction: 0,
          averageProfitMargin: 0,
          topSellingItems: [],
          paymentMethodBreakdown: {
            cash: { count: 0, amount: 0 },
            transfer: { count: 0, amount: 0 },
            credit: { count: 0, amount: 0 },
          },
          hourlyBreakdown: [],
        });
        setPeriods({
          startDate: "",
          endDate: "",
          totalDays: 0,
        });
      }
    } catch (error) {
      console.error("Error memuat transaksi harian:", error);
      setTransactions([]);
      setPagination({
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: 50,
      });
      setSummary({
        totalTransactions: 0,
        totalRevenue: 0,
        totalProfit: 0,
        totalQuantity: 0,
        averageTransaction: 0,
        averageProfitMargin: 0,
        topSellingItems: [],
        paymentMethodBreakdown: {
          cash: { count: 0, amount: 0 },
          transfer: { count: 0, amount: 0 },
          credit: { count: 0, amount: 0 },
        },
        hourlyBreakdown: [],
      });
      setPeriods({
        startDate: "",
        endDate: "",
        totalDays: 0,
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
    loadDailyTransactions(1);
  };

  const resetFilters = () => {
    const today = new Date().toISOString().split("T")[0];
    setFilters({
      startDate: today,
      endDate: today,
      categoryId: "",
      supplierId: "",
      itemId: "",
      paymentMethod: "all",
      transactionType: "all",
      cashierName: "",
      minAmount: "",
      maxAmount: "",
      sortBy: "date",
      sortOrder: "desc",
    });
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
    loadDailyTransactions(1);
  };

  const handlePageChange = (page: number) => {
    loadDailyTransactions(page);
  };

  const exportToCSV = async () => {
    setIsExporting(true);

    try {
      const exportData = {
        startDate: filters.startDate,
        endDate: filters.endDate,
        categoryId: filters.categoryId,
        supplierId: filters.supplierId,
        itemId: filters.itemId,
        paymentMethod: filters.paymentMethod,
        transactionType: filters.transactionType,
        cashierName: filters.cashierName,
        minAmount: filters.minAmount ? parseFloat(filters.minAmount) : undefined,
        maxAmount: filters.maxAmount ? parseFloat(filters.maxAmount) : undefined,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
      };

      const response = await fetch("/api/daily-transactions/export", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("admin_token")}`,
        },
        body: JSON.stringify(exportData),
      });

      if (response.ok) {
        const contentType = response.headers.get("content-type");
        if (contentType && (contentType.includes("text/csv") || contentType.includes("application/octet-stream"))) {
          const blob = await response.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.style.display = "none";
          a.href = url;
          a.download = `laporan-transaksi-harian-${new Date().getTime()}.csv`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
          alert("File CSV berhasil didownload!");
        } else {
          console.log("API Ekspor tidak tersedia - ekspor CSV tidak didukung");
          alert("Fitur ekspor CSV tidak tersedia karena API belum terpasang");
        }
      } else {
        console.log("Endpoint API Ekspor tidak ditemukan");
        alert("Fitur ekspor CSV tidak tersedia karena API belum terpasang");
      }
    } catch (error) {
      console.error("Error mengekspor data:", error);
      alert("Fitur ekspor CSV tidak tersedia karena API belum terpasang");
    } finally {
      setIsExporting(false);
    }
  };

  const toggleTransactionExpansion = (transactionId: string) => {
    setExpandedTransactions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(transactionId)) {
        newSet.delete(transactionId);
      } else {
        newSet.add(transactionId);
      }
      return newSet;
    });
  };

  const getTransactionTypeBadge = (type: string) => {
    if (type === "return") {
      return <span className="px-2 py-1 text-xs font-medium rounded-full border bg-red-100 text-red-800 border-red-200">Retur</span>;
    } else {
      return <span className="px-2 py-1 text-xs font-medium rounded-full border bg-green-100 text-green-800 border-green-200">Penjualan</span>;
    }
  };

  const getPaymentMethodBadge = (method: string) => {
    const colors = {
      cash: "bg-green-100 text-green-800 border-green-200",
      transfer: "bg-blue-100 text-blue-800 border-blue-200",
      credit: "bg-purple-100 text-purple-800 border-purple-200",
    };
    const labels = {
      cash: "TUNAI",
      transfer: "TRANSFER",
      credit: "KREDIT",
    };

    const color = colors[method as keyof typeof colors] || "bg-gray-100 text-gray-800 border-gray-200";
    const label = labels[method as keyof typeof labels] || method.toUpperCase();

    return <span className={`px-2 py-1 text-xs font-medium rounded-full border ${color}`}>{label}</span>;
  };

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold text-gray-800">Laporan Transaksi Harian</h2>
                <p className="text-sm text-gray-600 mt-1">Detail Transaksi Penjualan dan Retur</p>
                {periods.startDate && periods.endDate && (
                  <p className="text-xs text-blue-600 mt-1">
                    Periode: {new Date(periods.startDate).toLocaleDateString("id-ID")} - {new Date(periods.endDate).toLocaleDateString("id-ID")} ({periods.totalDays} hari)
                  </p>
                )}
                {apiStatus && <p className={`text-xs mt-1 ${apiStatus.includes("Tidak Tersedia") ? "text-orange-600" : "text-green-600"}`}>Status: {apiStatus}</p>}
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
                  onClick={() => loadDailyTransactions(pagination.currentPage)}
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
                  {isExporting ? "Mengekspor..." : "Ekspor CSV"}
                </button>
              </div>
            </div>
          </div>

          {/* Filters */}
          {showFilters && (
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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

                {/* Payment Method */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Metode Pembayaran</label>
                  <select
                    value={filters.paymentMethod}
                    onChange={(e) => handleFilterChange("paymentMethod", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black text-sm"
                  >
                    <option value="all">Semua Metode</option>
                    <option value="cash">Tunai</option>
                    <option value="transfer">Transfer</option>
                    <option value="credit">Kredit</option>
                  </select>
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
                    <option value="sale">Penjualan</option>
                    <option value="return">Retur</option>
                  </select>
                </div>

                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                  <select
                    value={filters.categoryId}
                    onChange={(e) => handleFilterChange("categoryId", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black text-sm"
                  >
                    <option value="">Semua Kategori</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Cashier */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kasir</label>
                  <select
                    value={filters.cashierName}
                    onChange={(e) => handleFilterChange("cashierName", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black text-sm"
                  >
                    <option value="">Semua Kasir</option>
                    {cashiers.map((cashier) => (
                      <option key={cashier.id} value={cashier.name}>
                        {cashier.name} ({cashier.employeeCode})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Min Amount */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Jumlah Minimum</label>
                  <input
                    type="number"
                    value={filters.minAmount}
                    onChange={(e) => handleFilterChange("minAmount", e.target.value)}
                    placeholder="Rp 0"
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
                    placeholder="Rp 0"
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
                    <option value="date">Tanggal</option>
                    <option value="amount">Total Transaksi</option>
                    <option value="quantity">Jumlah Item</option>
                    <option value="profit">Keuntungan</option>
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
                    <option value="desc">Terbaru ke Terlama</option>
                    <option value="asc">Terlama ke Terbaru</option>
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
            <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex items-center">
                  <Receipt className="w-8 h-8 text-blue-500" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">Total Transaksi</p>
                    <p className="text-lg font-semibold text-black">{summary.totalTransactions.toLocaleString("id-ID")}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex items-center">
                  <DollarSign className="w-8 h-8 text-green-500" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">Total Pendapatan</p>
                    <p className="text-lg font-semibold text-black">Rp {summary.totalRevenue.toLocaleString("id-ID")}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex items-center">
                  <TrendingUp className="w-8 h-8 text-purple-500" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">Total Keuntungan</p>
                    <p className="text-lg font-semibold text-black">Rp {summary.totalProfit.toLocaleString("id-ID")}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex items-center">
                  <Package className="w-8 h-8 text-orange-500" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">Total Barang</p>
                    <p className="text-lg font-semibold text-black">{summary.totalQuantity.toLocaleString("id-ID")}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex items-center">
                  <DollarSign className="w-6 h-6 text-green-500" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">Rata-rata Transaksi</p>
                    <p className="text-base font-semibold text-black">Rp {summary.averageTransaction.toLocaleString("id-ID")}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex items-center">
                  <TrendingUp className="w-6 h-6 text-blue-500" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">Rata-rata Margin</p>
                    <p className="text-base font-semibold text-black">{summary.averageProfitMargin.toFixed(1)}%</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex items-center">
                  <CreditCard className="w-6 h-6 text-purple-500" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">Transaksi Tunai</p>
                    <p className="text-base font-semibold text-black">{summary.paymentMethodBreakdown.cash.count}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex items-center">
                  <Clock className="w-6 h-6 text-indigo-500" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">Pendapatan Jam Puncak</p>
                    <p className="text-base font-semibold text-black">{summary.hourlyBreakdown.length > 0 ? `Rp ${Math.max(...summary.hourlyBreakdown.map((h) => h.revenue)).toLocaleString("id-ID")}` : "Rp 0"}</p>
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
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">No. Transaksi</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal & Waktu</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kasir</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Keuntungan</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pembayaran</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Jenis</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Detail</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {isLoading ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-8 text-center text-gray-500">
                      <div className="flex items-center justify-center">
                        <RefreshCw className="w-5 h-5 animate-spin mr-2" />
                        Memuat data...
                      </div>
                    </td>
                  </tr>
                ) : transactions.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-8 text-center text-gray-500">
                      {apiStatus.includes("Tidak Tersedia") ? (
                        <div className="space-y-2">
                          <p>Tidak ada data - API backend belum tersedia</p>
                          <p className="text-xs text-orange-600">Silakan implementasikan API endpoints untuk melihat data lengkap</p>
                        </div>
                      ) : (
                        "Tidak ada data transaksi harian"
                      )}
                    </td>
                  </tr>
                ) : (
                  transactions.map((transaction) => (
                    <React.Fragment key={transaction.id}>
                      <tr className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="text-sm font-medium text-black">{transaction.transactionNumber}</div>
                          {transaction.customerName && <div className="text-xs text-gray-500">Pelanggan: {transaction.customerName}</div>}
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm text-black">{new Date(transaction.date).toLocaleDateString("id-ID")}</div>
                          <div className="text-xs text-gray-500">{transaction.time}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm text-black">{transaction.cashierName}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm font-medium text-black">Rp {transaction.totalAmount.toLocaleString("id-ID")}</div>
                          {transaction.discount > 0 && <div className="text-xs text-red-500">Diskon: Rp {transaction.discount.toLocaleString("id-ID")}</div>}
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm font-medium text-green-600">Rp {transaction.totalProfit.toLocaleString("id-ID")}</div>
                        </td>
                        <td className="px-4 py-3">{getPaymentMethodBadge(transaction.paymentMethod)}</td>
                        <td className="px-4 py-3">{getTransactionTypeBadge(transaction.transactionType)}</td>
                        <td className="px-4 py-3">
                          <div className="text-sm text-black">{transaction.items.length} item</div>
                          <div className="text-xs text-gray-500">Qty: {transaction.items.reduce((sum, item) => sum + item.quantity, 0)}</div>
                        </td>
                        <td className="px-4 py-3">
                          <button onClick={() => toggleTransactionExpansion(transaction.id)} className="text-blue-500 hover:text-blue-700 text-sm flex items-center gap-1">
                            {expandedTransactions.has(transaction.id) ? (
                              <>
                                <EyeOff className="w-4 h-4" /> Sembunyikan
                              </>
                            ) : (
                              <>
                                <Eye className="w-4 h-4" /> Lihat
                              </>
                            )}
                          </button>
                        </td>
                      </tr>

                      {/* Expanded Transaction Details */}
                      {expandedTransactions.has(transaction.id) && (
                        <tr>
                          <td colSpan={9} className="px-4 py-4 bg-gray-50">
                            <div className="space-y-4">
                              <h4 className="font-medium text-gray-800">Detail Item:</h4>
                              <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                  <thead>
                                    <tr className="border-b border-gray-300">
                                      <th className="text-left py-2">Item</th>
                                      <th className="text-left py-2">Kategori</th>
                                      <th className="text-right py-2">Qty</th>
                                      <th className="text-right py-2">Harga Satuan</th>
                                      <th className="text-right py-2">Total</th>
                                      <th className="text-right py-2">Keuntungan</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {transaction.items.map((item) => (
                                      <tr key={item.id} className="border-b border-gray-200">
                                        <td className="py-2">
                                          <div className="text-black font-medium">{item.itemName}</div>
                                          <div className="text-xs text-gray-500">{item.barcode}</div>
                                        </td>
                                        <td className="py-2 text-gray-600">{item.categoryName}</td>
                                        <td className="py-2 text-right text-black">{item.quantity}</td>
                                        <td className="py-2 text-right text-black">Rp {item.unitPrice.toLocaleString("id-ID")}</td>
                                        <td className="py-2 text-right text-black font-medium">Rp {item.totalPrice.toLocaleString("id-ID")}</td>
                                        <td className="py-2 text-right text-green-600 font-medium">Rp {item.profit.toLocaleString("id-ID")}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>

                              {/* Payment Details */}
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                                <div>
                                  <h5 className="font-medium text-gray-700 mb-2">Detail Pembayaran:</h5>
                                  <div className="space-y-1 text-sm">
                                    <div>Subtotal: Rp {transaction.subtotal.toLocaleString("id-ID")}</div>
                                    {transaction.discount > 0 && <div className="text-red-600">Diskon: -Rp {transaction.discount.toLocaleString("id-ID")}</div>}
                                    {transaction.tax > 0 && <div>Pajak: Rp {transaction.tax.toLocaleString("id-ID")}</div>}
                                    <div className="font-medium border-t pt-1">Total: Rp {transaction.totalAmount.toLocaleString("id-ID")}</div>
                                  </div>
                                </div>

                                <div>
                                  <h5 className="font-medium text-gray-700 mb-2">Info Transaksi:</h5>
                                  <div className="space-y-1 text-sm">
                                    <div>Dibayar: Rp {transaction.amountPaid.toLocaleString("id-ID")}</div>
                                    <div>Kembalian: Rp {transaction.change.toLocaleString("id-ID")}</div>
                                    <div>Pembayaran: {getPaymentMethodBadge(transaction.paymentMethod)}</div>
                                  </div>
                                </div>

                                {transaction.notes && (
                                  <div>
                                    <h5 className="font-medium text-gray-700 mb-2">Catatan:</h5>
                                    <div className="text-sm text-gray-600 bg-white p-2 rounded border">{transaction.notes}</div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
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
                    Sebelumnya
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
                    Selanjutnya
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Payment Method Breakdown */}
          <div className="px-6 py-4 bg-blue-50 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-800 mb-3">Breakdown Metode Pembayaran</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-3 rounded-lg border border-gray-200">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded"></div>
                  <span className="text-sm font-medium text-gray-700">Tunai</span>
                </div>
                <div className="mt-1">
                  <div className="text-lg font-semibold text-black">{summary.paymentMethodBreakdown.cash.count}</div>
                  <div className="text-xs text-gray-600">Rp {summary.paymentMethodBreakdown.cash.amount.toLocaleString("id-ID")}</div>
                </div>
              </div>

              <div className="bg-white p-3 rounded-lg border border-gray-200">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded"></div>
                  <span className="text-sm font-medium text-gray-700">Transfer</span>
                </div>
                <div className="mt-1">
                  <div className="text-lg font-semibold text-black">{summary.paymentMethodBreakdown.transfer.count}</div>
                  <div className="text-xs text-gray-600">Rp {summary.paymentMethodBreakdown.transfer.amount.toLocaleString("id-ID")}</div>
                </div>
              </div>

              <div className="bg-white p-3 rounded-lg border border-gray-200">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-purple-500 rounded"></div>
                  <span className="text-sm font-medium text-gray-700">Kredit</span>
                </div>
                <div className="mt-1">
                  <div className="text-lg font-semibold text-black">{summary.paymentMethodBreakdown.credit.count}</div>
                  <div className="text-xs text-gray-600">Rp {summary.paymentMethodBreakdown.credit.amount.toLocaleString("id-ID")}</div>
                </div>
              </div>
            </div>

            {/* Top Selling Items */}
            {summary.topSellingItems.length > 0 && (
              <div className="mt-6">
                <h4 className="text-sm font-medium text-gray-800 mb-3">Barang Terlaris (Periode Ini)</h4>
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <div className="space-y-2 p-3">
                    {summary.topSellingItems.slice(0, 5).map((item, index) => (
                      <div key={index} className="flex items-center justify-between py-1">
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-xs font-medium text-blue-800">{index + 1}</span>
                          </div>
                          <span className="text-sm font-medium text-gray-800">{item.itemName}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-semibold text-black">{item.quantity} unit</div>
                          <div className="text-xs text-gray-600">Rp {item.revenue.toLocaleString("id-ID")}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LaporanTransaksiHarianPage;
