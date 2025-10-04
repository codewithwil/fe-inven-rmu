"use client";

import React, { useState, useEffect } from "react";
import {
  Calendar,
  Download,
  Filter,
  Search,
  RefreshCw,
  Package,
  AlertCircle,
} from "lucide-react";
import SummaryCard from "./summaryCard";
import { useReportSummaryTable } from "@/app/hooks/repBestSellTable";
import axios from "axios";

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

interface Category {
  categoryId: number;
  name: string;
}

interface Supplier {
  supplierId: number;
  name: string;
}

interface SalesPerformanceItem {
  id: number;
  itemName: string;
  categoryName: string;
  totalQuantitySold: number;
  totalRevenue: number;
  totalProfit: number;
  profitMargin: number;
  salesFrequency: number;
  currentStock: number;
  daysWithoutSale?: number;
  lastSaleDate?: string | null;
}

const LaporanPerformaPenjualanPage: React.FC = () => {
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

  const [showFilters, setShowFilters] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const { data: salesItems = [], loading: isLoading, status: apiStatus } =
    useReportSummaryTable(filters);

  const handleFilterChange = (key: keyof Filters, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      ...(key === "performanceType" && {
        sortOrder: value === "best-selling" ? "desc" : value === "slow-moving" ? "asc" : prev.sortOrder,
      }),
    }));
  };
  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    // Fetch categories
    axios
      .get(`${API_URL}/resources/category?all=true`, { headers })
      .then(res => setCategories(res.data.data.category || []))
      .catch(() => setCategories([]));

    // Fetch suppliers
    axios
      .get(`${API_URL}/resources/supplier?all=true`, { headers })
      .then(res => setSuppliers(res.data.data.supplier || []))
      .catch(() => setSuppliers([]));
  }, []);


  const applyFilters = () => {
    // Implementasikan logika fetch/filter
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
  };

  const exportSalesToCSV = () => {
    // Implement CSV export
  };

  const loadSalesItems = (filters: Filters) => {
  };

  const performanceBadges = [
    { check: (item: SalesPerformanceItem) => item.daysWithoutSale && item.daysWithoutSale > 30, label: "Tidak Laku", color: "red" },
    { check: (item: SalesPerformanceItem) => item.salesFrequency > 1, label: "Sangat Laku", color: "green" },
    { check: (item: SalesPerformanceItem) => item.salesFrequency > 0.5, label: "Laku", color: "blue" },
    { check: (_: SalesPerformanceItem) => true, label: "Kurang Laku", color: "yellow" },
  ];

  const getPerformanceBadge = (item: SalesPerformanceItem) => {
    const badge = performanceBadges.find(b => b.check(item))!;
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full border bg-${badge.color}-100 text-${badge.color}-800 border-${badge.color}-200`}>
        {badge.label}
      </span>
    );
  };

  const getStockStatus = (item: SalesPerformanceItem) => {
    const ratio = item.currentStock / (item.salesFrequency * 30 || 1);
    if (ratio > 6) return { status: "Overstock", color: "text-red-600", icon: AlertCircle };
    if (ratio > 3) return { status: "Normal", color: "text-green-600", icon: Package };
    if (ratio > 1) return { status: "Optimal", color: "text-blue-600", icon: Package };
    return { status: "Low Stock", color: "text-yellow-600", icon: AlertCircle };
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">Laporan Performa Penjualan</h2>
          <p className="text-sm text-gray-600 mt-1">Analisis Barang Paling Laku dan Tidak Laku</p>
          {apiStatus && (
            <p className={`text-xs mt-1 ${apiStatus.includes("Not Available") ? "text-orange-600" : "text-green-600"}`}>
              Status: {apiStatus}
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <div />
          <div className="flex gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 flex items-center gap-2"
            >
              <Filter className="w-4 h-4" /> Filter
            </button>
            <button
              onClick={() => loadSalesItems(filters)}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 flex items-center gap-2"
            >
              <RefreshCw className="w-4 h-4" /> Refresh
            </button>
            <button
              onClick={exportSalesToCSV}
              className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 flex items-center gap-2"
            >
              <Download className="w-4 h-4" /> Export CSV
            </button>
          </div>
        </div>

        {/* Filters Dropdown */}
        {showFilters && (
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200 grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { label: "Tipe Performa", type: "select", key: "performanceType", options: [{ value: "all", label: "Semua" }, { value: "best-selling", label: "Paling Laku" }, { value: "slow-moving", label: "Kurang Laku" }] },
              { label: "Kategori", type: "select", key: "categoryId", options: categories.map(c => ({ value: c.categoryId.toString(), label: c.name })) },
              { label: "Supplier", type: "select", key: "supplierId", options: suppliers.map(s => ({ value: s.supplierId.toString(), label: s.name })) },
              { label: "Tanggal Mulai", type: "date", key: "startDate" },
              { label: "Tanggal Akhir", type: "date", key: "endDate" },
              { label: "Qty Minimum", type: "number", key: "minQuantity", placeholder: "0" },
            ].map((f) => (
              <div key={f.key}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{f.label}</label>
                {f.type === "select" ? (
                  <select
                    value={filters[f.key as keyof Filters]}
                    onChange={(e) => handleFilterChange(f.key as keyof Filters, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black text-sm"
                  >
                    {f.options?.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type={f.type}
                    value={filters[f.key as keyof Filters]}
                    onChange={(e) => handleFilterChange(f.key as keyof Filters, e.target.value)}
                    placeholder={f.placeholder || ""}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black text-sm"
                  />
                )}
              </div>
            ))}
          </div>
        )}

        {/* Apply/Reset Buttons */}
        {showFilters && (
          <div className="px-6 py-4 flex gap-3">
            <button
              onClick={applyFilters}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 flex items-center gap-2"
            >
              <Search className="w-4 h-4" /> Terapkan Filter
            </button>
            <button
              onClick={resetFilters}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Reset
            </button>
          </div>
        )}

        {/* Summary */}
        <SummaryCard />

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                {["Barang","Kategori","Qty Terjual","Revenue","Profit","Margin","Frekuensi","Stock","Status","Last Sale"].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={10} className="px-4 py-8 text-center text-gray-500">
                    <RefreshCw className="w-5 h-5 animate-spin inline mr-2" /> Memuat data...
                  </td>
                </tr>
              ) : salesItems.length === 0 ? (
                <tr>
                  <td colSpan={10} className="px-4 py-8 text-center text-gray-500">
                    {apiStatus.includes("Not Available")
                      ? "Tidak ada data - API backend belum tersedia"
                      : "Tidak ada data performa penjualan"}
                  </td>
                </tr>
              ) : (
                salesItems.map((item) => {
                  const stockStatus = getStockStatus(item);
                  const StockIcon = stockStatus.icon;
                  return (
                    <tr key={item.id} className="text-gray-700">
                      <td className="px-4 py-3">{item.itemName}</td>
                      <td className="px-4 py-3">{item.categoryName}</td>
                      <td className="px-4 py-3">{item.totalQuantitySold}</td>
                      <td className="px-4 py-3">{item.totalRevenue}</td>
                      <td className="px-4 py-3">{(item.totalProfit ?? 0).toLocaleString("id-ID")}</td>
                      <td className="px-4 py-3">{item.profitMargin.toFixed(1)}%</td>
                      <td className="px-4 py-3">{item.salesFrequency.toFixed(2)}/hari</td>
                      <td className="px-4 py-3">
                        <StockIcon className={`w-4 h-4 ${stockStatus.color}`} /> {stockStatus.status}
                      </td>
                      <td className="px-4 py-3">{getPerformanceBadge(item)}</td>
                      <td className="px-4 py-3">{item.lastSaleDate ? new Date(item.lastSaleDate).toLocaleDateString("id-ID") : "-"}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default LaporanPerformaPenjualanPage;
