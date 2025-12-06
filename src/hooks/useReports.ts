import { useQuery } from '@tanstack/react-query';
import { getReportSummary, getReportByVariant } from '@/lib/api';

interface ReportDateFilters {
  start?: string;
  end?: string;
}

export function useReportSummary(filters: ReportDateFilters) {
  return useQuery({
    queryKey: ['report-summary', filters],
    queryFn: async () => {
      const data = await getReportSummary(filters);
      return data as {
        success?: boolean;
        data?: { total_orders: number; total_revenue: number; items_sold: number };
      } | { total_orders: number; total_revenue: number; items_sold: number };
    },
  });
}

export function useReportByVariant(filters: ReportDateFilters) {
  return useQuery({
    queryKey: ['report-by-variant', filters],
    queryFn: async () => {
      const data = await getReportByVariant(filters);
      return data as
        | { success?: boolean; data?: any[] }
        | any[];
    },
  });
}
