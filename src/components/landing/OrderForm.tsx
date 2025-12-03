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
import { toast } from 'sonner';
import type { Product } from '@/lib/types';
import { Loader2, ShoppingBag, MessageCircle } from 'lucide-react';

const formSchema = z.object({
  customer_name: z.string().min(2, 'Nama minimal 2 karakter').max(100, 'Nama maksimal 100 karakter'),
  customer_whatsapp: z.string().min(10, 'Nomor WhatsApp minimal 10 digit').max(15, 'Nomor WhatsApp maksimal 15 digit').regex(/^[0-9]+$/, 'Nomor WhatsApp hanya boleh angka'),
  customer_email: z.string().email('Format email tidak valid').optional().or(z.literal('')),
  product_id: z.string().min(1, 'Pilih produk'),
  variant_id: z.string().optional(),
  quantity: z.number().min(1, 'Minimal 1 item').max(100, 'Maksimal 100 item'),
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

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      customer_name: '',
      customer_whatsapp: '',
      customer_email: '',
      product_id: '',
      variant_id: '',
      quantity: 1,
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

  useEffect(() => {
    if (watchProductId) {
      setSelectedProductId(watchProductId);
      form.setValue('variant_id', '');
    }
  }, [watchProductId, form]);

  const selectedProductData = products.find((p) => p.id === watchProductId);
  const selectedVariant = variants.find((v) => v.id === watchVariantId);

  const unitPrice = (selectedProductData?.price || 0) + (selectedVariant?.extra_price || 0);
  const totalPrice = unitPrice * (watchQuantity || 1);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const onSubmit = async (values: FormValues) => {
    try {
      const order = await createOrder.mutateAsync({
        customer_name: values.customer_name,
        customer_whatsapp: values.customer_whatsapp,
        customer_email: values.customer_email || undefined,
        notes: values.notes,
        items: [
          {
            product_id: values.product_id,
            variant_id: values.variant_id || undefined,
            quantity: values.quantity,
            unit_price: unitPrice,
          },
        ],
      });

      // Build WhatsApp message
      const product = products.find((p) => p.id === values.product_id);
      const variant = variants.find((v) => v.id === values.variant_id);
      
      const message = `Halo, saya ingin melakukan Pre-Order:

*Kode Pesanan:* ${order.code}
*Nama:* ${values.customer_name}
*Produk:* ${product?.name || '-'}${variant ? ` (${variant.name})` : ''}
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
      toast.error('Gagal membuat pesanan', {
        description: error.message,
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <ShoppingBag className="w-5 h-5 text-accent" />
            Form Pre-Order
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            {/* Customer Name */}
            <FormField
              control={form.control}
              name="customer_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Lengkap *</FormLabel>
                  <FormControl>
                    <Input placeholder="Masukkan nama lengkap" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* WhatsApp */}
            <FormField
              control={form.control}
              name="customer_whatsapp"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nomor WhatsApp *</FormLabel>
                  <FormControl>
                    <Input placeholder="081234567890" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Email */}
            <FormField
              control={form.control}
              name="customer_email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email (opsional)</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="email@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Product */}
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
                      {products.map((product) => (
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

            {/* Variant */}
            {variants.length > 0 && (
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
                        {variants.map((variant) => (
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
            )}

            {/* Quantity */}
            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Jumlah *</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      max={100}
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Catatan (opsional)</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Catatan tambahan untuk pesanan Anda"
                      rows={3}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Price Summary */}
            {selectedProductData && (
              <div className="bg-muted/50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Harga Satuan</span>
                  <span>{formatPrice(unitPrice)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Jumlah</span>
                  <span>x{watchQuantity || 1}</span>
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
