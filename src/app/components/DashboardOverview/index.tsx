"use client";

import React, { useState, useEffect } from "react";

interface DashboardData {
  hutang: {
    totalHutang: number;
    itemJatuhTempo: number;
    totalOverdue: number;
    supplierCount: number;
  };
  piutang: {
    totalPiutang: number;
    anggotaNunggak: number;
    totalNunggak: number;
    anggotaAktif: number;
  };
  transaksiHarian: {
    transaksiHariIni: number;
    pendapatanHariIni: number;
    keuntunganHariIni: number;
    itemTerjual: number;
  };
}

interface DashboardOverviewProps {
  onNavigate: (menuItem: string) => void;
}

const DashboardOverview: React.FC<DashboardOverviewProps> = ({ onNavigate }) => {
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    hutang: {
      totalHutang: 52500000,
      itemJatuhTempo: 2,
      totalOverdue: 28000000,
      supplierCount: 6,
    },
    piutang: {
      totalPiutang: 12216000,
      anggotaNunggak: 3,
      totalNunggak: 6266500,
      anggotaAktif: 6,
    },
    transaksiHarian: {
      transaksiHariIni: 0,
      pendapatanHariIni: 0,
      keuntunganHariIni: 0,
      itemTerjual: 0,
    },
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      // Load hutang data
      const hutangResponse = await fetch("/api/supplier-debts", {
        headers: { Authorization: `Bearer ${localStorage.getItem("admin_token")}` },
      });

      // Load piutang data
      const piutangResponse = await fetch("/api/anggota-piutang", {
        headers: { Authorization: `Bearer ${localStorage.getItem("admin_token")}` },
      });

      // Load transaksi harian data
      const today = new Date().toISOString().split("T")[0];
      const transaksiResponse = await fetch(`/api/daily-transactions?startDate=${today}&endDate=${today}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("admin_token")}` },
      });

      // Use demo data if API not available
      if (!hutangResponse.ok || !piutangResponse.ok || !transaksiResponse.ok) {
        console.log("Using demo data for dashboard");
      }
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-orange-400 text-white p-6 rounded-lg">
        <h1 className="text-2xl font-bold">Dashboard POS System</h1>
        <p className="text-blue-100 mt-1">Ringkasan keuangan dan operasional hari ini</p>
        <div className="text-sm text-blue-100 mt-2">
          {new Date().toLocaleDateString("id-ID", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Total Hutang</p>
              <p className="text-lg font-semibold text-red-600">Rp {dashboardData.hutang.totalHutang.toLocaleString("id-ID")}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Total Piutang</p>
              <p className="text-lg font-semibold text-orange-600">Rp {dashboardData.piutang.totalPiutang.toLocaleString("id-ID")}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Pendapatan Hari Ini</p>
              <p className="text-lg font-semibold text-green-600">Rp {dashboardData.transaksiHarian.pendapatanHariIni.toLocaleString("id-ID")}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Transaksi Hari Ini</p>
              <p className="text-lg font-semibold text-blue-600">{dashboardData.transaksiHarian.transaksiHariIni.toLocaleString("id-ID")}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Widget Laporan Hutang */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-4 py-3 border-b border-gray-200 bg-red-50">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-red-800">Laporan Hutang Supplier</h3>
              <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total Hutang</span>
              <span className="text-lg font-semibold text-red-600">Rp {dashboardData.hutang.totalHutang.toLocaleString("id-ID")}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Jatuh Tempo</span>
              <span className="text-sm font-semibold text-orange-600">{dashboardData.hutang.itemJatuhTempo} item</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total Overdue</span>
              <span className="text-sm font-semibold text-red-600">Rp {dashboardData.hutang.totalOverdue.toLocaleString("id-ID")}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Supplier Aktif</span>
              <span className="text-sm font-semibold text-gray-800">{dashboardData.hutang.supplierCount} supplier</span>
            </div>
            <div className="pt-2 border-t border-gray-200">
              <button onClick={() => onNavigate("lap-hutang")} className="w-full text-sm text-red-600 hover:text-red-800 font-medium">
                Lihat Detail →
              </button>
            </div>
          </div>
        </div>

        {/* Widget Laporan Piutang */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-4 py-3 border-b border-gray-200 bg-orange-50">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-orange-800">Laporan Piutang Anggota</h3>
              <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
          <div className="p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total Piutang</span>
              <span className="text-lg font-semibold text-orange-600">Rp {dashboardData.piutang.totalPiutang.toLocaleString("id-ID")}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Anggota Nunggak</span>
              <span className="text-sm font-semibold text-red-600">{dashboardData.piutang.anggotaNunggak} anggota</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total Nunggak</span>
              <span className="text-sm font-semibold text-red-600">Rp {dashboardData.piutang.totalNunggak.toLocaleString("id-ID")}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Anggota Aktif</span>
              <span className="text-sm font-semibold text-gray-800">{dashboardData.piutang.anggotaAktif} anggota</span>
            </div>
            <div className="pt-2 border-t border-gray-200">
              <button onClick={() => onNavigate("lap-piutang")} className="w-full text-sm text-orange-600 hover:text-orange-800 font-medium">
                Lihat Detail →
              </button>
            </div>
          </div>
        </div>

        {/* Widget Transaksi Harian */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="px-4 py-3 border-b border-gray-200 bg-green-50">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-green-800">Transaksi Hari Ini</h3>
              <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
          <div className="p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Total Transaksi</span>
              <span className="text-lg font-semibold text-blue-600">{dashboardData.transaksiHarian.transaksiHariIni}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Pendapatan</span>
              <span className="text-sm font-semibold text-green-600">Rp {dashboardData.transaksiHarian.pendapatanHariIni.toLocaleString("id-ID")}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Keuntungan</span>
              <span className="text-sm font-semibold text-green-600">Rp {dashboardData.transaksiHarian.keuntunganHariIni.toLocaleString("id-ID")}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Item Terjual</span>
              <span className="text-sm font-semibold text-gray-800">{dashboardData.transaksiHarian.itemTerjual} item</span>
            </div>
            <div className="pt-2 border-t border-gray-200">
              <button onClick={() => onNavigate("lap-transaksi-harian")} className="w-full text-sm text-green-600 hover:text-green-800 font-medium">
                Lihat Detail →
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 cursor-pointer hover:bg-blue-100 transition-colors" onClick={() => onNavigate("hal-transaksi")}>
          <div className="flex items-center">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="ml-3">
              <h4 className="text-sm font-semibold text-blue-800">Transaksi Baru</h4>
              <p className="text-xs text-blue-600">Proses penjualan</p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4 cursor-pointer hover:bg-green-100 transition-colors" onClick={() => onNavigate("stok-barang")}>
          <div className="flex items-center">
            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10" />
              </svg>
            </div>
            <div className="ml-3">
              <h4 className="text-sm font-semibold text-green-800">Cek Stok</h4>
              <p className="text-xs text-green-600">Monitor inventory</p>
            </div>
          </div>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 cursor-pointer hover:bg-purple-100 transition-colors" onClick={() => onNavigate("input-barang")}>
          <div className="flex items-center">
            <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <div className="ml-3">
              <h4 className="text-sm font-semibold text-purple-800">Input Barang</h4>
              <p className="text-xs text-purple-600">Tambah inventory</p>
            </div>
          </div>
        </div>

        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 cursor-pointer hover:bg-orange-100 transition-colors" onClick={() => onNavigate("input-supplier")}>
          <div className="flex items-center">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h4 className="text-sm font-semibold text-orange-800">Input Supplier</h4>
              <p className="text-xs text-orange-600">Tambah supplier</p>
            </div>
          </div>
        </div>
      </div>

      {/* Status Alerts */}
      <div className="space-y-3">
        {dashboardData.hutang.itemJatuhTempo > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-red-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <div className="ml-3">
                <h4 className="text-sm font-semibold text-red-800">Peringatan Hutang Jatuh Tempo</h4>
                <p className="text-sm text-red-700">Terdapat {dashboardData.hutang.itemJatuhTempo} item hutang yang sudah jatuh tempo. Segera lakukan pembayaran untuk menghindari keterlambatan.</p>
              </div>
            </div>
          </div>
        )}

        {dashboardData.piutang.anggotaNunggak > 0 && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-orange-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="ml-3">
                <h4 className="text-sm font-semibold text-orange-800">Perhatian Piutang Nunggak</h4>
                <p className="text-sm text-orange-700">Ada {dashboardData.piutang.anggotaNunggak} anggota yang nunggak pembayaran. Lakukan follow up untuk menjaga cash flow.</p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="ml-3">
              <h4 className="text-sm font-semibold text-blue-800">Info Sistem</h4>
              <p className="text-sm text-blue-700">Dashboard ini menampilkan data demo. Untuk data real-time, pastikan API backend sudah terpasang dan berjalan dengan baik.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;
