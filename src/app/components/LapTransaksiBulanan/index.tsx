/*
API ENDPOINTS DOCUMENTATION FOR BACKEND IMPLEMENTATION:

1. GET /api/monthly-transactions
   Description: Mendapatkan data transaksi bulanan dengan agregasi per bulan
   Headers: Authorization: Bearer {token}
   Query Parameters:
   - startMonth: string (YYYY-MM) (wajib)
   - endMonth: string (YYYY-MM) (wajib)
   - categoryId: string (opsional)
   - supplierId: string (opsional)
   - paymentMethod: "cash" | "transfer" | "credit" | "all" (opsional, default: "all")
   - transactionType: "sale" | "return" | "all" (opsional, default: "all")
   - cashierName: string (opsional)
   - minAmount: number (opsional)
   - maxAmount: number (opsional)
   - sortBy: "month" | "revenue" | "transactions" | "profit" (opsional, default: "month")
   - sortOrder: "asc" | "desc" (opsional, default: "desc")
   - page: number (opsional, default: 1)
   - pageSize: number (opsional, default: 12)
   
   Response: {
     data: [
       {
         month: string, // YYYY-MM format
         monthName: string, // "Januari 2024"
         year: number,
         totalTransactions: number,
         totalRevenue: number,
         totalProfit: number,
         totalQuantity: number,
         averageTransaction: number,
         averageProfitMargin: number,
         transactionsByType: {
           sale: { count: number, amount: number },
           return: { count: number, amount: number }
         },
         paymentMethodBreakdown: {
           cash: { count: number, amount: number },
           transfer: { count: number, amount: number },
           credit: { count: number, amount: number }
         },
         topSellingItems: [
           {
             itemName: string,
             quantity: number,
             revenue: number
           }
         ],
         dailyAverage: {
           transactions: number,
           revenue: number,
           profit: number
         },
         growthRate: {
           revenue: number, // percentage compared to previous month
           transactions: number, // percentage compared to previous month
           profit: number // percentage compared to previous month
         }
       }
     ],
     pagination: {
       currentPage: number,
       totalPages: number,
       totalItems: number,
       itemsPerPage: number
     },
     summary: {
       totalMonths: number,
       totalRevenue: number,
       totalProfit: number,
       totalTransactions: number,
       averageMonthlyRevenue: number,
       averageMonthlyProfit: number,
       bestMonth: {
         month: string,
         revenue: number
       },
       worstMonth: {
         month: string,
         revenue: number
       },
       overallGrowthRate: {
         revenue: number,
         transactions: number,
         profit: number
       }
     },
     periods: {
       startMonth: string,
       endMonth: string,
       totalMonths: number
     }
   }

2. POST /api/monthly-transactions/export
   Description: Ekspor data transaksi bulanan ke CSV
   Headers: Authorization: Bearer {token}, Content-Type: application/json
   Body: {
     startMonth: string,
     endMonth: string,
     categoryId: string,
     supplierId: string,
     paymentMethod: string,
     transactionType: string,
     cashierName: string,
     minAmount: number,
     maxAmount: number,
     sortBy: string,
     sortOrder: string
   }
   Response: File CSV untuk didownload
*/

"use client";

import React, { useState, useEffect } from "react";
import { Calendar, Download, Filter, Search, RefreshCw, TrendingUp, TrendingDown, DollarSign, Package, Clock, Users, CreditCard, Receipt, BarChart3, ArrowUp, ArrowDown } from "lucide-react";

interface MonthlyTransaction {
  month: string;
  monthName: string;
  year: number;
  totalTransactions: number;
  totalRevenue: number;
  totalProfit: number;
  totalQuantity: number;
  averageTransaction: number;
  averageProfitMargin: number;
  transactionsByType: {
    sale: { count: number; amount: number };
    return: { count: number; amount: number };
  };
  paymentMethodBreakdown: {
    cash: { count: number; amount: number };
    transfer: { count: number; amount: number };
    credit: { count: number; amount: number };
  };
  topSellingItems: TopSellingItem[];
  dailyAverage: {
    transactions: number;
    revenue: number;
    profit: number;
  };
  growthRate: {
    revenue: number;
    transactions: number;
    profit: number;
  };
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

interface ReportSummary {
  totalMonths: number;
  totalRevenue: number;
  totalProfit: number;
  totalTransactions: number;
  averageMonthlyRevenue: number;
  averageMonthlyProfit: number;
  bestMonth: {
    month: string;
    revenue: number;
  };
  worstMonth: {
    month: string;
    revenue: number;
  };
  overallGrowthRate: {
    revenue: number;
    transactions: number;
    profit: number;
  };
}

interface Pagination {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

interface ReportPeriods {
  startMonth: string;
  endMonth: string;
  totalMonths: number;
}

interface Filters {
  startMonth: string;
  endMonth: string;
  categoryId: string;
  supplierId: string;
  paymentMethod: "cash" | "transfer" | "credit" | "all";
  transactionType: "sale" | "return" | "all";
  cashierName: string;
  minAmount: string;
  maxAmount: string;
  sortBy: "month" | "revenue" | "transactions" | "profit";
  sortOrder: "asc" | "desc";
}

const LaporanTransaksiBulananPage: React.FC = () => {
  const [monthlyTransactions, setMonthlyTransactions] = useState<MonthlyTransaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [cashiers, setCashiers] = useState<Cashier[]>([]);
  const [summary, setSummary] = useState<ReportSummary>({
    totalMonths: 0,
    totalRevenue: 0,
    totalProfit: 0,
    totalTransactions: 0,
    averageMonthlyRevenue: 0,
    averageMonthlyProfit: 0,
    bestMonth: { month: "", revenue: 0 },
    worstMonth: { month: "", revenue: 0 },
    overallGrowthRate: { revenue: 0, transactions: 0, profit: 0 },
  });
  const [periods, setPeriods] = useState<ReportPeriods>({
    startMonth: "",
    endMonth: "",
    totalMonths: 0,
  });
  const [pagination, setPagination] = useState<Pagination>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 12,
  });

  // Set bulan default ke bulan ini dan 11 bulan sebelumnya
  const currentDate = new Date();
  const currentMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}`;
  const lastYear = new Date(currentDate.getFullYear() - 1, currentDate.getMonth(), 1);
  const startMonth = `${lastYear.getFullYear()}-${String(lastYear.getMonth() + 1).padStart(2, "0")}`;

  const [filters, setFilters] = useState<Filters>({
    startMonth: startMonth,
    endMonth: currentMonth,
    categoryId: "",
    supplierId: "",
    paymentMethod: "all",
    transactionType: "all",
    cashierName: "",
    minAmount: "",
    maxAmount: "",
    sortBy: "month",
    sortOrder: "desc",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [apiStatus, setApiStatus] = useState<string>("");

  useEffect(() => {
    loadCategories();
    loadSuppliers();
    loadCashiers();
    loadMonthlyTransactions();
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

  const loadMonthlyTransactions = async (page: number = 1) => {
    setIsLoading(true);

    try {
      const queryParams = new URLSearchParams({
        startMonth: filters.startMonth,
        endMonth: filters.endMonth,
        page: page.toString(),
        pageSize: pagination.itemsPerPage.toString(),
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
      });

      // Tambahkan filter ke query params
      if (filters.categoryId) queryParams.append("categoryId", filters.categoryId);
      if (filters.supplierId) queryParams.append("supplierId", filters.supplierId);
      if (filters.paymentMethod !== "all") queryParams.append("paymentMethod", filters.paymentMethod);
      if (filters.transactionType !== "all") queryParams.append("transactionType", filters.transactionType);
      if (filters.cashierName) queryParams.append("cashierName", filters.cashierName);
      if (filters.minAmount) queryParams.append("minAmount", filters.minAmount);
      if (filters.maxAmount) queryParams.append("maxAmount", filters.maxAmount);

      const response = await fetch(`/api/monthly-transactions?${queryParams.toString()}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("admin_token")}`,
        },
      });

      if (response.ok) {
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const result = await response.json();
          setMonthlyTransactions(result.data || []);
          setPagination(result.pagination || pagination);
          setSummary(result.summary || summary);
          setPeriods(result.periods || periods);
        } else {
          console.log("API Transaksi bulanan tidak tersedia, menggunakan data kosong");
          setMonthlyTransactions([]);
          setPagination({
            currentPage: 1,
            totalPages: 1,
            totalItems: 0,
            itemsPerPage: 12,
          });
          setSummary({
            totalMonths: 0,
            totalRevenue: 0,
            totalProfit: 0,
            totalTransactions: 0,
            averageMonthlyRevenue: 0,
            averageMonthlyProfit: 0,
            bestMonth: { month: "", revenue: 0 },
            worstMonth: { month: "", revenue: 0 },
            overallGrowthRate: { revenue: 0, transactions: 0, profit: 0 },
          });
          setPeriods({
            startMonth: "",
            endMonth: "",
            totalMonths: 0,
          });
        }
      } else {
        console.log("Endpoint API Transaksi bulanan tidak ditemukan");
        setMonthlyTransactions([]);
        setPagination({
          currentPage: 1,
          totalPages: 1,
          totalItems: 0,
          itemsPerPage: 12,
        });
        setSummary({
          totalMonths: 0,
          totalRevenue: 0,
          totalProfit: 0,
          totalTransactions: 0,
          averageMonthlyRevenue: 0,
          averageMonthlyProfit: 0,
          bestMonth: { month: "", revenue: 0 },
          worstMonth: { month: "", revenue: 0 },
          overallGrowthRate: { revenue: 0, transactions: 0, profit: 0 },
        });
        setPeriods({
          startMonth: "",
          endMonth: "",
          totalMonths: 0,
        });
      }
    } catch (error) {
      console.error("Error memuat transaksi bulanan:", error);
      setMonthlyTransactions([]);
      setPagination({
        currentPage: 1,
        totalPages: 1,
        totalItems: 0,
        itemsPerPage: 12,
      });
      setSummary({
        totalMonths: 0,
        totalRevenue: 0,
        totalProfit: 0,
        totalTransactions: 0,
        averageMonthlyRevenue: 0,
        averageMonthlyProfit: 0,
        bestMonth: { month: "", revenue: 0 },
        worstMonth: { month: "", revenue: 0 },
        overallGrowthRate: { revenue: 0, transactions: 0, profit: 0 },
      });
      setPeriods({
        startMonth: "",
        endMonth: "",
        totalMonths: 0,
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
    loadMonthlyTransactions(1);
  };

  const resetFilters = () => {
    const currentDate = new Date();
    const currentMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, "0")}`;
    const lastYear = new Date(currentDate.getFullYear() - 1, currentDate.getMonth(), 1);
    const startMonth = `${lastYear.getFullYear()}-${String(lastYear.getMonth() + 1).padStart(2, "0")}`;

    setFilters({
      startMonth: startMonth,
      endMonth: currentMonth,
      categoryId: "",
      supplierId: "",
      paymentMethod: "all",
      transactionType: "all",
      cashierName: "",
      minAmount: "",
      maxAmount: "",
      sortBy: "month",
      sortOrder: "desc",
    });
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
    loadMonthlyTransactions(1);
  };

  const handlePageChange = (page: number) => {
    loadMonthlyTransactions(page);
  };

  const exportToCSV = async () => {
    setIsExporting(true);

    try {
      const exportData = {
        startMonth: filters.startMonth,
        endMonth: filters.endMonth,
        categoryId: filters.categoryId,
        supplierId: filters.supplierId,
        paymentMethod: filters.paymentMethod,
        transactionType: filters.transactionType,
        cashierName: filters.cashierName,
        minAmount: filters.minAmount ? parseFloat(filters.minAmount) : undefined,
        maxAmount: filters.maxAmount ? parseFloat(filters.maxAmount) : undefined,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
      };

      const response = await fetch("/api/monthly-transactions/export", {
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
          a.download = `laporan-transaksi-bulanan-${new Date().getTime()}.csv`;
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

  const getGrowthIndicator = (rate: number) => {
    if (rate > 0) {
      return (
        <div className="flex items-center text-green-600">
          <ArrowUp className="w-4 h-4 mr-1" />
          <span className="text-sm font-medium">{rate.toFixed(1)}%</span>
        </div>
      );
    } else if (rate < 0) {
      return (
        <div className="flex items-center text-red-600">
          <ArrowDown className="w-4 h-4 mr-1" />
          <span className="text-sm font-medium">{Math.abs(rate).toFixed(1)}%</span>
        </div>
      );
    } else {
      return (
        <div className="flex items-center text-gray-500">
          <span className="text-sm font-medium">0%</span>
        </div>
      );
    }
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
                <h2 className="text-xl font-semibold text-gray-800">Laporan Transaksi Bulanan</h2>
                <p className="text-sm text-gray-600 mt-1">Analisis Tren Penjualan dan Performa Bulanan</p>
                {periods.startMonth && periods.endMonth && (
                  <p className="text-xs text-blue-600 mt-1">
                    Periode: {periods.startMonth} - {periods.endMonth} ({periods.totalMonths} bulan)
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
                  onClick={() => loadMonthlyTransactions(pagination.currentPage)}
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
                {/* Start Month */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bulan Mulai</label>
                  <input
                    type="month"
                    value={filters.startMonth}
                    onChange={(e) => handleFilterChange("startMonth", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black text-sm"
                  />
                </div>

                {/* End Month */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bulan Akhir</label>
                  <input
                    type="month"
                    value={filters.endMonth}
                    onChange={(e) => handleFilterChange("endMonth", e.target.value)}
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pendapatan Minimum</label>
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Pendapatan Maksimum</label>
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
                    <option value="month">Bulan</option>
                    <option value="revenue">Pendapatan</option>
                    <option value="transactions">Jumlah Transaksi</option>
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Calendar className="w-8 h-8 text-blue-500" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-600">Total Bulan</p>
                      <p className="text-lg font-semibold text-black">{summary.totalMonths}</p>
                    </div>
                  </div>
                  {getGrowthIndicator(summary.overallGrowthRate.revenue)}
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <DollarSign className="w-8 h-8 text-green-500" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-600">Total Pendapatan</p>
                      <p className="text-lg font-semibold text-black">Rp {summary.totalRevenue.toLocaleString("id-ID")}</p>
                    </div>
                  </div>
                  {getGrowthIndicator(summary.overallGrowthRate.revenue)}
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <TrendingUp className="w-8 h-8 text-purple-500" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-600">Total Keuntungan</p>
                      <p className="text-lg font-semibold text-black">Rp {summary.totalProfit.toLocaleString("id-ID")}</p>
                    </div>
                  </div>
                  {getGrowthIndicator(summary.overallGrowthRate.profit)}
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Receipt className="w-8 h-8 text-orange-500" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-600">Total Transaksi</p>
                      <p className="text-lg font-semibold text-black">{summary.totalTransactions.toLocaleString("id-ID")}</p>
                    </div>
                  </div>
                  {getGrowthIndicator(summary.overallGrowthRate.transactions)}
                </div>
              </div>
            </div>

            {/* Additional Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex items-center">
                  <BarChart3 className="w-6 h-6 text-blue-500" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">Rata-rata Bulanan</p>
                    <p className="text-base font-semibold text-black">Rp {summary.averageMonthlyRevenue.toLocaleString("id-ID")}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex items-center">
                  <TrendingUp className="w-6 h-6 text-green-500" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">Bulan Terbaik</p>
                    <p className="text-base font-semibold text-black">{summary.bestMonth.month || "N/A"}</p>
                    <p className="text-xs text-green-600">Rp {summary.bestMonth.revenue.toLocaleString("id-ID")}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex items-center">
                  <TrendingDown className="w-6 h-6 text-red-500" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">Bulan Terlemah</p>
                    <p className="text-base font-semibold text-black">{summary.worstMonth.month || "N/A"}</p>
                    <p className="text-xs text-red-600">Rp {summary.worstMonth.revenue.toLocaleString("id-ID")}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex items-center">
                  <Package className="w-6 h-6 text-indigo-500" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">Keuntungan Rata-rata</p>
                    <p className="text-base font-semibold text-black">Rp {summary.averageMonthlyProfit.toLocaleString("id-ID")}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Monthly Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Periode</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Transaksi</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pendapatan</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Keuntungan</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rata-rata Harian</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pertumbuhan</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pembayaran</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Barang Terlaris</th>
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
                ) : monthlyTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                      {apiStatus.includes("Tidak Tersedia") ? (
                        <div className="space-y-2">
                          <p>Tidak ada data - API backend belum tersedia</p>
                          <p className="text-xs text-orange-600">Silakan implementasikan API endpoints untuk melihat data lengkap</p>
                        </div>
                      ) : (
                        "Tidak ada data transaksi bulanan"
                      )}
                    </td>
                  </tr>
                ) : (
                  monthlyTransactions.map((monthData) => (
                    <tr key={monthData.month} className="hover:bg-gray-50">
                      <td className="px-4 py-4">
                        <div className="text-sm font-medium text-black">{monthData.monthName}</div>
                        <div className="text-xs text-gray-500">{monthData.month}</div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm font-medium text-black">{monthData.totalTransactions.toLocaleString("id-ID")}</div>
                        <div className="text-xs text-gray-500">Penjualan: {monthData.transactionsByType.sale.count}</div>
                        {monthData.transactionsByType.return.count > 0 && <div className="text-xs text-red-500">Retur: {monthData.transactionsByType.return.count}</div>}
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm font-medium text-black">Rp {monthData.totalRevenue.toLocaleString("id-ID")}</div>
                        <div className="text-xs text-gray-500">Rata-rata: Rp {monthData.averageTransaction.toLocaleString("id-ID")}</div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm font-medium text-green-600">Rp {monthData.totalProfit.toLocaleString("id-ID")}</div>
                        <div className="text-xs text-green-500">Margin: {monthData.averageProfitMargin.toFixed(1)}%</div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-xs text-gray-600">
                          <div>Transaksi: {monthData.dailyAverage.transactions.toFixed(0)}/hari</div>
                          <div>Pendapatan: Rp {monthData.dailyAverage.revenue.toLocaleString("id-ID")}</div>
                          <div>Keuntungan: Rp {monthData.dailyAverage.profit.toLocaleString("id-ID")}</div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-gray-500">Pendapatan:</span>
                            {getGrowthIndicator(monthData.growthRate.revenue)}
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="text-xs text-gray-500">Transaksi:</span>
                            {getGrowthIndicator(monthData.growthRate.transactions)}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded"></div>
                            <span className="text-xs text-gray-600">Tunai: {monthData.paymentMethodBreakdown.cash.count}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-blue-500 rounded"></div>
                            <span className="text-xs text-gray-600">Transfer: {monthData.paymentMethodBreakdown.transfer.count}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-purple-500 rounded"></div>
                            <span className="text-xs text-gray-600">Kredit: {monthData.paymentMethodBreakdown.credit.count}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="space-y-1">
                          {monthData.topSellingItems.slice(0, 3).map((item, index) => (
                            <div key={index} className="text-xs">
                              <div className="font-medium text-gray-800 truncate max-w-32" title={item.itemName}>
                                {item.itemName}
                              </div>
                              <div className="text-gray-500">
                                {item.quantity} unit - Rp {item.revenue.toLocaleString("id-ID")}
                              </div>
                            </div>
                          ))}
                        </div>
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

          {/* Detailed Analysis */}
          <div className="px-6 py-4 bg-blue-50 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-800 mb-4">Analisis Tren Bulanan</h3>

            {/* Growth Trend Analysis */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-gray-700">Tren Pendapatan</h4>
                  {getGrowthIndicator(summary.overallGrowthRate.revenue)}
                </div>
                <div className="text-lg font-semibold text-black">Rp {summary.averageMonthlyRevenue.toLocaleString("id-ID")}/bulan</div>
                <div className="text-xs text-gray-500">Rata-rata bulanan</div>
              </div>

              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-gray-700">Tren Transaksi</h4>
                  {getGrowthIndicator(summary.overallGrowthRate.transactions)}
                </div>
                <div className="text-lg font-semibold text-black">{Math.round(summary.totalTransactions / Math.max(summary.totalMonths, 1)).toLocaleString("id-ID")}/bulan</div>
                <div className="text-xs text-gray-500">Rata-rata bulanan</div>
              </div>

              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium text-gray-700">Tren Keuntungan</h4>
                  {getGrowthIndicator(summary.overallGrowthRate.profit)}
                </div>
                <div className="text-lg font-semibold text-black">Rp {summary.averageMonthlyProfit.toLocaleString("id-ID")}/bulan</div>
                <div className="text-xs text-gray-500">Rata-rata bulanan</div>
              </div>
            </div>

            {/* Performance Insights */}
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <h4 className="text-sm font-medium text-gray-800 mb-3">Insight Performa</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h5 className="text-xs font-medium text-gray-600 mb-2">Bulan Terbaik vs Terburuk</h5>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-green-600 font-medium">{summary.bestMonth.month || "N/A"}</span>
                      <span className="text-green-600">Rp {summary.bestMonth.revenue.toLocaleString("id-ID")}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-red-600 font-medium">{summary.worstMonth.month || "N/A"}</span>
                      <span className="text-red-600">Rp {summary.worstMonth.revenue.toLocaleString("id-ID")}</span>
                    </div>
                    <div className="text-xs text-gray-500 pt-1">Selisih: Rp {(summary.bestMonth.revenue - summary.worstMonth.revenue).toLocaleString("id-ID")}</div>
                  </div>
                </div>

                <div>
                  <h5 className="text-xs font-medium text-gray-600 mb-2">Ringkasan Periode</h5>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Periode:</span>
                      <span className="font-medium text-black">{summary.totalMonths} bulan</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Pendapatan:</span>
                      <span className="font-medium text-green-600">Rp {summary.totalRevenue.toLocaleString("id-ID")}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Keuntungan:</span>
                      <span className="font-medium text-purple-600">Rp {summary.totalProfit.toLocaleString("id-ID")}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Transaksi:</span>
                      <span className="font-medium text-blue-600">{summary.totalTransactions.toLocaleString("id-ID")}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LaporanTransaksiBulananPage;
