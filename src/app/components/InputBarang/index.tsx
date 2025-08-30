"use client";

import React, { useState } from "react";

interface FormData {
  barcode: string;
  name: string;
  itemType: "tunai" | "beli_putus" | "konsinyasi";
  quantity: number;
  weightType: "gram" | "pieces" | "bungkus" | "mililiter";
  basePrice: number;
  expiryDate: string;
  invoiceNumber: string;
  purchaseType: "cash" | "hutang";
}

const InputBarang: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    barcode: "",
    name: "",
    itemType: "tunai",
    quantity: 0,
    weightType: "pieces",
    basePrice: 0,
    expiryDate: "",
    invoiceNumber: "",
    purchaseType: "cash",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "quantity" || name === "basePrice" ? (value === "" ? 0 : Number(value)) : value,
    }));
  };

  const handleNumberInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    // Remove leading zeros but keep single zero
    let cleanedValue = value.replace(/^0+/, "") || "0";

    // If it's empty after removing leading zeros (except single zero), set to empty string
    if (cleanedValue === "0" && value !== "0") {
      cleanedValue = "";
    }

    setFormData((prev) => ({
      ...prev,
      [name]: cleanedValue === "" ? 0 : Number(cleanedValue),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch("/api/barang", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("admin_token")}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const result = await response.json();
        alert("Barang berhasil ditambahkan!");
        resetForm();
      } else {
        const error = await response.json();
        alert(`Error: ${error.message || "Gagal menambahkan barang"}`);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("Terjadi kesalahan saat mengirim data");
    }
  };

  const resetForm = () => {
    setFormData({
      barcode: "",
      name: "",
      itemType: "tunai",
      quantity: 0,
      weightType: "pieces",
      basePrice: 0,
      expiryDate: "",
      invoiceNumber: "",
      purchaseType: "cash",
    });
  };

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">Input Barang Baru</h2>
            <p className="text-sm text-gray-600 mt-1">Tambahkan barang baru ke dalam inventori</p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Barcode dan Nama Barang */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="barcode" className="block text-sm font-medium text-gray-700 mb-2">
                  Barcode Barang *
                </label>
                <input
                  type="text"
                  id="barcode"
                  name="barcode"
                  value={formData.barcode}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                  placeholder="Masukkan barcode barang"
                  required
                />
              </div>

              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Nama Barang *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                  placeholder="Masukkan nama barang"
                  required
                />
              </div>
            </div>

            {/* Jenis Barang */}
            <div>
              <label htmlFor="itemType" className="block text-sm font-medium text-gray-700 mb-2">
                Jenis Barang *
              </label>
              <select
                id="itemType"
                name="itemType"
                value={formData.itemType}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                required
              >
                <option value="tunai">Barang Tunai</option>
                <option value="beli_putus">Barang Beli Putus</option>
                <option value="konsinyasi">Barang Konsinyasi</option>
              </select>
            </div>

            {/* Invoice Pembelian dan Jenis Pembelian */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="invoiceNumber" className="block text-sm font-medium text-gray-700 mb-2">
                  Nomor Invoice Pembelian *
                </label>
                <input
                  type="text"
                  id="invoiceNumber"
                  name="invoiceNumber"
                  value={formData.invoiceNumber}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                  placeholder="Masukkan nomor invoice"
                  required
                />
              </div>

              <div>
                <label htmlFor="purchaseType" className="block text-sm font-medium text-gray-700 mb-2">
                  Jenis Pembelian *
                </label>
                <select
                  id="purchaseType"
                  name="purchaseType"
                  value={formData.purchaseType}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                  required
                >
                  <option value="cash">Cash (Tunai)</option>
                  <option value="hutang">Hutang</option>
                </select>
              </div>
            </div>

            {/* Jumlah dan Jenis Berat */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-2">
                  Jumlah Barang *
                </label>
                <input
                  type="number"
                  id="quantity"
                  name="quantity"
                  value={formData.quantity === 0 ? "" : formData.quantity}
                  onChange={handleNumberInputChange}
                  min="0"
                  step="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                  placeholder="0"
                  required
                />
              </div>

              <div>
                <label htmlFor="weightType" className="block text-sm font-medium text-gray-700 mb-2">
                  Jenis Berat/Satuan *
                </label>
                <select
                  id="weightType"
                  name="weightType"
                  value={formData.weightType}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                  required
                >
                  <option value="pieces">Item</option>
                  <option value="gram">Gram</option>
                  <option value="bungkus">Bungkus</option>
                  <option value="mililiter">Mililiter</option>
                </select>
              </div>
            </div>

            {/* Harga Dasar */}
            <div>
              <label htmlFor="basePrice" className="block text-sm font-medium text-gray-700 mb-2">
                Harga Dasar *
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2 text-gray-500">Rp</span>
                <input
                  type="number"
                  id="basePrice"
                  name="basePrice"
                  value={formData.basePrice === 0 ? "" : formData.basePrice}
                  onChange={handleNumberInputChange}
                  min="0"
                  step="100"
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                  placeholder="0"
                  required
                />
              </div>
            </div>

            {/* Tanggal Kadaluarsa */}
            <div>
              <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700 mb-2">
                Tanggal Kadaluarsa (Optional)
              </label>
              <input
                type="date"
                id="expiryDate"
                name="expiryDate"
                value={formData.expiryDate}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
              />
            </div>

            {/* Tombol Aksi */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <button type="button" onClick={resetForm} className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2">
                Reset Form
              </button>
              <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                Simpan Barang
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default InputBarang;
