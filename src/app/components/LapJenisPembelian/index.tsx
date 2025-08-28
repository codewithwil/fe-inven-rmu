"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { Calendar, Download, Filter, Search, RefreshCw, CreditCard, TrendingUp, DollarSign, MapPin, FileText, BarChart3, Clock } from "lucide-react";

// Types
interface Transaction {
  id: string;
  transactionDate: string;
  paymentMethod: "transfer" | "kredit" | "cash";
  amount: number;
  uniqueId: string;
  memberName: string;
  wilayah: string;
  description: string;
  status: string;
  referenceNumber: string;
}

interface PaymentMethodData {
  count: number;
  totalAmount: number;
  percentage: number;
  averageAmount: number;
}

interface ReportSummary {
  period: string;
  totalTransactions: number;
  totalAmount: number;
  averageTransactionAmount: number;
  methodBreakdown: {
    transfer: PaymentMethodData;
    kredit: PaymentMethodData;
    cash: PaymentMethodData;
  };
  dailyBreakdown: Array<{
    date: string;
    transfer: { count: number; amount: number };
    kredit: { count: number; amount: number };
    cash: { count: number; amount: number };
    totalCount: number;
    totalAmount: number;
  }>;
  regionalBreakdown: Record<
    string,
    {
      transfer: { count: number; amount: number };
      kredit: { count: number; amount: number };
      cash: { count: number; amount: number };
      totalCount: number;
      totalAmount: number;
    }
  >;
}

interface Region {
  code: string;
  name: string;
  memberCount: number;
}

interface Filters {
  month: string;
  wilayah: string;
  startDate: string;
  endDate: string;
  paymentMethod: "all" | "transfer" | "kredit" | "cash";
  minAmount: string;
  maxAmount: string;
  sortBy: "date" | "totalTransactions" | "totalAmount" | "paymentMethod";
  sortOrder: "asc" | "desc";
  groupBy: "daily" | "weekly" | "method";
}

// Constants
const PAYMENT_METHODS = {
  transfer: {
    label: "Transfer Bank",
    color: "bg-blue-100 text-blue-800 border-blue-200",
    iconColor: "text-blue-500",
    icon: CreditCard,
  },
  kredit: {
    label: "Kartu Kredit",
    color: "bg-purple-100 text-purple-800 border-purple-200",
    iconColor: "text-purple-500",
    icon: CreditCard,
  },
  cash: {
    label: "Tunai",
    color: "bg-green-100 text-green-800 border-green-200",
    iconColor: "text-green-500",
    icon: DollarSign,
  },
} as const;

const STATUS_MAP = {
  completed: { label: "Berhasil", color: "bg-green-100 text-green-800 border-green-200" },
  pending: { label: "Pending", color: "bg-yellow-100 text-yellow-800 border-yellow-200" },
  failed: { label: "Gagal", color: "bg-red-100 text-red-800 border-red-200" },
  processing: { label: "Diproses", color: "bg-blue-100 text-blue-800 border-blue-200" },
} as const;

const DEFAULT_REGIONS: Region[] = [
  { code: "BDG", name: "Bandung", memberCount: 0 },
  { code: "KBG", name: "Kabupaten Bandung", memberCount: 0 },
  { code: "KBB", name: "Kabupaten Bandung Barat", memberCount: 0 },
  { code: "KBT", name: "Kabupaten Bandung Timur", memberCount: 0 },
  { code: "CMH", name: "Cimahi", memberCount: 0 },
  { code: "GRT", name: "Garut", memberCount: 0 },
  { code: "KGU", name: "Kabupaten Garut Utara", memberCount: 0 },
  { code: "KGS", name: "Kabupaten Garut Selatan", memberCount: 0 },
  { code: "SMD", name: "Sumedang", memberCount: 0 },
  { code: "TSM", name: "Tasikmalaya", memberCount: 0 },
  { code: "SMI", name: "Kota Sukabumi", memberCount: 0 },
  { code: "KSI", name: "Kabupaten Sukabumi", memberCount: 0 },
  { code: "KSU", name: "Kabupaten Sukabumi Utara", memberCount: 0 },
  { code: "CJR", name: "Cianjur", memberCount: 0 },
  { code: "BGR", name: "Bogor", memberCount: 0 },
  { code: "KBR", name: "Kabupaten Bogor", memberCount: 0 },
  { code: "YMG", name: "Yamughni", memberCount: 0 },
  { code: "PMB", name: "Pembina", memberCount: 0 },
];

// Utility functions
const formatCurrency = (amount: number): string => `Rp ${amount.toLocaleString("id-ID")}`;

const generateDemoData = (filters: Filters): ReportSummary => ({
  period: filters.month || new Date().toISOString().substring(0, 7),
  totalTransactions: 285,
  totalAmount: 142500000,
  averageTransactionAmount: 500000,
  methodBreakdown: {
    transfer: { count: 120, totalAmount: 65000000, percentage: 42.1, averageAmount: 541666 },
    kredit: { count: 95, totalAmount: 52500000, percentage: 33.3, averageAmount: 552631 },
    cash: { count: 70, totalAmount: 25000000, percentage: 24.6, averageAmount: 357142 },
  },
  dailyBreakdown: [],
  regionalBreakdown: {
    BDG: {
      transfer: { count: 45, amount: 22500000 },
      kredit: { count: 35, amount: 18750000 },
      cash: { count: 25, amount: 8750000 },
      totalCount: 105,
      totalAmount: 50000000,
    },
    KBG: {
      transfer: { count: 35, amount: 17500000 },
      kredit: { count: 30, amount: 16500000 },
      cash: { count: 20, amount: 7000000 },
      totalCount: 85,
      totalAmount: 41000000,
    },
  },
});

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
const PaymentMethodBadge: React.FC<{ method: string }> = React.memo(({ method }) => {
  const methodInfo = PAYMENT_METHODS[method.toLowerCase() as keyof typeof PAYMENT_METHODS];

  if (!methodInfo) {
    return <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full border bg-gray-100 text-gray-800 border-gray-200">{method}</span>;
  }

  const Icon = methodInfo.icon;
  return (
    <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full border ${methodInfo.color}`}>
      <Icon className="w-3 h-3 mr-1" />
      {methodInfo.label}
    </span>
  );
});

const StatusBadge: React.FC<{ status: string }> = React.memo(({ status }) => {
  const statusInfo = STATUS_MAP[status.toLowerCase() as keyof typeof STATUS_MAP] || { label: status, color: "bg-gray-100 text-gray-800 border-gray-200" };

  return <span className={`px-2 py-1 text-xs font-medium rounded-full border ${statusInfo.color}`}>{statusInfo.label}</span>;
});

const SummaryCard: React.FC<{
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  title: string;
  value: string | number;
  formatter?: (value: any) => string;
}> = React.memo(({ icon: Icon, iconColor, title, value, formatter }) => (
  <div className="bg-white p-4 rounded-lg border border-gray-200">
    <div className="flex items-center">
      <Icon className={`w-8 h-8 ${iconColor}`} />
      <div className="ml-3">
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-lg font-semibold text-black">{formatter ? formatter(value) : value}</p>
      </div>
    </div>
  </div>
));

const PaymentMethodCard: React.FC<{
  method: keyof typeof PAYMENT_METHODS;
  data: PaymentMethodData;
}> = React.memo(({ method, data }) => {
  const methodInfo = PAYMENT_METHODS[method];
  const Icon = methodInfo.icon;

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          <Icon className={`w-5 h-5 ${methodInfo.iconColor} mr-2`} />
          <span className="text-sm font-medium text-gray-700">{methodInfo.label}</span>
        </div>
        <span className={`text-xs font-medium px-2 py-1 rounded-full ${methodInfo.color}`}>{data.percentage.toFixed(1)}%</span>
      </div>
      <div className="space-y-1">
        <p className="text-lg font-semibold text-black">{data.count} transaksi</p>
        <p className="text-sm text-green-600">{formatCurrency(data.totalAmount)}</p>
        <p className="text-xs text-gray-500">Rata-rata: {formatCurrency(data.averageAmount)}</p>
      </div>
    </div>
  );
});

const TransactionTable: React.FC<{
  transactions: Transaction[];
  isLoading: boolean;
  apiStatus: string;
}> = React.memo(({ transactions, isLoading, apiStatus }) => {
  if (isLoading) {
    return (
      <tr>
        <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
          <div className="flex items-center justify-center">
            <RefreshCw className="w-5 h-5 animate-spin mr-2" />
            Memuat data...
          </div>
        </td>
      </tr>
    );
  }

  if (transactions.length === 0) {
    const isDemoMode = apiStatus.includes("Not Available");
    return (
      <tr>
        <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
          <div className="space-y-2">
            <BarChart3 className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <p>{isDemoMode ? "Tidak ada data transaksi - API backend belum tersedia" : "Tidak ada transaksi untuk periode ini"}</p>
            {isDemoMode && (
              <>
                <p className="text-xs text-orange-600">Silakan implementasikan API endpoints untuk melihat detail transaksi</p>
                <p className="text-xs text-gray-400 mt-2">Data summary di atas menggunakan data demo untuk tampilan interface</p>
              </>
            )}
          </div>
        </td>
      </tr>
    );
  }

  return (
    <>
      {transactions.map((transaction) => (
        <tr key={transaction.id} className="hover:bg-gray-50">
          <td className="px-4 py-3">
            <div className="flex items-center">
              <Clock className="w-4 h-4 text-gray-400 mr-2" />
              <div>
                <div className="text-sm font-medium text-black">{new Date(transaction.transactionDate).toLocaleDateString("id-ID")}</div>
                <div className="text-xs text-gray-500">{new Date(transaction.transactionDate).toLocaleTimeString("id-ID")}</div>
              </div>
            </div>
          </td>
          <td className="px-4 py-3">
            <PaymentMethodBadge method={transaction.paymentMethod} />
          </td>
          <td className="px-4 py-3">
            <div>
              <div className="text-sm font-medium text-black">{transaction.memberName}</div>
              <div className="text-xs text-gray-500">{transaction.uniqueId}</div>
            </div>
          </td>
          <td className="px-4 py-3">
            <div className="flex items-center">
              <MapPin className="w-4 h-4 text-blue-500 mr-1" />
              <span className="text-sm text-black">{transaction.wilayah}</span>
            </div>
          </td>
          <td className="px-4 py-3">
            <div className="text-sm font-semibold text-green-600">{formatCurrency(transaction.amount)}</div>
          </td>
          <td className="px-4 py-3">
            <div className="text-sm text-gray-900 max-w-xs truncate">{transaction.description}</div>
          </td>
          <td className="px-4 py-3">
            <StatusBadge status={transaction.status} />
          </td>
          <td className="px-4 py-3">
            <div className="text-xs text-gray-500 font-mono">{transaction.referenceNumber}</div>
          </td>
        </tr>
      ))}
    </>
  );
});

// Main component
const LaporanJenisPembelianPage: React.FC = () => {
  const { makeRequest } = useApiCall();

  // State
  const [reportData, setReportData] = useState<ReportSummary>({
    period: "",
    totalTransactions: 0,
    totalAmount: 0,
    averageTransactionAmount: 0,
    methodBreakdown: {
      transfer: { count: 0, totalAmount: 0, percentage: 0, averageAmount: 0 },
      kredit: { count: 0, totalAmount: 0, percentage: 0, averageAmount: 0 },
      cash: { count: 0, totalAmount: 0, percentage: 0, averageAmount: 0 },
    },
    dailyBreakdown: [],
    regionalBreakdown: {},
  });

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [regions, setRegions] = useState<Region[]>(DEFAULT_REGIONS);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 50,
  });

  const [filters, setFilters] = useState<Filters>({
    month: new Date().toISOString().substring(0, 7),
    wilayah: "",
    startDate: "",
    endDate: "",
    paymentMethod: "all",
    minAmount: "",
    maxAmount: "",
    sortBy: "date",
    sortOrder: "desc",
    groupBy: "method",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [apiStatus, setApiStatus] = useState("API Not Available - Demo Mode");

  // Memoized values
  const queryParams = useMemo(() => {
    const params = new URLSearchParams({
      page: pagination.currentPage.toString(),
      pageSize: pagination.itemsPerPage.toString(),
      sortBy: filters.sortBy,
      sortOrder: filters.sortOrder,
      groupBy: filters.groupBy,
    });

    if (filters.month && !filters.startDate && !filters.endDate) {
      params.append("month", filters.month);
    }
    if (filters.wilayah) params.append("wilayah", filters.wilayah);
    if (filters.startDate) params.append("startDate", filters.startDate);
    if (filters.endDate) params.append("endDate", filters.endDate);
    if (filters.paymentMethod !== "all") params.append("paymentMethod", filters.paymentMethod);
    if (filters.minAmount) params.append("minAmount", filters.minAmount);
    if (filters.maxAmount) params.append("maxAmount", filters.maxAmount);

    return params;
  }, [filters, pagination.currentPage, pagination.itemsPerPage]);

  // API functions
  const loadRegions = useCallback(async () => {
    const result = await makeRequest("/api/regions");
    if (result?.data) {
      setRegions(result.data);
      setApiStatus("API Connected");
    } else {
      setRegions(DEFAULT_REGIONS);
      setApiStatus("API Not Available - Demo Mode");
    }
  }, [makeRequest]);

  const loadPaymentMethodReport = useCallback(
    async (page: number = 1) => {
      setIsLoading(true);

      try {
        const params = new URLSearchParams(queryParams.toString());
        params.set("page", page.toString());

        const result = await makeRequest(`/api/payment-method-report?${params.toString()}`);

        if (result?.data) {
          setReportData(result.data.summary || reportData);
          setTransactions(result.data.transactions || []);
          setPagination(result.pagination || pagination);
        } else {
          setReportData(generateDemoData(filters));
          setTransactions([]);
        }
      } catch (error) {
        console.error("Error loading payment method report:", error);
        setReportData(generateDemoData(filters));
        setTransactions([]);
      } finally {
        setIsLoading(false);
      }
    },
    [queryParams, makeRequest, filters]
  );

  // Event handlers
  const handleFilterChange = useCallback((key: keyof Filters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const applyFilters = useCallback(() => {
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
    loadPaymentMethodReport(1);
  }, [loadPaymentMethodReport]);

  const resetFilters = useCallback(() => {
    setFilters({
      month: new Date().toISOString().substring(0, 7),
      wilayah: "",
      startDate: "",
      endDate: "",
      paymentMethod: "all",
      minAmount: "",
      maxAmount: "",
      sortBy: "date",
      sortOrder: "desc",
      groupBy: "method",
    });
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  }, []);

  const exportToCSV = useCallback(async () => {
    setIsExporting(true);

    try {
      const response = await fetch(`/api/payment-method-report/export?${queryParams.toString()}`, {
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
          a.download = `laporan-jenis-pembelian-${filters.month || "custom"}-${Date.now()}.csv`;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
          alert("File CSV berhasil didownload!");
        } else {
          alert("Fitur export CSV tidak tersedia karena API belum terpasang");
        }
      } else {
        alert("Fitur export CSV tidak tersedia karena API belum terpasang");
      }
    } catch (error) {
      console.error("Error exporting data:", error);
      alert("Fitur export CSV tidak tersedia karena API belum terpasang");
    } finally {
      setIsExporting(false);
    }
  }, [queryParams, filters.month]);

  // Effects
  useEffect(() => {
    loadRegions();
    loadPaymentMethodReport();
  }, []);

  useEffect(() => {
    loadPaymentMethodReport();
  }, [filters]);

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold text-gray-800">Laporan Jenis Pembelian</h2>
                <p className="text-sm text-gray-600 mt-1">Ringkasan transaksi bulanan berdasarkan metode pembayaran</p>
                {reportData.period && <p className="text-xs text-blue-600 mt-1">Periode: {new Date(reportData.period + "-01").toLocaleDateString("id-ID", { year: "numeric", month: "long" })}</p>}
                <p className={`text-xs mt-1 ${apiStatus.includes("Not Available") ? "text-orange-600" : "text-green-600"}`}>Status: {apiStatus}</p>
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
                  onClick={() => loadPaymentMethodReport(pagination.currentPage)}
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Wilayah</label>
                  <select
                    value={filters.wilayah}
                    onChange={(e) => handleFilterChange("wilayah", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black text-sm"
                  >
                    <option value="">Semua Wilayah</option>
                    {regions.map((region) => (
                      <option key={region.code} value={region.code}>
                        {region.name} ({region.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Metode Pembayaran</label>
                  <select
                    value={filters.paymentMethod}
                    onChange={(e) => handleFilterChange("paymentMethod", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black text-sm"
                  >
                    <option value="all">Semua Metode</option>
                    <option value="transfer">Transfer Bank</option>
                    <option value="kredit">Kartu Kredit</option>
                    <option value="cash">Tunai</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Jumlah Minimum</label>
                  <input
                    type="number"
                    value={filters.minAmount}
                    onChange={(e) => handleFilterChange("minAmount", e.target.value)}
                    placeholder="Minimum transaksi"
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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <SummaryCard icon={FileText} iconColor="text-blue-500" title="Total Transaksi" value={reportData.totalTransactions} formatter={(val) => val.toLocaleString("id-ID")} />
              <SummaryCard icon={DollarSign} iconColor="text-green-500" title="Total Nilai" value={reportData.totalAmount} formatter={formatCurrency} />
              <SummaryCard icon={TrendingUp} iconColor="text-purple-500" title="Rata-rata Transaksi" value={reportData.averageTransactionAmount} formatter={formatCurrency} />
              <SummaryCard icon={Calendar} iconColor="text-orange-500" title="Periode" value={reportData.period ? new Date(reportData.period + "-01").toLocaleDateString("id-ID", { year: "numeric", month: "short" }) : "-"} />
            </div>

            {/* Payment Method Breakdown */}
            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-800 mb-3">Breakdown Metode Pembayaran</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <PaymentMethodCard method="transfer" data={reportData.methodBreakdown.transfer} />
                <PaymentMethodCard method="kredit" data={reportData.methodBreakdown.kredit} />
                <PaymentMethodCard method="cash" data={reportData.methodBreakdown.cash} />
              </div>
            </div>

            {/* Regional Distribution */}
            {Object.keys(reportData.regionalBreakdown).length > 0 && (
              <div className="mt-4">
                <h3 className="text-sm font-medium text-gray-800 mb-3">Distribusi Wilayah</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {Object.entries(reportData.regionalBreakdown).map(([wilayah, data]) => (
                    <div key={wilayah} className="bg-white p-3 rounded-lg border border-gray-200">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 text-blue-500 mr-1" />
                          <span className="text-sm font-medium text-gray-700">{wilayah}</span>
                        </div>
                        <span className="text-xs text-gray-500">{data.totalCount} transaksi</span>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-blue-600">Transfer: {data.transfer.count}</span>
                          <span className="text-gray-500">{formatCurrency(data.transfer.amount)}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-purple-600">Kredit: {data.kredit.count}</span>
                          <span className="text-gray-500">{formatCurrency(data.kredit.amount)}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-green-600">Tunai: {data.cash.count}</span>
                          <span className="text-gray-500">{formatCurrency(data.cash.amount)}</span>
                        </div>
                        <div className="border-t pt-1 mt-1">
                          <div className="flex justify-between text-xs font-medium">
                            <span className="text-gray-700">Total:</span>
                            <span className="text-gray-900">{formatCurrency(data.totalAmount)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Transaction Details Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal & Waktu</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Metode Pembayaran</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Anggota</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Wilayah</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Jumlah</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Deskripsi</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Referensi</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <TransactionTable transactions={transactions} isLoading={isLoading} apiStatus={apiStatus} />
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  Menampilkan {(pagination.currentPage - 1) * pagination.itemsPerPage + 1} - {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} dari {pagination.totalItems} transaksi
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => loadPaymentMethodReport(pagination.currentPage - 1)}
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
                        onClick={() => loadPaymentMethodReport(page)}
                        className={`px-3 py-2 text-sm border rounded-md ${page === pagination.currentPage ? "bg-blue-500 text-white border-blue-500" : "text-gray-700 border-gray-300 hover:bg-gray-50"}`}
                      >
                        {page}
                      </button>
                    );
                  })}

                  <button
                    onClick={() => loadPaymentMethodReport(pagination.currentPage + 1)}
                    disabled={pagination.currentPage >= pagination.totalPages}
                    className="px-3 py-2 text-sm text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Insights */}
          <div className="px-6 py-4 bg-blue-50 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-800 mb-3">Insight Laporan Jenis Pembelian</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Metode Pembayaran:</h4>
                <ul className="text-gray-600 space-y-1">
                  <li>
                    • <strong>Transfer Bank:</strong> Metode digital paling populer
                  </li>
                  <li>
                    • <strong>Kartu Kredit:</strong> Transaksi dengan nilai rata-rata tinggi
                  </li>
                  <li>
                    • <strong>Tunai:</strong> Pembayaran langsung, cocok untuk analisis cash flow
                  </li>
                  <li>• Persentase menunjukkan preferensi anggota</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Analisis Bulanan:</h4>
                <ul className="text-gray-600 space-y-1">
                  <li>• Monitor tren metode pembayaran per bulan</li>
                  <li>• Identifikasi shift dari cash ke digital</li>
                  <li>• Analisis regional preferences</li>
                  <li>• Optimalkan sistem pembayaran berdasarkan data</li>
                </ul>
              </div>
            </div>
            <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-800 text-sm">
                <strong>Catatan:</strong> Laporan ini membantu memahami pola pembayaran anggota untuk mengoptimalkan sistem dan infrastruktur pembayaran yang tersedia.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LaporanJenisPembelianPage;
