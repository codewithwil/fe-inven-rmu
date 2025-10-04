"use client";

import { useState, useEffect } from "react";
import axios from "axios";

interface PaymentMethod {
  count: number;
}

interface HourlyData {
  revenue: number;
}

interface SummaryState {
  totalTransactions: number;
  totalRevenue: number;
  totalProfit: number;
  totalQuantity: number;
  averageTransaction: number;
  averageProfitMargin: number;
  paymentMethodBreakdown: {
    cash: PaymentMethod;
    transfer: PaymentMethod;
    debt: PaymentMethod;
  };
  hourlyBreakdown: HourlyData[];
  loading: boolean;
  error: string | null;
}

export const useDailyTransactionSummary = () => {
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const [summary, setSummary] = useState<SummaryState>({
    totalTransactions: 0,
    totalRevenue: 0,
    totalProfit: 0,
    totalQuantity: 0,
    averageTransaction: 0,
    averageProfitMargin: 0,
    paymentMethodBreakdown: {
      cash: { count: 0 },
      transfer: { count: 0 },
      debt: { count: 0 },
    },
    hourlyBreakdown: [],
    loading: true,
    error: null,
  });

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const token = localStorage.getItem("admin_token");
        const headers = { Authorization: `Bearer ${token}` };

        const endpoints = [
          { key: "totalTransactions", url: `${API_URL}/report/RepDailyTransactions/getTotalTransactionsDaily`, dataKey: "getTotalTransactionsDaily" },
          { key: "totalRevenue", url: `${API_URL}/report/RepDailyTransactions/getTotalIncome`, dataKey: "getTotalIncome" },
          { key: "totalProfit", url: `${API_URL}/report/RepDailyTransactions/getTotalProfit`, dataKey: "getTotalProfit" },
          { key: "totalQuantity", url: `${API_URL}/report/RepDailyTransactions/getTotalProdct`, dataKey: "getTotalProdct" },
          { key: "averageTransaction", url: `${API_URL}/report/RepDailyTransactions/getAverageTransac`, dataKey: "getAverageTransac" },
          { key: "averageProfitMargin", url: `${API_URL}/report/RepDailyTransactions/getAverageMargin`, dataKey: "getAverageMargin" },
          { key: "cashTransactions", url: `${API_URL}/report/RepDailyTransactions/getTransacTunai`, dataKey: "getTransacTunai" },
          { key: "peakHour", url: `${API_URL}/report/RepDailyTransactions/getIncomePeakHour`, dataKey: "getIncomePeakHour" },
          { key: "totalTunai", url: `${API_URL}/report/RepDailyTransactions/getTotalTunai`, dataKey: "getTotalTunai" },
          { key: "totalTransfer", url: `${API_URL}/report/RepDailyTransactions/getTotalTransfer`, dataKey: "getTotalTransfer" },
          { key: "totalHutang", url: `${API_URL}/report/RepDailyTransactions/getTotalHutang`, dataKey: "getTotalHutang" },
        ];

        const results = await Promise.all(
          endpoints.map(ep => axios.get(ep.url, { headers }))
        );

        setSummary({
          totalTransactions: results[0]?.data?.data?.getTotalTransactionsDaily ?? 0,
          totalRevenue: results[1]?.data?.data?.getTotalIncome ?? 0,
          totalProfit: results[2]?.data?.data?.getTotalProfit ?? 0,
          totalQuantity: results[3]?.data?.data?.getTotalProdct ?? 0,
          averageTransaction: results[4]?.data?.data?.getAverageTransac ?? 0,
          averageProfitMargin: results[5]?.data?.data?.getAverageMargin ?? 0,
          paymentMethodBreakdown: {
            cash: { count: results[6]?.data?.data?.getTransacTunai ?? 0 },
            transfer: { count: results[9]?.data?.data?.getTotalTransfer?.total_transaksi ?? 0 },
            debt: { count: results[10]?.data?.data?.getTotalHutang?.total_transaksi ?? 0 },
          },
          hourlyBreakdown: results[7]?.data?.data?.getIncomePeakHour
            ? [{ revenue: results[7]?.data?.data?.getIncomePeakHour.total_income ?? 0 }]
            : [],
          loading: false,
          error: null,
        });
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        setSummary(prev => ({ ...prev, loading: false, error: message }));
      }
    };

    fetchSummary();
  }, []);

  return summary;
};
