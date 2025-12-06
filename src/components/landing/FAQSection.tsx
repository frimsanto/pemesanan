import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { HelpCircle } from 'lucide-react';

const faqs = [
  {
    question: 'Apa itu Pre-Order?',
    answer:
      'Pre-Order adalah sistem pembelian di mana Anda memesan produk sebelum tersedia. Produk akan diproduksi/dikirim setelah periode PO berakhir.',
  },
  {
    question: 'Bagaimana cara melakukan Pre-Order?',
    answer:
      'Pilih produk yang diinginkan, isi form pemesanan dengan data lengkap, kemudian Anda akan diarahkan ke WhatsApp untuk konfirmasi pembayaran.',
  },
  {
    question: 'Kapan produk akan dikirim?',
    answer:
      'Produk akan dikirim setelah periode Pre-Order berakhir dan pembayaran telah dikonfirmasi. Estimasi pengiriman akan diinformasikan melalui WhatsApp.',
  },
  {
    question: 'Apakah bisa membatalkan pesanan?',
    answer:
      'Pembatalan pesanan dapat dilakukan sebelum pembayaran dikonfirmasi. Hubungi admin melalui WhatsApp untuk informasi lebih lanjut.',
  },
  {
    question: 'Metode pembayaran apa yang tersedia?',
    answer:
      'Informasi metode pembayaran akan diberikan melalui WhatsApp setelah Anda mengisi form pemesanan.',
  },
];

export function FAQSection() {
  return (
    <section id="faq" className="py-20 bg-transparent">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto rounded-3xl bg-card shadow-xl border border-border/60 px-5 py-10 md:px-8 md:py-12">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-accent/10 text-accent mb-4">
              <HelpCircle className="w-7 h-7" />
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              Pertanyaan Umum
            </h2>
            <div className="h-1 w-16 bg-accent rounded-full mx-auto mb-3" />
            <p className="text-muted-foreground text-sm md:text-base">
              Temukan jawaban untuk pertanyaan yang sering diajukan seputar pre-order di DnF.
            </p>
          </div>

          {/* FAQ Accordion */}
          <Accordion type="single" collapsible className="space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem
                key={index}
                value={`item-${index}`}
                className="bg-card border border-border rounded-xl px-6 data-[state=open]:shadow-md transition-shadow"
              >
                <AccordionTrigger className="text-left font-semibold hover:no-underline py-5">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground pb-5">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
