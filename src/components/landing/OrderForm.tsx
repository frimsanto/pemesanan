import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { useProducts, useProductVariants } from '@/hooks/useProducts';
import { useCreateOrder } from '@/hooks/useOrders';
import { useSettings } from '@/hooks/useSettings';
import Swal from 'sweetalert2';
import type { Product } from '@/lib/types';
import { Loader2, ShoppingBag, MessageCircle } from 'lucide-react';

function safeNumber(value: any): number {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

const formSchema = z.object({
  customer_name: z.string().min(2, 'Nama minimal 2 karakter').max(100, 'Nama maksimal 100 karakter'),
  customer_whatsapp: z.string().min(10, 'Nomor WhatsApp minimal 10 digit').max(15, 'Nomor WhatsApp maksimal 15 digit').regex(/^[0-9]+$/, 'Nomor WhatsApp hanya boleh angka'),
  customer_email: z.string().email('Format email tidak valid').optional().or(z.literal('')),
  product_id: z.string().min(1, 'Pilih produk'),
  variant_id: z.string().optional(),
  quantity: z.number().min(1, 'Minimal 1 item').max(100, 'Maksimal 100 item'),
  toppings: z.record(z.number().min(0, 'Minimal 0')).optional(),
  notes: z.string().max(500, 'Catatan maksimal 500 karakter').optional(),
  agree_terms: z.boolean().refine((val) => val === true, 'Anda harus menyetujui syarat & ketentuan'),
});

type FormValues = z.infer<typeof formSchema>;

interface OrderFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedProduct?: Product | null;
  onSuccess: (orderCode: string) => void;
}

export function OrderForm({ open, onOpenChange, selectedProduct, onSuccess }: OrderFormProps) {
  const { data: products = [] } = useProducts(true);
  const { data: settings } = useSettings();
  const createOrder = useCreateOrder();
  
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const { data: variants = [] } = useProductVariants(selectedProductId);

  const toppingProduct = products.find((p) => p.name.toLowerCase().includes('topping')); // "Topping Tambahan"
  const { data: toppingVariants = [] } = useProductVariants(toppingProduct?.id || '');

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customer_name: '',
      customer_whatsapp: '',
      customer_email: '',
      product_id: '',
      variant_id: '',
      quantity: 1,
      toppings: {},
      notes: '',
      agree_terms: false,
    },
  });

  useEffect(() => {
    if (selectedProduct) {
      form.setValue('product_id', selectedProduct.id);
      setSelectedProductId(selectedProduct.id);
    }
  }, [selectedProduct, form]);

  const watchProductId = form.watch('product_id');
  const watchVariantId = form.watch('variant_id');
  const watchQuantity = form.watch('quantity');
  const watchToppings = form.watch('toppings') || {};

  useEffect(() => {
    if (watchProductId) {
      setSelectedProductId(watchProductId);
      form.setValue('variant_id', '');
    }
  }, [watchProductId, form]);

  const selectedProductData = products.find((p) => p.id === watchProductId);
  const displayVariants = variants.filter((variant) => !variant.name.toLowerCase().includes('nasi'));
  const isBaseWholeFish = selectedProductData
    ? selectedProductData.name.toLowerCase().includes('bandeng utuh')
    : false;
  const selectedVariant = variants.find((v) => v.id === watchVariantId);

  const selectedToppingVariants = toppingVariants.filter((tv) => {
    const qty = (watchToppings as Record<string, number>)[tv.id] || 0;
    return qty > 0;
  });

  const basePrice = safeNumber(selectedProductData?.price);
  const variantExtra = safeNumber(selectedVariant?.extra_price);
  const quantity = Math.max(1, safeNumber(watchQuantity));

  const baseUnitPrice = basePrice + variantExtra;

  const toppingsTotal = toppingVariants.reduce((sum, tv) => {
    const qty = (watchToppings as Record<string, number>)[tv.id] || 0;
    if (!qty) return sum;
    const baseToppingPrice = safeNumber(toppingProduct?.price);
    const extra = safeNumber(tv.extra_price);
    const toppingUnit = baseToppingPrice + extra;
    return sum + toppingUnit * qty;
  }, 0);

  const totalPrice = baseUnitPrice * quantity + toppingsTotal;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const onSubmit = async (values: FormValues) => {
    try {
      const items = [
        {
          product_id: values.product_id,
          variant_id: values.variant_id || undefined,
          quantity: quantity,
          unit_price: baseUnitPrice,
        },
      ];

      // Tambahkan item untuk setiap topping yang dipilih, dengan quantity sesuai input masing-masing
      if (toppingProduct && toppingVariants.length > 0) {
        toppingVariants.forEach((tv) => {
          const qty = (values.toppings?.[tv.id] as number | undefined) || 0;
          if (!qty) return;
          const toppingPrice = safeNumber(toppingProduct.price) + safeNumber(tv.extra_price);
          items.push({
            product_id: toppingProduct.id,
            variant_id: tv.id,
            quantity: qty,
            unit_price: toppingPrice,
          });
        });
      }

      const order = await createOrder.mutateAsync({
        customer_name: values.customer_name,
        customer_whatsapp: values.customer_whatsapp,
        customer_email: values.customer_email || undefined,
        notes: values.notes,
        items,
      });

      // Build WhatsApp message
      const product = products.find((p) => p.id === values.product_id);
      const variant = variants.find((v) => v.id === values.variant_id);
      const toppingsText = selectedToppingVariants.length
        ? '\nTopping: ' +
          selectedToppingVariants
            .map((tv) => `${tv.name}`)
            .join(', ')
        : '';
      
      const message = `Halo, saya ingin melakukan Pre-Order:

*Kode Pesanan:* ${order.code}
*Nama:* ${values.customer_name}
*Produk:* ${product?.name || '-'}${variant ? ` (${variant.name})` : ''}${toppingsText}
*Jumlah:* ${values.quantity}
*Total:* ${formatPrice(totalPrice)}
${values.notes ? `*Catatan:* ${values.notes}` : ''}

Mohon konfirmasi pesanan saya. Terima kasih!`;

      // Redirect to WhatsApp
      if (settings?.whatsapp_admin) {
        const waUrl = `https://wa.me/${settings.whatsapp_admin}?text=${encodeURIComponent(message)}`;
        window.open(waUrl, '_blank');
      }

      form.reset();
      onSuccess(order.code);
    } catch (error: any) {
      await Swal.fire({
        icon: 'error',
        title: 'Gagal membuat pesanan',
        text: error.message || 'Terjadi kesalahan. Silakan coba lagi.',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-lg sm:max-w-xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <ShoppingBag className="w-5 h-5 text-accent" />
            Form Pre-Order
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-5 flex-1 min-h-0">
            <div className="space-y-5 overflow-y-auto pr-1">
              {/* 1. Data Pemesan */}
              <div className="space-y-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Data Pemesan</p>
                <FormField
                control={form.control}
                name="customer_name"
                render={({ field }) => (
                  <FormItem>
                    <div className="relative">
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Nama Lengkap"
                          className="peer h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        />
                      </FormControl>
                      <FormLabel className="pointer-events-none absolute left-3 -top-2 z-10 bg-background px-1 text-xs text-muted-foreground transition-all peer-placeholder-shown:opacity-0 peer-placeholder-shown:translate-y-2">
                        Nama Lengkap
                      </FormLabel>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
                />

                <FormField
                control={form.control}
                name="customer_whatsapp"
                render={({ field }) => (
                  <FormItem>
                    <div className="relative">
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Nomor WhatsApp"
                          className="peer h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        />
                      </FormControl>
                      <FormLabel className="pointer-events-none absolute left-3 -top-2 z-10 bg-background px-1 text-xs text-muted-foreground transition-all peer-placeholder-shown:opacity-0 peer-placeholder-shown:translate-y-2">
                        Nomor WhatsApp
                      </FormLabel>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
                />

                <FormField
                control={form.control}
                name="customer_email"
                render={({ field }) => (
                  <FormItem>
                    <div className="relative">
                      <FormControl>
                        <Input
                          type="email"
                          {...field}
                          placeholder="Email (opsional)"
                          className="peer h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        />
                      </FormControl>
                      <FormLabel className="pointer-events-none absolute left-3 -top-2 z-10 bg-background px-1 text-xs text-muted-foreground transition-all peer-placeholder-shown:opacity-0 peer-placeholder-shown:translate-y-2">
                        Email (opsional)
                      </FormLabel>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
                />
              </div>

              {/* 2. Pilih Produk */}
              <div className="space-y-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Pilih Produk</p>
                <FormField
                control={form.control}
                name="product_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Pilih Produk *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih produk" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {products
                          .filter((product) => !product.name.toLowerCase().includes('topping'))
                          .map((product) => (
                            <SelectItem key={product.id} value={product.id}>
                              {product.name} - {formatPrice(product.price)}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
                />
              </div>

              {/* 3. Pilih Varian (hanya jika ada varian yang relevan dan produk bukan Bandeng Utuh) */}
              {displayVariants.length > 0 && !isBaseWholeFish && (
                <div className="space-y-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Pilih Varian</p>
                <FormField
                  control={form.control}
                  name="variant_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pilih Varian</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih varian" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {displayVariants.map((variant) => (
                          <SelectItem key={variant.id} value={variant.id}>
                            {variant.name}
                            {variant.extra_price > 0 && ` (+${formatPrice(variant.extra_price)})`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
                />
              </div>
            )}

            {/* 4. Topping Tambahan */}
            {toppingProduct && toppingVariants.length > 0 && (
              <div className="space-y-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Topping Tambahan</p>
                <FormField
                  control={form.control}
                  name="toppings"
                  render={({ field }) => {
                    const value = (field.value as Record<string, number> | undefined) || {};
                    return (
                      <FormItem>
                        <FormLabel>Pilih topping (opsional)</FormLabel>
                        <div className="space-y-3">
                          {toppingVariants.map((tv) => {
                            const toppingPrice = safeNumber(toppingProduct.price) + safeNumber(tv.extra_price);
                            const qty = value[tv.id] || 0;
                            return (
                              <div key={tv.id} className="flex items-center justify-between gap-3 text-sm">
                                <div className="flex flex-col">
                                  <span>{tv.name}</span>
                                  <span className="text-xs text-muted-foreground">{formatPrice(toppingPrice)} / porsi</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-muted-foreground">Qty</span>
                                  <Input
                                    type="number"
                                    min={0}
                                    max={100}
                                    value={qty}
                                    className="w-20 h-9 text-sm"
                                    onChange={(e) => {
                                      const next = { ...(value || {}) } as Record<string, number>;
                                      const n = safeNumber(e.target.value);
                                      if (!n) {
                                        delete next[tv.id];
                                      } else {
                                        next[tv.id] = n;
                                      }
                                      field.onChange(next);
                                    }}
                                  />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                        <FormMessage />
                      </FormItem>
                    );
                  }}
                />
              </div>
            )}

              {/* 5. Jumlah & Catatan */}
              <div className="space-y-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Jumlah Produk & Catatan</p>
                <FormField
                control={form.control}
                name="quantity"
                render={({ field }) => (
                  <FormItem>
                    <div className="relative">
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          max={100}
                          {...field}
                          placeholder="Jumlah produk"
                          className="peer h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          onChange={(e) => field.onChange(safeNumber(e.target.value) || 1)}
                        />
                      </FormControl>
                      <FormLabel className="pointer-events-none absolute left-3 -top-2 z-10 bg-background px-1 text-xs text-muted-foreground transition-all peer-placeholder-shown:opacity-0 peer-placeholder-shown:translate-y-2">
                        Jumlah produk
                      </FormLabel>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

                <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <div className="relative">
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Catatan (opsional)"
                          rows={3}
                          className="peer min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        />
                      </FormControl>
                      <FormLabel className="pointer-events-none absolute left-3 -top-2 z-10 bg-background px-1 text-xs text-muted-foreground transition-all peer-placeholder-shown:opacity-0 peer-placeholder-shown:translate-y-2">
                        Catatan (opsional)
                      </FormLabel>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
                />
              </div>
            </div>

            {/* 6. Ringkasan Harga */}
            {selectedProductData && (
              <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Harga Produk</span>
                  <span>{formatPrice(baseUnitPrice)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Jumlah Produk</span>
                  <span>x{quantity}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Topping</span>
                  <span>{formatPrice(toppingsTotal)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-2 border-t border-border">
                  <span>Total</span>
                  <span className="text-accent">{formatPrice(totalPrice)}</span>
                </div>
              </div>
            )}

            {/* Terms */}
            <FormField
              control={form.control}
              name="agree_terms"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="text-sm font-normal cursor-pointer">
                      Saya menyetujui syarat & ketentuan yang berlaku
                    </FormLabel>
                    {settings?.terms && (
                      <p className="text-xs text-muted-foreground">{settings.terms}</p>
                    )}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Submit */}
            <Button
              type="submit"
              variant="accent"
              size="lg"
              className="w-full"
              disabled={createOrder.isPending}
            >
              {createOrder.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Memproses...
                </>
              ) : (
                <>
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Pre-Order via WhatsApp
                </>
              )}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
