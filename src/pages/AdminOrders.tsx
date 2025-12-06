import React, { useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { useOrdersWithTotal, useUpdateOrder, useDeleteOrder } from '@/hooks/useOrders';
import { useProducts, useProductVariants } from '@/hooks/useProducts';
import { ORDER_STATUS_LABELS, OrderStatus, ORDER_STATUS_COLORS } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import Swal from 'sweetalert2';
import { AdminLayout } from '@/components/admin/AdminLayout';

class OrdersErrorBoundary extends React.Component<{ children: ReactNode }, { hasError: boolean; message?: string }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, message: error?.message || 'Terjadi kesalahan pada halaman pesanan.' };
  }

  componentDidCatch(error: any, info: any) {
    console.error('Error in AdminOrders:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="py-8 text-center text-sm text-destructive">
          Terjadi kesalahan saat menampilkan daftar pesanan.
          <div className="mt-1 text-xs text-muted-foreground">{this.state.message}</div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function AdminOrders() {
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [productId, setProductId] = useState<string>('');
  const [variantId, setVariantId] = useState<string>('');

  const { data: products = [] } = useProducts(false);
  const { data: variants = [] } = useProductVariants(productId || '', false);

  const { data: orders, isLoading, error } = useOrdersWithTotal({
    status: statusFilter === 'all' ? undefined : statusFilter,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
    productId: productId || undefined,
    variantId: variantId || undefined,
  });

  const updateOrder = useUpdateOrder();
  const deleteOrder = useDeleteOrder();

  const handleStatusChange = async (id: string, status: OrderStatus) => {
    try {
      await updateOrder.mutateAsync({ id, status });
      await Swal.fire({
        icon: 'success',
        title: 'Berhasil',
        text: 'Status pesanan berhasil diperbarui',
        timer: 1200,
        showConfirmButton: false,
      });
    } catch (error: any) {
      await Swal.fire({
        icon: 'error',
        title: 'Gagal memperbarui status pesanan',
        text: error.message || 'Terjadi kesalahan',
      });
    }
  };

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value);

  const formatDateTime = (value?: string) => {
    if (!value) return '-';
    try {
      const d = new Date(value);
      if (Number.isNaN(d.getTime())) return '-';
      return d.toLocaleString('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '-';
    }
  };

  return (
    <AdminLayout
      title="Daftar Pesanan"
      description="Kelola semua pesanan pre-order yang masuk."
    >
      <OrdersErrorBoundary>
      {/* Filters */}
      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="text-sm font-semibold">Filter Pesanan</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 sm:space-y-4">
          <div className="grid gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Status */}
            <div className="space-y-1">
              <Label>Status</Label>
              <Select
                value={statusFilter}
                onValueChange={(value) => setStatusFilter(value as OrderStatus | 'all')}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Semua status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua</SelectItem>
                  <SelectItem value="pending">{ORDER_STATUS_LABELS.pending}</SelectItem>
                  <SelectItem value="waiting_payment">{ORDER_STATUS_LABELS.waiting_payment}</SelectItem>
                  <SelectItem value="confirmed">{ORDER_STATUS_LABELS.confirmed}</SelectItem>
                  <SelectItem value="cancelled">{ORDER_STATUS_LABELS.cancelled}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Start Date */}
            <div className="space-y-1">
              <Label>Dari Tanggal</Label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            {/* End Date */}
            <div className="space-y-1">
              <Label>Sampai Tanggal</Label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>

            {/* Product */}
            <div className="space-y-1">
              <Label>Produk</Label>
              <Select
                value={productId || 'all'}
                onValueChange={(value) => {
                  const nextProductId = value === 'all' ? '' : value;
                  setProductId(nextProductId);
                  setVariantId('');
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Semua produk" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua</SelectItem>
                  {products.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Variant */}
          <div className="grid gap-3 sm:gap-4 md:grid-cols-4">
            <div className="space-y-1 md:col-span-2 lg:col-span-1">
              <Label>Varian</Label>
              <Select
                value={variantId || 'all'}
                onValueChange={(value) => setVariantId(value === 'all' ? '' : value)}
                disabled={!productId}
              >
                <SelectTrigger>
                  <SelectValue placeholder={productId ? 'Semua varian' : 'Pilih produk dahulu'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua</SelectItem>
                  {variants.map((variant) => (
                    <SelectItem key={variant.id} value={variant.id}>
                      {variant.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Orders Table */}
      <Card className="border-border/60 mt-3">
        <CardHeader>
          <CardTitle className="text-sm font-semibold">Daftar Pesanan</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : error ? (
            <div className="py-8 text-center text-sm text-destructive">
              Gagal memuat pesanan.
              <div className="mt-1 text-xs text-muted-foreground">
                {(error as any)?.message ?? 'Terjadi kesalahan pada server.'}
              </div>
            </div>
          ) : !orders || orders.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              Tidak ada pesanan dengan filter saat ini.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table className="text-xs sm:text-sm">
                <TableHeader>
                  <TableRow>
                    <TableHead>Kode</TableHead>
                    <TableHead>Pelanggan</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Tanggal</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order: any) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-mono text-xs">{order.code}</TableCell>
                      <TableCell>{order.customer_name}</TableCell>
                      <TableCell>
                        <Select
                          value={order.status as OrderStatus}
                          onValueChange={(value) =>
                            handleStatusChange(order.id, value as OrderStatus)
                          }
                          disabled={updateOrder.isPending}
                        >
                          <SelectTrigger className="h-8 w-[180px] text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {(Object.keys(ORDER_STATUS_LABELS) as OrderStatus[]).map((status) => (
                              <SelectItem key={status} value={status}>
                                {ORDER_STATUS_LABELS[status]}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                        {formatDateTime(order.created_at)}
                      </TableCell>
                      <TableCell className="text-right text-sm font-medium">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium border ${
                            ORDER_STATUS_COLORS[order.status as OrderStatus]
                          }`}
                        >
                          {formatCurrency(order.total || 0)}
                        </span>
                      </TableCell>
                      <TableCell className="text-right space-x-2">
                        <Button asChild size="sm" variant="outline">
                          <Link to={`/admin/orders/${order.id}`}>Detail</Link>
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          disabled={deleteOrder.isPending}
                          onClick={async () => {
                            const result = await Swal.fire({
                              icon: 'warning',
                              title: 'Hapus pesanan?',
                              html: `Pesanan <b>${order.code}</b> atas nama <b>${order.customer_name}</b> akan dihapus permanen.`,
                              showCancelButton: true,
                              confirmButtonText: 'Ya, hapus',
                              cancelButtonText: 'Batal',
                            });

                            if (!result.isConfirmed) return;

                            try {
                              await deleteOrder.mutateAsync(order.id);
                              await Swal.fire({
                                icon: 'success',
                                title: 'Berhasil',
                                text: 'Pesanan berhasil dihapus.',
                                timer: 1200,
                                showConfirmButton: false,
                              });
                            } catch (error: any) {
                              await Swal.fire({
                                icon: 'error',
                                title: 'Gagal menghapus pesanan',
                                text: error?.message || 'Terjadi kesalahan.',
                              });
                            }
                          }}
                        >
                          Hapus
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      </OrdersErrorBoundary>
    </AdminLayout>
  );
}
