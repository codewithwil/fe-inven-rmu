"use client";

import React, { useState, useRef } from "react";

interface Member {
  id: string;
  code: string;
  name: string;
  phone: string;
  point: number;
}


interface TierPrice {
  minQuantity: number;
  price: number;
}

interface TransactionItem {
  id: string;
  barcode: string;
  name: string;
  basePrice: number;
  tierPrices: TierPrice[];
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  weightType: "gram" | "pieces" | "bungkus" | "mililiter";
}

interface Transaction {
  id: string;
  items: TransactionItem[];
  subtotal: number;
  memberBonus: number;
  total: number;
  paymentMethod: "cash" | "transfer" | "credit";
  memberId?: string;
  createdAt: string;
}

const TransaksiPage: React.FC = () => {
  const [transactionId] = useState(() => `TRX${Date.now()}`);
  const [items, setItems] = useState<TransactionItem[]>([]);
  const [barcodeInput, setBarcodeInput] = useState("");
  const [quantityInput, setQuantityInput] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "transfer" | "credit">("cash");
  const [member, setMember] = useState<Member | null>(null);
  const [memberIdInput, setMemberIdInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentTransaction, setCurrentTransaction] = useState<Transaction | null>(null);

  const barcodeInputRef = useRef<HTMLInputElement>(null);

  const calculateTierPrice = (basePrice: number, tierPrices: TierPrice[], quantity: number): number => {
    // Sort tier prices by minQuantity descending to get the highest applicable tier
    const sortedTiers = [...tierPrices].sort((a, b) => b.minQuantity - a.minQuantity);

    for (const tier of sortedTiers) {
      if (quantity >= tier.minQuantity) {
        return tier.price;
      }
    }

    return basePrice;
  };

  const addItemToCart = async (barcode: string, quantity: number) => {
    if (!barcode.trim()) {
      alert("Masukkan barcode barang");
      return;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/resources/product?search=${barcode}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("admin_token")}`,
          },
        }
      );

      if (!response.ok) {
        alert("Barang tidak ditemukan");
        return;
      }

      const result = await response.json();
      const barang =
      result?.data?.product?.data && result.data.product.data.length > 0
        ? result.data.product.data[0]
        : null;

      if (!barang) {
        alert("Barang tidak ditemukan");
        return;
      }

      // cek apakah sudah ada di keranjang
      const existingItemIndex = items.findIndex((item) => item.barcode === barang.barcode);

      if (existingItemIndex >= 0) {
        const updatedItems = [...items];
        const updatedQuantity = updatedItems[existingItemIndex].quantity + quantity;
        const unitPrice = calculateTierPrice(
          barang.member_price ?? barang.selling_price,
          barang.tierPrices || [],
          updatedQuantity
        );

        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedQuantity,
          unitPrice,
          totalPrice: unitPrice * updatedQuantity,
        };

        setItems(updatedItems);
      } else {
        const unitPrice = calculateTierPrice(
          barang.member_price ?? barang.selling_price,
          barang.tierPrices || [],
          quantity
        );

        const newItem: TransactionItem = {
          id: `${barang.productId}_${Date.now()}`,
          barcode: barang.barcode,
          name: barang.name,
          basePrice: barang.member_price ?? barang.selling_price,
          tierPrices: barang.tierPrices || [],
          quantity,
          unitPrice,
          totalPrice: unitPrice * quantity,
          weightType: barang.unit || "pieces",
        };

        setItems([...items, newItem]);
      }

      // reset input
      setBarcodeInput("");
      setQuantityInput(1);
      barcodeInputRef.current?.focus();
    } catch (error) {
      console.error("Error adding item:", error);
      alert("Terjadi kesalahan saat mengambil barang");
    }
  };


  const removeItem = (itemId: string) => {
    setItems(items.filter((item) => item.id !== itemId));
  };

  const updateItemQuantity = (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      removeItem(itemId);
      return;
    }

    setItems(
      items.map((item) => {
        if (item.id === itemId) {
          const unitPrice = calculateTierPrice(item.basePrice, item.tierPrices, newQuantity);
          return {
            ...item,
            quantity: newQuantity,
            unitPrice,
            totalPrice: unitPrice * newQuantity,
          };
        }
        return item;
      })
    );
  };

  const searchMember = async (keyword: string) => {
    if (!keyword.trim()) {
      setMember(null);
      return;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/people/member?search=${encodeURIComponent(keyword)}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("admin_token")}`,
          },
        }
      );

      if (response.ok) {
        const result = await response.json();
        const members = result?.data?.member || [];

        if (members.length === 0) {
          setMember(null);
          alert("Member tidak ditemukan");
          return;
        }

        // kalau hasilnya lebih dari 1, untuk sekarang ambil pertama aja
        const m = members[0];

        setMember({
          id: m.memberId,
          point: m.bonusPoints || 0, // kalau ada di API
          code: m.memberCode,              // simpan code buat ditampilkan
          name: m.name,
          phone: m.phone,
        });
      } else {
        setMember(null);
        alert("Gagal mengambil data member");
      }
    } catch (error) {
      console.error("Error searching member:", error);
      setMember(null);
      alert("Terjadi kesalahan saat mencari data member");
    }
  };


  const calculateSubtotal = () => {
    return items.reduce((total, item) => total + item.totalPrice, 0);
  };

  const calculateTotal = () => {
    return calculateSubtotal();
  };

  const processTransaction = async () => {
    if (items.length === 0) {
      alert("Tidak ada barang dalam keranjang");
      return;
    }

    setIsProcessing(true);

    try {
      const transactionData = {
        member_id: member?.id || null,
        purchaseDate: new Date().toISOString().split("T")[0], 
        purchaseType:
          paymentMethod === "cash"
            ? 1
            : paymentMethod === "transfer"
            ? 2
            : 3, // mapping ke constant Laravel
        subtotal: calculateSubtotal(),
        items: items.map((item) => ({
          product_id: item.id.split("_")[0], // ambil product_id asli dari barcode/id
          qty: item.quantity,
          price: item.unitPrice,
        })),
      };

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/transactions/outProduct/store`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("admin_token")}`,
          },
          body: JSON.stringify(transactionData),
        }
      );

      if (response.ok) {
        const result = await response.json();
        setCurrentTransaction(result);
        alert("Transaksi berhasil diproses!");
        resetTransaction();
      } else {
        const error = await response.json();
        alert(`Error: ${error.message || "Gagal memproses transaksi"}`);
      }
    } catch (error) {
      console.error("Error processing transaction:", error);
      alert("Terjadi kesalahan saat memproses transaksi");
    } finally {
      setIsProcessing(false);
    }
  };


  const printReceipt = () => {
    if (!currentTransaction) return;

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Nota - ${currentTransaction.id}</title>
          <style>
            body { font-family: monospace; font-size: 12px; margin: 0; padding: 20px; }
            .header { text-align: center; border-bottom: 1px dashed #000; padding-bottom: 10px; margin-bottom: 10px; }
            .item { display: flex; justify-content: space-between; margin: 5px 0; }
            .total { border-top: 1px dashed #000; padding-top: 10px; margin-top: 10px; font-weight: bold; }
            @media print { body { margin: 0; padding: 0; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h3>TOKO SAYA</h3>
            <p>Jl. Contoh No. 123<br>Telepon: (021) 12345678</p>
            <p>Nota: ${currentTransaction.id}</p>
            <p>${new Date(currentTransaction.createdAt).toLocaleString("id-ID")}</p>
            ${currentTransaction.memberId ? `<p>Member ID: ${currentTransaction.memberId}</p>` : ""}
          </div>
          
          ${currentTransaction.items
            .map(
              (item) => `
            <div class="item">
              <div>
                <div>${item.name}</div>
                <div>${item.quantity} x Rp ${item.unitPrice.toLocaleString("id-ID")}</div>
              </div>
              <div>Rp ${item.totalPrice.toLocaleString("id-ID")}</div>
            </div>
          `
            )
            .join("")}
          
          <div class="total">
            <div class="item">
              <span>Subtotal:</span>
              <span>Rp ${currentTransaction.subtotal.toLocaleString("id-ID")}</span>
            </div>
            ${
              currentTransaction.memberBonus > 0
                ? `
              <div class="item">
                <span>Bonus Member:</span>
                <span>-Rp ${currentTransaction.memberBonus.toLocaleString("id-ID")}</span>
              </div>
            `
                : ""
            }
            <div class="item">
              <span>Total:</span>
              <span>Rp ${currentTransaction.total.toLocaleString("id-ID")}</span>
            </div>
            <div class="item">
              <span>Pembayaran:</span>
              <span>${currentTransaction.paymentMethod.toUpperCase()}</span>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 20px;">
            <p>Terima Kasih Atas Kunjungan Anda!</p>
          </div>
        </body>
      </html>
    `;

    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();
      printWindow.close();
    }
  };

  const resetTransaction = () => {
    setItems([]);
    setMember(null);
    setMemberIdInput("");
    setBarcodeInput("");
    setQuantityInput(1);
    setPaymentMethod("cash");
    setCurrentTransaction(null);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      addItemToCart(barcodeInput, quantityInput);
    }
  };

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold text-gray-800">Transaksi Penjualan</h2>
                <p className="text-sm text-gray-600 mt-1">ID Transaksi: {transactionId}</p>
              </div>
              {currentTransaction && (
                <button onClick={printReceipt} className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2">
                  Cetak Nota
                </button>
              )}
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Input Section */}
              <div className="lg:col-span-2 space-y-4">
                {/* Barcode Input */}
                <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
                  <h3 className="text-sm font-medium text-blue-800 mb-3">Tambah Barang</h3>
                  <div className="grid grid-cols-4 gap-3">
                    <div className="col-span-2">
                      <input
                        ref={barcodeInputRef}
                        type="text"
                        value={barcodeInput}
                        onChange={(e) => setBarcodeInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                        placeholder="Scan/input barcode"
                        autoFocus
                      />
                    </div>
                    <div>
                      <input
                        type="number"
                        value={quantityInput}
                        onChange={(e) => setQuantityInput(Math.max(1, parseInt(e.target.value) || 1))}
                        onKeyPress={handleKeyPress}
                        min="1"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                        placeholder="Qty"
                      />
                    </div>
                    <div>
                      <button
                        onClick={() => addItemToCart(barcodeInput, quantityInput)}
                        className="w-full px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                      >
                        Tambah
                      </button>
                    </div>
                  </div>
                </div>

                {/* Items List */}
                <div className="bg-white border border-gray-200 rounded-md">
                  <div className="px-4 py-3 border-b border-gray-200">
                    <h3 className="font-medium text-gray-800">Daftar Barang</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Barang</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Harga</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Qty</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Aksi</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {items.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                              Belum ada barang dalam keranjang
                            </td>
                          </tr>
                        ) : (
                          items.map((item) => (
                            <tr key={item.id}>
                              <td className="px-4 py-3">
                                <div>
                                  <div className="text-sm font-medium text-black">{item.name}</div>
                                  <div className="text-xs text-gray-500">{item.barcode}</div>
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <div className="text-sm text-black">
                                  Rp {item.unitPrice.toLocaleString("id-ID")}
                                  {item.unitPrice !== item.basePrice && <div className="text-xs text-green-600">Harga tier (dari Rp {item.basePrice.toLocaleString("id-ID")})</div>}
                                </div>
                              </td>
                              <td className="px-4 py-3">
                                <input
                                  type="number"
                                  value={item.quantity}
                                  onChange={(e) => updateItemQuantity(item.id, parseInt(e.target.value) || 0)}
                                  min="0"
                                  className="w-16 px-2 py-1 border border-gray-300 rounded text-black text-center"
                                />
                              </td>
                              <td className="px-4 py-3 text-sm text-black">Rp {item.totalPrice.toLocaleString("id-ID")}</td>
                              <td className="px-4 py-3">
                                <button onClick={() => removeItem(item.id)} className="text-red-500 hover:text-red-700 text-sm">
                                  Hapus
                                </button>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              {/* Summary Section */}
              <div className="space-y-4">
                {/* Member Section */}
                <div className="bg-white border border-gray-200 rounded-md p-4">
                  <h3 className="font-medium text-gray-800 mb-3">Member</h3>
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={memberIdInput}
                        onChange={(e) => setMemberIdInput(e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                        placeholder="Member ID"
                      />
                      <button type="button" onClick={() => searchMember(memberIdInput)} className="px-3 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
                        Cari
                      </button>
                    </div>
                    {member && (
                      <div className="bg-green-50 p-3 rounded border border-green-200">
                        <div className="text-sm font-medium text-green-800">
                          {member.code} - {member.name}
                        </div>
                        <div className="text-xs text-green-600">Telp: {member.phone}</div>
                        <div className="text-xs text-green-600">Bonus Points: {member.point}</div>
                      </div>
                    )}

                  </div>
                </div>

                {/* Payment Method */}
                <div className="bg-white border border-gray-200 rounded-md p-4">
                  <h3 className="font-medium text-gray-800 mb-3">Metode Pembayaran</h3>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                  >
                    <option value="cash">Cash (Tunai)</option>
                    <option value="transfer">Transfer Bank</option>
                    <option value="credit">Kredit</option>
                  </select>
                </div>

                {/* Summary */}
                <div className="bg-white border border-gray-200 rounded-md p-4">
                  <h3 className="font-medium text-gray-800 mb-3">Ringkasan</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal:</span>
                      <span className="text-black">Rp {calculateSubtotal().toLocaleString("id-ID")}</span>
                    </div>
                    <div className="flex justify-between font-medium text-lg border-t pt-2">
                      <span>Total:</span>
                      <span className="text-black">Rp {calculateTotal().toLocaleString("id-ID")}</span>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-3">
                  <button
                    onClick={processTransaction}
                    disabled={items.length === 0 || isProcessing}
                    className="w-full px-4 py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  >
                    {isProcessing ? "Memproses..." : "Proses Transaksi"}
                  </button>
                  <button onClick={resetTransaction} className="w-full px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2">
                    Reset Transaksi
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
         <div className="mt-6 text-center">
      <a
        href="/transactions/outProduct"
        className="inline-block px-5 py-3 bg-indigo-500 text-white rounded-md shadow hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 font-medium"
      >
        Lihat Semua Transaksi Produk
      </a>
    </div>
      </div>
    </div>
  );
};

export default TransaksiPage;
