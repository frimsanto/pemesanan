import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle, Copy, Home } from 'lucide-react';
import { toast } from 'sonner';

interface ThankYouDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderCode: string;
}

export function ThankYouDialog({ open, onOpenChange, orderCode }: ThankYouDialogProps) {
  const copyOrderCode = () => {
    navigator.clipboard.writeText(orderCode);
    toast.success('Kode pesanan disalin!');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md text-center">
        <DialogHeader>
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center">
              <CheckCircle className="w-10 h-10 text-success" />
            </div>
          </div>
          <DialogTitle className="text-2xl">Terima Kasih!</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <p className="text-muted-foreground">
            Pesanan Anda telah berhasil dibuat. Silakan lanjutkan konfirmasi pembayaran melalui WhatsApp.
          </p>

          {/* Order Code */}
          <div className="bg-muted rounded-lg p-4">
            <p className="text-sm text-muted-foreground mb-2">Kode Pesanan Anda</p>
            <div className="flex items-center justify-center gap-2">
              <span className="text-2xl font-bold text-foreground">{orderCode}</span>
              <Button variant="ghost" size="icon" onClick={copyOrderCode}>
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="bg-warning/10 border border-warning/30 rounded-lg p-4">
            <p className="text-sm text-warning">
              Simpan kode pesanan ini untuk melacak status pesanan Anda.
            </p>
          </div>

          <Button
            variant="default"
            size="lg"
            className="w-full"
            onClick={() => onOpenChange(false)}
          >
            <Home className="w-5 h-5 mr-2" />
            Kembali ke Beranda
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
