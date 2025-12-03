import { Button } from '@/components/ui/button';
import { Calendar, Clock, ArrowRight } from 'lucide-react';
import { useSettings, isPOOpen } from '@/hooks/useSettings';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

interface HeroSectionProps {
  onOrderClick: () => void;
}

export function HeroSection({ onOrderClick }: HeroSectionProps) {
  const { data: settings } = useSettings();
  const isOpen = settings ? isPOOpen(settings) : false;

  return (
    <section className="relative min-h-[90vh] gradient-hero overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-72 h-72 bg-accent rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-primary-foreground rounded-full blur-3xl" />
      </div>

      <div className="relative container mx-auto px-4 py-20 lg:py-32">
        <div className="max-w-4xl mx-auto text-center space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-accent/20 backdrop-blur-sm border border-accent/30 rounded-full px-4 py-2 text-accent animate-fade-in">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
            </span>
            <span className="text-sm font-medium">
              {isOpen ? 'Pre-Order Sedang Dibuka!' : 'Pre-Order Ditutup'}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-primary-foreground leading-tight animate-slide-up">
            Dapatkan Produk Eksklusif
            <span className="block text-accent mt-2">Sebelum Kehabisan</span>
          </h1>

          {/* Description */}
          <p className="text-lg md:text-xl text-primary-foreground/80 max-w-2xl mx-auto animate-slide-up" style={{ animationDelay: '0.1s' }}>
            Jangan lewatkan kesempatan untuk mendapatkan produk berkualitas dengan harga spesial. 
            Pre-order sekarang dan jadilah yang pertama memilikinya!
          </p>

          {/* PO Period */}
          {settings && (
            <div className="flex flex-wrap justify-center gap-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
              <div className="flex items-center gap-2 bg-primary-foreground/10 backdrop-blur-sm rounded-lg px-4 py-3">
                <Calendar className="w-5 h-5 text-accent" />
                <div className="text-left">
                  <p className="text-xs text-primary-foreground/60">Mulai</p>
                  <p className="text-sm font-semibold text-primary-foreground">
                    {format(new Date(settings.po_start_date), 'dd MMM yyyy', { locale: id })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-primary-foreground/10 backdrop-blur-sm rounded-lg px-4 py-3">
                <Clock className="w-5 h-5 text-accent" />
                <div className="text-left">
                  <p className="text-xs text-primary-foreground/60">Berakhir</p>
                  <p className="text-sm font-semibold text-primary-foreground">
                    {format(new Date(settings.po_end_date), 'dd MMM yyyy', { locale: id })}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* CTA */}
          <div className="flex flex-wrap justify-center gap-4 pt-4 animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <Button
              variant="accent"
              size="xl"
              onClick={onOrderClick}
              disabled={!isOpen}
              className="group"
            >
              Pre-Order Sekarang
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button variant="hero-outline" size="xl" asChild>
              <a href="#products">Lihat Produk</a>
            </Button>
          </div>
        </div>
      </div>

      {/* Wave */}
      <div className="absolute bottom-0 left-0 right-0">
        <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
            fill="hsl(var(--background))"
          />
        </svg>
      </div>
    </section>
  );
}
