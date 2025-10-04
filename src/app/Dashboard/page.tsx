"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// Import your components (you'll create these)
// For now, we'll create placeholder components to avoid import errors

import DashboardOverview from "../components/DashboardOverview";
import InputBarang from "../components/InputBarang";
import InputSupplier from "../components/InputSupplier";
import ReturnBarang from "../components/ReturnBarang";
import HalTransaksi from "../components/HalTransaksi";
import StokBarang from "../components/stok-barang";
import TransaksiPiutang from "../components/TransaksiPiutang";
import LapBarangReturn from "../components/LapBarangReturn";
import LapBarangLaku from "../components/LapBarangLaku";
import LaporanTransaksiHarianPage from "../components/LapTransaksiHarian";
import LaporanTransaksiBulananPage from "../components/LapTransaksiBulanan";
import LaporanTransaksiUniqueIdPage from "../components/LapTransaksiUniqueID";
import LaporanJenisPembelianPage from "../components/LapJenisPembelian";
import LaporanHutangSupplierPage from "../components/LapHutang";
import LaporanPiutangAnggotaPage from "../components/LapPiutang";
import LaporanBonusPointPage from "../components/LapBonusPoint";
import InputKategori from "../components/InputKategori";
import AllUser from "../components/People/AllUser";
import AllMember from "../components/People/Member";
import InputAdmin from "../components/People/Admin";
import InputPetugas from "../components/People/Employee";
import AllHistoryStock from "../components/History/Stock";
import AllHistoryUser from "../components/History/User";

const Settings = () => (
  <div className="p-6">
    <h2 className="text-2xl font-bold">Settings</h2>
    <p>System settings will be implemented here.</p>
  </div>
);

// Define types for better TypeScript support
interface Admin {
  adminId: number;
  name: string;
  phone: number;
}

interface User {
  id: number;
  email: string;
  role: string;
  admin: Admin;
}


type MenuItemId =
  | "dashboard"
  | "input-kategori"
  | "input-barang"
  | "input-supplier"
  | "return-barang"
  | "hal-transaksi"
  | "transaksi-piutang-member"
  | "stok-barang"
  | "lap-barang-return"
  | "lap-barang-laku"
  | "lap-transaksi-harian"
  | "lap-transaksi-bulanan"
  | "lap-bonus-point"
  | "lap-transaksi-unique-id"
  | "lap-jenis-pembelian"
  | "lap-hutang"
  | "lap-piutang"
  | "seluruh-user"
  | "admin"
  | "petugas"
  | "member"
  | "history-user"
  | "history-stock"
  | "settings";

type CategoryId = "barang" | "transaksi" | "laporan";

const Dashboard = () => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [activeMenuItem, setActiveMenuItem] = useState<MenuItemId>("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Record<CategoryId, boolean>>({
    barang: false,
    transaksi: false,
    laporan: false,
  });

  useEffect(() => {
    // Check if user is logged in
    const userData = localStorage.getItem("admin_user");
    const token = localStorage.getItem("admin_token");

    if (!userData || !token) {
      router.push("/");
      return;
    }

    setUser(JSON.parse(userData));
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("admin_user");
    localStorage.removeItem("admin_token");
    router.push("/");
  };

  const toggleCategory = (categoryId: CategoryId) => {
    setExpandedCategories((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
  };

  interface MenuItem {
    id: MenuItemId;
    label: string;
    icon: React.ReactNode;
  }

  interface MenuCategory {
    id: CategoryId;
    label: string;
    icon: React.ReactNode;
    items: MenuItem[];
  }

  const menuCategories: MenuCategory[] = [
    {
      id: "barang" as CategoryId,
      label: "Category Barang",
      icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10" />,
      items: [
        {
          id: "input-kategori" as MenuItemId,
          label: "Input Kategori Barang",
          icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />,
        },
        {
          id: "input-barang" as MenuItemId,
          label: "Input Barang",
          icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />,
        },
        {
          id: "input-supplier" as MenuItemId,
          label: "Input Supplier",
          icon: (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
            />
          ),
        },
        {
          id: "return-barang" as MenuItemId,
          label: "Return Barang",
          icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />,
        },
      ],
    },
    {
      id: "transaksi" as CategoryId,
      label: "Category Transaksi",
      icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6l1 9H8l1-9zM8 7V5a2 2 0 012-2h4a2 2 0 012 2v2M5 7h14" />,
      items: [
        {
          id: "hal-transaksi" as MenuItemId,
          label: "Transaksi Produk",
          icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />,
        },
        {
          id: "transaksi-piutang-member" as MenuItemId,
          label: "Transaksi Piutang Member",
          icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />,
        },
        {
          id: "stok-barang" as MenuItemId,
          label: "Stok Barang",
          icon: (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m0 0V1a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1h-2a1 1 0 01-1-1V4m-9 0H4a1 1 0 00-1 1v10a1 1 0 001 1h2m9-12v8a2 2 0 01-2 2H9a2 2 0 01-2-2V4m8 0H8m0 0v8a1 1 0 001 1h6a1 1 0 001-1V4"
            />
          ),
        },
      ],
    },
    {
      id: "laporan" as CategoryId,
      label: "Category Laporan",
      icon: (
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
        />
      ),
      items: [
        // Laporan Barang
        {
          id: "lap-barang-return" as MenuItemId,
          label: "Laporan Barang Return",
          icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 15v-1a4 4 0 00-4-4H8m0 0l3 3m-3-3l3-3m5 14-2 2a3 3 0 01-4 0l-2-2m8 0V9a2 2 0 00-2-2h-1m-3 0h3" />,
        },
        {
          id: "lap-barang-laku" as MenuItemId,
          label: "Laporan Barang Paling Laku",
          icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />,
        },
        // Laporan Transaksi
        {
          id: "lap-transaksi-harian" as MenuItemId,
          label: "Laporan Transaksi Harian",
          icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a1 1 0 011-1h6a1 1 0 011 1v4M8 7H6a1 1 0 00-1 1v9a1 1 0 001 1h12a1 1 0 001-1V8a1 1 0 00-1-1h-2M8 7h8" />,
        },
        {
          id: "lap-transaksi-bulanan" as MenuItemId,
          label: "Laporan Transaksi Bulanan",
          icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />,
        },
        {
          id: "lap-transaksi-unique-id" as MenuItemId,
          label: "Laporan Transaksi per Bulan dari setiap Unique-ID",
          icon: (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2"
            />
          ),
        },
        {
          id: "lap-jenis-pembelian" as MenuItemId,
          label: "Laporan Jenis Pembelian",
          icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />,
        },
        // Laporan Keuangan
        {
          id: "lap-hutang" as MenuItemId,
          label: "Laporan Hutang",
          icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />,
        },
        {
          id: "lap-piutang" as MenuItemId,
          label: "Laporan Piutang",
          icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />,
        },
        // Laporan Member
        {
          id: "lap-bonus-point" as MenuItemId,
          label: "Laporan Bonus Point per Anggota",
          icon: (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
            />
          ),
        },
      ],
    },
    {
      id: "user" as CategoryId,
      label: "Manajemen User",
      icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6l1 9H8l1-9zM8 7V5a2 2 0 012-2h4a2 2 0 012 2v2M5 7h14" />,
      items: [
        {
          id: "seluruh-user" as MenuItemId,
          label: "Seluruh User",
          icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />,
        },
        {
          id: "admin" as MenuItemId,
          label: "Admin",
          icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />,
        },
        {
          id: "petugas" as MenuItemId,
          label: "Petugas",
          icon: (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m0 0V1a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1h-2a1 1 0 01-1-1V4m-9 0H4a1 1 0 00-1 1v10a1 1 0 001 1h2m9-12v8a2 2 0 01-2 2H9a2 2 0 01-2-2V4m8 0H8m0 0v8a1 1 0 001 1h6a1 1 0 001-1V4"
            />
          ),
        },
         {
          id: "member" as MenuItemId,
          label: "Member",
          icon: (
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2m0 0V1a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1h-2a1 1 0 01-1-1V4m-9 0H4a1 1 0 00-1 1v10a1 1 0 001 1h2m9-12v8a2 2 0 01-2 2H9a2 2 0 01-2-2V4m8 0H8m0 0v8a1 1 0 001 1h6a1 1 0 001-1V4"
            />
          ),
        },
      ],
    },
     {
      id: "history" as CategoryId,
      label: "Riwayat",
      icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6l1 9H8l1-9zM8 7V5a2 2 0 012-2h4a2 2 0 012 2v2M5 7h14" />,
      items: [
        {
          id: "history-user" as MenuItemId,
          label: "Riwayat aktivitas user",
          icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />,
        },
        {
          id: "history-stock" as MenuItemId,
          label: "Riwayat Stock",
          icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />,
        },
      ],
    },
  ];

  // Navigation handler function that matches the expected type
  const handleNavigate = (menuItem: string) => {
    setActiveMenuItem(menuItem as MenuItemId);
  };

  const renderContent = () => {
    switch (activeMenuItem) {
      case "dashboard":
        return <DashboardOverview onNavigate={handleNavigate} />;

      // Category Barang
      case "input-kategori":
        return <InputKategori />;
      case "input-barang":
        return <InputBarang />;
      case "input-supplier":
        return <InputSupplier />;
      case "return-barang":
        return <ReturnBarang />;

      // Category Transaksi
      case "hal-transaksi":
        return <HalTransaksi />;
      case "transaksi-piutang-member":
        return <TransaksiPiutang />;
      case "stok-barang":
        return <StokBarang />;

      // Category Laporan
      case "lap-transaksi-harian":
        return <LaporanTransaksiHarianPage />;
      case "lap-transaksi-bulanan":
        return <LaporanTransaksiBulananPage />;
      case "lap-hutang":
        return <LaporanHutangSupplierPage />;
      case "lap-piutang":
        return <LaporanPiutangAnggotaPage />;
      case "lap-jenis-pembelian":
        return <LaporanJenisPembelianPage />;
      case "lap-bonus-point":
        return <LaporanBonusPointPage />;
      case "lap-transaksi-unique-id":
        return <LaporanTransaksiUniqueIdPage />;
      case "lap-barang-return":
        return <LapBarangReturn />;
      case "lap-barang-laku":
        return <LapBarangLaku />;
      case "seluruh-user":
        return <AllUser />;
      case "admin":
        return <InputAdmin />;
      case "petugas":
        return <InputPetugas />;
      case "member":
        return <AllMember />;
      case "history-user":
        return <AllHistoryUser />;
      case "history-stock":
        return <AllHistoryStock />;
      // Settings
      case "settings":
        return <Settings />;

      default:
        return <DashboardOverview onNavigate={handleNavigate} />;
    }
  };

  const getPageDescription = (): string => {
    const descriptions: Record<MenuItemId, string> = {
      dashboard: "Overview of your business performance",
      "input-kategori": "Add new items to inventory",
      "input-barang": "Add new items to inventory",
      "input-supplier": "Manage supplier information and data",
      "return-barang": "Process returned items",
      "hal-transaksi": "Process sales transactions and print receipts",
      "transaksi-piutang-member": "Process receivables transactions",
      "stok-barang": "Monitor and manage inventory stock levels",
      "lap-barang-return": "View returned items reports",
      "lap-barang-laku": "View best selling items reports",
      "lap-transaksi-harian": "View daily transaction reports",
      "lap-transaksi-bulanan": "View monthly transaction reports",
      "lap-transaksi-unique-id": "View monthly transaction reports by unique ID",
      "lap-jenis-pembelian": "View purchase type reports",
      "lap-hutang": "View debt reports",
      "lap-piutang": "View receivables reports",
      "lap-bonus-point": "View bonus points report per member",
      "seluruh-user": "Manage all registered users",
      "admin": "Manage admin accounts",
      "petugas": "Manage staff/petugas accounts",
      "member": "Manage member accounts",
      "history-user": "history list of all user activities",
      "history-stock": "list of all product stock history",
      settings: "Configure system settings",
    };
    return descriptions[activeMenuItem] || "Overview of your business performance";
  };

  const getPageTitle = (): string => {
    const titles: Record<MenuItemId, string> = {
      dashboard: "Dashboard",
      "input-kategori": "Input Kategori",
      "input-barang": "Input Barang",
      "input-supplier": "Input Supplier",
      "return-barang": "Return Barang",
      "hal-transaksi": "Halaman Transaksi",
      "transaksi-piutang-member": "Transaksi Piutang",
      "stok-barang": "Stok Barang",
      "lap-barang-return": "Laporan Barang Return",
      "lap-barang-laku": "Laporan Barang Paling Laku",
      "lap-transaksi-harian": "Laporan Transaksi Harian",
      "lap-transaksi-bulanan": "Laporan Transaksi Bulanan",
      "lap-transaksi-unique-id": "Laporan Transaksi per Bulan dari setiap Unique-ID",
      "lap-jenis-pembelian": "Laporan Jenis Pembelian",
      "lap-hutang": "Laporan Hutang",
      "lap-piutang": "Laporan Piutang",
      "lap-bonus-point": "Laporan Bonus Point per Anggota",
      "seluruh-user": "Manage all registered users",
      "admin": "Manage admin accounts",
      "petugas": "Manage staff/petugas accounts",
      "member": "Manage member accounts",
      "history-user": "Riwayat Aktivitas User",
      "history-stock": "Riwayat Aktivitas Stok Produk",
      settings: "Settings",
    };
    return titles[activeMenuItem] || "Dashboard";
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white via-blue-50 to-orange-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 bg-white shadow-lg border-r border-gray-200 transition-all duration-300 ${isSidebarOpen ? "w-64" : "w-16"} overflow-y-auto`}>
        {/* Sidebar Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 sticky top-0 bg-white z-10">
          {isSidebarOpen && (
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-orange-400 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6l1 9H8l1-9zM8 7V5a2 2 0 012-2h4a2 2 0 012 2v2M5 7h14" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">POS System</h1>
                <p className="text-xs text-gray-600">Management</p>
              </div>
            </div>
          )}
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Navigation Menu */}
        <nav className="p-4 space-y-2">
          {/* Dashboard Button */}
          <button
            onClick={() => setActiveMenuItem("dashboard")}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
              activeMenuItem === "dashboard" ? "bg-gradient-to-r from-blue-50 to-orange-50 text-blue-700 border-l-4 border-blue-500" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            }`}
          >
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2 2z" />
            </svg>
            {isSidebarOpen && <span className="font-medium text-sm">Dashboard</span>}
          </button>

          {/* Categories */}
          {menuCategories.map((category) => (
            <div key={category.id} className="space-y-1">
              {/* Category Header */}
              <button
                onClick={() => toggleCategory(category.id)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 text-gray-700 hover:bg-gray-100 ${expandedCategories[category.id] ? "bg-gray-50" : ""}`}
              >
                <div className="flex items-center space-x-3">
                  <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {category.icon}
                  </svg>
                  {isSidebarOpen && <span className="font-semibold text-sm">{category.label}</span>}
                </div>
                {isSidebarOpen && (
                  <svg className={`w-4 h-4 transition-transform duration-200 ${expandedCategories[category.id] ? "transform rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                )}
              </button>

              {/* Category Items */}
              {expandedCategories[category.id] && isSidebarOpen && (
                <div className="ml-4 space-y-1">
                  {category.items.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setActiveMenuItem(item.id)}
                      className={`w-full flex items-center space-x-3 px-4 py-2 rounded-lg transition-all duration-200 text-sm ${
                        activeMenuItem === item.id ? "bg-gradient-to-r from-blue-50 to-orange-50 text-blue-700 border-l-4 border-blue-500" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      }`}
                    >
                      <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {item.icon}
                      </svg>
                      <span className="font-medium">{item.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Settings Button */}
          <button
            onClick={() => setActiveMenuItem("settings")}
            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
              activeMenuItem === "settings" ? "bg-gradient-to-r from-blue-50 to-orange-50 text-blue-700 border-l-4 border-blue-500" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            }`}
          >
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
            </svg>
            {isSidebarOpen && <span className="font-medium text-sm">Settings</span>}
          </button>
        </nav>
      </div>

      {/* Main Content */}
      <div className={`transition-all duration-300 ${isSidebarOpen ? "ml-64" : "ml-16"}`}>
        {/* Top Header */}
        <header className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Page Title */}
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{getPageTitle()}</h1>
              <p className="text-sm text-gray-600 mt-1">{getPageDescription()}</p>
            </div>

            {/* Right Side - Notifications & Profile */}
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <button className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors">
                <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM10.07 2.82a3 3 0 00-4.24 0l-2.83 2.83a3 3 0 000 4.24l7.07 7.07a3 3 0 004.24 0l2.83-2.83a3 3 0 000-4.24L10.07 2.82z" />
                </svg>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
              </button>

              {/* Profile Dropdown */}
              <div className="relative">
                <button onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-orange-400 rounded-full flex items-center justify-center">
                    <span className="text-white font-medium text-sm">
                      {user?.admin?.name?.charAt(0).toUpperCase() || "A"}
                    </span>

                  </div>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium text-gray-900">{user?.admin?.name || "Name not set"}</p>
                    <p className="text-xs text-gray-600">{user?.email}</p>
                  </div>
                  <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {isProfileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                    <div className="px-4 py-2 border-b border-gray-200">
                      <p className="text-sm font-medium text-gray-900">{user?.admin?.name || "Name not set"}</p>
                      <p className="text-xs text-gray-600">{user?.email}</p>
                    </div>

                    <button onClick={() => setActiveMenuItem("settings")} className="w-full flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors">
                      <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                        />
                      </svg>
                      Account Settings
                    </button>

                    <button onClick={handleLogout} className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors">
                      <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          <div className="max-w-7xl mx-auto">
            {/* Render the appropriate component based on activeMenuItem */}
            {renderContent()}
          </div>
        </main>

        {/* Footer */}
        <footer className=" w-full bg-white border-t border-gray-200 px-6 py-4">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-600">
              <div className="flex items-center space-x-4 mb-2 md:mb-0">
                <p>&copy; 2024 POS System. All rights reserved.</p>
                <span className="hidden md:inline">•</span>
                <p className="hidden md:inline">Version 1.0.0</p>
              </div>
              <div className="flex items-center space-x-6 ml-auto">
                <button className="hover:text-gray-900 transition-colors">Help</button>
                <button className="hover:text-gray-900 transition-colors">Support</button>
                <button className="hover:text-gray-900 transition-colors">Privacy</button>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-green-600">System Online</span>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </div>

      {/* Click outside to close dropdown */}
      {isProfileDropdownOpen && <div className="fixed inset-0 z-30" onClick={() => setIsProfileDropdownOpen(false)}></div>}
    </div>
  );
};

export default Dashboard;
