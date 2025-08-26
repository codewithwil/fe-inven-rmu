"use client";

import React, { useState } from "react";

interface FormData {
  barcode: string;
  name: string;
  returnType: "konsinyasi" | "kadaluarsa";
  quantity: number;
  weightType: "gram" | "pieces" | "bungkus";
  returnPrice: number;
  returnReason: string;
  returnDate: string;
}

const ReturnBarang: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    barcode: "",
    name: "",
    returnType: "konsinyasi",
    quantity: 0,
    weightType: "pieces",
    returnPrice: 0,
    returnReason: "",
    returnDate: new Date().toISOString().split("T")[0], // Default to today
  });

  const [isSearching, setIsSearching] = useState(false);
  const [itemFound, setItemFound] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
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

  const searchBarang = async () => {
    if (!formData.barcode.trim()) {
      alert("Masukkan barcode terlebih dahulu");
      return;
    }

    setIsSearching(true);

    // Simulate API call - replace this with actual API call when backend is ready
    setTimeout(() => {
      // Mock data untuk demo - ganti dengan actual API call
      const mockBarang = {
        barcode: formData.barcode,
        name: "Contoh Barang " + formData.barcode,
        itemType: "konsinyasi" as "konsinyasi" | "beli_putus" | "tunai",
        weightType: "pieces" as "gram" | "pieces" | "bungkus",
        basePrice: 15000,
        expiryDate: null,
      };

      // Mock validation - replace with actual API response
      if (formData.barcode.length >= 5) {
        const today = new Date();
        const expiryDate = mockBarang.expiryDate ? new Date(mockBarang.expiryDate) : null;
        const isExpired = expiryDate && expiryDate < today;

        if (mockBarang.itemType === "konsinyasi" || isExpired) {
          setFormData((prev) => ({
            ...prev,
            name: mockBarang.name,
            weightType: mockBarang.weightType,
            returnPrice: mockBarang.basePrice,
            returnType: isExpired ? "kadaluarsa" : "konsinyasi",
          }));
          setItemFound(true);
        } else {
          alert("Barang ini tidak dapat di-return. Hanya barang konsinyasi atau barang kadaluarsa yang dapat di-return.");
          setItemFound(false);
        }
      } else {
        alert("Barang tidak ditemukan");
        setItemFound(false);
      }
      setIsSearching(false);
    }, 1000);

    /* TODO: Replace mock with actual API call when backend is ready
    try {
      const response = await fetch(`/api/barang/${formData.barcode}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("admin_token")}`,
        },
      });

      if (response.ok) {
        const barang = await response.json();
        
        // Check if item is eligible for return (konsinyasi or expired)
        const today = new Date();
        const expiryDate = barang.expiryDate ? new Date(barang.expiryDate) : null;
        const isExpired = expiryDate && expiryDate < today;
        
        if (barang.itemType === "konsinyasi" || isExpired) {
          setFormData((prev) => ({
            ...prev,
            name: barang.name,
            weightType: barang.weightType,
            returnPrice: barang.basePrice,
            returnType: isExpired ? "kadaluarsa" : "konsinyasi",
          }));
          setItemFound(true);
        } else {
          alert("Barang ini tidak dapat di-return. Hanya barang konsinyasi atau barang kadaluarsa yang dapat di-return.");
          setItemFound(false);
        }
      } else {
        alert("Barang tidak ditemukan");
        setItemFound(false);
      }
    } catch (error) {
      console.error("Error searching item:", error);
      alert("Terjadi kesalahan saat mencari barang");
      setItemFound(false);
    } finally {
      setIsSearching(false);
    }
    */
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!itemFound) {
      alert("Silakan cari barang terlebih dahulu");
      return;
    }

    // Mock submit - replace with actual API call when backend is ready
    console.log("Return Data:", formData);
    alert("Data return telah disiapkan. Silakan implementasikan API endpoint untuk menyimpan data return.");

    // Uncomment this when you want to keep data after mock submit
    // resetForm();

    /* TODO: Replace mock with actual API call when backend is ready
    try {
      const response = await fetch("/api/barang/return", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("admin_token")}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const result = await response.json();
        alert("Barang berhasil di-return!");
        resetForm();
      } else {
        const error = await response.json();
        alert(`Error: ${error.message || "Gagal melakukan return barang"}`);
      }
    } catch (error) {
      console.error("Error submitting return:", error);
      alert("Terjadi kesalahan saat mengirim data return");
    }
    */
  };

  const resetForm = () => {
    setFormData({
      barcode: "",
      name: "",
      returnType: "konsinyasi",
      quantity: 0,
      weightType: "pieces",
      returnPrice: 0,
      returnReason: "",
      returnDate: new Date().toISOString().split("T")[0],
    });
    setItemFound(false);
  };

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">Return Barang</h2>
            <p className="text-sm text-gray-600 mt-1">Return barang konsinyasi dan barang kadaluarsa</p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Search Barang Section */}
            <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
              <h3 className="text-sm font-medium text-blue-800 mb-3">Cari Barang untuk di-Return</h3>
              <div className="flex gap-3">
                <div className="flex-1">
                  <input
                    type="text"
                    name="barcode"
                    value={formData.barcode}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                    placeholder="Masukkan barcode barang"
                    disabled={itemFound}
                  />
                </div>
                <button
                  type="button"
                  onClick={searchBarang}
                  disabled={isSearching || itemFound}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSearching ? "Mencari..." : itemFound ? "Ditemukan" : "Cari"}
                </button>
                {itemFound && (
                  <button type="button" onClick={resetForm} className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2">
                    Reset
                  </button>
                )}
              </div>
            </div>

            {itemFound && (
              <>
                {/* Nama Barang (Read-only) */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Nama Barang
                  </label>
                  <input type="text" id="name" name="name" value={formData.name} className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-black" readOnly />
                </div>

                {/* Jenis Return */}
                <div>
                  <label htmlFor="returnType" className="block text-sm font-medium text-gray-700 mb-2">
                    Jenis Return *
                  </label>
                  <select
                    id="returnType"
                    name="returnType"
                    value={formData.returnType}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                    required
                  >
                    <option value="konsinyasi">Return Konsinyasi</option>
                    <option value="kadaluarsa">Return Kadaluarsa</option>
                  </select>
                </div>

                {/* Jumlah Return dan Satuan */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-2">
                      Jumlah Return *
                    </label>
                    <input
                      type="number"
                      id="quantity"
                      name="quantity"
                      value={formData.quantity === 0 ? "" : formData.quantity}
                      onChange={handleNumberInputChange}
                      min="1"
                      step="1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                      placeholder="0"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="weightType" className="block text-sm font-medium text-gray-700 mb-2">
                      Satuan
                    </label>
                    <input type="text" id="weightType" name="weightType" value={formData.weightType} className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 text-black" readOnly />
                  </div>
                </div>

                {/* Harga Return */}
                <div>
                  <label htmlFor="returnPrice" className="block text-sm font-medium text-gray-700 mb-2">
                    Harga Return *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-gray-500">Rp</span>
                    <input
                      type="number"
                      id="returnPrice"
                      name="returnPrice"
                      value={formData.returnPrice === 0 ? "" : formData.returnPrice}
                      onChange={handleNumberInputChange}
                      min="0"
                      step="100"
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                      placeholder="0"
                      required
                    />
                  </div>
                </div>

                {/* Alasan Return */}
                <div>
                  <label htmlFor="returnReason" className="block text-sm font-medium text-gray-700 mb-2">
                    Alasan Return *
                  </label>
                  <textarea
                    id="returnReason"
                    name="returnReason"
                    value={formData.returnReason}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black resize-none"
                    placeholder="Masukkan alasan return barang..."
                    required
                  />
                </div>

                {/* Tanggal Return */}
                <div>
                  <label htmlFor="returnDate" className="block text-sm font-medium text-gray-700 mb-2">
                    Tanggal Return *
                  </label>
                  <input
                    type="date"
                    id="returnDate"
                    name="returnDate"
                    value={formData.returnDate}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                    required
                  />
                </div>

                {/* Tombol Aksi */}
                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                  <button type="button" onClick={resetForm} className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2">
                    Reset Form
                  </button>
                  <button type="submit" className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2">
                    Proses Return
                  </button>
                </div>
              </>
            )}

            {!itemFound && (
              <div className="text-center py-8 text-gray-500">
                <p>Silakan cari barang terlebih dahulu menggunakan barcode</p>
                <p className="text-sm mt-1">Hanya barang konsinyasi dan barang kadaluarsa yang dapat di-return</p>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default ReturnBarang;
