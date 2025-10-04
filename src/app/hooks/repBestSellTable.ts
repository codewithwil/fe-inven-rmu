"use client";

import { useState, useEffect } from "react";
import axios from "axios";

export interface SalesPerformanceTable {
  id: number;
  barcode: string;
  itemName: string;
  categoryName: string;
  supplierName: string;
categoryId?: number;
 supplierId?: number;
  totalQuantitySold: number;
  totalRevenue: number;
  totalProfit: number;
  profitMargin: number;
  averageSellingPrice: number;
  salesFrequency: number;
  stockTurnover: number;
  currentStock: number;
  lastSaleDate: string | null;
  daysWithoutSale?: number;
  min_stock: number;
  max_stock: number;
  stockStatus: "Low Stock" | "Normal" | "Overstock";
}

interface Filters {
  performanceType: "best-selling" | "slow-moving" | "all";
  startDate?: string;
  endDate?: string;
  categoryId?: string;
  supplierId?: string;
  minQuantity?: string;
  sortBy: "quantity" | "revenue" | "profit";
  sortOrder: "asc" | "desc";
}

export const useReportSummaryTable = (filters: Filters) => {
  const [data, setData] = useState<SalesPerformanceTable[]>([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string>("Idle");
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setStatus("Loading...");

      try {
        const token = localStorage.getItem("admin_token");
        const res = await axios.get(`${API_URL}/report/ReportProdBestSell`, {
          headers: { Authorization: `Bearer ${token}` },
          params: {
            startDate: filters.startDate,
            endDate: filters.endDate,
          },
        });

        if (!res.data?.success) {
          setStatus("Not Available");
          setData([]);
          return;
        }

        const raw = res.data.data.repProd || [];

        const distinctDays = new Set(
          raw.map((r: any) =>
            r.purchaseDate ? String(r.purchaseDate).split("T")[0] : String(r.purchaseDate)
          )
        ).size || 1;

        const productMap: Record<number, Partial<SalesPerformanceTable>> = {};

        raw.forEach((trx: any) => {
          trx.items.forEach((it: any) => {
            const prod = it.product;
            const productId = Number(prod.productId);

            if (!productMap[productId]) {
              productMap[productId] = {
                id: productId,
                barcode: prod.barcode ?? "",
                itemName: prod.name ?? "",
                categoryName: prod.category?.name ?? `Kategori ${prod.category_id}`,
                categoryId: prod.category_id,      // <-- tambahkan ini
                supplierName: prod.supplier?.name ?? `Supplier ${prod.supplier_id}`,
                supplierId: prod.supplier_id,  
                totalQuantitySold: 0,
                totalRevenue: 0,
                totalProfit: 0,
                currentStock: Number(prod.qty ?? 0),
                min_stock: Number(prod.min_stock ?? 0),
                max_stock: Number(prod.max_stock ?? 0),
                lastSaleDate: null,
              };
            }

            const p = productMap[productId] as Partial<SalesPerformanceTable>;

            p.totalQuantitySold = (p.totalQuantitySold || 0) + Number(it.qty || 0);
            p.totalRevenue = (p.totalRevenue || 0) + parseFloat(it.total || "0");
            p.totalProfit =
              (p.totalProfit || 0) +
              (parseFloat(it.price || "0") - parseFloat(prod.purchase_price || "0")) * Number(it.qty || 0);

            if (!p.lastSaleDate || new Date(trx.purchaseDate) > new Date(p.lastSaleDate)) {
              p.lastSaleDate = trx.purchaseDate;
            }
          });
        });

        let result: SalesPerformanceTable[] = Object.values(productMap).map((p) => {
        const totalQty = Number(p.totalQuantitySold ?? 0);
        const totalRev = Number(p.totalRevenue ?? 0);
        const totalProfit = Number(p.totalProfit ?? 0);
        const currentStock = Number(p.currentStock ?? 0);

        const avgPrice = totalQty ? totalRev / totalQty : 0;
        const margin = totalRev ? (totalProfit / totalRev) * 100 : 0;
        const salesFrequency = totalQty / Math.max(distinctDays, 1);
        const stockTurnover = currentStock ? totalQty / currentStock : 0;

        let stockStatus: SalesPerformanceTable["stockStatus"] = "Normal";
        if (currentStock > p.max_stock!) stockStatus = "Overstock";
        else if (currentStock < p.min_stock!) stockStatus = "Low Stock";

        let daysWithoutSale: number | undefined;
        if (p.lastSaleDate) {
            const lastDate = new Date(p.lastSaleDate);
            const today = new Date();
            daysWithoutSale = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
        }

        return {
            ...p,
            totalQuantitySold: totalQty,
            totalRevenue: totalRev,
            totalProfit,
            averageSellingPrice: avgPrice,
            profitMargin: margin,
            salesFrequency,
            stockTurnover,
            currentStock,
            stockStatus,
            daysWithoutSale,
        } as SalesPerformanceTable;
        });

        const filteredResult = (() => {
        let filtered = [...result];

       if (filters.categoryId) {
            filtered = filtered.filter(p => String(p.categoryId) === filters.categoryId);
        }

        if (filters.supplierId) {
            filtered = filtered.filter(p => String(p.supplierId) === filters.supplierId);
        }


        if (filters.minQuantity) {
            filtered = filtered.filter(p => (p.totalQuantitySold || 0) >= Number(filters.minQuantity));
        }

        if (filters.performanceType === "best-selling") {
            filtered.sort((a, b) => (b.totalQuantitySold || 0) - (a.totalQuantitySold || 0));
        } else if (filters.performanceType === "slow-moving") {
            filtered.sort((a, b) => (a.totalQuantitySold || 0) - (b.totalQuantitySold || 0));
        }

       if (filters.sortBy) {
            type NumericKeys = "totalQuantitySold" | "totalRevenue" | "totalProfit";
            const keyMap: Record<string, NumericKeys> = {
                quantity: "totalQuantitySold",
                revenue: "totalRevenue",
                profit: "totalProfit",
            };
            const key = keyMap[filters.sortBy];
            if (key) {
                filtered.sort((a, b) => {
                    const aVal = a[key] ?? 0; 
                    const bVal = b[key] ?? 0;
                    const diff = aVal - bVal;
                    return filters.sortOrder === "asc" ? diff : -diff;
                });
            }
        }   

        return filtered;
        })();

        setData(filteredResult);
        setStatus("Success");

      } catch (err) {
        console.error("Fetch error:", err);
        setStatus("Not Available");
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [filters, API_URL]);

  return { data, loading, status };
};
