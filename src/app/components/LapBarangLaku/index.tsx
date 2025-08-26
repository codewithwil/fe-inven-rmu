/*
API ENDPOINTS DOCUMENTATION FOR BACKEND IMPLEMENTATION:

1. GET /api/sales-performance
   Description: Get sales performance data for best-selling and slow-moving items
   Headers: Authorization: Bearer {token}
   Query Parameters:
   - performanceType: "best-selling" | "slow-moving" | "all" (optional, default: "all")
   - startDate: string (YYYY-MM-DD) (optional)
   - endDate: string (YYYY-MM-DD) (optional)
   - categoryId: string (optional)
   - supplierId: string (optional)
   - minQuantity: number (optional, for slow-moving items threshold)
   - limit: number (optional, default: 100 for best-selling, all for slow-moving)
   - sortBy: "quantity" | "revenue" | "profit" (optional, default: "quantity")
   - sortOrder: "asc" | "desc" (optional, default: "desc" for best-selling, "asc" for slow-moving)
   - page: number (optional, default: 1)
   - pageSize: number (optional, default: 50)
   
   Response: {
     data: [
       {
         id: string,
         barcode: string,
         itemName: string,
         categoryName: string,
         categoryId: string,
         supplierName: string,
         supplierId: string,
         totalQuantitySold: number,
         totalRevenue: number,
         totalProfit: number,
         averageSellingPrice: number,
         costPrice: number,
         currentStock: number,
         daysWithoutSale: number (for slow-moving),
         lastSaleDate: string | null,
         salesFrequency: number, // sales per day
         stockTurnover: number,
         profitMargin: number, // percentage
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
       totalItems: number,
       totalRevenue: number,
       totalProfit: number,
       averageProfitMargin: number,
       bestSellingCount: number,
       slowMovingCount: number,
       stockValue: number,
       deadStockValue: number
     },
     periods: {
       startDate: string,
       endDate: string,
       totalDays: number
     }
   }

2. GET /api/categories
   Description: Get list of categories for filter dropdown
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

3. GET /api/suppliers
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

4. POST /api/sales-performance/export
   Description: Export sales performance data to CSV
   Headers: Authorization: Bearer {token}, Content-Type: application/json
   Body: {
     performanceType: string,
     startDate: string,
     endDate: string,
     categoryId: string,
     supplierId: string,
     minQuantity: number,
     sortBy: string,
     sortOrder: string
   }
   Response: CSV file download

ERROR RESPONSES:
- 400: Invalid filter parameters
- 401: Unauthorized (invalid token)
- 500: Server error
*/

"use client";

import React, { useState, useEffect } from "react";
import { Calendar, Download, Filter, Search, RefreshCw, TrendingUp, TrendingDown, Package, DollarSign, AlertCircle, BarChart3, Eye, EyeOff } from "lucide-react";

interface SalesPerformanceItem {
  id: string;
  barcode: string;
  itemName: string;
  categoryName: string;
  categoryId: string;
  supplierName: string;
  supplierId: string;
  totalQuantitySold: number;
  totalRevenue: number;
  totalProfit: number;
  averageSellingPrice: number;
  costPrice: number;
  currentStock: number;
  daysWithoutSale?: number;
  lastSaleDate?: string;
  salesFrequency: number;
  stockTurnover: number;
  profitMargin: number;
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

interface ReportSummary {
  totalItems: number;
  totalRevenue: number;
  totalProfit: number;
  averageProfitMargin: number;
  bestSellingCount: number;
  slowMovingCount: number;
  stockValue: number;
  deadStockValue: number;
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
  performanceType: "best-selling" | "slow-moving" | "all";
  startDate: string;
  endDate: string;
  categoryId: string;
  supplierId: string;
  minQuantity: string;
  sortBy: "quantity" | "revenue" | "profit";
  sortOrder: "asc" | "desc";
}

const LaporanPerformaPenjualanPage: React.FC = () => {
  const [salesItems, setSalesItems] = useState<SalesPerformanceItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [summary, setSummary] = useState<ReportSummary>({
    totalItems: 0,
    totalRevenue: 0,
    totalProfit: 0,
    averageProfitMargin: 0,
    bestSellingCount: 0,
    slowMovingCount: 0,
    stockValue: 0,
    deadStockValue: 0,
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
  const [filters, setFilters] = useState<Filters>({
    performanceType: "all",
    startDate: "",
    endDate: "",
    categoryId: "",
    supplierId: "",
    minQuantity: "",
    sortBy: "quantity",
    sortOrder: "desc",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadCategories();
    loadSuppliers();
    loadSalesPerformance();
  }, []);

  const loadCategories = async () => {
    try {
      const response = await fetch("/api/categories", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("admin_token")}`,
        },
      });

      if (response.ok) {
        const result = await response.json();
        setCategories(result.data || []);
      }
    } catch (error) {
      console.error("Error loading categories:", error);
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
        const result = await response.json();
        setSuppliers(result.data || []);
      }
    } catch (error) {
      console.error("Error loading suppliers:", error);
    }
  };

  const loadSalesPerformance = async (page: number = 1) => {
    setIsLoading(true);

    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        pageSize: pagination.itemsPerPage.toString(),
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
      });

      // Add filters to query params
      if (filters.performanceType !== "all") queryParams.append("performanceType", filters.performanceType);
      if (filters.startDate) queryParams.append("startDate", filters.startDate);
      if (filters.endDate) queryParams.append("endDate", filters.endDate);
      if (filters.categoryId) queryParams.append("categoryId", filters.categoryId);
      if (filters.supplierId) queryParams.append("supplierId", filters.supplierId);
      if (filters.minQuantity) queryParams.append("minQuantity", filters.minQuantity);

      const response = await fetch(`/api/sales-performance?${queryParams.toString()}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("admin_token")}`,
        },
      });

      if (response.ok) {
        const result = await response.json();
        setSalesItems(result.data || []);
        setPagination(result.pagination || pagination);
        setSummary(result.summary || summary);
        setPeriods(result.periods || periods);
      } else {
        const error = await response.json();
        alert(`Error: ${error.message || "Gagal memuat data"}`);
      }
    } catch (error) {
      console.error("Error loading sales performance:", error);
      alert("Terjadi kesalahan saat memuat data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (key: keyof Filters, value: string) => {
    setFilters((prev) => {
      const newFilters = { ...prev, [key]: value };

      // Auto-adjust sort order based on performance type
      if (key === "performanceType") {
        if (value === "best-selling") {
          newFilters.sortOrder = "desc";
        } else if (value === "slow-moving") {
          newFilters.sortOrder = "asc";
        }
      }

      return newFilters;
    });
  };

  const applyFilters = () => {
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
    loadSalesPerformance(1);
  };

  const resetFilters = () => {
    setFilters({
      performanceType: "all",
      startDate: "",
      endDate: "",
      categoryId: "",
      supplierId: "",
      minQuantity: "",
      sortBy: "quantity",
      sortOrder: "desc",
    });
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
    loadSalesPerformance(1);
  };

  const handlePageChange = (page: number) => {
    loadSalesPerformance(page);
  };

  const exportToCSV = async () => {
    setIsExporting(true);

    try {
      const exportData = {
        performanceType: filters.performanceType,
        startDate: filters.startDate,
        endDate: filters.endDate,
        categoryId: filters.categoryId,
        supplierId: filters.supplierId,
        minQuantity: filters.minQuantity ? parseInt(filters.minQuantity) : undefined,
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
      };

      const response = await fetch("/api/sales-performance/export", {
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
        a.download = `laporan-performa-penjualan-${new Date().getTime()}.csv`;
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

  const getPerformanceBadge = (item: SalesPerformanceItem) => {
    if (item.daysWithoutSale && item.daysWithoutSale > 30) {
      return <span className="px-2 py-1 text-xs font-medium rounded-full border bg-red-100 text-red-800 border-red-200">Tidak Laku</span>;
    } else if (item.salesFrequency > 1) {
      return <span className="px-2 py-1 text-xs font-medium rounded-full border bg-green-100 text-green-800 border-green-200">Sangat Laku</span>;
    } else if (item.salesFrequency > 0.5) {
      return <span className="px-2 py-1 text-xs font-medium rounded-full border bg-blue-100 text-blue-800 border-blue-200">Laku</span>;
    } else {
      return <span className="px-2 py-1 text-xs font-medium rounded-full border bg-yellow-100 text-yellow-800 border-yellow-200">Kurang Laku</span>;
    }
  };

  const getProfitMarginBadge = (margin: number) => {
    if (margin >= 30) {
      return <span className="px-2 py-1 text-xs font-medium rounded-full border bg-green-100 text-green-800 border-green-200">Tinggi</span>;
    } else if (margin >= 15) {
      return <span className="px-2 py-1 text-xs font-medium rounded-full border bg-blue-100 text-blue-800 border-blue-200">Sedang</span>;
    } else if (margin >= 5) {
      return <span className="px-2 py-1 text-xs font-medium rounded-full border bg-yellow-100 text-yellow-800 border-yellow-200">Rendah</span>;
    } else {
      return <span className="px-2 py-1 text-xs font-medium rounded-full border bg-red-100 text-red-800 border-red-200">Sangat Rendah</span>;
    }
  };

  const getStockStatus = (item: SalesPerformanceItem) => {
    const stockRatio = item.currentStock / (item.salesFrequency * 30 || 1);
    if (stockRatio > 6) {
      return { status: "Overstock", color: "text-red-600", icon: AlertCircle };
    } else if (stockRatio > 3) {
      return { status: "Normal", color: "text-green-600", icon: Package };
    } else if (stockRatio > 1) {
      return { status: "Optimal", color: "text-blue-600", icon: Package };
    } else {
      return { status: "Low Stock", color: "text-yellow-600", icon: AlertCircle };
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
                <h2 className="text-xl font-semibold text-gray-800">Laporan Performa Penjualan</h2>
                <p className="text-sm text-gray-600 mt-1">Analisis Barang Paling Laku dan Tidak Laku</p>
                {periods.startDate && periods.endDate && (
                  <p className="text-xs text-blue-600 mt-1">
                    Periode: {new Date(periods.startDate).toLocaleDateString("id-ID")} - {new Date(periods.endDate).toLocaleDateString("id-ID")} ({periods.totalDays} hari)
                  </p>
                )}
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
                  onClick={() => loadSalesPerformance(pagination.currentPage)}
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
                {/* Performance Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Jenis Performa</label>
                  <select
                    value={filters.performanceType}
                    onChange={(e) => handleFilterChange("performanceType", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black text-sm"
                  >
                    <option value="all">Semua</option>
                    <option value="best-selling">Paling Laku</option>
                    <option value="slow-moving">Kurang Laku</option>
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

                {/* Min Quantity for Slow Moving */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Min. Qty (Slow Moving)</label>
                  <input
                    type="number"
                    value={filters.minQuantity}
                    onChange={(e) => handleFilterChange("minQuantity", e.target.value)}
                    placeholder="Threshold minimum"
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
                    <option value="quantity">Quantity Terjual</option>
                    <option value="revenue">Revenue</option>
                    <option value="profit">Profit</option>
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
            <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex items-center">
                  <DollarSign className="w-8 h-8 text-green-500" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                    <p className="text-lg font-semibold text-black">Rp {summary.totalRevenue.toLocaleString("id-ID")}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex items-center">
                  <TrendingUp className="w-8 h-8 text-blue-500" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">Total Profit</p>
                    <p className="text-lg font-semibold text-black">Rp {summary.totalProfit.toLocaleString("id-ID")}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex items-center">
                  <BarChart3 className="w-8 h-8 text-purple-500" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">Avg Profit Margin</p>
                    <p className="text-lg font-semibold text-black">{summary.averageProfitMargin.toFixed(1)}%</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex items-center">
                  <Package className="w-8 h-8 text-orange-500" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">Total Items</p>
                    <p className="text-lg font-semibold text-black">{summary.totalItems.toLocaleString("id-ID")}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex items-center">
                  <TrendingUp className="w-6 h-6 text-green-500" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">Best Selling</p>
                    <p className="text-base font-semibold text-black">{summary.bestSellingCount}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex items-center">
                  <TrendingDown className="w-6 h-6 text-red-500" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">Slow Moving</p>
                    <p className="text-base font-semibold text-black">{summary.slowMovingCount}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex items-center">
                  <Package className="w-6 h-6 text-blue-500" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">Stock Value</p>
                    <p className="text-base font-semibold text-black">Rp {summary.stockValue.toLocaleString("id-ID")}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg border border-gray-200">
                <div className="flex items-center">
                  <AlertCircle className="w-6 h-6 text-red-500" />
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-600">Dead Stock Value</p>
                    <p className="text-base font-semibold text-black">Rp {summary.deadStockValue.toLocaleString("id-ID")}</p>
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
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Barang</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Kategori</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Qty Terjual</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Revenue</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Profit</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Margin</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Frekuensi</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Sale</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {isLoading ? (
                  <tr>
                    <td colSpan={10} className="px-4 py-8 text-center text-gray-500">
                      <div className="flex items-center justify-center">
                        <RefreshCw className="w-5 h-5 animate-spin mr-2" />
                        Memuat data...
                      </div>
                    </td>
                  </tr>
                ) : salesItems.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="px-4 py-8 text-center text-gray-500">
                      Tidak ada data performa penjualan
                    </td>
                  </tr>
                ) : (
                  salesItems.map((item) => {
                    const stockStatus = getStockStatus(item);
                    const StockIcon = stockStatus.icon;

                    return (
                      <tr key={item.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="text-sm font-medium text-black">{item.itemName}</div>
                          <div className="text-xs text-gray-500">{item.barcode}</div>
                          <div className="text-xs text-gray-500">{item.supplierName}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm text-black">{item.categoryName}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm font-medium text-black">{item.totalQuantitySold.toLocaleString("id-ID")}</div>
                          <div className="text-xs text-gray-500">Turnover: {item.stockTurnover.toFixed(2)}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm font-medium text-black">Rp {item.totalRevenue.toLocaleString("id-ID")}</div>
                          <div className="text-xs text-gray-500">Avg: Rp {item.averageSellingPrice.toLocaleString("id-ID")}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm font-medium text-green-600">Rp {item.totalProfit.toLocaleString("id-ID")}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex flex-col gap-1">
                            <span className="text-sm font-medium text-black">{item.profitMargin.toFixed(1)}%</span>
                            {getProfitMarginBadge(item.profitMargin)}
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm text-black">{item.salesFrequency.toFixed(2)}/hari</div>
                          {item.daysWithoutSale && <div className="text-xs text-red-500">{item.daysWithoutSale} hari tanpa penjualan</div>}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <StockIcon className={`w-4 h-4 ${stockStatus.color}`} />
                            <div>
                              <div className="text-sm font-medium text-black">{item.currentStock}</div>
                              <div className={`text-xs ${stockStatus.color}`}>{stockStatus.status}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3">{getPerformanceBadge(item)}</td>
                        <td className="px-4 py-3">{item.lastSaleDate ? <div className="text-sm text-black">{new Date(item.lastSaleDate).toLocaleDateString("id-ID")}</div> : <div className="text-sm text-gray-500">-</div>}</td>
                      </tr>
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

          {/* Performance Insights */}
          <div className="px-6 py-4 bg-blue-50 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-800 mb-3">💡 Insight Performa</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-medium text-gray-700 mb-2">📈 Barang Paling Laku:</h4>
                <ul className="text-gray-600 space-y-1">
                  <li>• Frekuensi penjualan {">"}1 unit/hari</li>
                  <li>• Stock turnover tinggi</li>
                  <li>• Perlu monitoring stock untuk avoid stockout</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-700 mb-2">📉 Barang Kurang Laku:</h4>
                <ul className="text-gray-600 space-y-1">
                  <li>• Lebih dari 30 hari tanpa penjualan</li>
                  <li>• Overstock berpotensi jadi dead stock</li>
                  <li>• Pertimbangkan promosi atau retur ke supplier</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LaporanPerformaPenjualanPage;
