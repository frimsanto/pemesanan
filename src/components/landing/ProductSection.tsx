import { useProducts, useProductVariants } from '@/hooks/useProducts';
import { ProductCard } from './ProductCard';
import type { Product } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';

interface ProductSectionProps {
  onSelectProduct: (product: Product) => void;
}

function ProductCardWithVariants({
  product,
  onSelect,
}: {
  product: Product;
  onSelect: (product: Product) => void;
}) {
  const { data: variants = [] } = useProductVariants(product.id);
  return <ProductCard product={product} variants={variants} onSelect={onSelect} />;
}

export function ProductSection({ onSelectProduct }: ProductSectionProps) {
  const { data: products, isLoading } = useProducts(true);

  return (
    <section id="products" className="py-20 bg-transparent">
      <div className="container mx-auto px-4">
        <div className="rounded-3xl bg-card/80 shadow-xl border border-border/60 px-5 py-10 md:px-8 md:py-12">
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto mb-10">
            <p className="text-xs uppercase tracking-[0.25em] text-accent mb-2">Menu Utama</p>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
              Produk Pre-Order
            </h2>
            <div className="h-1 w-16 bg-accent rounded-full mx-auto mb-4" />
            <p className="text-muted-foreground text-sm md:text-base">
              Pilih produk yang Anda inginkan dan segera lakukan pre-order sebelum stok habis.
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
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products
                .filter((product) => !product.name.toLowerCase().includes('topping'))
                .map((product) => (
                  <ProductCardWithVariants
                    key={product.id}
                    product={product}
                    onSelect={onSelectProduct}
                  />
                ))}
            </div>

            {/* Section Topping Tambahan */}
            <div className="mt-16 border-t border-border/40 pt-10">
              <h3 className="text-2xl font-bold mb-4 text-foreground">Topping Tambahan</h3>
              <p className="text-sm text-muted-foreground mb-6">
                Pilih topping tambahan untuk melengkapi pesanan bandeng Anda.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {/* Nasi Putih */}
                <div className="rounded-lg border border-border/40 bg-card shadow-sm p-4 flex flex-col gap-3">
                  <img
                    src="/img/nasi.jpeg"
                    alt="Nasi Putih"
                    className="w-full aspect-video object-cover rounded-md"
                  />
                  <div>
                    <h4 className="font-semibold text-foreground">Nasi Putih</h4>
                    <p className="text-xs text-muted-foreground">
                      Topping nasi putih untuk menambah porsi sesuai selera.
                    </p>
                    <p className="text-sm font-semibold mt-1">Rp 5.000</p>
                  </div>
                </div>

                {/* Tahu */}
                <div className="rounded-lg border border-border/40 bg-card shadow-sm p-4 flex flex-col gap-3">
                  <img
                    src="/img/tahu.jpeg"
                    alt="Tahu"
                    className="w-full aspect-video object-cover rounded-md"
                  />
                  <div>
                    <h4 className="font-semibold text-foreground">Tahu</h4>
                    <p className="text-xs text-muted-foreground">
                      Topping tahu goreng gurih untuk melengkapi bandeng.
                    </p>
                    <p className="text-sm font-semibold mt-1">Rp 3.000</p>
                  </div>
                </div>

                {/* Tempe */}
                <div className="rounded-lg border border-border/40 bg-card shadow-sm p-4 flex flex-col gap-3">
                  <img
                    src="/img/tempe.jpeg"
                    alt="Tempe"
                    className="w-full aspect-video object-cover rounded-md"
                  />
                  <div>
                    <h4 className="font-semibold text-foreground">Tempe</h4>
                    <p className="text-xs text-muted-foreground">
                      Topping tempe untuk menambah porsi sesuai selera.
                    </p>
                    <p className="text-sm font-semibold mt-1">Rp 3.000</p>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Belum ada produk tersedia</p>
          </div>
        )}
        </div>
      </div>
    </section>
  );
}
