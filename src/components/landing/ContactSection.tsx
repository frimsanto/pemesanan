import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { MessageCircle, Mail, Phone } from 'lucide-react';
import { useSettings } from '@/hooks/useSettings';

export function ContactSection() {
  const { data: settings } = useSettings();

  const handleWhatsAppClick = () => {
    if (settings?.whatsapp_admin) {
      const message = encodeURIComponent('Halo, saya ingin bertanya tentang Pre-Order.');
      window.open(`https://wa.me/${settings.whatsapp_admin}?text=${message}`, '_blank');
    }
  };

  return (
    <section id="contact" className="py-20 bg-transparent">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              Butuh Bantuan?
            </h2>
            <div className="h-1 w-16 bg-accent rounded-full mx-auto mb-3" />
            <p className="text-muted-foreground text-sm md:text-base">
              Hubungi kami jika ada pertanyaan atau kendala seputar pemesanan dan pengiriman.
            </p>
          </div>

          {/* Contact Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* WhatsApp Card */}
            <Card className="border-accent/30 bg-gradient-to-br from-accent/5 to-transparent hover:shadow-lg transition-shadow">
              <CardContent className="p-8 text-center space-y-4">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-success/10 text-success">
                  <MessageCircle className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-foreground">WhatsApp</h3>
                <p className="text-muted-foreground">
                  Hubungi kami langsung melalui WhatsApp untuk respon cepat
                </p>
                <Button
                  variant="success"
                  size="lg"
                  className="w-full"
                  onClick={handleWhatsAppClick}
                >
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Chat WhatsApp
                </Button>
              </CardContent>
            </Card>

            {/* Info Card */}
            <Card className="border-border/50 hover:shadow-lg transition-shadow">
              <CardContent className="p-8 space-y-6">
                <h3 className="text-xl font-bold text-foreground">Informasi Kontak</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Phone className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">WhatsApp</p>
                      <p className="font-semibold text-foreground">
                        +{settings?.whatsapp_admin || '62xxx'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Mail className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="font-semibold text-foreground">desnitayulianti200@gmail.com</p>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-muted-foreground pt-4 border-t border-border">
                  Jam operasional: Senin - Sabtu, 09:00 - 21:00 WIB
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
