import { useState, useEffect } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useSettings, useUpdateSettings } from '@/hooks/useSettings';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import Swal from 'sweetalert2';
import { uploadImage } from '@/lib/api';
import { Image as ImageIcon } from 'lucide-react';

export default function AdminSettings() {
  const { data: settings, isLoading, error } = useSettings();
  const updateSettings = useUpdateSettings();

  const [form, setForm] = useState({
    whatsapp_admin: '',
    po_start_date: '',
    po_end_date: '',
    terms: '',
    max_order_quantity: '',
    landing_logo_url: '',
    landing_brand_title: '',
    landing_brand_subtitle: '',
    landing_hero_title_line1: '',
    landing_hero_title_line2: '',
    landing_hero_description: '',
    landing_teaser_main_title: '',
    landing_teaser_main_subtitle: '',
    landing_teaser_col1_title: '',
    landing_teaser_col1_body: '',
    landing_teaser_col2_title: '',
    landing_teaser_col2_body: '',
  });

  const [logoFile, setLogoFile] = useState<File | null>(null);

  useEffect(() => {
    if (settings) {
      setForm({
        whatsapp_admin: settings.whatsapp_admin || '',
        po_start_date: settings.po_start_date || '',
        po_end_date: settings.po_end_date || '',
        terms: settings.terms || '',
        max_order_quantity: settings.max_order_quantity || '',
        landing_logo_url: settings.landing_logo_url || '',
        landing_brand_title: settings.landing_brand_title || '',
        landing_brand_subtitle: settings.landing_brand_subtitle || '',
        landing_hero_title_line1: settings.landing_hero_title_line1 || '',
        landing_hero_title_line2: settings.landing_hero_title_line2 || '',
        landing_hero_description: settings.landing_hero_description || '',
        landing_teaser_main_title: settings.landing_teaser_main_title || '',
        landing_teaser_main_subtitle: settings.landing_teaser_main_subtitle || '',
        landing_teaser_col1_title: settings.landing_teaser_col1_title || '',
        landing_teaser_col1_body: settings.landing_teaser_col1_body || '',
        landing_teaser_col2_title: settings.landing_teaser_col2_title || '',
        landing_teaser_col2_body: settings.landing_teaser_col2_body || '',
      });
      setLogoFile(null);
    }
  }, [settings]);

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let logoUrl = form.landing_logo_url;
      if (logoFile) {
        logoUrl = await uploadImage(logoFile);
      }
      await updateSettings.mutateAsync({
        whatsapp_admin: form.whatsapp_admin,
        po_start_date: form.po_start_date,
        po_end_date: form.po_end_date,
        terms: form.terms,
        max_order_quantity: form.max_order_quantity,
        landing_logo_url: logoUrl,
        landing_brand_title: form.landing_brand_title,
        landing_brand_subtitle: form.landing_brand_subtitle,
        landing_hero_title_line1: form.landing_hero_title_line1,
        landing_hero_title_line2: form.landing_hero_title_line2,
        landing_hero_description: form.landing_hero_description,
        landing_teaser_main_title: form.landing_teaser_main_title,
        landing_teaser_main_subtitle: form.landing_teaser_main_subtitle,
        landing_teaser_col1_title: form.landing_teaser_col1_title,
        landing_teaser_col1_body: form.landing_teaser_col1_body,
        landing_teaser_col2_title: form.landing_teaser_col2_title,
        landing_teaser_col2_body: form.landing_teaser_col2_body,
      });
      await Swal.fire({
        icon: 'success',
        title: 'Pengaturan berhasil disimpan',
        timer: 1500,
        showConfirmButton: false,
      });
      setLogoFile(null);
    } catch (err: any) {
      await Swal.fire({
        icon: 'error',
        title: 'Gagal menyimpan pengaturan',
        text: err?.message || 'Terjadi kesalahan',
      });
    }
  };

  return (
    <AdminLayout
      title="Pengaturan Sistem"
      description="Atur informasi WhatsApp admin, periode pre-order, dan tampilan landing."
    >
      <div className="grid gap-6 max-w-5xl md:grid-cols-[1.4fr,1.2fr]">
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Pengaturan Pre-Order</CardTitle>
          </CardHeader>
          <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-24 w-full" />
            </div>
          ) : error ? (
            <div className="py-4 text-sm text-destructive">
              Gagal memuat pengaturan.
            </div>
          ) : (
            <form className="space-y-4" onSubmit={handleSubmit}>
              <div className="space-y-1">
                <Label>Nomor WhatsApp Admin</Label>
                <Input
                  value={form.whatsapp_admin}
                  onChange={(e) => handleChange('whatsapp_admin', e.target.value)}
                  placeholder="62812xxxxxxx"
                  required
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-1">
                  <Label>Tanggal Mulai Pre-Order</Label>
                  <Input
                    type="date"
                    value={form.po_start_date}
                    onChange={(e) => handleChange('po_start_date', e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label>Tanggal Selesai Pre-Order</Label>
                  <Input
                    type="date"
                    value={form.po_end_date}
                    onChange={(e) => handleChange('po_end_date', e.target.value)}
                    required
                  />
                </div>
              </div>
              <div className="space-y-1">
                <Label>Syarat & Ketentuan</Label>
                <Textarea
                  rows={5}
                  value={form.terms}
                  onChange={(e) => handleChange('terms', e.target.value)}
                  placeholder="Tulis syarat dan ketentuan pre-order di sini..."
                />
              </div>
              <div className="space-y-1">
                <Label>Batas Maksimal Jumlah Pesanan per Pelanggan (opsional)</Label>
                <Input
                  type="number"
                  min={0}
                  value={form.max_order_quantity}
                  onChange={(e) => handleChange('max_order_quantity', e.target.value)}
                  placeholder="Biarkan kosong jika tidak dibatasi"
                />
              </div>
              <div className="flex justify-end pt-2">
                <Button
                  type="submit"
                  size="sm"
                  disabled={updateSettings.isPending}
                >
                  Simpan Pengaturan
                </Button>
              </div>
            </form>
          )}
          </CardContent>
        </Card>

        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Pengaturan Landing Page</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="space-y-1">
              <Label>Logo Landing</Label>
              <div className="flex flex-col gap-2">
                <input
                  id="landing-logo-input"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0] || null;
                    setLogoFile(file);
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="inline-flex w-fit items-center gap-2"
                  onClick={() => {
                    const input = document.getElementById('landing-logo-input') as HTMLInputElement | null;
                    input?.click();
                  }}
                >
                  <ImageIcon className="w-4 h-4" />
                  Pilih Logo
                </Button>
                {(logoFile || form.landing_logo_url) && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <ImageIcon className="w-3 h-3" />
                    <span className="truncate">
                      {logoFile?.name || form.landing_logo_url}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-1">
              <Label>Judul Brand (navbar)</Label>
              <Input
                value={form.landing_brand_title}
                onChange={(e) => handleChange('landing_brand_title', e.target.value)}
                placeholder="DnF Pre-Order Hub"
              />
            </div>
            <div className="space-y-1">
              <Label>Subjudul Brand (navbar)</Label>
              <Input
                value={form.landing_brand_subtitle}
                onChange={(e) => handleChange('landing_brand_subtitle', e.target.value)}
                placeholder="Bandeng & menu spesial pilihan"
              />
            </div>

            <div className="space-y-1">
              <Label>Judul Hero Baris 1</Label>
              <Input
                value={form.landing_hero_title_line1}
                onChange={(e) => handleChange('landing_hero_title_line1', e.target.value)}
                placeholder="A Taste of Fresh"
              />
            </div>
            <div className="space-y-1">
              <Label>Judul Hero Baris 2</Label>
              <Input
                value={form.landing_hero_title_line2}
                onChange={(e) => handleChange('landing_hero_title_line2', e.target.value)}
                placeholder="Bandeng & Topping Spesial"
              />
            </div>
            <div className="space-y-1">
              <Label>Deskripsi Hero</Label>
              <Textarea
                rows={4}
                value={form.landing_hero_description}
                onChange={(e) => handleChange('landing_hero_description', e.target.value)}
                placeholder="Teks deskripsi singkat di bawah judul hero."
              />
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-1">
                <Label>Judul Kartu Utama</Label>
                <Input
                  value={form.landing_teaser_main_title}
                  onChange={(e) => handleChange('landing_teaser_main_title', e.target.value)}
                  placeholder="Bandeng Utuh Bumbu Spesial"
                />
              </div>
              <div className="space-y-1">
                <Label>Label Kecil Kartu Utama</Label>
                <Input
                  value={form.landing_teaser_main_subtitle}
                  onChange={(e) => handleChange('landing_teaser_main_subtitle', e.target.value)}
                  placeholder="Signature Dish"
                />
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div className="space-y-1">
                <Label>Judul Kartu Kecil 1</Label>
                <Input
                  value={form.landing_teaser_col1_title}
                  onChange={(e) => handleChange('landing_teaser_col1_title', e.target.value)}
                />
                <Textarea
                  rows={3}
                  value={form.landing_teaser_col1_body}
                  onChange={(e) => handleChange('landing_teaser_col1_body', e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <Label>Judul Kartu Kecil 2</Label>
                <Input
                  value={form.landing_teaser_col2_title}
                  onChange={(e) => handleChange('landing_teaser_col2_title', e.target.value)}
                />
                <Textarea
                  rows={3}
                  value={form.landing_teaser_col2_body}
                  onChange={(e) => handleChange('landing_teaser_col2_body', e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
