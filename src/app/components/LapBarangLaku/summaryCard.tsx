"use client";

import React from "react";
import { useReportSummary } from "@/app/hooks/repBestSell";
import {
  DollarSign,
  TrendingUp,
  BarChart3,
  Package,
  TrendingDown,
  AlertCircle,
} from "lucide-react";

const SummaryCard: React.FC = () => {
  const { summary, loading } = useReportSummary();

  if (loading) {
    return <div className="p-4">Loading summary...</div>;
  }

  return (
    <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
      {/* Top Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <DollarSign className="w-8 h-8 text-green-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Total Revenue</p>
              <p className="text-lg font-semibold text-black">
                Rp {summary.totalRevenue.toLocaleString("id-ID")}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <TrendingUp className="w-8 h-8 text-blue-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Total Profit</p>
              <p className="text-lg font-semibold text-black">
                Rp {summary.totalProfit.toLocaleString("id-ID")}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <BarChart3 className="w-8 h-8 text-purple-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Avg Profit Margin</p>
              <p className="text-lg font-semibold text-black">
                {summary.averageProfitMargin.toFixed(1)}%
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <Package className="w-8 h-8 text-orange-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Total Items</p>
              <p className="text-lg font-semibold text-black">
                {summary.totalItems.toLocaleString("id-ID")}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <TrendingUp className="w-6 h-6 text-green-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Best Selling</p>
              <p className="text-base font-semibold text-black">
                {summary.bestSellingCount}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <TrendingDown className="w-6 h-6 text-red-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Slow Moving</p>
              <p className="text-base font-semibold text-black">
                {summary.slowMovingCount}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <Package className="w-6 h-6 text-blue-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Stock Value</p>
              <p className="text-base font-semibold text-black">
                Rp {summary.stockValue.toLocaleString("id-ID")}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center">
            <AlertCircle className="w-6 h-6 text-red-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-600">Dead Stock Value</p>
              <p className="text-base font-semibold text-black">
                Rp {summary.deadStockValue.toLocaleString("id-ID")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SummaryCard;
