import { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useOrderByCode } from '@/hooks/useOrders';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2, Search, ArrowLeft, Receipt } from 'lucide-react';

export default function TrackOrder() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCode = searchParams.get('code') || '';
  const [code, setCode] = useState(initialCode);
  const { data: order, isLoading, isError, refetch } = useOrderByCode(initialCode);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const next = code.trim();
    if (!next) return;
    setSearchParams({ code: next });
    refetch();
  };

  const statusLabel: Record<string, string> = {
    pending: 'Menunggu diproses',
    waiting_payment: 'Menunggu pembayaran',
    confirmed: 'Sudah dikonfirmasi',
    cancelled: 'Dibatalkan',
  };

  const statusColor: Record<string, string> = {
    pending: 'bg-amber-100 text-amber-800',
    waiting_payment: 'bg-sky-100 text-sky-800',
    confirmed: 'bg-emerald-100 text-emerald-800',
    cancelled: 'bg-rose-100 text-rose-800',
  };

  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-10 max-w-2xl">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Kembali ke Beranda
        </Link>

        <Card className="border-border/60 shadow-xl rounded-3xl bg-card/90">
          <CardHeader className="flex flex-row items-center gap-3 pb-3">
            <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-lg md:text-xl">Lacak Status Pesanan</CardTitle>
              <p className="text-xs text-muted-foreground mt-1">
                Masukkan kode pesanan yang Anda dapatkan setelah melakukan pre-order.
              </p>
            </div>
          </CardHeader>
          <CardContent className="space-y-5 pt-2">
            <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
              <Input
                placeholder="Contoh: PO-2025-0002"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="h-11 rounded-xl"
              />
              <Button
                type="submit"
                className="sm:w-36 h-11 rounded-xl"
                disabled={!code.trim() || isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Cek...
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4 mr-2" />
                    Cek Status
                  </>
                )}
              </Button>
            </form>

            {isError && (
              <p className="text-sm text-destructive mt-1">Gagal memuat data pesanan. Coba lagi.</p>
            )}

            {initialCode && !isLoading && !order && !isError && (
              <p className="text-sm text-muted-foreground mt-1">
                Pesanan dengan kode tersebut tidak ditemukan. Pastikan kode sudah benar.
              </p>
            )}

            {order && (
              <div className="mt-2 space-y-4 text-sm">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/50 pb-3">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Kode Pesanan</p>
                    <p className="text-lg font-semibold tracking-tight">{order.code}</p>
                  </div>
                  <span
                    className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                      statusColor[order.status] ?? 'bg-muted text-foreground'
                    }`}
                  >
                    {statusLabel[order.status] || order.status}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Atas Nama</p>
                    <p className="font-semibold">{order.customer_name}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground">Dibuat Pada</p>
                    <p className="font-semibold">
                      {new Date(order.created_at).toLocaleString('id-ID')}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
