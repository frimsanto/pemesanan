import { useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useProducts, useProductVariants, useCreateProduct, useUpdateProduct, useDeleteProduct, useCreateVariant, useUpdateVariant, useDeleteVariant } from '@/hooks/useProducts';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ChevronDown, ChevronRight, Plus, Trash2, Pencil, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { uploadImage } from '@/lib/api';

export default function AdminProducts() {
  const { data: products = [], isLoading } = useProducts(false);
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();

  const createVariant = useCreateVariant();
  const updateVariant = useUpdateVariant();
  const deleteVariant = useDeleteVariant();

  const [expandedProductId, setExpandedProductId] = useState<string | null>(null);
  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    description: '',
    image_url: '',
    is_active: true,
  });

  const [newProductFile, setNewProductFile] = useState<File | null>(null);
  const [editingProductFile, setEditingProductFile] = useState<File | null>(null);

  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [editingProduct, setEditingProduct] = useState({
    name: '',
    price: '',
    description: '',
    image_url: '',
    is_active: true,
  });

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.price) {
      toast.error('Nama dan harga produk wajib diisi');
      return;
    }
    try {
      let imageUrl: string | null = newProduct.image_url || null;
      if (newProductFile) {
        imageUrl = await uploadImage(newProductFile);
      }
      await createProduct.mutateAsync({
        name: newProduct.name,
        description: newProduct.description || null,
        price: Number(newProduct.price) || 0,
        image_url: imageUrl,
        is_active: newProduct.is_active,
        created_at: '',
        updated_at: '',
        id: '',
      } as any);
      toast.success('Produk berhasil ditambahkan');
      setNewProduct({ name: '', price: '', description: '', image_url: '', is_active: true });
      setNewProductFile(null);
    } catch (err: any) {
      toast.error('Gagal menambahkan produk', { description: err?.message });
    }
  };

  const startEditProduct = (product: any) => {
    setEditingProductId(product.id);
    setEditingProduct({
      name: product.name || '',
      price: String(product.price ?? ''),
      description: product.description || '',
      image_url: product.image_url || '',
      is_active: !!product.is_active,
    });
    setEditingProductFile(null);
  };

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProductId) return;
    try {
      let imageUrl: string | null = editingProduct.image_url || null;
      if (editingProductFile) {
        imageUrl = await uploadImage(editingProductFile);
      }
      await updateProduct.mutateAsync({
        id: editingProductId,
        name: editingProduct.name,
        description: editingProduct.description || null,
        price: Number(editingProduct.price) || 0,
        image_url: imageUrl,
        is_active: editingProduct.is_active,
      } as any);
      toast.success('Produk berhasil diperbarui');
      setEditingProductId(null);
      setEditingProductFile(null);
    } catch (err: any) {
      toast.error('Gagal memperbarui produk', { description: err?.message });
    }
  };

  const handleDeleteProduct = async (id: string) => {
    if (!confirm('Yakin ingin menghapus produk ini?')) return;
    try {
      await deleteProduct.mutateAsync(id);
      toast.success('Produk berhasil dihapus');
    } catch (err: any) {
      toast.error('Gagal menghapus produk', { description: err?.message });
    }
  };

  return (
    <AdminLayout
      title="Manajemen Produk"
      description="Kelola produk dan varian yang akan ditampilkan di halaman pre-order."
    >
      <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
        {/* Daftar produk */}
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Daftar Produk</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoading ? (
              <p className="text-sm text-muted-foreground">Memuat produk...</p>
            ) : products.length === 0 ? (
              <p className="text-sm text-muted-foreground">Belum ada produk.</p>
            ) : (
              <div className="space-y-2">
                {products.map((product: any) => (
                  <ProductRow
                    key={product.id}
                    product={product}
                    expanded={expandedProductId === product.id}
                    onToggleExpand={() =>
                      setExpandedProductId((curr) => (curr === product.id ? null : product.id))
                    }
                    onEdit={() => startEditProduct(product)}
                    onDelete={() => handleDeleteProduct(product.id)}
                    createVariant={createVariant}
                    updateVariant={updateVariant}
                    deleteVariant={deleteVariant}
                  />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Form tambah / edit produk */}
        <div className="space-y-4">
          <Card className="border-border/60">
            <CardHeader>
              <CardTitle className="text-sm font-semibold">
                {editingProductId ? 'Edit Produk' : 'Tambah Produk Baru'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form
                className="space-y-3"
                onSubmit={editingProductId ? handleUpdateProduct : handleCreateProduct}
              >
                <div className="space-y-1">
                  <Label>Nama Produk</Label>
                  <Input
                    value={editingProductId ? editingProduct.name : newProduct.name}
                    onChange={(e) =>
                      editingProductId
                        ? setEditingProduct((p) => ({ ...p, name: e.target.value }))
                        : setNewProduct((p) => ({ ...p, name: e.target.value }))
                    }
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label>Harga (Rp)</Label>
                  <Input
                    type="number"
                    min={0}
                    value={editingProductId ? editingProduct.price : newProduct.price}
                    onChange={(e) =>
                      editingProductId
                        ? setEditingProduct((p) => ({ ...p, price: e.target.value }))
                        : setNewProduct((p) => ({ ...p, price: e.target.value }))
                    }
                    required
                  />
                </div>
                <div className="space-y-1">
                  <Label>Deskripsi</Label>
                  <Input
                    value={editingProductId ? editingProduct.description : newProduct.description}
                    onChange={(e) =>
                      editingProductId
                        ? setEditingProduct((p) => ({ ...p, description: e.target.value }))
                        : setNewProduct((p) => ({ ...p, description: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-1">
                  <Label>Gambar Produk (opsional)</Label>
                  <div className="flex flex-col gap-1">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      id="product-image-input"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        if (editingProductId) {
                          setEditingProductFile(file);
                        } else {
                          setNewProductFile(file);
                        }
                      }}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="inline-flex w-fit items-center gap-2"
                      onClick={() => {
                        const input = document.getElementById('product-image-input') as HTMLInputElement | null;
                        input?.click();
                      }}
                    >
                      <ImageIcon className="w-4 h-4" />
                      Pilih Gambar
                    </Button>
                    {(newProductFile || editingProductFile) && (
                      <span className="text-xs text-muted-foreground truncate">
                        {(newProductFile || editingProductFile)?.name}
                      </span>
                    )}
                    {!newProductFile && !editingProductFile &&
                      (editingProductId ? editingProduct.image_url : newProduct.image_url) && (
                        <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                          <ImageIcon className="w-3 h-3" />
                          <span>Gambar saat ini sudah tersimpan.</span>
                        </div>
                      )}
                  </div>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <Label className="text-sm">Aktif</Label>
                  <Switch
                    checked={editingProductId ? editingProduct.is_active : newProduct.is_active}
                    onCheckedChange={(checked) =>
                      editingProductId
                        ? setEditingProduct((p) => ({ ...p, is_active: checked }))
                        : setNewProduct((p) => ({ ...p, is_active: checked }))
                    }
                  />
                </div>
                <div className="flex justify-between pt-2">
                  {editingProductId && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingProductId(null)}
                    >
                      Batal Edit
                    </Button>
                  )}
                  <Button
                    type="submit"
                    size="sm"
                    className="ml-auto"
                    disabled={createProduct.isPending || updateProduct.isPending}
                  >
                    {editingProductId ? 'Simpan Perubahan' : 'Tambah Produk'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}

interface ProductRowProps {
  product: any;
  expanded: boolean;
  onToggleExpand: () => void;
  onEdit: () => void;
  onDelete: () => void;
  createVariant: ReturnType<typeof useCreateVariant>;
  updateVariant: ReturnType<typeof useUpdateVariant>;
  deleteVariant: ReturnType<typeof useDeleteVariant>;
}

function ProductRow({
  product,
  expanded,
  onToggleExpand,
  onEdit,
  onDelete,
  createVariant,
  updateVariant,
  deleteVariant,
}: ProductRowProps) {
  const { data: variants = [] } = useProductVariants(product.id, false);
  const [variantForm, setVariantForm] = useState({
    name: '',
    extra_price: '',
    is_active: true,
  });
  const [editingVariantId, setEditingVariantId] = useState<string | null>(null);

  const handleSubmitVariant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!variantForm.name) {
      toast.error('Nama varian wajib diisi');
      return;
    }
    try {
      if (editingVariantId) {
        await updateVariant.mutateAsync({
          id: editingVariantId,
          name: variantForm.name,
          extra_price: Number(variantForm.extra_price) || 0,
          is_active: variantForm.is_active,
          product_id: product.id,
        } as any);
        toast.success('Varian berhasil diperbarui');
      } else {
        await createVariant.mutateAsync({
          product_id: product.id,
          name: variantForm.name,
          extra_price: Number(variantForm.extra_price) || 0,
          is_active: variantForm.is_active,
          id: '',
          created_at: '',
        } as any);
        toast.success('Varian berhasil ditambahkan');
      }
      setVariantForm({ name: '', extra_price: '', is_active: true });
      setEditingVariantId(null);
    } catch (err: any) {
      toast.error('Operasi varian gagal', { description: err?.message });
    }
  };

  const handleEditVariant = (variant: any) => {
    setEditingVariantId(variant.id);
    setVariantForm({
      name: variant.name || '',
      extra_price: String(variant.extra_price ?? ''),
      is_active: !!variant.is_active,
    });
  };

  const handleDeleteVariant = async (id: string) => {
    if (!confirm('Yakin ingin menghapus varian ini?')) return;
    try {
      await deleteVariant.mutateAsync(id);
      toast.success('Varian berhasil dihapus');
    } catch (err: any) {
      toast.error('Gagal menghapus varian', { description: err?.message });
    }
  };

  return (
    <div className="border rounded-md border-border/60">
      <div
        role="button"
        tabIndex={0}
        className="w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-muted/60"
        onClick={onToggleExpand}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onToggleExpand();
          }
        }}
      >
        <div className="flex items-center gap-2">
          {expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          <div className="text-left">
            <div className="font-medium">{product.name}</div>
            <div className="text-xs text-muted-foreground">
              Rp {new Intl.NumberFormat('id-ID').format(Number(product.price || 0))}
              {product.is_active ? ' • Aktif' : ' • Nonaktif'}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            size="icon"
            variant="outline"
            className="h-8 w-8"
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
          >
            <Pencil className="w-3 h-3" />
          </Button>
          <Button
            type="button"
            size="icon"
            variant="outline"
            className="h-8 w-8 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
          >
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-border/60 p-3 space-y-3 bg-muted/40">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Varian Produk</span>
          </div>
          {variants.length === 0 ? (
            <p className="text-xs text-muted-foreground">Belum ada varian.</p>
          ) : (
            <div className="space-y-1">
              {variants.map((variant: any) => (
                <div
                  key={variant.id}
                  className="flex items-center justify-between rounded border border-border/60 bg-background px-3 py-1.5 text-xs"
                >
                  <div>
                    <div className="font-medium">{variant.name}</div>
                    <div className="text-[11px] text-muted-foreground">
                      Tambahan Rp {new Intl.NumberFormat('id-ID').format(Number(variant.extra_price || 0))}
                      {variant.is_active ? ' • Aktif' : ' • Nonaktif'}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      type="button"
                      size="icon"
                      variant="outline"
                      className="h-7 w-7"
                      onClick={() => handleEditVariant(variant)}
                    >
                      <Pencil className="w-3 h-3" />
                    </Button>
                    <Button
                      type="button"
                      size="icon"
                      variant="outline"
                      className="h-7 w-7 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                      onClick={() => handleDeleteVariant(variant.id)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          <form className="mt-2 space-y-2 rounded-md border border-dashed border-border/60 bg-background/80 p-2" onSubmit={handleSubmitVariant}>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] font-semibold text-muted-foreground">
                {editingVariantId ? 'Edit Varian' : 'Tambah Varian Baru'}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-[11px]">Nama Varian</Label>
                <Input
                  className="h-8 text-xs"
                  value={variantForm.name}
                  onChange={(e) => setVariantForm((v) => ({ ...v, name: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-1">
                <Label className="text-[11px]">Tambahan Harga</Label>
                <Input
                  className="h-8 text-xs"
                  type="number"
                  min={0}
                  value={variantForm.extra_price}
                  onChange={(e) => setVariantForm((v) => ({ ...v, extra_price: e.target.value }))}
                />
              </div>
            </div>
            <div className="flex items-center justify-between pt-1">
              <Label className="text-[11px]">Aktif</Label>
              <Switch
                checked={variantForm.is_active}
                onCheckedChange={(checked) => setVariantForm((v) => ({ ...v, is_active: checked }))}
              />
            </div>
            <div className="flex justify-end gap-2 pt-1">
              {editingVariantId && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm" asChild={false}
                  className="h-7 px-2 text-[11px]"
                  onClick={() => {
                    setEditingVariantId(null);
                    setVariantForm({ name: '', extra_price: '', is_active: true });
                  }}
                >
                  Batal
                </Button>
              )}
              <Button
                type="submit"
                size="sm" asChild={false}
                className="h-7 px-3 text-[11px]"
                disabled={createVariant.isPending || updateVariant.isPending}
              >
                {editingVariantId ? 'Simpan Varian' : 'Tambah Varian'}
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
