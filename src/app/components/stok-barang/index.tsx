"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";

interface StokBarang {
  productId: number;
  barcode: string;
  name: string;
  qty: number;
  min_stock: number;
  max_stock: number;
  unit: string;
  status: number;
  lastUpdated: string;
}

const StokBarang: React.FC = () => {
  const [stockData, setStockData] = useState<StokBarang[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [filteredData, setFilteredData] = useState<StokBarang[]>([]);

  const fetchStock = async (all = false) => {
    try {
      setLoading(true);
      const params: any = {};
      if (search) params.search = search;
      if (all) params.all = true;

      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/resources/product`, { 
        headers: {
          Authorization: `Bearer ${localStorage.getItem("admin_token")}`,
        },
        params 
      });
      const products = all ? res.data.data.product : res.data.data.product.data;

      const mapped: StokBarang[] = products.map((p: any) => ({
        productId: p.productId,
        barcode: p.barcode,
        name: p.name,
        qty: p.qty,
        min_stock: p.min_stock,
        max_stock: p.max_stock,
        unit: p.unit,
        status: p.qty === 0 ? 0 : p.qty < p.min_stock ? 2 : p.qty > p.max_stock ? 3 : 1,
        lastUpdated: p.updated_at,
      }));

      setStockData(mapped);
      setFilteredData(mapped);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStock();
  }, []);

  useEffect(() => {
    if (search) {
      const filtered = stockData.filter(
        (item) =>
          item.barcode.includes(search) ||
          item.name.toLowerCase().includes(search.toLowerCase())
      );
      setFilteredData(filtered);
    } else {
      setFilteredData(stockData);
    }
  }, [search, stockData]);

  const getStatusText = (status: number) => {
    switch (status) {
      case 0: return "Habis";
      case 2: return "Stok Rendah";
      case 3: return "Overstock";
      default: return "Normal";
    }
  };

  const getStatusColor = (status: number) => {
    switch (status) {
      case 0: return "bg-red-100 text-red-800";
      case 2: return "bg-yellow-100 text-yellow-800";
      case 3: return "bg-purple-100 text-purple-800";
      default: return "bg-green-100 text-green-800";
    }
  };

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-800 mb-2">Cek Stok Barang</h1>
          <p className="text-gray-600">Monitor stok barang berdasarkan barcode dan status ketersediaan</p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 sm:items-end">
            <div className="flex-1">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Cari barcode atau nama..."
                className="w-full px-3 py-2 border rounded-md"
              />
            </div>
            <button
              onClick={() => fetchStock(true)}
              disabled={loading}
              className="px-4 py-2 bg-blue-500 text-white rounded-md"
            >
              {loading ? "Loading..." : "Cari"}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-x-auto">
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
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">Memuat data stok...</td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">Tidak ada data</td>
                </tr>
              ) : (
                filteredData.map((item) => (
                  <tr key={item.productId} className="hover:bg-gray-50">
                    <td className="px-4 py-4 font-mono">{item.barcode}</td>
                    <td className="px-4 py-4">{item.name}</td>
                    <td className="px-4 py-4 text-center">{item.qty} {item.unit}</td>
                    <td className="px-4 py-4 text-center">{item.min_stock} {item.unit}</td>
                    <td className="px-4 py-4 text-center">{item.max_stock} {item.unit}</td>
                    <td className="px-4 py-4 text-center">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(item.status)}`}>
                        {getStatusText(item.status)}
                      </span>
                    </td>
                    <td className="px-4 py-4">{new Date(item.lastUpdated).toLocaleString("id-ID")}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StokBarang;
