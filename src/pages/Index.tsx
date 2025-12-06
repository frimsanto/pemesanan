import { useState } from 'react';
import { HeroSection } from '@/components/landing/HeroSection';
import { ProductSection } from '@/components/landing/ProductSection';
import { FAQSection } from '@/components/landing/FAQSection';
import { ContactSection } from '@/components/landing/ContactSection';
import { Footer } from '@/components/landing/Footer';
import { OrderForm } from '@/components/landing/OrderForm';
import { ThankYouDialog } from '@/components/landing/ThankYouDialog';
import { POClosedBanner } from '@/components/landing/POClosedBanner';
import type { Product } from '@/lib/types';

const Index = () => {
  const [orderFormOpen, setOrderFormOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [thankYouOpen, setThankYouOpen] = useState(false);
  const [orderCode, setOrderCode] = useState('');

  const handleOrderClick = () => {
    setSelectedProduct(null);
    setOrderFormOpen(true);
  };

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
    setOrderFormOpen(true);
  };

  const handleOrderSuccess = (code: string) => {
    setOrderFormOpen(false);
    setOrderCode(code);
    setThankYouOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <POClosedBanner />
      <HeroSection onOrderClick={handleOrderClick} />
      <ProductSection onSelectProduct={handleSelectProduct} />
      <FAQSection />
      <ContactSection />
      <Footer />

      <OrderForm
        open={orderFormOpen}
        onOpenChange={setOrderFormOpen}
        selectedProduct={selectedProduct}
        onSuccess={handleOrderSuccess}
      />

      <ThankYouDialog
        open={thankYouOpen}
        onOpenChange={setThankYouOpen}
        orderCode={orderCode}
      />
    </div>
  );
};

export default Index;
