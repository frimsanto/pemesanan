import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { useOrderStats, useOrdersWithTotal } from '@/hooks/useOrders';
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS, OrderStatus } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AdminLayout } from '@/components/admin/AdminLayout';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminDashboard() {
  const { data: stats, isLoading: statsLoading, error: statsError } = useOrderStats();
  const { data: orders, isLoading: ordersLoading, error: ordersError } = useOrdersWithTotal();

  const totalRevenue =
    orders?.reduce((sum: number, order: any) => sum + Number(order.total ?? 0), 0) ?? 0;
  const latestOrders = orders?.slice(0, 5) ?? [];

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value);

  return (
    <AdminLayout
      title="Dashboard Admin"
      description="Ringkasan pesanan pre-order dan akses cepat ke halaman penting."
    >
      {/* Hero stats section */}
      <div className="mb-3 sm:mb-5 overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-sky-500 px-4 py-4 sm:px-5 sm:py-5 shadow-md">
        <div className="mb-3 flex items-center justify-between text-indigo-50">
          <div className="space-y-0.5">
            <p className="text-[11px] sm:text-xs uppercase tracking-[0.25em] text-indigo-100/80">Overview</p>
            <p className="text-sm sm:text-base font-semibold">Projects &amp; Orders Snapshot</p>
          </div>
          <span className="hidden sm:inline text-[11px] text-indigo-100/90">
            Data real-time berdasarkan pesanan yang masuk.
          </span>
        </div>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
          {(['pending', 'waiting_payment', 'confirmed', 'cancelled'] as OrderStatus[]).map((status) => (
            <div key={status} className="rounded-xl bg-white/95 px-3 py-3 text-slate-900 shadow-sm">
              <p className="text-[11px] sm:text-xs font-medium text-slate-500">
                {ORDER_STATUS_LABELS[status]}
              </p>
              {statsLoading ? (
                <Skeleton className="mt-2 h-7 w-10" />
              ) : (
                <p className="mt-1 text-xl sm:text-2xl font-semibold">
                  {stats ? (stats as any)[status] ?? 0 : 0}
                </p>
              )}
            </div>
          ))}

          <div className="rounded-xl bg-white/95 px-3 py-3 text-slate-900 shadow-sm md:col-span-2 lg:col-span-1">
            <p className="text-[11px] font-medium text-slate-500">Total Nilai Pre-Order</p>
            {ordersLoading ? (
              <Skeleton className="mt-2 h-7 w-32" />
            ) : ordersError ? (
              <p className="mt-2 text-xs text-red-500">Gagal memuat data pendapatan</p>
            ) : (
              <p className="mt-1 text-xl font-semibold text-indigo-600">
                {formatCurrency(totalRevenue)}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Latest Orders */}
      <Card className="border-border/60 bg-white/90 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold">Pesanan Terbaru</CardTitle>
            <p className="text-xs text-muted-foreground">
              Menampilkan 5 pesanan terakhir yang masuk.
            </p>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link to="/admin/orders">Lihat Semua</Link>
          </Button>
        </CardHeader>
        <CardContent>
          {ordersLoading ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : ordersError ? (
            <div className="py-8 text-center text-sm text-destructive">
              Gagal memuat daftar pesanan terbaru.
              <div className="mt-1 text-xs text-muted-foreground">
                {(ordersError as any)?.message ?? 'Terjadi kesalahan pada server.'}
              </div>
            </div>
          ) : latestOrders.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              Belum ada pesanan.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
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
                  {latestOrders.map((order: any) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-mono text-xs">
                        {order.code}
                      </TableCell>
                      <TableCell>{order.customer_name}</TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium border ${
                            ORDER_STATUS_COLORS[order.status as OrderStatus]
                          }`}
                        >
                          {ORDER_STATUS_LABELS[order.status as OrderStatus]}
                        </span>
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                        {order.created_at
                          ? format(new Date(order.created_at), 'dd MMM yyyy HH:mm', { locale: id })
                          : '-'}
                      </TableCell>
                      <TableCell className="text-right text-sm font-medium">
                        {formatCurrency(order.total || 0)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button asChild size="sm" variant="outline">
                          <Link to={`/admin/orders/${order.id}`}>Detail</Link>
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
    </AdminLayout>
  );
}
