import { useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useReportSummary, useReportByVariant } from '@/hooks/useReports';
import jsPDF from 'jspdf';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function AdminReports() {
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');

  const filters = { start: start || undefined, end: end || undefined };

  const { data: summaryData, isLoading: summaryLoading, error: summaryError } = useReportSummary(filters);
  const { data: byVariantData, isLoading: byVariantLoading, error: byVariantError } = useReportByVariant(filters);

  const summary =
    (summaryData && 'data' in summaryData ? (summaryData as any).data : summaryData) || {
      total_orders: 0,
      total_revenue: 0,
      items_sold: 0,
    };

  const variants =
    (byVariantData && 'data' in (byVariantData as any)
      ? (byVariantData as any).data
      : byVariantData) || [];

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(value);

  const formatDateLabel = (value?: string) => {
    if (!value) return '-';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    return d.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const handleExportPdf = () => {
    const doc = new jsPDF();
    let y = 18;

    // Title
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('Laporan Pre-Order', 14, y);
    y += 8;

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    if (filters.start || filters.end) {
      const startLabel = formatDateLabel(filters.start);
      const endLabel = formatDateLabel(filters.end);
      doc.text(`Periode: ${startLabel} s/d ${endLabel}`, 14, y);
      y += 6;
    }

    // Summary section
    doc.setFont('helvetica', 'bold');
    doc.text('Ringkasan', 14, y);
    y += 6;

    doc.setFont('helvetica', 'normal');
    doc.text(`Total Pesanan    : ${summary.total_orders}`, 16, y);
    y += 5;
    doc.text(`Total Item Terjual: ${summary.items_sold}`, 16, y);
    y += 5;
    doc.text(`Total Pendapatan : ${formatCurrency(summary.total_revenue)}`, 16, y);
    y += 10;

    // Variant performance table
    doc.setFont('helvetica', 'bold');
    doc.text('Performa Varian Produk', 14, y);
    y += 6;

    doc.setFontSize(9);
    const colXProduct = 14;
    const colXVariant = 90;
    const colXQty = 170;

    // Table header
    doc.text('Produk', colXProduct, y);
    doc.text('Varian', colXVariant, y);
    doc.text('Qty', colXQty, y);
    y += 4;

    doc.setLineWidth(0.1);
    doc.line(colXProduct, y, 190, y);
    y += 4;

    doc.setFont('helvetica', 'normal');
    variants.forEach((row: any) => {
      if (y > 280) {
        doc.addPage();
        y = 20;
        doc.setFont('helvetica', 'bold');
        doc.text('Performa Varian Produk (lanjutan)', 14, y);
        y += 6;
        doc.setFontSize(9);
        doc.text('Produk', colXProduct, y);
        doc.text('Varian', colXVariant, y);
        doc.text('Qty', colXQty, y);
        y += 4;
        doc.line(colXProduct, y, 190, y);
        y += 4;
        doc.setFont('helvetica', 'normal');
      }

      doc.text(String(row.product_name || '-'), colXProduct, y);
      doc.text(String(row.variant_name || '(Tanpa varian)'), colXVariant, y);
      doc.text(String(row.qty_sold), colXQty, y, { align: 'right' });
      y += 5;
    });

    doc.save('laporan-preorder.pdf');
  };

  const handleExportExcel = () => {
    const rows: string[] = [];
    rows.push('Ringkasan');
    rows.push('Total Pesanan,Total Item Terjual,Total Pendapatan');
    rows.push(`${summary.total_orders},${summary.items_sold},${summary.total_revenue}`);
    rows.push('');
    rows.push('Performa Varian');
    rows.push('Produk,Varian,Qty Terjual');
    variants.forEach((row: any) => {
      rows.push(
        `${row.product_name || ''},${row.variant_name || ''},${row.qty_sold}`,
      );
    });

    const csvContent = rows.join('\n');
    const blob = new Blob([csvContent], {
      type: 'application/vnd.ms-excel',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'laporan-preorder.xlsx';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AdminLayout
      title="Laporan"
      description="Lihat ringkasan pre-order dan performa varian produk."
    >
      <div className="space-y-6">
        {/* Filter tanggal + export */}
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Filter Laporan</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div className="grid gap-3 md:grid-cols-2 w-full max-w-xl">
              <div className="space-y-1">
                <Label>Dari tanggal</Label>
                <Input type="date" value={start} onChange={(e) => setStart(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label>Sampai tanggal</Label>
                <Input type="date" value={end} onChange={(e) => setEnd(e.target.value)} />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleExportPdf}
              >
                Export PDF
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleExportExcel}
              >
                Export Excel
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Summary cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border-border/60">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">
                Total Pesanan
              </CardTitle>
            </CardHeader>
            <CardContent>
              {summaryLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : summaryError ? (
                <p className="text-xs text-destructive">Gagal memuat</p>
              ) : (
                <p className="text-2xl font-bold">{summary.total_orders}</p>
              )}
            </CardContent>
          </Card>
          <Card className="border-border/60">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">
                Total Item Terjual
              </CardTitle>
            </CardHeader>
            <CardContent>
              {summaryLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : summaryError ? (
                <p className="text-xs text-destructive">Gagal memuat</p>
              ) : (
                <p className="text-2xl font-bold">{summary.items_sold}</p>
              )}
            </CardContent>
          </Card>
          <Card className="border-border/60">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">
                Total Pendapatan
              </CardTitle>
            </CardHeader>
            <CardContent>
              {summaryLoading ? (
                <Skeleton className="h-8 w-24" />
              ) : summaryError ? (
                <p className="text-xs text-destructive">Gagal memuat</p>
              ) : (
                <p className="text-lg font-bold">{formatCurrency(summary.total_revenue)}</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* By variant table */}
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Performa Varian Produk</CardTitle>
          </CardHeader>
          <CardContent>
            {byVariantLoading ? (
              <div className="space-y-2">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-8 w-full" />
                ))}
              </div>
            ) : byVariantError ? (
              <div className="py-8 text-center text-sm text-destructive">
                Gagal memuat data varian.
              </div>
            ) : !variants || variants.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                Tidak ada data varian untuk rentang tanggal ini.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Produk</TableHead>
                      <TableHead>Varian</TableHead>
                      <TableHead className="text-right">Qty Terjual</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {variants.map((row: any, idx: number) => (
                      <TableRow key={`${row.variant_id ?? 'none'}-${idx}`}>
                        <TableCell>{row.product_name || '-'}</TableCell>
                        <TableCell>{row.variant_name || '(Tanpa varian)'}</TableCell>
                        <TableCell className="text-right">{row.qty_sold}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
