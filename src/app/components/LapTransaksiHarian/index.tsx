"use client";

import React, { useState, useEffect } from "react";
import { Calendar, Download, Filter, Search, RefreshCw, TrendingUp, DollarSign, Package, Clock, Users, CreditCard, Receipt, Eye, EyeOff } from "lucide-react";
import SummaryCardDailyTransac from "./summaryCard";
import Pagination from "../Pagination/Pagination";
import axios from "axios";

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
  categoryId: string;
  name: string;
  code: string;
}

interface Supplier {
  supplierId: string;
  name: string;
  code: string;
}

interface Cashier {
  id: string;
  name: string;
  employeeCode: string;
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
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const token   = localStorage.getItem("admin_token");
  useEffect(() => {
    loadCategories();
    loadSuppliers();
    loadCashiers();
    loadDailyTransactions();
  }, []);

  const loadCategories = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/resources/category?all=true`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (data?.data?.category) {
      setCategories(data.data.category); 
      setApiStatus("API Tersambung");
      } else {
        setCategories([]);
        setApiStatus("API Tidak Tersedia - Mode Demo");
      }
    } catch (error) {
      console.error("Error memuat kategori:", error);
      setCategories([]);
      setApiStatus("API Tidak Tersedia - Mode Demo");
    }
  };

// Load Suppliers
  const loadSuppliers = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/resources/supplier?all=true`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setSuppliers(data?.data.supplier || []);
    } catch (error) {
      console.error("Error memuat supplier:", error);
      setSuppliers([]);
    }
  };

  const loadCashiers = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/people/allPeople`, {
        headers: { Authorization: `Bearer ${token}` },
      });

     setCashiers(
        (data?.data?.allPeople || []).map((p: any) => ({
          id: p.id,
          name: p.admin?.name || p.employee?.name || "No Name",
          role: p.role,
        }))
      );

    } catch (error) {
      console.error("Error memuat kasir:", error);
      setCashiers([]);
    }
  };


  const paymentMethodMap: Record<number, string> = {
    1: "Cash",
    2: "Transfer",
    3: "Kredit", 
  };

// Load Daily Transactions
  const loadDailyTransactions = async (page: number = 1) => {
    setIsLoading(true);
    try {
      const { data } = await axios.get(`${API_URL}/report/RepDailyTransactions`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const apiData = data.data.repDailyTransac;

      const mappedTransactions: DailyTransaction[] = apiData.data.map((tr: any) => ({
        id: tr.outProductId.toString(),
        transactionNumber: `TR-${tr.outProductId}`,
        date: tr.purchaseDate,
        time: new Date(tr.created_at).toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' }),
        cashierName: tr.users?.admin?.name || "-",
        customerName: tr.member?.name || null,
        subtotal: parseFloat(tr.subtotal),
        discount: 0,
        tax: 0,
        totalAmount: parseFloat(tr.subtotal),
        totalProfit: tr.items.reduce((sum: number, item: any) => sum + (parseFloat(item.price) - parseFloat(item.product.purchase_price)) * item.qty, 0),
        paymentMethod: paymentMethodMap[tr.purchaseType] || "unknown",
        transactionType: "sale",
        amountPaid: parseFloat(tr.subtotal),
        change: 0,
        notes: "",
        items: tr.items.map((item: any) => ({
          id: item.outItemId.toString(),
          itemName: item.product.name,
          barcode: item.product.barcode,
          categoryName: item.product.category.name,
          supplierName: item.product.supplier_id.toString(),
          quantity: item.qty,
          unitPrice: parseFloat(item.price),
          totalPrice: parseFloat(item.total),
          costPrice: parseFloat(item.product.purchase_price),
          profit: (parseFloat(item.price) - parseFloat(item.product.purchase_price)) * item.qty,
          profitMargin: ((parseFloat(item.price) - parseFloat(item.product.purchase_price)) / parseFloat(item.price)) * 100
        })),
        createdAt: tr.created_at,
        updatedAt: tr.updated_at,
      }));

      setTransactions(mappedTransactions);
       setPagination({
        currentPage: apiData.current_page,
        totalPages: apiData.last_page,
        totalItems: apiData.total,
        itemsPerPage: apiData.per_page,
      });
    } catch (error) {
      console.error(error);
      setTransactions([]);
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
                      <option key={category.categoryId} value={category.categoryId}>
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
          <SummaryCardDailyTransac/>

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
           <Pagination
            currentPage={pagination.currentPage}
            lastPage={pagination.totalPages}
            onPageChange={(page) => loadDailyTransactions(page)}
          />


        </div>
      </div>
    </div>
  );
};

export default LaporanTransaksiHarianPage;
