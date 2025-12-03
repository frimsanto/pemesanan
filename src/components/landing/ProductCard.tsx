import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ShoppingBag, Star } from 'lucide-react';
import type { Product, ProductVariant } from '@/lib/types';

interface ProductCardProps {
  product: Product;
  variants: ProductVariant[];
  onSelect: (product: Product) => void;
}

export function ProductCard({ product, variants, onSelect }: ProductCardProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <Card className="group overflow-hidden border-border/50 hover:border-accent/50 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      {/* Image */}
      <div className="relative aspect-square overflow-hidden bg-muted">
        {product.image_url ? (
          <img
            src={product.image_url}
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
          <h3 className="font-bold text-lg text-foreground line-clamp-1">{product.name}</h3>
          {product.description && (
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
              {product.description}
            </p>
          )}
        </div>

        {/* Variants */}
        {variants.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {variants.slice(0, 4).map((variant) => (
              <Badge key={variant.id} variant="outline" className="text-xs">
                {variant.name}
              </Badge>
            ))}
            {variants.length > 4 && (
              <Badge variant="outline" className="text-xs">
                +{variants.length - 4} lainnya
              </Badge>
            )}
          </div>
        )}

        {/* Price */}
        <div className="flex items-center justify-between pt-2">
          <div>
            <p className="text-xs text-muted-foreground">Mulai dari</p>
            <p className="text-xl font-bold text-primary">{formatPrice(product.price)}</p>
          </div>
          <Button variant="outline" size="sm" onClick={() => onSelect(product)}>
            Pilih
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
