"use client";

import React from "react";
import { Receipt, DollarSign, TrendingUp, Package, CreditCard, Clock } from "lucide-react";
import { useDailyTransactionSummary } from "@/app/hooks/repDailyTransac"; 

const SummaryCardDailyTransac = () => {
  const summary = useDailyTransactionSummary();

  if (summary.loading) {
    return <p className="p-4 text-center text-gray-500">Loading summary...</p>;
  }

  if (summary.error) {
    return <p className="p-4 text-center text-red-500">Error: {summary.error}</p>;
  }

  return (
    <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <Receipt className="w-8 h-8 text-blue-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Total Transaksi</p>
              <p className="text-lg font-semibold text-black">
                {summary.totalTransactions?.toLocaleString("id-ID") ?? 0}
              </p>
            </div>
          </div>
        </div>

        {/* Total Pendapatan */}
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <DollarSign className="w-8 h-8 text-green-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Total Pendapatan</p>
              <p className="text-lg font-semibold text-black">
                Rp {summary.totalRevenue?.toLocaleString("id-ID") ?? 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <TrendingUp className="w-8 h-8 text-purple-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Total Keuntungan</p>
              <p className="text-lg font-semibold text-black">
                Rp {summary.totalProfit?.toLocaleString("id-ID") ?? 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <Package className="w-8 h-8 text-orange-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Total Barang</p>
              <p className="text-lg font-semibold text-black">
                {summary.totalQuantity?.toLocaleString("id-ID") ?? 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <DollarSign className="w-6 h-6 text-green-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Rata-rata Transaksi</p>
              <p className="text-base font-semibold text-black">
                Rp {summary.averageTransaction?.toLocaleString("id-ID") ?? 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <TrendingUp className="w-6 h-6 text-blue-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Rata-rata Margin</p>
              <p className="text-base font-semibold text-black">
                {summary.averageProfitMargin?.toFixed(1) ?? 0}%
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <CreditCard className="w-6 h-6 text-purple-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Transaksi Tunai</p>
              <p className="text-base font-semibold text-black">
                {summary.paymentMethodBreakdown?.cash?.count ?? 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <Clock className="w-6 h-6 text-indigo-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Pendapatan Jam Puncak</p>
              <p className="text-base font-semibold text-black">
                {summary.hourlyBreakdown?.length > 0
                  ? `Rp ${Math.max(...summary.hourlyBreakdown.map(h => h.revenue)).toLocaleString("id-ID")}`
                  : "Rp 0"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SummaryCardDailyTransac;
