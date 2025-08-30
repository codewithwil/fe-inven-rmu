"use client";

import React, { useState } from "react";

interface SupplierFormData {
  uniqueId: string;
  supplierCode: string;
  name: string;
  contactPerson: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  postalCode: string;
  paymentTerms: "cash" | "net_7" | "net_14" | "net_30" | "net_45" | "net_60";
  supplierType: "distributor" | "manufacturer" | "wholesaler" | "local_supplier";
  taxNumber: string;
  bankAccount: string;
  bankName: string;
  notes: string;
}

const InputSupplier: React.FC = () => {
  const [formData, setFormData] = useState<SupplierFormData>({
    uniqueId: "",
    supplierCode: "",
    name: "",
    contactPerson: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    postalCode: "",
    paymentTerms: "cash",
    supplierType: "distributor",
    taxNumber: "",
    bankAccount: "",
    bankName: "",
    notes: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch("/api/supplier", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("admin_token")}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const result = await response.json();
        alert("Supplier berhasil ditambahkan!");
        resetForm();
      } else {
        const error = await response.json();
        alert(`Error: ${error.message || "Gagal menambahkan supplier"}`);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("Terjadi kesalahan saat mengirim data");
    }
  };

  const resetForm = () => {
    setFormData({
      uniqueId: "",
      supplierCode: "",
      name: "",
      contactPerson: "",
      phone: "",
      email: "",
      address: "",
      city: "",
      postalCode: "",
      paymentTerms: "cash",
      supplierType: "distributor",
      taxNumber: "",
      bankAccount: "",
      bankName: "",
      notes: "",
    });
  };

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">Input Supplier Baru</h2>
            <p className="text-sm text-gray-600 mt-1">Tambahkan supplier baru ke dalam database</p>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Unique ID Supplier */}
            <div>
              <label htmlFor="uniqueId" className="block text-sm font-medium text-gray-700 mb-2">
                Unique ID Supplier *
              </label>
              <input
                type="text"
                id="uniqueId"
                name="uniqueId"
                value={formData.uniqueId}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                placeholder="Masukkan unique ID supplier (contoh: SUP-001)"
                required
              />
              <p className="text-xs text-gray-500 mt-1">ID unik yang akan digunakan untuk mengidentifikasi supplier</p>
            </div>

            {/* Kode Supplier dan Nama */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="supplierCode" className="block text-sm font-medium text-gray-700 mb-2">
                  Kode Supplier *
                </label>
                <input
                  type="text"
                  id="supplierCode"
                  name="supplierCode"
                  value={formData.supplierCode}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                  placeholder="Masukkan kode supplier"
                  required
                />
              </div>

              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Nama Supplier *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                  placeholder="Masukkan nama supplier"
                  required
                />
              </div>
            </div>

            {/* Contact Person dan Phone */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="contactPerson" className="block text-sm font-medium text-gray-700 mb-2">
                  Contact Person *
                </label>
                <input
                  type="text"
                  id="contactPerson"
                  name="contactPerson"
                  value={formData.contactPerson}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                  placeholder="Nama contact person"
                  required
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Nomor Telepon *
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                  placeholder="08xxxxxxxxxx"
                  required
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                placeholder="supplier@email.com"
              />
            </div>

            {/* Alamat */}
            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                Alamat *
              </label>
              <textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black resize-none"
                placeholder="Masukkan alamat lengkap supplier"
                required
              />
            </div>

            {/* Kota dan Kode Pos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                  Kota *
                </label>
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                  placeholder="Nama kota"
                  required
                />
              </div>

              <div>
                <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-2">
                  Kode Pos
                </label>
                <input
                  type="text"
                  id="postalCode"
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                  placeholder="12345"
                />
              </div>
            </div>

            {/* Jenis Supplier dan Payment Terms */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="supplierType" className="block text-sm font-medium text-gray-700 mb-2">
                  Jenis Supplier *
                </label>
                <select
                  id="supplierType"
                  name="supplierType"
                  value={formData.supplierType}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                  required
                >
                  <option value="distributor">Distributor</option>
                  <option value="manufacturer">Manufacturer</option>
                  <option value="wholesaler">Wholesaler</option>
                  <option value="local_supplier">Supplier Lokal</option>
                </select>
              </div>

              <div>
                <label htmlFor="paymentTerms" className="block text-sm font-medium text-gray-700 mb-2">
                  Terms Pembayaran *
                </label>
                <select
                  id="paymentTerms"
                  name="paymentTerms"
                  value={formData.paymentTerms}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                  required
                >
                  <option value="cash">Cash</option>
                  <option value="net_7">Net 7 hari</option>
                  <option value="net_14">Net 14 hari</option>
                  <option value="net_30">Net 30 hari</option>
                  <option value="net_45">Net 45 hari</option>
                  <option value="net_60">Net 60 hari</option>
                </select>
              </div>
            </div>

            {/* NPWP */}
            <div>
              <label htmlFor="taxNumber" className="block text-sm font-medium text-gray-700 mb-2">
                NPWP
              </label>
              <input
                type="text"
                id="taxNumber"
                name="taxNumber"
                value={formData.taxNumber}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                placeholder="xx.xxx.xxx.x-xxx.xxx"
              />
            </div>

            {/* Bank Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="bankName" className="block text-sm font-medium text-gray-700 mb-2">
                  Nama Bank
                </label>
                <input
                  type="text"
                  id="bankName"
                  name="bankName"
                  value={formData.bankName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                  placeholder="Nama bank"
                />
              </div>

              <div>
                <label htmlFor="bankAccount" className="block text-sm font-medium text-gray-700 mb-2">
                  Nomor Rekening
                </label>
                <input
                  type="text"
                  id="bankAccount"
                  name="bankAccount"
                  value={formData.bankAccount}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                  placeholder="Nomor rekening bank"
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
                Catatan
              </label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black resize-none"
                placeholder="Catatan tambahan tentang supplier..."
              />
            </div>

            {/* Tombol Aksi */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <button type="button" onClick={resetForm} className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2">
                Reset Form
              </button>
              <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                Simpan Supplier
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default InputSupplier;
