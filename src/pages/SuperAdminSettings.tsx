import { AdminLayout } from '@/components/admin/AdminLayout';
import { useSettings } from '@/hooks/useSettings';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function SuperAdminSettings() {
  const { data: settings, isLoading, error } = useSettings();

  const formatDate = (value?: string) => {
    if (!value) return '-';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    return d.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <AdminLayout
      title="Pengaturan Global"
      description="Ringkasan pengaturan sistem yang digunakan oleh seluruh aplikasi."
    >
      <div className="space-y-4 max-w-2xl">
        <p className="text-sm text-muted-foreground">
          Halaman ini menampilkan pengaturan global yang juga digunakan oleh panel Admin. Perubahan
          nilai dilakukan melalui halaman <span className="font-semibold">Pengaturan Sistem</span>
          , namun Super Admin dapat memantau konfigurasi aktif di sini.
        </p>

        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Ringkasan Pengaturan Pre-Order</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="h-4 w-56" />
                <Skeleton className="h-4 w-64" />
              </div>
            ) : error ? (
              <p className="text-sm text-destructive">Gagal memuat pengaturan.</p>
            ) : !settings ? (
              <p className="text-sm text-muted-foreground">Belum ada pengaturan yang tersimpan.</p>
            ) : (
              <dl className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <dt className="text-muted-foreground">Nomor WhatsApp Admin</dt>
                  <dd className="font-medium">{settings.whatsapp_admin}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-muted-foreground">Periode Pre-Order</dt>
                  <dd className="font-medium">
                    {formatDate(settings.po_start_date)} s/d {formatDate(settings.po_end_date)}
                  </dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-muted-foreground">Batas Maksimal per Pelanggan</dt>
                  <dd className="font-medium">
                    {settings.max_order_quantity
                      ? `${settings.max_order_quantity} item`
                      : 'Tidak dibatasi'}
                  </dd>
                </div>
              </dl>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
