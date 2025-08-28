"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Calendar, Download, Search, RefreshCw, Gift, User, TrendingUp, Award } from "lucide-react";

// Types
interface BonusPointAnggota {
  id: string;
  uniqueId: string;
  namaAnggota: string;
  wilayah: string;
  tahun: string;
  totalTransaksi: number;
  totalPembelian: number;
  totalBonusPoint: number;
  pointTerpakai: number;
  sisaPoint: number;
  statusAnggota: "aktif" | "tidak_aktif";
  terakhirTransaksi: string;
  kontakWhatsapp: string;
  detailTransaksi: {
    transaksiPOS: number;
    pointPOS: number;
    transaksiSimpanan: number;
    pointSimpanan: number;
    transaksiPinjaman: number;
    pointPinjaman: number;
  };
}

interface Filters {
  tahun: string;
  wilayah: string;
  statusAnggota: "all" | "aktif" | "tidak_aktif";
  search: string;
  sortBy: "nama" | "totalPoint" | "sisaPoint" | "totalTransaksi";
  sortOrder: "asc" | "desc";
}

// Constants
const STATUS_ANGGOTA = {
  aktif: {
    label: "Aktif",
    color: "bg-green-100 text-green-800 border-green-200",
  },
  tidak_aktif: {
    label: "Tidak Aktif",
    color: "bg-red-100 text-red-800 border-red-200",
  },
} as const;

const WILAYAH_OPTIONS = [
  { value: "", label: "Semua Wilayah" },
  { value: "BDG", label: "Bandung (BDG)" },
  { value: "KBG", label: "Kabupaten Bandung (KBG)" },
  { value: "KBB", label: "Kabupaten Bandung Barat (KBB)" },
  { value: "KBT", label: "Kabupaten Bandung Timur (KBT)" },
  { value: "CMH", label: "Cimahi (CMH)" },
  { value: "GRT", label: "Garut (GRT)" },
  { value: "KGU", label: "Kabupaten Garut Utara (KGU)" },
  { value: "KGS", label: "Kabupaten Garut Selatan (KGS)" },
  { value: "SMD", label: "Sumedang (SMD)" },
  { value: "TSM", label: "Tasikmalaya (TSM)" },
  { value: "SMI", label: "Kota Sukabumi (SMI)" },
  { value: "KSI", label: "Kabupaten Sukabumi (KSI)" },
  { value: "KSU", label: "Kabupaten Sukabumi Utara (KSU)" },
  { value: "CJR", label: "Cianjur (CJR)" },
  { value: "BGR", label: "Bogor (BGR)" },
  { value: "KBR", label: "Kabupaten Bogor (KBR)" },
  { value: "YMG", label: "Yamughni (YMG)" },
  { value: "PMB", label: "Pembina (PMB)" },
];

const SORT_OPTIONS = [
  { value: "nama", label: "Nama Anggota" },
  { value: "totalPoint", label: "Total Bonus Point" },
  { value: "sisaPoint", label: "Sisa Point" },
  { value: "totalTransaksi", label: "Total Transaksi" },
];

// Utility functions
const formatCurrency = (amount: number): string => `Rp ${amount.toLocaleString("id-ID")}`;
const formatPoint = (point: number): string => `${point.toLocaleString("id-ID")} pts`;

const generateYearOptions = () => {
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let i = currentYear; i >= currentYear - 5; i--) {
    years.push({ value: i.toString(), label: i.toString() });
  }
  return years;
};

const generateDemoData = (): BonusPointAnggota[] => [
  {
    id: "1",
    uniqueId: "BDG-0001",
    namaAnggota: "Ahmad Sutrisno",
    wilayah: "BDG",
    tahun: "2024",
    totalTransaksi: 45,
    totalPembelian: 15750000,
    totalBonusPoint: 7875,
    pointTerpakai: 2500,
    sisaPoint: 5375,
    statusAnggota: "aktif",
    terakhirTransaksi: "2024-08-25",
    kontakWhatsapp: "081234567890",
    detailTransaksi: {
      transaksiPOS: 32,
      pointPOS: 6400,
      transaksiSimpanan: 8,
      pointSimpanan: 800,
      transaksiPinjaman: 5,
      pointPinjaman: 675,
    },
  },
  {
    id: "2",
    uniqueId: "KBG-0001",
    namaAnggota: "Siti Nurhalimah",
    wilayah: "KBG",
    tahun: "2024",
    totalTransaksi: 38,
    totalPembelian: 12300000,
    totalBonusPoint: 6150,
    pointTerpakai: 1200,
    sisaPoint: 4950,
    statusAnggota: "aktif",
    terakhirTransaksi: "2024-08-20",
    kontakWhatsapp: "082345678901",
    detailTransaksi: {
      transaksiPOS: 25,
      pointPOS: 4500,
      transaksiSimpanan: 10,
      pointSimpanan: 1200,
      transaksiPinjaman: 3,
      pointPinjaman: 450,
    },
  },
  {
    id: "3",
    uniqueId: "CMH-0001",
    namaAnggota: "Budi Pranoto",
    wilayah: "CMH",
    tahun: "2024",
    totalTransaksi: 28,
    totalPembelian: 8950000,
    totalBonusPoint: 4475,
    pointTerpakai: 800,
    sisaPoint: 3675,
    statusAnggota: "aktif",
    terakhirTransaksi: "2024-08-18",
    kontakWhatsapp: "083456789012",
    detailTransaksi: {
      transaksiPOS: 20,
      pointPOS: 3200,
      transaksiSimpanan: 6,
      pointSimpanan: 900,
      transaksiPinjaman: 2,
      pointPinjaman: 375,
    },
  },
  {
    id: "4",
    uniqueId: "GRT-0001",
    namaAnggota: "Dewi Lestari",
    wilayah: "GRT",
    tahun: "2024",
    totalTransaksi: 52,
    totalPembelian: 18500000,
    totalBonusPoint: 9250,
    pointTerpakai: 3500,
    sisaPoint: 5750,
    statusAnggota: "aktif",
    terakhirTransaksi: "2024-08-27",
    kontakWhatsapp: "084567890123",
    detailTransaksi: {
      transaksiPOS: 40,
      pointPOS: 7200,
      transaksiSimpanan: 8,
      pointSimpanan: 1200,
      transaksiPinjaman: 4,
      pointPinjaman: 850,
    },
  },
  {
    id: "5",
    uniqueId: "TSM-0001",
    namaAnggota: "Iwan Setiawan",
    wilayah: "TSM",
    tahun: "2024",
    totalTransaksi: 15,
    totalPembelian: 4200000,
    totalBonusPoint: 2100,
    pointTerpakai: 0,
    sisaPoint: 2100,
    statusAnggota: "tidak_aktif",
    terakhirTransaksi: "2024-06-15",
    kontakWhatsapp: "085678901234",
    detailTransaksi: {
      transaksiPOS: 12,
      pointPOS: 1680,
      transaksiSimpanan: 2,
      pointSimpanan: 300,
      transaksiPinjaman: 1,
      pointPinjaman: 120,
    },
  },
  {
    id: "6",
    uniqueId: "BDG-0002",
    namaAnggota: "Rina Marlina",
    wilayah: "BDG",
    tahun: "2024",
    totalTransaksi: 41,
    totalPembelian: 14250000,
    totalBonusPoint: 7125,
    pointTerpakai: 1800,
    sisaPoint: 5325,
    statusAnggota: "aktif",
    terakhirTransaksi: "2024-08-22",
    kontakWhatsapp: "086789012345",
    detailTransaksi: {
      transaksiPOS: 30,
      pointPOS: 5400,
      transaksiSimpanan: 7,
      pointSimpanan: 1050,
      transaksiPinjaman: 4,
      pointPinjaman: 675,
    },
  },
  {
    id: "7",
    uniqueId: "SMD-0001",
    namaAnggota: "Andi Wijaya",
    wilayah: "SMD",
    tahun: "2024",
    totalTransaksi: 62,
    totalPembelian: 22800000,
    totalBonusPoint: 11400,
    pointTerpakai: 4200,
    sisaPoint: 7200,
    statusAnggota: "aktif",
    terakhirTransaksi: "2024-08-28",
    kontakWhatsapp: "087890123456",
    detailTransaksi: {
      transaksiPOS: 48,
      pointPOS: 8640,
      transaksiSimpanan: 10,
      pointSimpanan: 1800,
      transaksiPinjaman: 4,
      pointPinjaman: 960,
    },
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
const StatusAnggotaBadge: React.FC<{ status: string }> = React.memo(({ status }) => {
  const statusInfo = STATUS_ANGGOTA[status.toLowerCase() as keyof typeof STATUS_ANGGOTA];

  if (!statusInfo) {
    return <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full border bg-gray-100 text-gray-800 border-gray-200">{status}</span>;
  }

  return <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full border ${statusInfo.color}`}>{statusInfo.label}</span>;
});

const PointProgressBar: React.FC<{ used: number; total: number }> = React.memo(({ used, total }) => {
  const percentage = total > 0 ? (used / total) * 100 : 0;

  return (
    <div className="w-full bg-gray-200 rounded-full h-2">
      <div className="bg-blue-600 h-2 rounded-full transition-all duration-300" style={{ width: `${percentage}%` }}></div>
    </div>
  );
});

// Main component
const LaporanBonusPointPage: React.FC = () => {
  const { makeRequest } = useApiCall();

  // State
  const [bonusPointData, setBonusPointData] = useState<BonusPointAnggota[]>([]);
  const [filteredData, setFilteredData] = useState<BonusPointAnggota[]>([]);
  const [filters, setFilters] = useState<Filters>({
    tahun: new Date().getFullYear().toString(),
    wilayah: "",
    statusAnggota: "all",
    search: "",
    sortBy: "totalPoint",
    sortOrder: "desc",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [apiStatus, setApiStatus] = useState("API Not Available - Demo Mode");

  // API functions
  const loadBonusPointData = useCallback(async () => {
    setIsLoading(true);

    try {
      const params = new URLSearchParams({
        tahun: filters.tahun,
        ...(filters.wilayah && { wilayah: filters.wilayah }),
        ...(filters.statusAnggota !== "all" && { statusAnggota: filters.statusAnggota }),
        sortBy: filters.sortBy,
        sortOrder: filters.sortOrder,
      });

      const result = await makeRequest(`/api/bonus-point-anggota?${params.toString()}`);

      if (result?.data) {
        setBonusPointData(result.data);
        setApiStatus("API Connected");
      } else {
        setBonusPointData(generateDemoData());
        setApiStatus("API Not Available - Demo Mode");
      }
    } catch (error) {
      console.error("Error loading bonus point data:", error);
      setBonusPointData(generateDemoData());
      setApiStatus("API Not Available - Demo Mode");
    } finally {
      setIsLoading(false);
    }
  }, [filters, makeRequest]);

  // Filter and sort data
  useEffect(() => {
    let filtered = [...bonusPointData];

    // Filter by wilayah
    if (filters.wilayah) {
      filtered = filtered.filter((item) => item.wilayah === filters.wilayah);
    }

    // Filter by status anggota
    if (filters.statusAnggota !== "all") {
      filtered = filtered.filter((item) => item.statusAnggota === filters.statusAnggota);
    }

    // Filter by search term
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter((item) => item.namaAnggota.toLowerCase().includes(searchLower) || item.uniqueId.toLowerCase().includes(searchLower) || item.kontakWhatsapp.includes(filters.search));
    }

    // Sort data
    filtered.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (filters.sortBy) {
        case "nama":
          aValue = a.namaAnggota.toLowerCase();
          bValue = b.namaAnggota.toLowerCase();
          break;
        case "totalPoint":
          aValue = a.totalBonusPoint;
          bValue = b.totalBonusPoint;
          break;
        case "sisaPoint":
          aValue = a.sisaPoint;
          bValue = b.sisaPoint;
          break;
        case "totalTransaksi":
          aValue = a.totalTransaksi;
          bValue = b.totalTransaksi;
          break;
        default:
          aValue = a.totalBonusPoint;
          bValue = b.totalBonusPoint;
      }

      if (filters.sortOrder === "asc") {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    setFilteredData(filtered);
  }, [bonusPointData, filters]);

  // Event handlers
  const handleFilterChange = useCallback((key: keyof Filters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const exportToCSV = useCallback(async () => {
    setIsExporting(true);

    try {
      const response = await fetch(`/api/bonus-point-anggota/export?tahun=${filters.tahun}`, {
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
        a.download = `laporan-bonus-point-${filters.tahun}-${Date.now()}.csv`;
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
  }, [filters.tahun]);

  // Effects
  useEffect(() => {
    loadBonusPointData();
  }, [loadBonusPointData]);

  // Calculate summary
  const totalAnggota = filteredData.length;
  const totalBonusPoint = filteredData.reduce((sum, item) => sum + item.totalBonusPoint, 0);
  const totalSisaPoint = filteredData.reduce((sum, item) => sum + item.sisaPoint, 0);
  const totalPointTerpakai = filteredData.reduce((sum, item) => sum + item.pointTerpakai, 0);
  const anggotaAktif = filteredData.filter((item) => item.statusAnggota === "aktif").length;
  const totalPembelian = filteredData.reduce((sum, item) => sum + item.totalPembelian, 0);

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                  <Gift className="w-6 h-6 text-yellow-500" />
                  Laporan Bonus Point Anggota
                </h2>
                <p className="text-sm text-gray-600 mt-1">Akumulasi bonus point anggota berdasarkan Unique ID per tahun</p>
                <p className={`text-xs mt-1 ${apiStatus.includes("Not Available") ? "text-orange-600" : "text-green-600"}`}>Status: {apiStatus}</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => loadBonusPointData()}
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

          {/* Summary Cards */}
          <div className="px-6 py-4 bg-gradient-to-r from-blue-50 to-purple-50 border-b border-gray-200">
            <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
              <div className="bg-white p-3 rounded-lg shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-600">Total Anggota</p>
                    <p className="text-lg font-bold text-gray-900">{totalAnggota}</p>
                  </div>
                  <User className="w-8 h-8 text-blue-500" />
                </div>
              </div>

              <div className="bg-white p-3 rounded-lg shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-600">Anggota Aktif</p>
                    <p className="text-lg font-bold text-green-600">{anggotaAktif}</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-green-500" />
                </div>
              </div>

              <div className="bg-white p-3 rounded-lg shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-600">Total Point</p>
                    <p className="text-lg font-bold text-purple-600">{formatPoint(totalBonusPoint)}</p>
                  </div>
                  <Award className="w-8 h-8 text-purple-500" />
                </div>
              </div>

              <div className="bg-white p-3 rounded-lg shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-600">Sisa Point</p>
                    <p className="text-lg font-bold text-yellow-600">{formatPoint(totalSisaPoint)}</p>
                  </div>
                  <Gift className="w-8 h-8 text-yellow-500" />
                </div>
              </div>

              <div className="bg-white p-3 rounded-lg shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-600">Point Terpakai</p>
                    <p className="text-lg font-bold text-orange-600">{formatPoint(totalPointTerpakai)}</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-orange-500" />
                </div>
              </div>

              <div className="bg-white p-3 rounded-lg shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-600">Total Pembelian</p>
                    <p className="text-sm font-bold text-blue-600">{formatCurrency(totalPembelian)}</p>
                  </div>
                  <div className="text-2xl">💰</div>
                </div>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tahun</label>
                <select
                  value={filters.tahun}
                  onChange={(e) => handleFilterChange("tahun", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black text-sm"
                >
                  {generateYearOptions().map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Wilayah</label>
                <select
                  value={filters.wilayah}
                  onChange={(e) => handleFilterChange("wilayah", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black text-sm"
                >
                  {WILAYAH_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status Anggota</label>
                <select
                  value={filters.statusAnggota}
                  onChange={(e) => handleFilterChange("statusAnggota", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black text-sm"
                >
                  <option value="all">Semua Status</option>
                  <option value="aktif">Aktif</option>
                  <option value="tidak_aktif">Tidak Aktif</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Urutkan Berdasarkan</label>
                <select
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange("sortBy", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black text-sm"
                >
                  {SORT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Urutan</label>
                <select
                  value={filters.sortOrder}
                  onChange={(e) => handleFilterChange("sortOrder", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black text-sm"
                >
                  <option value="desc">Terbesar ke Terkecil</option>
                  <option value="asc">Terkecil ke Terbesar</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pencarian</label>
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                  placeholder="Cari nama, ID, atau nomor HP..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black text-sm"
                />
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ranking</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID Anggota</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama Anggota</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Point</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Point Terpakai</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sisa Point</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Progress</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Transaksi</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Pembelian</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Detail</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {isLoading ? (
                  <tr>
                    <td colSpan={11} className="px-4 py-8 text-center text-gray-500">
                      <div className="flex items-center justify-center">
                        <RefreshCw className="w-5 h-5 animate-spin mr-2" />
                        Memuat data...
                      </div>
                    </td>
                  </tr>
                ) : filteredData.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="px-4 py-8 text-center text-gray-500">
                      <div className="space-y-2">
                        <Gift className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                        <p>Tidak ada data bonus point untuk filter yang dipilih</p>
                        {apiStatus.includes("Not Available") && <p className="text-xs text-orange-600">API backend belum tersedia - menampilkan data demo</p>}
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredData.map((item, index) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center">
                          {index < 3 ? (
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${index === 0 ? "bg-yellow-500" : index === 1 ? "bg-gray-400" : "bg-amber-600"}`}>{index + 1}</div>
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center text-xs font-semibold text-gray-600">{index + 1}</div>
                          )}
                        </div>
                      </td>

                      <td className="px-4 py-3">
                        <div className="text-sm font-medium text-blue-600">{item.uniqueId}</div>
                        <div className="text-xs text-gray-500">{item.wilayah}</div>
                      </td>

                      <td className="px-4 py-3">
                        <div className="text-sm font-medium text-black">{item.namaAnggota}</div>
                        <div className="text-xs text-gray-500">{item.kontakWhatsapp}</div>
                      </td>

                      <td className="px-4 py-3">
                        <div className="text-sm font-bold text-purple-600">{formatPoint(item.totalBonusPoint)}</div>
                        <div className="text-xs text-gray-500">Tahun {item.tahun}</div>
                      </td>

                      <td className="px-4 py-3">
                        <div className="text-sm font-semibold text-orange-600">{formatPoint(item.pointTerpakai)}</div>
                        <div className="text-xs text-gray-500">{item.totalBonusPoint > 0 ? `${((item.pointTerpakai / item.totalBonusPoint) * 100).toFixed(1)}%` : "0%"}</div>
                      </td>

                      <td className="px-4 py-3">
                        <div className="text-sm font-bold text-green-600">{formatPoint(item.sisaPoint)}</div>
                        <div className="text-xs text-gray-500">Tersisa</div>
                      </td>

                      <td className="px-4 py-3">
                        <div className="w-20">
                          <PointProgressBar used={item.pointTerpakai} total={item.totalBonusPoint} />
                        </div>
                        <div className="text-xs text-gray-500 mt-1">{item.totalBonusPoint > 0 ? `${((item.pointTerpakai / item.totalBonusPoint) * 100).toFixed(0)}%` : "0%"} terpakai</div>
                      </td>

                      <td className="px-4 py-3">
                        <div className="text-sm font-semibold text-blue-600">{item.totalTransaksi}</div>
                        <div className="text-xs text-gray-500">transaksi</div>
                      </td>

                      <td className="px-4 py-3">
                        <div className="text-sm font-medium text-black">{formatCurrency(item.totalPembelian)}</div>
                        <div className="text-xs text-gray-500">Terakhir: {new Date(item.terakhirTransaksi).toLocaleDateString("id-ID")}</div>
                      </td>

                      <td className="px-4 py-3">
                        <StatusAnggotaBadge status={item.statusAnggota} />
                      </td>

                      <td className="px-4 py-3">
                        <div className="space-y-1">
                          <div className="text-xs text-gray-600">
                            <span className="font-medium">POS:</span> {item.detailTransaksi.transaksiPOS}x ({formatPoint(item.detailTransaksi.pointPOS)})
                          </div>
                          <div className="text-xs text-gray-600">
                            <span className="font-medium">Simpanan:</span> {item.detailTransaksi.transaksiSimpanan}x ({formatPoint(item.detailTransaksi.pointSimpanan)})
                          </div>
                          <div className="text-xs text-gray-600">
                            <span className="font-medium">Pinjaman:</span> {item.detailTransaksi.transaksiPinjaman}x ({formatPoint(item.detailTransaksi.pointPinjaman)})
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Footer Summary */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Ringkasan Point Tahun {filters.tahun}</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="text-center p-3 bg-white rounded border">
                    <div className="text-xs text-gray-500">Total Point Diberikan</div>
                    <div className="text-lg font-bold text-purple-600">{formatPoint(totalBonusPoint)}</div>
                  </div>
                  <div className="text-center p-3 bg-white rounded border">
                    <div className="text-xs text-gray-500">Point Terpakai</div>
                    <div className="text-lg font-bold text-orange-600">{formatPoint(totalPointTerpakai)}</div>
                  </div>
                  <div className="text-center p-3 bg-white rounded border">
                    <div className="text-xs text-gray-500">Point Tersisa</div>
                    <div className="text-lg font-bold text-green-600">{formatPoint(totalSisaPoint)}</div>
                  </div>
                  <div className="text-center p-3 bg-white rounded border">
                    <div className="text-xs text-gray-500">Tingkat Pemakaian</div>
                    <div className="text-lg font-bold text-blue-600">{totalBonusPoint > 0 ? `${((totalPointTerpakai / totalBonusPoint) * 100).toFixed(1)}%` : "0%"}</div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Top 3 Anggota Terbaik</h4>
                <div className="space-y-2">
                  {filteredData.slice(0, 3).map((item, index) => (
                    <div key={item.id} className="flex items-center justify-between p-2 bg-white rounded border">
                      <div className="flex items-center gap-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${index === 0 ? "bg-yellow-500" : index === 1 ? "bg-gray-400" : "bg-amber-600"}`}>{index + 1}</div>
                        <div>
                          <div className="text-sm font-medium">{item.namaAnggota}</div>
                          <div className="text-xs text-gray-500">{item.uniqueId}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-purple-600">{formatPoint(item.totalBonusPoint)}</div>
                        <div className="text-xs text-gray-500">{item.totalTransaksi} transaksi</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="text-sm font-semibold text-blue-800 mb-2">ℹ️ Informasi Sistem Bonus Point</h4>
              <div className="text-blue-700 text-sm space-y-1">
                <p>
                  <strong>Cara Perhitungan:</strong>
                </p>
                <ul className="list-disc list-inside ml-4 space-y-1">
                  <li>Transaksi POS: 1 point per Rp 5.000 pembelian</li>
                  <li>Simpanan: 1 point per Rp 10.000 setoran</li>
                  <li>Pinjaman: 1 point per Rp 50.000 pinjaman yang dibayar tepat waktu</li>
                  <li>Bonus point dapat digunakan untuk potongan belanja atau hadiah</li>
                  <li>Point berlaku selama anggota masih aktif dalam koperasi</li>
                </ul>
              </div>
            </div>

            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800 text-sm">
                <strong>Tips:</strong> Gunakan laporan ini untuk program loyalitas anggota. Anggota dengan point tinggi dapat diberikan reward khusus untuk meningkatkan kepuasan dan loyalitas. Monitor juga anggota tidak aktif untuk program
                reaktivasi.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LaporanBonusPointPage;
