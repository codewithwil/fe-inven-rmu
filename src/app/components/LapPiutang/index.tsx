"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Calendar, Download, Search, RefreshCw, AlertTriangle, User } from "lucide-react";

// Types
interface AnggotaPiutang {
  id: string;
  uniqueId: string;
  namaAnggota: string;
  wilayah: string;
  tanggalPinjaman: string;
  nomorKontrak: string;
  jenisLayanan: string;
  jumlahPinjaman: number;
  bungaPersentase: number;
  statusPembayaran: "belum_bayar" | "cicilan" | "nunggak" | "lunas";
  jatuhTempo: string;
  jumlahTerbayar: number;
  sisaPiutang: number;
  hariTunggakan: number;
  dendaKeterlambatan: number;
  kontakWhatsapp: string;
}

interface Filters {
  month: string;
  wilayah: string;
  statusPembayaran: "all" | "belum_bayar" | "cicilan" | "nunggak" | "lunas";
  search: string;
}

// Constants
const STATUS_PEMBAYARAN = {
  belum_bayar: {
    label: "Belum Bayar",
    color: "bg-red-100 text-red-800 border-red-200",
  },
  cicilan: {
    label: "Cicilan Berjalan",
    color: "bg-blue-100 text-blue-800 border-blue-200",
  },
  nunggak: {
    label: "Nunggak",
    color: "bg-orange-100 text-orange-800 border-orange-200",
  },
  lunas: {
    label: "Lunas",
    color: "bg-green-100 text-green-800 border-green-200",
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

const JENIS_LAYANAN = ["Kredit Pembelian dari POS"];

// Utility functions
const formatCurrency = (amount: number): string => `Rp ${amount.toLocaleString("id-ID")}`;

const calculateHariTunggakan = (jatuhTempo: string): number => {
  const due = new Date(jatuhTempo);
  const today = new Date();
  const diffTime = today.getTime() - due.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
};

const generateDemoData = (): AnggotaPiutang[] => [
  {
    id: "1",
    uniqueId: "BDG-0001",
    namaAnggota: "Ahmad Sutrisno",
    wilayah: "BDG",
    tanggalPinjaman: "2024-06-15",
    nomorKontrak: "KTR-2024-001",
    jenisLayanan: "Kredit Pembelian dari POS",
    jumlahPinjaman: 2500000,
    bungaPersentase: 2.5,
    statusPembayaran: "nunggak",
    jatuhTempo: "2024-08-15",
    jumlahTerbayar: 750000,
    sisaPiutang: 1812500,
    hariTunggakan: 13,
    dendaKeterlambatan: 36250,
    kontakWhatsapp: "081234567890",
  },
  {
    id: "2",
    uniqueId: "KBG-0001",
    namaAnggota: "Siti Nurhalimah",
    wilayah: "KBG",
    tanggalPinjaman: "2024-07-01",
    nomorKontrak: "KTR-2024-002",
    jenisLayanan: "Kredit Pembelian dari POS",
    jumlahPinjaman: 1800000,
    bungaPersentase: 3.0,
    statusPembayaran: "cicilan",
    jatuhTempo: "2024-09-01",
    jumlahTerbayar: 600000,
    sisaPiutang: 1254000,
    hariTunggakan: 0,
    dendaKeterlambatan: 0,
    kontakWhatsapp: "082345678901",
  },
  {
    id: "3",
    uniqueId: "CMH-0001",
    namaAnggota: "Budi Pranoto",
    wilayah: "CMH",
    tanggalPinjaman: "2024-08-10",
    nomorKontrak: "KTR-2024-003",
    jenisLayanan: "Kredit Pembelian dari POS",
    jumlahPinjaman: 3200000,
    bungaPersentase: 2.0,
    statusPembayaran: "belum_bayar",
    jatuhTempo: "2024-09-10",
    jumlahTerbayar: 0,
    sisaPiutang: 3264000,
    hariTunggakan: 0,
    dendaKeterlambatan: 0,
    kontakWhatsapp: "083456789012",
  },
  {
    id: "4",
    uniqueId: "GRT-0001",
    namaAnggota: "Dewi Lestari",
    wilayah: "GRT",
    tanggalPinjaman: "2024-05-20",
    nomorKontrak: "KTR-2024-004",
    jenisLayanan: "Kredit Pembelian dari POS",
    jumlahPinjaman: 1500000,
    bungaPersentase: 1.5,
    statusPembayaran: "lunas",
    jatuhTempo: "2024-08-20",
    jumlahTerbayar: 1522500,
    sisaPiutang: 0,
    hariTunggakan: 0,
    dendaKeterlambatan: 0,
    kontakWhatsapp: "084567890123",
  },
  {
    id: "5",
    uniqueId: "TSM-0001",
    namaAnggota: "Iwan Setiawan",
    wilayah: "TSM",
    tanggalPinjaman: "2024-07-15",
    nomorKontrak: "KTR-2024-005",
    jenisLayanan: "Kredit Pembelian dari POS",
    jumlahPinjaman: 4500000,
    bungaPersentase: 3.5,
    statusPembayaran: "cicilan",
    jatuhTempo: "2024-10-15",
    jumlahTerbayar: 1500000,
    sisaPiutang: 3157500,
    hariTunggakan: 0,
    dendaKeterlambatan: 0,
    kontakWhatsapp: "085678901234",
  },
  {
    id: "6",
    uniqueId: "BDG-0002",
    namaAnggota: "Rina Marlina",
    wilayah: "BDG",
    tanggalPinjaman: "2024-06-01",
    nomorKontrak: "KTR-2024-006",
    jenisLayanan: "Kredit Pembelian dari POS",
    jumlahPinjaman: 2800000,
    bungaPersentase: 2.8,
    statusPembayaran: "nunggak",
    jatuhTempo: "2024-07-30",
    jumlahTerbayar: 900000,
    sisaPiutang: 1978000,
    hariTunggakan: 29,
    dendaKeterlambatan: 57340,
    kontakWhatsapp: "086789012345",
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
const StatusPembayaranBadge: React.FC<{ status: string }> = React.memo(({ status }) => {
  const statusInfo = STATUS_PEMBAYARAN[status.toLowerCase() as keyof typeof STATUS_PEMBAYARAN];

  if (!statusInfo) {
    return <span className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full border bg-gray-100 text-gray-800 border-gray-200">{status}</span>;
  }

  return <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full border ${statusInfo.color}`}>{statusInfo.label}</span>;
});

// Main component
const LaporanPiutangAnggotaPage: React.FC = () => {
  const { makeRequest } = useApiCall();

  // State
  const [piutangData, setPiutangData] = useState<AnggotaPiutang[]>([]);
  const [filteredData, setFilteredData] = useState<AnggotaPiutang[]>([]);
  const [filters, setFilters] = useState<Filters>({
    month: new Date().toISOString().substring(0, 7),
    wilayah: "",
    statusPembayaran: "all",
    search: "",
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [apiStatus, setApiStatus] = useState("API Not Available - Demo Mode");

  // API functions
  const loadPiutangData = useCallback(async () => {
    setIsLoading(true);

    try {
      const params = new URLSearchParams({
        month: filters.month,
        ...(filters.wilayah && { wilayah: filters.wilayah }),
        ...(filters.statusPembayaran !== "all" && { statusPembayaran: filters.statusPembayaran }),
      });

      const result = await makeRequest(`/api/anggota-piutang?${params.toString()}`);

      if (result?.data) {
        setPiutangData(result.data);
        setApiStatus("API Connected");
      } else {
        setPiutangData(generateDemoData());
        setApiStatus("API Not Available - Demo Mode");
      }
    } catch (error) {
      console.error("Error loading piutang data:", error);
      setPiutangData(generateDemoData());
      setApiStatus("API Not Available - Demo Mode");
    } finally {
      setIsLoading(false);
    }
  }, [filters, makeRequest]);

  // Filter data based on current filters
  useEffect(() => {
    let filtered = [...piutangData];

    // Filter by wilayah
    if (filters.wilayah) {
      filtered = filtered.filter((item) => item.wilayah === filters.wilayah);
    }

    // Filter by status pembayaran
    if (filters.statusPembayaran !== "all") {
      filtered = filtered.filter((item) => item.statusPembayaran === filters.statusPembayaran);
    }

    // Filter by search term
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        (item) => item.namaAnggota.toLowerCase().includes(searchLower) || item.uniqueId.toLowerCase().includes(searchLower) || item.nomorKontrak.toLowerCase().includes(searchLower) || item.jenisLayanan.toLowerCase().includes(searchLower)
      );
    }

    setFilteredData(filtered);
  }, [piutangData, filters]);

  // Event handlers
  const handleFilterChange = useCallback((key: keyof Filters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }, []);

  const exportToCSV = useCallback(async () => {
    setIsExporting(true);

    try {
      const response = await fetch(`/api/anggota-piutang/export?month=${filters.month}`, {
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
        a.download = `laporan-piutang-pos-${filters.month}-${Date.now()}.csv`;
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
  }, [filters.month]);

  // Effects
  useEffect(() => {
    loadPiutangData();
  }, [loadPiutangData]);

  // Calculate summary
  const totalPiutang = filteredData.reduce((sum, item) => sum + item.sisaPiutang, 0);
  const nunggakData = filteredData.filter((item) => item.statusPembayaran === "nunggak");
  const totalNunggak = nunggakData.reduce((sum, item) => sum + item.sisaPiutang, 0);
  const totalDenda = filteredData.reduce((sum, item) => sum + item.dendaKeterlambatan, 0);

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-semibold text-gray-800">Laporan Piutang Kredit POS</h2>
                <p className="text-sm text-gray-600 mt-1">Daftar piutang kredit pembelian dari Point of Sale (POS) berdasarkan Unique ID</p>
                <p className={`text-xs mt-1 ${apiStatus.includes("Not Available") ? "text-orange-600" : "text-green-600"}`}>Status: {apiStatus}</p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => loadPiutangData()}
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
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
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
                  {WILAYAH_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status Pembayaran</label>
                <select
                  value={filters.statusPembayaran}
                  onChange={(e) => handleFilterChange("statusPembayaran", e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black text-sm"
                >
                  <option value="all">Semua Status</option>
                  <option value="belum_bayar">Belum Bayar</option>
                  <option value="cicilan">Cicilan Berjalan</option>
                  <option value="nunggak">Nunggak</option>
                  <option value="lunas">Lunas</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pencarian</label>
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                  placeholder="Cari nama, ID, atau kontrak..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black text-sm"
                />
              </div>

              <div className="flex items-end">
                <div className="grid grid-cols-1 gap-2 w-full">
                  <div className="text-center p-2 bg-white rounded border">
                    <div className="text-xs text-gray-500">Total Piutang</div>
                    <div className="text-sm font-semibold text-red-600">{formatCurrency(totalPiutang)}</div>
                  </div>
                  <div className="text-center p-2 bg-white rounded border">
                    <div className="text-xs text-gray-500">Nunggak</div>
                    <div className="text-sm font-semibold text-orange-600">{nunggakData.length} anggota</div>
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
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID Anggota</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nama Anggota</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Tanggal Transaksi</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Jenis Layanan</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Jumlah Kredit</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status Pembayaran</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Jatuh Tempo</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sisa Piutang</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Denda</th>
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
                ) : filteredData.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-8 text-center text-gray-500">
                      <div className="space-y-2">
                        <User className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                        <p>Tidak ada data piutang kredit POS untuk filter yang dipilih</p>
                        {apiStatus.includes("Not Available") && <p className="text-xs text-orange-600">API backend belum tersedia - menampilkan data demo</p>}
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredData.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="text-sm font-medium text-blue-600">{item.uniqueId}</div>
                        <div className="text-xs text-gray-500">{item.wilayah}</div>
                      </td>

                      <td className="px-4 py-3">
                        <div className="text-sm font-medium text-black">{item.namaAnggota}</div>
                        <div className="text-xs text-gray-500">{item.kontakWhatsapp}</div>
                      </td>

                      <td className="px-4 py-3">
                        <div className="text-sm font-medium text-black">{new Date(item.tanggalPinjaman).toLocaleDateString("id-ID")}</div>
                        <div className="text-xs text-gray-500">{item.nomorKontrak}</div>
                      </td>

                      <td className="px-4 py-3">
                        <div className="text-sm font-medium text-black">{item.jenisLayanan}</div>
                        <div className="text-xs text-gray-500">Bunga: {item.bungaPersentase}%</div>
                      </td>

                      <td className="px-4 py-3">
                        <div className="text-sm font-medium text-black">{formatCurrency(item.jumlahPinjaman)}</div>
                        {item.jumlahTerbayar > 0 && <div className="text-xs text-green-600">Terbayar: {formatCurrency(item.jumlahTerbayar)}</div>}
                      </td>

                      <td className="px-4 py-3">
                        <StatusPembayaranBadge status={item.statusPembayaran} />
                      </td>

                      <td className="px-4 py-3">
                        <div className="text-sm font-medium text-black">{new Date(item.jatuhTempo).toLocaleDateString("id-ID")}</div>
                        {item.hariTunggakan > 0 && (
                          <div className="text-xs text-red-600 flex items-center mt-1">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            {item.hariTunggakan} hari tunggak
                          </div>
                        )}
                      </td>

                      <td className="px-4 py-3">
                        <div className={`text-sm font-semibold ${item.sisaPiutang > 0 ? "text-red-600" : "text-green-600"}`}>{formatCurrency(item.sisaPiutang)}</div>
                      </td>

                      <td className="px-4 py-3">
                        <div className={`text-sm font-semibold ${item.dendaKeterlambatan > 0 ? "text-red-600" : "text-gray-400"}`}>{formatCurrency(item.dendaKeterlambatan)}</div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Footer Summary */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
              <div className="text-center">
                <div className="text-gray-600">Total Anggota</div>
                <div className="text-lg font-semibold text-blue-600">{filteredData.length}</div>
              </div>
              <div className="text-center">
                <div className="text-gray-600">Total Piutang</div>
                <div className="text-lg font-semibold text-red-600">{formatCurrency(totalPiutang)}</div>
              </div>
              <div className="text-center">
                <div className="text-gray-600">Anggota Nunggak</div>
                <div className="text-lg font-semibold text-orange-600">{nunggakData.length}</div>
              </div>
              <div className="text-center">
                <div className="text-gray-600">Total Denda</div>
                <div className="text-lg font-semibold text-red-600">{formatCurrency(totalDenda)}</div>
              </div>
            </div>

            {totalNunggak > 0 && (
              <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <p className="text-orange-800 text-sm">
                  <strong>Perhatian:</strong> Terdapat {nunggakData.length} anggota dengan total tunggakan {formatCurrency(totalNunggak)}. Segera lakukan tindakan penagihan untuk menjaga kesehatan keuangan koperasi.
                </p>
              </div>
            )}

            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-800 text-sm">
                <strong>Tips:</strong> Sistem ini khusus untuk melacak kredit pembelian dari POS. Gunakan filter wilayah untuk fokus pada area tertentu. Export data ke CSV untuk analisis lebih lanjut dan koordinasi dengan tim penagihan
                lapangan.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LaporanPiutangAnggotaPage;
