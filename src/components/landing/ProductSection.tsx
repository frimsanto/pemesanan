import { useProducts, useProductVariants } from '@/hooks/useProducts';
import { ProductCard } from './ProductCard';
import type { Product } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

interface ProductSectionProps {
  onSelectProduct: (product: Product) => void;
}

function ProductCardWithVariants({ product, onSelect }: { product: Product; onSelect: (product: Product) => void }) {
  const { data: variants = [] } = useProductVariants(product.id);
  return <ProductCard product={product} variants={variants} onSelect={onSelect} />;
}

export function ProductSection({ onSelectProduct }: ProductSectionProps) {
  const { data: products, isLoading } = useProducts(true);

  return (
    <section id="products" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Produk Pre-Order
          </h2>
          <p className="text-muted-foreground">
            Pilih produk yang Anda inginkan dan segera lakukan pre-order sebelum stok habis
          </p>
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="space-y-4">
                <Skeleton className="aspect-square w-full rounded-lg" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : products && products.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <ProductCardWithVariants
                key={product.id}
                product={product}
                onSelect={onSelectProduct}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Belum ada produk tersedia</p>
          </div>
        )}
      </div>
    </section>
  );
}
