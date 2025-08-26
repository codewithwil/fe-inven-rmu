/*
API ENDPOINTS DOCUMENTATION FOR BACKEND IMPLEMENTATION:

1. GET /api/member-debts/{uniqueId}
   Description: Get member debt details by unique ID
   Headers: Authorization: Bearer {token}
   Response: {
     id: string,
     memberId: string,
     memberName: string,
     uniqueId: string,
     items: [
       {
         id: string,
         transactionId: string,
         itemName: string,
         quantity: number,
         unitPrice: number,
         totalPrice: number,
         createdAt: string
       }
     ],
     totalDebt: number,
     remainingDebt: number,
     status: "unpaid" | "partial" | "paid",
     createdAt: string,
     dueDate: string
   }

2. GET /api/member-debts/{uniqueId}/payments
   Description: Get payment history for a specific debt
   Headers: Authorization: Bearer {token}
   Response: {
     payments: [
       {
         id: string,
         debtId: string,
         amount: number,
         paymentMethod: "cash" | "transfer",
         createdAt: string
       }
     ]
   }

3. POST /api/member-debt-payments
   Description: Process a new debt payment
   Headers: Authorization: Bearer {token}, Content-Type: application/json
   Body: {
     id: string,
     debtId: string,
     uniqueId: string,
     memberId: string,
     amount: number,
     paymentMethod: "cash" | "transfer",
     remainingDebtBefore: number,
     remainingDebtAfter: number,
     createdAt: string
   }
   Response: {
     success: boolean,
     paymentId: string,
     message: string
   }

ERROR RESPONSES:
- 404: Debt not found
- 400: Invalid payment amount or validation errors
- 401: Unauthorized (invalid token)
- 500: Server error
*/

"use client";

import React, { useState, useRef } from "react";

interface DebtItem {
  id: string;
  transactionId: string;
  itemName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  createdAt: string;
}

interface MemberDebt {
  id: string;
  memberId: string;
  memberName: string;
  uniqueId: string;
  items: DebtItem[];
  totalDebt: number;
  remainingDebt: number;
  status: "unpaid" | "partial" | "paid";
  createdAt: string;
  dueDate: string;
}

interface Payment {
  id: string;
  debtId: string;
  amount: number;
  paymentMethod: "cash" | "transfer";
  createdAt: string;
}

interface PaymentTransaction {
  id: string;
  debtId: string;
  uniqueId: string;
  memberName: string;
  originalAmount: number;
  paidAmount: number;
  paymentMethod: "cash" | "transfer";
  createdAt: string;
}

const PembayaranPiutangPage: React.FC = () => {
  const [paymentId] = useState(() => `PAY${Date.now()}`);
  const [uniqueIdInput, setUniqueIdInput] = useState("");
  const [memberDebt, setMemberDebt] = useState<MemberDebt | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "transfer">("cash");
  const [isSearching, setIsSearching] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentPayment, setCurrentPayment] = useState<PaymentTransaction | null>(null);
  const [existingPayments, setExistingPayments] = useState<Payment[]>([]);

  const uniqueIdInputRef = useRef<HTMLInputElement>(null);

  const searchDebt = async (uniqueId: string) => {
    if (!uniqueId.trim()) {
      alert("Masukkan Unique ID tagihan");
      return;
    }

    setIsSearching(true);

    try {
      // API call to get debt by unique ID
      // GET /api/member-debts/{uniqueId}
      const response = await fetch(`/api/member-debts/${uniqueId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("admin_token")}`,
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          alert("Tagihan tidak ditemukan");
        } else {
          const errorData = await response.json();
          alert(`Gagal mencari tagihan: ${errorData.message || "Unknown error"}`);
        }
        setMemberDebt(null);
        setExistingPayments([]);
        return;
      }

      const debtData = await response.json();
      setMemberDebt(debtData);

      // Get existing payments for this debt
      // GET /api/member-debts/{uniqueId}/payments
      const paymentsResponse = await fetch(`/api/member-debts/${uniqueId}/payments`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("admin_token")}`,
        },
      });

      if (paymentsResponse.ok) {
        const paymentsData = await paymentsResponse.json();
        setExistingPayments(paymentsData.payments || []);
      } else {
        setExistingPayments([]);
      }

      // Set default payment amount to remaining debt
      setPaymentAmount(debtData.remainingDebt);
    } catch (error) {
      console.error("Error searching debt:", error);
      alert("Terjadi kesalahan saat mencari tagihan");
      setMemberDebt(null);
      setExistingPayments([]);
    } finally {
      setIsSearching(false);
    }
  };

  const processPayment = async () => {
    if (!memberDebt) {
      alert("Tidak ada tagihan yang dipilih");
      return;
    }

    if (paymentAmount <= 0) {
      alert("Jumlah pembayaran harus lebih dari 0");
      return;
    }

    if (paymentAmount > memberDebt.remainingDebt) {
      alert("Jumlah pembayaran tidak boleh melebihi sisa tagihan");
      return;
    }

    setIsProcessing(true);

    try {
      const paymentData = {
        id: paymentId,
        debtId: memberDebt.id,
        uniqueId: memberDebt.uniqueId,
        memberId: memberDebt.memberId,
        amount: paymentAmount,
        paymentMethod,
        remainingDebtBefore: memberDebt.remainingDebt,
        remainingDebtAfter: memberDebt.remainingDebt - paymentAmount,
        createdAt: new Date().toISOString(),
      };

      // POST /api/member-debt-payments
      const response = await fetch("/api/member-debt-payments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("admin_token")}`,
        },
        body: JSON.stringify(paymentData),
      });

      if (response.ok) {
        const result = await response.json();

        setCurrentPayment({
          id: paymentId,
          debtId: memberDebt.id,
          uniqueId: memberDebt.uniqueId,
          memberName: memberDebt.memberName,
          originalAmount: paymentAmount,
          paidAmount: paymentAmount,
          paymentMethod,
          createdAt: new Date().toISOString(),
        });

        alert("Pembayaran berhasil diproses!");

        // Refresh debt data to get updated remaining balance
        await searchDebt(memberDebt.uniqueId);

        // Generate new payment ID for next transaction
        const newPaymentId = `PAY${Date.now()}`;
        // Note: In a real app, you'd update the paymentId state here
      } else {
        const error = await response.json();
        alert(`Error: ${error.message || "Gagal memproses pembayaran"}`);
      }
    } catch (error) {
      console.error("Error processing payment:", error);
      alert("Terjadi kesalahan saat memproses pembayaran");
    } finally {
      setIsProcessing(false);
    }
  };

  const printReceipt = () => {
    if (!currentPayment || !memberDebt) return;

    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Bukti Pembayaran - ${currentPayment.id}</title>
          <style>
            body { font-family: monospace; font-size: 12px; margin: 0; padding: 20px; }
            .header { text-align: center; border-bottom: 1px dashed #000; padding-bottom: 10px; margin-bottom: 10px; }
            .item { display: flex; justify-content: space-between; margin: 5px 0; }
            .total { border-top: 1px dashed #000; padding-top: 10px; margin-top: 10px; font-weight: bold; }
            .debt-items { margin: 10px 0; }
            @media print { body { margin: 0; padding: 0; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h3>TOKO SAYA</h3>
            <p>Jl. Contoh No. 123<br>Telepon: (021) 12345678</p>
            <p><strong>BUKTI PEMBAYARAN PIUTANG</strong></p>
            <p>No. Pembayaran: ${currentPayment.id}</p>
            <p>Unique ID: ${currentPayment.uniqueId}</p>
            <p>${new Date(currentPayment.createdAt).toLocaleString("id-ID")}</p>
          </div>
          
          <div class="item">
            <span>Member:</span>
            <span>${memberDebt.memberName}</span>
          </div>
          <div class="item">
            <span>Total Tagihan Awal:</span>
            <span>Rp ${memberDebt.totalDebt.toLocaleString("id-ID")}</span>
          </div>
          <div class="item">
            <span>Jumlah Dibayar:</span>
            <span>Rp ${currentPayment.paidAmount.toLocaleString("id-ID")}</span>
          </div>
          <div class="item">
            <span>Sisa Tagihan:</span>
            <span>Rp ${(memberDebt.remainingDebt - currentPayment.paidAmount).toLocaleString("id-ID")}</span>
          </div>
          
          <div class="total">
            <div class="item">
              <span>Metode Pembayaran:</span>
              <span>${currentPayment.paymentMethod.toUpperCase()}</span>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 20px;">
            <p>Terima Kasih Atas Pembayaran Anda!</p>
            <p style="font-size: 10px;">Simpan bukti ini sebagai tanda pembayaran yang sah</p>
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

  const resetForm = () => {
    setUniqueIdInput("");
    setMemberDebt(null);
    setPaymentAmount(0);
    setPaymentMethod("cash");
    setCurrentPayment(null);
    setExistingPayments([]);
    uniqueIdInputRef.current?.focus();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      searchDebt(uniqueIdInput);
    }
  };

  const calculateTotalPaid = () => {
    return existingPayments.reduce((total, payment) => total + payment.amount, 0);
  };

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-semibold text-gray-800">Pembayaran Piutang Member</h2>
                <p className="text-sm text-gray-600 mt-1">ID Pembayaran: {paymentId}</p>
              </div>
              {currentPayment && (
                <button onClick={printReceipt} className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2">
                  Cetak Bukti
                </button>
              )}
            </div>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Search Section */}
              <div className="lg:col-span-2 space-y-4">
                {/* Unique ID Input */}
                <div className="bg-blue-50 p-4 rounded-md border border-blue-200">
                  <h3 className="text-sm font-medium text-blue-800 mb-3">Cari Tagihan Member</h3>
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <input
                        ref={uniqueIdInputRef}
                        type="text"
                        value={uniqueIdInput}
                        onChange={(e) => setUniqueIdInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                        placeholder="Masukkan Unique ID tagihan"
                        autoFocus
                      />
                    </div>
                    <button
                      onClick={() => searchDebt(uniqueIdInput)}
                      disabled={isSearching}
                      className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                    >
                      {isSearching ? "Mencari..." : "Cari"}
                    </button>
                  </div>
                </div>

                {/* Debt Details */}
                {memberDebt && (
                  <div className="bg-white border border-gray-200 rounded-md">
                    <div className="px-4 py-3 border-b border-gray-200">
                      <h3 className="font-medium text-gray-800">Detail Tagihan</h3>
                    </div>
                    <div className="p-4 space-y-4">
                      {/* Member Info */}
                      <div className="bg-gray-50 p-3 rounded">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <div className="text-sm text-gray-600">Member</div>
                            <div className="font-medium text-black">{memberDebt.memberName}</div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-600">Unique ID</div>
                            <div className="font-medium text-black">{memberDebt.uniqueId}</div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-600">Tanggal Tagihan</div>
                            <div className="font-medium text-black">{new Date(memberDebt.createdAt).toLocaleDateString("id-ID")}</div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-600">Jatuh Tempo</div>
                            <div className="font-medium text-black">{new Date(memberDebt.dueDate).toLocaleDateString("id-ID")}</div>
                          </div>
                        </div>
                      </div>

                      {/* Items */}
                      <div>
                        <h4 className="font-medium text-gray-800 mb-2">Item Tagihan</h4>
                        <div className="overflow-x-auto">
                          <table className="w-full text-sm">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Qty</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Harga</th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                              {memberDebt.items.map((item) => (
                                <tr key={item.id}>
                                  <td className="px-3 py-2 text-black">{item.itemName}</td>
                                  <td className="px-3 py-2 text-black">{item.quantity}</td>
                                  <td className="px-3 py-2 text-black">Rp {item.unitPrice.toLocaleString("id-ID")}</td>
                                  <td className="px-3 py-2 text-black">Rp {item.totalPrice.toLocaleString("id-ID")}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Payment Summary */}
                      <div className="bg-yellow-50 p-3 rounded border border-yellow-200">
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <div className="text-gray-600">Total Tagihan</div>
                            <div className="font-medium text-black">Rp {memberDebt.totalDebt.toLocaleString("id-ID")}</div>
                          </div>
                          <div>
                            <div className="text-gray-600">Sudah Dibayar</div>
                            <div className="font-medium text-green-600">Rp {calculateTotalPaid().toLocaleString("id-ID")}</div>
                          </div>
                          <div>
                            <div className="text-gray-600">Sisa Tagihan</div>
                            <div className="font-medium text-red-600">Rp {memberDebt.remainingDebt.toLocaleString("id-ID")}</div>
                          </div>
                        </div>
                      </div>

                      {/* Payment History */}
                      {existingPayments.length > 0 && (
                        <div>
                          <h4 className="font-medium text-gray-800 mb-2">Riwayat Pembayaran</h4>
                          <div className="space-y-2">
                            {existingPayments.map((payment) => (
                              <div key={payment.id} className="bg-green-50 p-2 rounded border border-green-200 text-sm">
                                <div className="flex justify-between">
                                  <span className="text-black">
                                    {new Date(payment.createdAt).toLocaleString("id-ID")} - {payment.paymentMethod.toUpperCase()}
                                  </span>
                                  <span className="font-medium text-green-600">Rp {payment.amount.toLocaleString("id-ID")}</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Payment Section */}
              <div className="space-y-4">
                {/* Payment Amount */}
                <div className="bg-white border border-gray-200 rounded-md p-4">
                  <h3 className="font-medium text-gray-800 mb-3">Jumlah Pembayaran</h3>
                  <input
                    type="number"
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(Math.max(0, parseFloat(e.target.value) || 0))}
                    min="0"
                    max={memberDebt?.remainingDebt || 0}
                    step="0.01"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                    placeholder="Masukkan jumlah pembayaran"
                    disabled={!memberDebt}
                  />
                  {memberDebt && <div className="mt-2 text-xs text-gray-500">Maksimal: Rp {memberDebt.remainingDebt.toLocaleString("id-ID")}</div>}
                  {memberDebt && (
                    <div>
                      {/* Quick Payment Buttons */}
                      <div className="mt-3">
                        <div className="text-sm text-gray-600 mb-2">Pembayaran Cepat:</div>
                        <div className="flex gap-2 flex-wrap">
                          <button type="button" onClick={() => setPaymentAmount(memberDebt.remainingDebt)} className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200">
                            Lunas
                          </button>
                          <button type="button" onClick={() => setPaymentAmount(Math.floor(memberDebt.remainingDebt / 2))} className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200">
                            50%
                          </button>
                          <button type="button" onClick={() => setPaymentAmount(Math.floor(memberDebt.remainingDebt / 4))} className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200">
                            25%
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Payment Method */}
                <div className="bg-white border border-gray-200 rounded-md p-4">
                  <h3 className="font-medium text-gray-800 mb-3">Metode Pembayaran</h3>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as "cash" | "transfer")}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
                    disabled={!memberDebt}
                  >
                    <option value="cash">Cash (Tunai)</option>
                    <option value="transfer">Transfer Bank</option>
                  </select>
                </div>

                {/* Summary */}
                {memberDebt && (
                  <div className="bg-white border border-gray-200 rounded-md p-4">
                    <h3 className="font-medium text-gray-800 mb-3">Ringkasan</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Sisa Tagihan:</span>
                        <span className="text-black">Rp {memberDebt.remainingDebt.toLocaleString("id-ID")}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Jumlah Bayar:</span>
                        <span className="text-black">Rp {paymentAmount.toLocaleString("id-ID")}</span>
                      </div>
                      <div className="flex justify-between font-medium text-lg border-t pt-2">
                        <span>Sisa Setelah Bayar:</span>
                        <span className="text-black">Rp {Math.max(0, memberDebt.remainingDebt - paymentAmount).toLocaleString("id-ID")}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="space-y-3">
                  <button
                    onClick={processPayment}
                    disabled={!memberDebt || paymentAmount <= 0 || paymentAmount > (memberDebt?.remainingDebt || 0) || isProcessing}
                    className="w-full px-4 py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  >
                    {isProcessing ? "Memproses..." : "Proses Pembayaran"}
                  </button>
                  <button onClick={resetForm} className="w-full px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2">
                    Reset Form
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PembayaranPiutangPage;
