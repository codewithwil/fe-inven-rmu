"use client";

import { useEffect, useState } from "react";

export interface ReportSummary {
  totalItems: number;
  totalRevenue: number;
  totalProfit: number;
  averageProfitMargin: number;
  bestSellingCount: number;
  slowMovingCount: number;
  stockValue: number;
  deadStockValue: number;
}

const defaultSummary: ReportSummary = {
  totalItems: 0,
  totalRevenue: 0,
  totalProfit: 0,
  averageProfitMargin: 0,
  bestSellingCount: 0,
  slowMovingCount: 0,
  stockValue: 0,
  deadStockValue: 0,
};

export function useReportSummary() {
  const [summary, setSummary] = useState<ReportSummary>(defaultSummary);
  const [loading, setLoading] = useState(false);
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        setLoading(true);

        const token = localStorage.getItem("admin_token");
        const headers = {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        };

        const baseUrl = `${API_URL}/report/ReportProdBestSell`;

        const [
          revenueRes,
          profitRes,
          itemsRes,
          stockRes,
          avgProfitRes,
          deadStockRes,
          bestSellRes,
          slowMovRes,
        ] = await Promise.all([
          fetch(`${baseUrl}/getTotalRevenue`, { headers }).then(r => r.json()),
          fetch(`${baseUrl}/getTotalProvit`, { headers }).then(r => r.json()),
          fetch(`${baseUrl}/getTotalItems`, { headers }).then(r => r.json()),
          fetch(`${baseUrl}/getStockValue`, { headers }).then(r => r.json()),
          fetch(`${baseUrl}/getAvgProfit`, { headers }).then(r => r.json()),
          fetch(`${baseUrl}/getDeadStock`, { headers }).then(r => r.json()),
          fetch(`${baseUrl}/getBestSell`, { headers }).then(r => r.json()),
          fetch(`${baseUrl}/getSlowMov`, { headers }).then(r => r.json()),
        ]);

        setSummary({
          totalRevenue: parseFloat(revenueRes.data?.getTotalRevenue || 0),
          totalProfit: parseFloat(profitRes.data?.getTotalProvit || 0),
          totalItems: parseInt(itemsRes.data?.getTotalItems || 0),
          stockValue: parseFloat(stockRes.data?.getStockValue || 0),
          averageProfitMargin: parseFloat(avgProfitRes.data?.getAvgProfit || 0),
          deadStockValue: deadStockRes.data?.getDeadStock?.length || 0,
          bestSellingCount: bestSellRes.data?.getBestSell ? 1 : 0,
          slowMovingCount: slowMovRes.data?.getSlowMov?.length || 0,
        });
      } catch (err) {
        console.error("Error fetch summary:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, [API_URL]);

  return { summary, loading };
}
