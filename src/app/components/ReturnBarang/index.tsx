"use client";

import React, { useState, useEffect } from "react";
import { Search, RotateCcw, AlertCircle, CheckCircle, Package, Calendar } from "lucide-react";

interface FormData {
  productId?: number;
  barcode: string;
  name: string;
  returnType: "konsinyasi" | "kadaluarsa";
  quantity: number;
  weightType: "gram" | "pieces" | "bungkus";
  returnPrice: number;
  returnReason: string;
  returnDate: string;
  statusReturn?: 0 | 1 | 2 | 3;
}

interface ApiError {
  message: string;
  code?: string;
  details?: any;
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
    returnDate: new Date().toISOString().split("T")[0], 
  });

  const [returnData, setReturnData] = useState<any[]>([]);
  const [editReturnId, setEditReturnId] = useState<number | null>(null);
  const [isLoadingReturn, setIsLoadingReturn] = useState(false);
  const [returnError, setReturnError] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [itemFound, setItemFound] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiStatus, setApiStatus] = useState<string>("");
  const [searchError, setSearchError] = useState<string>("");
  const [submitError, setSubmitError] = useState<string>("");
  const [submitSuccess, setSubmitSuccess] = useState<string>("");

  const fetchReturnData = async () => {
    setIsLoadingReturn(true);
    setReturnError("");
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/transactions/returnProduct`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("admin_token")}`,
        },
      });
      if (response.ok) {
        const result = await safeJsonParse(response);
        if (result && result.data && result.data.returns && Array.isArray(result.data.returns.data)) {
          setReturnData(result.data.returns.data);
        } else {
          setReturnError("Data return tidak sesuai format");
        }
      } else {
        setReturnError(`Error ${response.status}: Gagal mengambil data return`);
      }
    } catch (error) {
      console.error(error);
      setReturnError("Gagal menghubungi API return");
    } finally {
      setIsLoadingReturn(false);
    }
  };

  useEffect(() => {
    fetchReturnData();
  }, []);

  useEffect(() => {
    if (submitSuccess) fetchReturnData();
  }, [submitSuccess]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (submitError) setSubmitError("");
    if (submitSuccess) setSubmitSuccess("");
  };

  const handleNumberInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    let cleanedValue = value.replace(/^0+/, "") || "0";
    if (cleanedValue === "0" && value !== "0") {
      cleanedValue = "";
    }

    setFormData((prev) => ({
      ...prev,
      [name]: cleanedValue === "" ? 0 : Number(cleanedValue),
    }));

    if (submitError) setSubmitError("");
    if (submitSuccess) setSubmitSuccess("");
  };

  const safeJsonParse = async (response: Response): Promise<any> => {
    try {
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const text = await response.text();
        if (text.trim()) {
          return JSON.parse(text);
        }
        return {};
      }
      return null;
    } catch (error) {
      console.warn("Failed to parse JSON response:", error);
      return null;
    }
  };

  const searchBarang = async () => {
    if (!formData.barcode.trim()) {
      setSearchError("Masukkan barcode terlebih dahulu");
      return;
    }

    setIsSearching(true);
    setSearchError("");
    setSubmitError("");
    setSubmitSuccess("");

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/resources/product/return?search=${formData.barcode}`, 
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("admin_token")}`,
          },
        }
      );

      if (response.ok) {
        const result = await safeJsonParse(response);

        if (result && result.data && Array.isArray(result.data.product)) {
          const product = result.data.product[0]; // ambil produk pertama

         if (product) {
            const today = new Date();
            const expiryDate = product.expireDate ? new Date(product.expireDate) : null;
            const isExpired = expiryDate && expiryDate < today;

            setFormData((prev) => ({
              ...prev,
              productId: product.productId, // simpan ID produk
              name: product.name,
              weightType: product.unit || "pieces",
              returnPrice: parseFloat(product.purchase_price) || 0,
              returnType: isExpired ? "kadaluarsa" : "konsinyasi",
            }));

            setItemFound(true);
            setApiStatus("API Connected");
            setSearchError("");
          } else {
            setSearchError("Barang tidak ditemukan");
            setItemFound(false);
          }
        } else {
          setSearchError("Response API tidak sesuai format");
          setItemFound(false);
        }
      } else if (response.status === 404) {
        setSearchError("Barang tidak ditemukan");
        setItemFound(false);
        setApiStatus("API Connected");
      } else if (response.status === 401) {
        setSearchError("Sesi login telah berakhir. Silakan login ulang.");
        setItemFound(false);
      } else {
        const errorData = await safeJsonParse(response);
        setSearchError(errorData?.message || `Error ${response.status}: Gagal mencari barang`);
        setItemFound(false);
      }
    } catch (error) {
      console.error("Error searching item:", error);
      setSearchError("Gagal menghubungi API");
      setItemFound(false);
    } finally {
      setIsSearching(false);
    }
  };


  const handleMockSearch = () => {
    setApiStatus("API Not Available - Demo Mode");

    // Mock validation - simulate finding item
    if (formData.barcode.length >= 3) {
      // Mock data untuk demo
      const mockBarang = {
        barcode: formData.barcode,
        name: "Demo Barang " + formData.barcode,
        itemType: Math.random() > 0.3 ? "konsinyasi" : "beli_putus", // 70% chance konsinyasi
        weightType: "pieces" as "gram" | "pieces" | "bungkus",
        basePrice: Math.floor(Math.random() * 50000) + 5000,
        expiryDate: Math.random() > 0.7 ? new Date(Date.now() - 86400000).toISOString() : null, // 30% chance expired
      };

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
        setSearchError("");
      } else {
        setSearchError("Barang ini tidak dapat di-return. Hanya barang konsinyasi atau barang kadaluarsa yang dapat di-return.");
        setItemFound(false);
      }
    } else {
      setSearchError("Barang tidak ditemukan (Demo: minimal 3 karakter)");
      setItemFound(false);
    }
  };

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!itemFound || !formData.productId) {
    setSubmitError("Silakan cari barang terlebih dahulu");
    return;
  }

  const typeReturn = formData.returnType === "konsinyasi" ? 1 : 2;


  const payload = {
    product_id: formData.productId,
    typeReturn,
    qty: formData.quantity,
    priceReturn: formData.returnPrice,
    notes: formData.returnReason,
    returnDate: formData.returnDate,
    statusReturn: formData.statusReturn, 
  };

  const endpoint = editReturnId
    ? `${process.env.NEXT_PUBLIC_API_URL}/transactions/returnProduct/update/${editReturnId}`
    : `${process.env.NEXT_PUBLIC_API_URL}/transactions/returnProduct/store`;


  console.log("Submitting return:", { editReturnId, payload }); // debug

  setIsSubmitting(true);
  setSubmitError("");
  setSubmitSuccess("");

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("admin_token")}`,
      },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      const result = await safeJsonParse(response);
      setSubmitSuccess(editReturnId ? "Data return berhasil diupdate!" : "Barang berhasil di-return!");
      setTimeout(() => resetForm(), 2000);
      setEditReturnId(null);
    } else {
      const errorData = await safeJsonParse(response);
      setSubmitError(errorData?.message || `Error ${response.status}`);
    }
  } catch (error) {
    console.error("Error submitting return:", error);
    setSubmitError("Gagal menghubungi API return");
  } finally {
    setIsSubmitting(false);
  }
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
      statusReturn: 1,
    });
    setItemFound(false);
    setEditReturnId(null);
    setSearchError("");
    setSubmitError("");
    setSubmitSuccess("");
  };

  const clearMessages = () => {
    setSearchError("");
    setSubmitError("");
    setSubmitSuccess("");
  };

  const handleEdit = (item: any) => {
    setFormData({
      productId: item.product_id,
      barcode: item.product?.barcode || "",
      name: item.product?.name || "",
      returnType: item.typeReturn === 1 ? "konsinyasi" : "kadaluarsa",
      quantity: item.qty,
      weightType: item.product?.unit || "pieces",
      returnPrice: item.priceReturn,
      returnReason: item.notes,
      returnDate: item.returnDate,
      statusReturn: item.statusReturn,
    });
    setItemFound(true);
    setEditReturnId(item.returnId);
    clearMessages();
  };

  const handleDelete = async (returnId: number) => {
    if (!confirm("Apakah Anda yakin ingin menghapus return ini?")) return;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/transactions/returnProduct/delete/${returnId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("admin_token")}`,
        },
      });

      if (response.ok) {
        setSubmitSuccess("Data return berhasil dihapus");
        fetchReturnData(); 
      } else {
        const errorData = await response.json();
        setSubmitError(errorData?.message || `Gagal menghapus return (Error ${response.status})`);
      }
    } catch (error) {
      console.error(error);
      setSubmitError("Gagal menghubungi API untuk menghapus data return");
    }
  };


  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold text-gray-800">Return Barang</h2>
                <p className="text-sm text-gray-600 mt-1">Return barang konsinyasi dan barang kadaluarsa</p>
                {apiStatus && <p className={`text-xs mt-1 ${apiStatus.includes("Not Available") ? "text-orange-600" : "text-green-600"}`}>Status: {apiStatus}</p>}
              </div>
              {(searchError || submitError || submitSuccess) && (
                <button onClick={clearMessages} className="text-gray-400 hover:text-gray-600" title="Clear messages">
                  <AlertCircle className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          {/* Error/Success Messages */}
          {(searchError || submitError || submitSuccess) && (
            <div className="px-6 py-3 border-b border-gray-200">
              {searchError && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <span className="text-red-700 text-sm">{searchError}</span>
                </div>
              )}
              {submitError && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
                  <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                  <span className="text-red-700 text-sm">{submitError}</span>
                </div>
              )}
              {submitSuccess && (
                <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-md">
                  <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                  <span className="text-green-700 text-sm">{submitSuccess}</span>
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Search Barang Section */}
            <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
              <h3 className="text-sm font-medium text-blue-800 mb-3 flex items-center gap-2">
                <Search className="w-4 h-4" />
                Cari Barang untuk di-Return
              </h3>
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
                  disabled={isSearching || itemFound || !formData.barcode.trim()}
                  className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isSearching ? (
                    <>
                      <Search className="w-4 h-4 animate-pulse" />
                      Mencari...
                    </>
                  ) : itemFound ? (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Ditemukan
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4" />
                      Cari
                    </>
                  )}
                </button>
                {itemFound && (
                  <button type="button" onClick={resetForm} className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 flex items-center gap-2">
                    <RotateCcw className="w-4 h-4" />
                    Reset
                  </button>
                )}
              </div>
              {apiStatus.includes("Not Available") && <p className="text-xs text-orange-600 mt-2">Mode Demo: Masukkan minimal 3 karakter untuk simulasi pencarian</p>}
            </div>

            {itemFound && (
              <>
                {/* Nama Barang (Read-only) */}
                <div>
                  <label htmlFor="name" className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <Package className="w-4 h-4" />
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
                  <label htmlFor="returnDate" className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                    <Calendar className="w-4 h-4" />
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

                {itemFound && (
                  <div>
                    <label htmlFor="statusReturn" className="block text-sm font-medium text-gray-700 mb-2">
                      Status Return *
                    </label>
                    <select
                      id="statusReturn"
                      name="statusReturn"
                      value={formData.statusReturn}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                      required
                    >
                      <option value={0}>Batal</option>
                      <option value={1}>Proses</option>
                      <option value={2}>Ditolak</option>
                      <option value={3}>Berhasil</option>
                    </select>
                  </div>
                )}

                {/* Tombol Aksi */}
                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 flex items-center gap-2"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Reset Form
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <RotateCcw className="w-4 h-4 animate-spin" />
                        Memproses...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        Proses Return
                      </>
                    )}
                  </button>
                </div>
              </>
            )}

            {!itemFound && (
              <div className="text-center py-12 text-gray-500">
                <Package className="w-16 h-16 mx-auto text-gray-300 mb-4" />
                <p className="text-lg font-medium">Silakan cari barang terlebih dahulu</p>
                <p className="text-sm mt-1">Masukkan barcode dan klik tombol "Cari"</p>
                <p className="text-sm mt-2 text-orange-600">Hanya barang konsinyasi dan barang kadaluarsa yang dapat di-return</p>
              </div>
            )}
          </form>
        </div>
         <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Data Return Barang</h3>
            {isLoadingReturn ? (
              <p className="text-gray-500">Memuat data...</p>
            ) : returnError ? (
              <p className="text-red-600">{returnError}</p>
            ) : returnData.length === 0 ? (
              <p className="text-gray-500">Belum ada data return.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-200 rounded-md">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="px-4 py-2 border-b text-left text-sm text-gray-600">Kode Return</th>
                      <th className="px-4 py-2 border-b text-left text-sm text-gray-600">Nama Barang</th>
                      <th className="px-4 py-2 border-b text-left text-sm text-gray-600">Qty</th>
                      <th className="px-4 py-2 border-b text-left text-sm text-gray-600">Harga Return</th>
                      <th className="px-4 py-2 border-b text-left text-sm text-gray-600">Tipe Return</th>
                      <th className="px-4 py-2 border-b text-left text-sm text-gray-600">Tanggal Return</th>
                      <th className="px-4 py-2 border-b text-left text-sm text-gray-600">Catatan</th>
                      <th className="px-4 py-2 border-b text-left text-sm text-gray-600">Status</th>
                      <th className="px-4 py-2 border-b text-left text-sm text-gray-600">Aksi</th>
                    </tr>
                  </thead>
                <tbody>
                    {returnData.map((item) => (
                      <tr key={item.returnId} className="hover:bg-gray-50">
                        <td className="px-4 py-2 border-b text-sm text-gray-700">{item.returnCode}</td>
                        <td className="px-4 py-2 border-b text-sm text-gray-700">{item.product?.name || "-"}</td>
                        <td className="px-4 py-2 border-b text-sm text-gray-700">{item.qty}</td>
                        <td className="px-4 py-2 border-b text-sm text-gray-700">Rp {item.priceReturn}</td>
                        <td className="px-4 py-2 border-b text-sm text-gray-700">{item.typeReturn === 1 ? "Konsinyasi" : "Kadaluarsa"}</td>
                        <td className="px-4 py-2 border-b text-sm text-gray-700">{item.returnDate}</td>
                        <td className="px-4 py-2 border-b text-sm text-gray-700">{item.notes}</td>
                        <td className="px-4 py-2 border-b text-sm">
                          {item.statusReturn === 0 && (
                            <span className="px-2 py-1 text-xs font-medium rounded bg-gray-100 text-gray-600">
                              Batal
                            </span>
                          )}
                          {item.statusReturn === 1 && (
                            <span className="px-2 py-1 text-xs font-medium rounded bg-blue-100 text-blue-600">
                              Proses
                            </span>
                          )}
                          {item.statusReturn === 2 && (
                            <span className="px-2 py-1 text-xs font-medium rounded bg-red-100 text-red-600">
                              Ditolak
                            </span>
                          )}
                          {item.statusReturn === 3 && (
                            <span className="px-2 py-1 text-xs font-medium rounded bg-green-100 text-green-600">
                              Berhasil
                            </span>
                          )}
                        </td>

                        <td className="px-4 py-2 border-b text-sm text-gray-700 flex gap-2">
                          <button
                            type="button"
                            onClick={() => handleEdit(item)}
                            className="px-2 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 text-xs flex items-center gap-1"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(item.returnId)}
                            className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-xs flex items-center gap-1"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
      </div>
    </div>
  );
};

export default ReturnBarang;
