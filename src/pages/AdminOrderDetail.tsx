import React, { useState, useMemo, type ReactNode } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useOrder, useUpdateOrder } from '@/hooks/useOrders';
import { useSettings } from '@/hooks/useSettings';
import { ORDER_STATUS_LABELS, OrderStatus, ORDER_STATUS_COLORS } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import Swal from 'sweetalert2';
import { MessageCircle } from 'lucide-react';
import { AdminLayout } from '@/components/admin/AdminLayout';

class OrderDetailErrorBoundary extends React.Component<
  { children: ReactNode },
  { hasError: boolean; message?: string }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: any) {
    return {
      hasError: true,
      message: error?.message || 'Terjadi kesalahan pada halaman detail pesanan.',
    };
  }

  componentDidCatch(error: any, info: any) {
    console.error('Error in AdminOrderDetail:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <AdminLayout title="Detail Pesanan">
          <div className="min-h-[60vh] flex flex-col items-center justify-center text-center space-y-3">
            <p className="text-sm text-destructive">Terjadi kesalahan saat menampilkan detail pesanan.</p>
            <p className="text-xs text-muted-foreground">{this.state.message}</p>
            <Button asChild variant="outline" size="sm">
              <Link to="/admin/orders">Kembali ke Daftar Pesanan</Link>
            </Button>
          </div>
        </AdminLayout>
      );
    }
    return this.props.children;
  }
}

export default function AdminOrderDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: order, isLoading } = useOrder(id || '');
  const { data: settings } = useSettings();
  const updateOrder = useUpdateOrder();
  const [adminNotes, setAdminNotes] = useState('');

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value);

  const total = useMemo(() => {
    if (!order) return 0;
    return order.items.reduce(
      (sum, item) => sum + item.quantity * item.unit_price,
      0
    );
  }, [order]);

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

  const handleStatusChange = async (status: OrderStatus) => {
    if (!order) return;
    try {
      await updateOrder.mutateAsync({ id: order.id, status });
      await Swal.fire({
        icon: 'success',
        title: 'Status pesanan berhasil diperbarui',
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

  const handleSaveNotes = async () => {
    if (!order) return;
    try {
      await updateOrder.mutateAsync({ id: order.id, admin_notes: adminNotes });
      await Swal.fire({
        icon: 'success',
        title: 'Catatan internal berhasil disimpan',
        timer: 1200,
        showConfirmButton: false,
      });
    } catch (error: any) {
      await Swal.fire({
        icon: 'error',
        title: 'Gagal menyimpan catatan internal',
        text: error.message || 'Terjadi kesalahan',
      });
    }
  };

  const handleWhatsApp = () => {
    if (!order || !settings?.whatsapp_admin) return;

    const itemsText = order.items
      .map((item) => {
        const productName = item.product?.name || '-';
        const variantName = item.variant?.name ? ` (${item.variant.name})` : '';
        const subtotal = item.quantity * item.unit_price;
        return `- ${productName}${variantName} x${item.quantity} = ${formatCurrency(subtotal)}`;
      })
      .join('\n');

    const message = `Halo Admin, saya ingin konfirmasi pesanan:

*Kode Pesanan:* ${order.code}
*Nama:* ${order.customer_name}
*Nomor WA:* ${order.customer_whatsapp}

*Detail Pesanan:*
${itemsText}

*Total:* ${formatCurrency(total)}
${order.notes ? `\n*Catatan Pelanggan:* ${order.notes}` : ''}

Mohon konfirmasi pesanan saya. Terima kasih!`;

    const waUrl = `https://wa.me/${settings.whatsapp_admin}?text=${encodeURIComponent(
      message
    )}`;
    window.open(waUrl, '_blank');
  };

  if (isLoading) {
    return (
      <AdminLayout title="Detail Pesanan">
        <div className="min-h-[60vh] p-6">
          <Skeleton className="h-8 w-48 mb-4" />
          <Skeleton className="h-32 w-full mb-4" />
          <Skeleton className="h-48 w-full" />
        </div>
      </AdminLayout>
    );
  }

  if (!order) {
    return (
      <AdminLayout title="Detail Pesanan">
        <div className="min-h-[60vh] flex flex-col items-center justify-center text-center space-y-4">
          <p className="text-muted-foreground">Pesanan tidak ditemukan.</p>
          <Button asChild variant="outline">
            <Link to="/admin/orders">Kembali ke Daftar Pesanan</Link>
          </Button>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout
      title="Detail Pesanan"
      description={`Kode pesanan ${order.code}`}
    >
      <OrderDetailErrorBoundary>
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Left column: customer & order info */}
        <div className="space-y-4 lg:col-span-2">
          <Card className="border-border/60">
            <CardHeader>
              <CardTitle className="text-sm font-semibold">Informasi Pelanggan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div>
                <Label className="text-xs text-muted-foreground">Nama</Label>
                <p className="font-medium">{order.customer_name}</p>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground">Nomor WhatsApp</Label>
                <p className="font-medium">{order.customer_whatsapp}</p>
              </div>
              {order.customer_email && (
                <div>
                  <Label className="text-xs text-muted-foreground">Email</Label>
                  <p className="font-medium">{order.customer_email}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="border-border/60">
            <CardHeader>
              <CardTitle className="text-sm font-semibold">Detail Pesanan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs text-muted-foreground">Kode Pesanan</Label>
                  <p className="font-mono font-medium">{order.code}</p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Tanggal</Label>
                  <p className="font-medium">
                    {formatDateTime(order.created_at)}
                  </p>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Status</Label>
                  <div className="mt-1">
                    <Select
                      value={order.status as OrderStatus}
                      onValueChange={(value) => handleStatusChange(value as OrderStatus)}
                      disabled={updateOrder.isPending}
                    >
                      <SelectTrigger className="h-8 w-[200px] text-xs">
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
                  </div>
                </div>
                {order.notes && (
                  <div className="col-span-2">
                    <Label className="text-xs text-muted-foreground">Catatan Pelanggan</Label>
                    <p className="mt-1 whitespace-pre-wrap">{order.notes}</p>
                  </div>
                )}
              </div>

              <div className="border-t pt-3 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Total</span>
                  <span className="text-lg font-bold text-accent">{formatCurrency(total)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/60">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-semibold">Item Pesanan</CardTitle>
              <Button
                size="sm"
                variant="accent"
                className="gap-2"
                onClick={handleWhatsApp}
                disabled={!settings?.whatsapp_admin}
              >
                <MessageCircle className="w-4 h-4" />
                Chat via WhatsApp
              </Button>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              {order.items.length === 0 ? (
                <p className="text-muted-foreground text-sm">Tidak ada item pesanan.</p>
              ) : (
                <div className="space-y-3">
                  {order.items.map((item) => {
                    const subtotal = item.quantity * item.unit_price;
                    return (
                      <div
                        key={item.id}
                        className="flex items-start justify-between gap-4 border-b last:border-0 pb-2 last:pb-0"
                      >
                        <div>
                          <p className="font-medium">
                            {item.product?.name || '-'}
                            {item.variant?.name && (
                              <span className="text-xs text-muted-foreground"> ({item.variant.name})</span>
                            )}
                          </p>
                          <p className="text-xs text-muted-foreground">x{item.quantity}</p>
                        </div>
                        <div className="text-right text-xs">
                          <p>{formatCurrency(item.unit_price)}</p>
                          <p className="font-semibold">{formatCurrency(subtotal)}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right column: admin notes */}
        <div className="space-y-4">
          <Card className="border-border/60">
            <CardHeader>
              <CardTitle className="text-sm font-semibold">Catatan Internal Admin</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Textarea
                value={adminNotes ?? order.admin_notes ?? ''}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Catatan internal untuk pesanan ini (tidak terlihat oleh pelanggan)."
                rows={8}
              />
              <div className="flex justify-end">
                <Button
                  size="sm"
                  onClick={handleSaveNotes}
                  disabled={updateOrder.isPending}
                >
                  Simpan Catatan
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/60">
            <CardHeader>
              <CardTitle className="text-sm font-semibold">Ringkasan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Status</span>
                <span
                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium border ${
                    ORDER_STATUS_COLORS[order.status as OrderStatus]
                  }`}
                >
                  {ORDER_STATUS_LABELS[order.status as OrderStatus]}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Total</span>
                <span className="font-semibold">{formatCurrency(total)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      </OrderDetailErrorBoundary>
    </AdminLayout>
  );
}
