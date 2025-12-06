import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, ArrowRight, Moon, Sun, Menu, X } from 'lucide-react';
import { useSettings, isPOOpen } from '@/hooks/useSettings';

interface HeroSectionProps {
  onOrderClick: () => void;
}

export function HeroSection({ onOrderClick }: HeroSectionProps) {
  const { data: settings } = useSettings();
  const isOpen = settings ? isPOOpen(settings) : false;

  const logoSrc = settings?.landing_logo_url || '/img/Logo-DnF.png';
  const brandTitle = settings?.landing_brand_title || 'DnF Pre-Order Hub';
  const brandSubtitle = settings?.landing_brand_subtitle || 'Bandeng & menu spesial pilihan';
  const heroTitleLine1 = settings?.landing_hero_title_line1 || 'A Taste of Fresh';
  const heroTitleLine2 = settings?.landing_hero_title_line2 || 'Bandeng & Topping Spesial';
  const heroDescription =
    settings?.landing_hero_description ||
    'Nikmati bandeng pilihan dengan racikan bumbu rumahan dan topping khas DnF. Stok terbatas setiap periode pre-order, pesan sekarang sebelum kehabisan.';
  const teaserMainTitle = settings?.landing_teaser_main_title || 'Bandeng Utuh Bumbu Spesial';
  const teaserMainSubtitle = settings?.landing_teaser_main_subtitle || 'Signature Dish';
  const teaserCol1Title = settings?.landing_teaser_col1_title || 'Topping Tambahan';
  const teaserCol1Body =
    settings?.landing_teaser_col1_body ||
    'Kombinasikan dengan topping favoritmu seperti tempe, tahu, atau nasi hangat.';
  const teaserCol2Title = settings?.landing_teaser_col2_title || 'Pesan Sekali, Nikmati Ramai';
  const teaserCol2Body =
    settings?.landing_teaser_col2_body ||
    'Cocok untuk keluarga, arisan, atau bekal acara spesial.';

  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof document === 'undefined') return false;
    return document.documentElement.classList.contains('dark');
  });

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    const stored = localStorage.getItem('theme');
    if (stored === 'dark') {
      root.classList.add('dark');
      setIsDark(true);
    } else if (stored === 'light') {
      root.classList.remove('dark');
      setIsDark(false);
    }
  }, []);

  const toggleTheme = () => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    if (isDark) {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      setIsDark(false);
    } else {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      setIsDark(true);
    }
  };

  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const formatDate = (value?: string) => {
    if (!value) return '-';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return value;
    return d.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <section className="relative min-h-[90vh] overflow-hidden bg-slate-950">
      {/* Background overlay */}
      <div className="absolute inset-0">
        <div className="h-full w-full bg-[radial-gradient(circle_at_top_left,#f97316_0,transparent_55%),radial-gradient(circle_at_bottom_right,#22d3ee_0,transparent_55%)] opacity-60" />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/95 via-slate-950/80 to-slate-950" />
      </div>

      {/* Navbar */}
      <header className="relative z-10 border-b border-white/10 bg-slate-950/60 backdrop-blur">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <img
              src={logoSrc}
              alt="DnF Pre-Order Hub"
              className="h-8 w-auto rounded-md bg-white/10 px-2 py-1 object-contain"
            />
            <div className="hidden sm:block">
              <p className="text-xs uppercase tracking-[0.25em] text-slate-300">{brandTitle}</p>
              <p className="text-[11px] text-slate-400">{brandSubtitle}</p>
            </div>
          </div>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-4 text-xs font-medium text-slate-200">
            <a href="#products" className="hover:text-white transition-colors">
              Produk
            </a>
            <a href="#faq" className="hover:text-white transition-colors">
              FAQ
            </a>
            <a href="#contact" className="hover:text-white transition-colors">
              Kontak
            </a>
            <a href="/track-order" className="hover:text-white transition-colors">
              Lacak Pesanan
            </a>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-full border-white/20 bg-slate-900/60 text-slate-100 hover:bg-slate-800/80"
              onClick={toggleTheme}
            >
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <Button
              variant="accent"
              size="sm"
              className="ml-2"
              onClick={onOrderClick}
              disabled={!isOpen}
            >
              Pre-Order
            </Button>
          </nav>

          {/* Mobile nav actions */}
          <div className="flex items-center gap-2 md:hidden">
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-8 w-8 rounded-full border-white/20 bg-slate-900/60 text-slate-100 hover:bg-slate-800/80"
              onClick={toggleTheme}
            >
              {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-9 w-9 rounded-full border-white/20 bg-slate-900/80 text-slate-100 hover:bg-slate-800"
              onClick={() => setMobileNavOpen((prev) => !prev)}
            >
              {mobileNavOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile nav dropdown */}
        {mobileNavOpen && (
          <div className="md:hidden border-t border-white/10 bg-slate-950/95 backdrop-blur">
            <div className="container mx-auto px-4 py-3 space-y-2 text-sm text-slate-100">
              <button
                type="button"
                className="block w-full text-left py-2 hover:text-white/90"
                onClick={() => {
                  document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' });
                  setMobileNavOpen(false);
                }}
              >
                Produk
              </button>
              <button
                type="button"
                className="block w-full text-left py-2 hover:text-white/90"
                onClick={() => {
                  document.getElementById('faq')?.scrollIntoView({ behavior: 'smooth' });
                  setMobileNavOpen(false);
                }}
              >
                FAQ
              </button>
              <button
                type="button"
                className="block w-full text-left py-2 hover:text-white/90"
                onClick={() => {
                  document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
                  setMobileNavOpen(false);
                }}
              >
                Kontak
              </button>
              <a
                href="/track-order"
                className="block w-full py-2 hover:text-white/90"
                onClick={() => setMobileNavOpen(false)}
              >
                Lacak Pesanan
              </a>
              <Button
                variant="accent"
                size="sm"
                className="mt-2 w-full"
                onClick={() => {
                  setMobileNavOpen(false);
                  onOrderClick();
                }}
                disabled={!isOpen}
              >
                Pre-Order
              </Button>
            </div>
          </div>
        )}
      </header>

      {/* Hero content */}
      <div className="relative z-10">
        <div className="container mx-auto px-4 py-10 lg:py-16">
          <div className="grid gap-10 lg:grid-cols-[1.4fr,1fr] items-center">
            {/* Left: text */}
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-emerald-300 border border-emerald-400/30">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
                </span>
                <span className="text-xs font-medium">
                  {isOpen ? 'Pre-Order Sedang Dibuka' : 'Pre-Order Ditutup Sementara'}
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
                {heroTitleLine1}
                <span className="block text-amber-300 mt-1">{heroTitleLine2}</span>
              </h1>

              <p className="max-w-xl text-sm sm:text-base text-slate-200/80">
                {heroDescription}
              </p>

              {settings && (
                <div className="flex flex-wrap gap-3 text-xs text-slate-100/90">
                  <div className="flex items-center gap-2 rounded-lg bg-slate-900/60 px-3 py-2 border border-white/10">
                    <Calendar className="h-4 w-4 text-amber-300" />
                    <div>
                      <p className="text-[10px] uppercase tracking-wide text-slate-400">Mulai</p>
                      <p className="font-semibold">{formatDate(settings.po_start_date)}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 rounded-lg bg-slate-900/60 px-3 py-2 border border-white/10">
                    <Clock className="h-4 w-4 text-cyan-300" />
                    <div>
                      <p className="text-[10px] uppercase tracking-wide text-slate-400">Berakhir</p>
                      <p className="font-semibold">{formatDate(settings.po_end_date)}</p>
                    </div>
                  </div>
                </div>
              )}

              <div className="flex flex-wrap gap-4 pt-2">
                <Button
                  variant="accent"
                  size="lg"
                  onClick={onOrderClick}
                  disabled={!isOpen}
                  className="group"
                >
                  Pre-Order via WhatsApp
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
                <Button variant="hero-outline" size="lg" asChild>
                  <a href="#products">Lihat Menu</a>
                </Button>
              </div>
            </div>

            {/* Right: teaser cards */}
            <div className="hidden md:block">
              <div className="rounded-3xl bg-white/5 border border-white/10 shadow-2xl backdrop-blur-lg p-4 space-y-3 max-w-md ml-auto">
                <div className="rounded-2xl overflow-hidden h-40 bg-gradient-to-tr from-amber-400 via-orange-500 to-red-500 flex items-end p-4">
                  <div className="bg-black/40 backdrop-blur px-3 py-2 rounded-xl">
                    <p className="text-[11px] text-amber-100 uppercase tracking-wide">
                      {teaserMainSubtitle}
                    </p>
                    <p className="text-sm font-semibold text-white">{teaserMainTitle}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="rounded-xl bg-slate-900/70 border border-white/5 p-3">
                    <p className="font-semibold text-slate-50 mb-1">{teaserCol1Title}</p>
                    <p className="text-slate-300 text-[11px]">{teaserCol1Body}</p>
                  </div>
                  <div className="rounded-xl bg-slate-900/70 border border-white/5 p-3">
                    <p className="font-semibold text-slate-50 mb-1">{teaserCol2Title}</p>
                    <p className="text-slate-300 text-[11px]">{teaserCol2Body}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
