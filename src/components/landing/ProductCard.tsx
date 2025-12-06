import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ShoppingBag, Star } from 'lucide-react';
import type { Product, ProductVariant } from '@/lib/types';

interface ProductCardProps {
  product: Product;
  variants: ProductVariant[];
  onSelect: (product: Product) => void;
  displayName?: string;
  imageOverride?: string;
  variantFilter?: (variant: ProductVariant) => boolean;
  priceOverride?: number;
}

export function ProductCard({ product, variants, onSelect, displayName, imageOverride, variantFilter, priceOverride }: ProductCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  // Pilih gambar default berdasarkan jenis produk jika image_url kosong
  const getFallbackImage = () => {
    const name = product.name.toLowerCase();
    // Bandeng cup (300ml) pakai gambar Cup300ml
    if (name.includes('cup') || name.includes('300')) {
      return '/img/Cup300ml.jpg';
    }
    // Produk bandeng lain pakai Bandeng utuh
    if (name.includes('bandeng')) {
      return '/img/Bandeng_utuh.jpg';
    }
    // Produk topping lain bisa diatur nanti jika perlu
    return undefined;
  };

  const imageSrc = imageOverride || product.image_url || getFallbackImage();

  const title = displayName || product.name;
  const displayPrice = typeof priceOverride === 'number' ? priceOverride : product.price;

  return (
    <Card className="group overflow-hidden border-border/50 hover:border-accent/50 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-muted">
        {imageSrc ? (
          <img
            src={imageSrc}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ShoppingBag className="w-16 h-16 text-muted-foreground/30" />
          </div>
        )}
        
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-foreground/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Quick Action */}
        <div className="absolute bottom-4 left-4 right-4 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
          <Button variant="accent" className="w-full" onClick={() => onSelect(product)}>
            <ShoppingBag className="w-4 h-4 mr-2" />
            Pre-Order
          </Button>
        </div>

        {/* Badge */}
        <div className="absolute top-3 left-3">
          <Badge className="bg-accent text-accent-foreground border-0">
            <Star className="w-3 h-3 mr-1 fill-current" />
            Populer
          </Badge>
        </div>
      </div>

      {/* Content */}
      <CardContent className="p-5 space-y-3">
        <div>
          <h3 className="font-bold text-lg text-foreground line-clamp-1">{title}</h3>
          {product.description && (
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
              {product.description}
            </p>
          )}
        </div>

        {/* Price */}
        <div className="flex items-center justify-between pt-2">
          <div>
            <p className="text-xs text-muted-foreground">Mulai dari</p>
            <p className="text-xl font-bold text-primary">{formatPrice(displayPrice)}</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => onSelect(product)}>
            Pilih
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
