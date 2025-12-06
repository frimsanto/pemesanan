import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Order, OrderItem, OrderWithItems, OrderStatus } from '@/lib/types';
import {
  createOrder as apiCreateOrder,
  deleteOrder as apiDeleteOrder,
  getOrderById as apiGetOrderById,
  getOrders as apiGetOrders,
  updateOrder as apiUpdateOrder,
  getOrderByCodePublic,
} from '@/lib/api';

interface OrderFilters {
  status?: OrderStatus;
  productId?: string;
  variantId?: string;
  startDate?: string;
  endDate?: string;
}

export function useOrders(filters?: OrderFilters) {
  return useQuery({
    queryKey: ['orders', filters],
    queryFn: async (): Promise<Order[]> => {
      const params: Record<string, string | undefined> = {
        status: filters?.status,
        startDate: filters?.startDate,
        endDate: filters?.endDate,
        productId: filters?.productId,
        variantId: filters?.variantId,
      };
      const data = await apiGetOrders(params);
      return data as Order[];
    },
  });
}

export function useOrderByCode(code: string) {
  return useQuery({
    queryKey: ['order-by-code', code],
    queryFn: async (): Promise<Order | null> => {
      const data = await getOrderByCodePublic(code);
      return data as Order | null;
    },
    enabled: !!code,
  });
}

export function useOrder(id: string) {
  return useQuery({
    queryKey: ['order', id],
    queryFn: async (): Promise<OrderWithItems | null> => {
      const data = await apiGetOrderById(id);
      return data as OrderWithItems | null;
    },
    enabled: !!id,
  });
}

export function useOrderItems(orderId: string) {
  return useQuery({
    queryKey: ['order-items', orderId],
    queryFn: async (): Promise<OrderItem[]> => {
      const data = await apiGetOrderById(orderId);
      if (!data) return [];
      return (data as any).items as OrderItem[];
    },
    enabled: !!orderId,
  });
}

interface CreateOrderInput {
  customer_name: string;
  customer_whatsapp: string;
  customer_email?: string;
  notes?: string;
  items: {
    product_id: string;
    variant_id?: string;
    quantity: number;
    unit_price: number;
  }[];
}

export function useCreateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateOrderInput) => {
      const created = await apiCreateOrder(input);
      return created;
    },
    onSuccess: () => {
      // Refresh all related order data
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['orders-with-total'] });
      queryClient.invalidateQueries({ queryKey: ['order-stats'] });
    },
  });
}

export function useUpdateOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Order> & { id: string }) => {
      const updated = await apiUpdateOrder(id, updates);
      return updated as Order;
    },
    onSuccess: (updated) => {
      // Update plain orders list caches
      queryClient.setQueriesData({ queryKey: ['orders'] }, (old: unknown) => {
        const current = old as Order[] | undefined;
        if (!current) return current;
        return current.map((o) => (o.id === updated.id ? { ...o, ...updated } : o));
      });

      // Update orders-with-total caches (used in AdminOrders)
      queryClient.setQueriesData({ queryKey: ['orders-with-total'] }, (old: unknown) => {
        const current = old as any[] | undefined;
        if (!current) return current;
        return current.map((o) => (o.id === updated.id ? { ...o, ...updated } : o));
      });

      // Keep detailed order and stats in sync via refetch
      queryClient.invalidateQueries({ queryKey: ['order', updated.id] });
      queryClient.invalidateQueries({ queryKey: ['order-stats'] });
    },
  });
}

export function useDeleteOrder() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await apiDeleteOrder(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      queryClient.invalidateQueries({ queryKey: ['orders-with-total'] });
      queryClient.invalidateQueries({ queryKey: ['order-stats'] });
    },
  });
}

export function useOrderStats() {
  return useQuery({
    queryKey: ['order-stats'],
    queryFn: async () => {
      const orders = (await apiGetOrders()) as Order[];

      const stats = {
        pending: 0,
        waiting_payment: 0,
        confirmed: 0,
        cancelled: 0,
        total: orders.length,
      };

      orders.forEach((order) => {
        stats[order.status as OrderStatus]++;
      });

      return stats;
    },
  });
}

export function useOrdersWithTotal(filters?: OrderFilters) {
  return useQuery({
    queryKey: ['orders-with-total', filters],
    queryFn: async () => {
      const params: Record<string, string | undefined> = {
        status: filters?.status,
        startDate: filters?.startDate,
        endDate: filters?.endDate,
        productId: filters?.productId,
        variantId: filters?.variantId,
      };

      const data = await apiGetOrders(params);
      return data;
    },
  });
}
