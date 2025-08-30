"use client";

import React, { useState, useEffect } from "react";

interface StokBarang {
  id: string;
  barcode: string;
  name: string;
  currentStock: number;
  minStock: number;
  maxStock: number;
  weightType: "gram" | "pieces" | "bungkus" | "mililiter";
  lastUpdated: string;
  status: "normal" | "low" | "empty" | "overstock";
}

const StokBarang: React.FC = () => {
  const [stockData, setStockData] = useState<StokBarang[]>([]);
  const [searchBarcode, setSearchBarcode] = useState("");
  const [loading, setLoading] = useState(false);
  const [filteredData, setFilteredData] = useState<StokBarang[]>([]);

  // Mock data - dalam implementasi nyata, data ini akan diambil dari API
  const mockData: StokBarang[] = [
    {
      id: "1",
      barcode: "8991102000123",
      name: "Indomie Ayam Bawang",
      currentStock: 5,
      minStock: 10,
      maxStock: 100,
      weightType: "pieces",
      lastUpdated: "2025-08-30T10:30:00",
      status: "low",
    },
    {
      id: "2",
      barcode: "8991102000456",
      name: "Teh Botol Sosro 350ml",
      currentStock: 0,
      minStock: 20,
      maxStock: 200,
      weightType: "pieces",
      lastUpdated: "2025-08-29T15:45:00",
      status: "empty",
    },
    {
      id: "3",
      barcode: "8991102000789",
      name: "Beras Premium 5kg",
      currentStock: 50,
      minStock: 10,
      maxStock: 80,
      weightType: "bungkus",
      lastUpdated: "2025-08-30T08:20:00",
      status: "normal",
    },
    {
      id: "4",
      barcode: "8991102001234",
      name: "Minyak Goreng Tropical 1L",
      currentStock: 150,
      minStock: 30,
      maxStock: 100,
      weightType: "pieces",
      lastUpdated: "2025-08-30T12:15:00",
      status: "overstock",
    },
    {
      id: "5",
      barcode: "8991102005678",
      name: "Gula Pasir 1kg",
      currentStock: 25,
      minStock: 15,
      maxStock: 60,
      weightType: "bungkus",
      lastUpdated: "2025-08-30T09:30:00",
      status: "normal",
    },
  ];

  useEffect(() => {
    // Simulate API call
    setLoading(true);
    setTimeout(() => {
      setStockData(mockData);
      setFilteredData(mockData);
      setLoading(false);
    }, 500);
  }, []);

  useEffect(() => {
    if (searchBarcode) {
      const filtered = stockData.filter((item) => item.barcode.includes(searchBarcode) || item.name.toLowerCase().includes(searchBarcode.toLowerCase()));
      setFilteredData(filtered);
    } else {
      setFilteredData(stockData);
    }
  }, [searchBarcode, stockData]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "empty":
        return "bg-red-100 text-red-800";
      case "low":
        return "bg-yellow-100 text-yellow-800";
      case "overstock":
        return "bg-purple-100 text-purple-800";
      case "normal":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "empty":
        return "Habis";
      case "low":
        return "Stok Rendah";
      case "overstock":
        return "Overstock";
      case "normal":
        return "Normal";
      default:
        return "Unknown";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("id-ID", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleRefresh = async () => {
    setLoading(true);
    // Simulate API refresh
    setTimeout(() => {
      setStockData(mockData);
      setFilteredData(mockData);
      setLoading(false);
    }, 500);
  };

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-800 mb-2">Cek Stok Barang</h1>
          <p className="text-gray-600">Monitor stok barang berdasarkan barcode dan status ketersediaan</p>
        </div>

        {/* Search and Controls */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 sm:items-end">
            <div className="flex-1">
              <label htmlFor="searchBarcode" className="block text-sm font-medium text-gray-700 mb-2">
                Cari Barcode atau Nama Barang
              </label>
              <input
                type="text"
                id="searchBarcode"
                value={searchBarcode}
                onChange={(e) => setSearchBarcode(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                placeholder="Masukkan barcode atau nama barang..."
              />
            </div>
            <button
              onClick={handleRefresh}
              disabled={loading}
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {loading ? "Loading..." : "Refresh"}
            </button>
          </div>
        </div>

        {/* Stock Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Barcode</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Barang</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Stok Saat Ini</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Min Stok</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Max Stok</th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Update Terakhir</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                      Memuat data stok...
                    </td>
                  </tr>
                ) : filteredData.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                      {searchBarcode ? "Tidak ada data yang sesuai dengan pencarian" : "Tidak ada data stok"}
                    </td>
                  </tr>
                ) : (
                  filteredData.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm font-mono text-gray-900">{item.barcode}</div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{item.name}</div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-center">
                        <div className="text-sm font-semibold text-gray-900">
                          {item.currentStock} {item.weightType}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-center">
                        <div className="text-sm text-gray-600">
                          {item.minStock} {item.weightType}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-center">
                        <div className="text-sm text-gray-600">
                          {item.maxStock} {item.weightType}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-center">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(item.status)}`}>{getStatusText(item.status)}</span>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-500">{formatDate(item.lastUpdated)}</div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Summary Footer */}
          {!loading && filteredData.length > 0 && (
            <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
              <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                <span>
                  Total: <strong>{filteredData.length}</strong> item
                </span>
                <span className="text-red-600">
                  Habis: <strong>{filteredData.filter((item) => item.status === "empty").length}</strong>
                </span>
                <span className="text-yellow-600">
                  Stok Rendah: <strong>{filteredData.filter((item) => item.status === "low").length}</strong>
                </span>
                <span className="text-purple-600">
                  Overstock: <strong>{filteredData.filter((item) => item.status === "overstock").length}</strong>
                </span>
                <span className="text-green-600">
                  Normal: <strong>{filteredData.filter((item) => item.status === "normal").length}</strong>
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StokBarang;
