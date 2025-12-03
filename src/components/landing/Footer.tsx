import { Link } from 'react-router-dom';
import { ShoppingBag, Lock } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-primary text-primary-foreground py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center">
              <ShoppingBag className="w-5 h-5 text-accent-foreground" />
            </div>
            <span className="text-xl font-bold">PreOrder</span>
          </div>

          {/* Links */}
          <nav className="flex flex-wrap justify-center gap-6">
            <a href="#products" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
              Produk
            </a>
            <a href="#faq" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
              FAQ
            </a>
            <a href="#contact" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">
              Kontak
            </a>
          </nav>

          {/* Admin Login */}
          <Link
            to="/auth"
            className="inline-flex items-center gap-2 text-sm text-primary-foreground/60 hover:text-primary-foreground transition-colors"
          >
            <Lock className="w-4 h-4" />
            Login Admin
          </Link>
        </div>

        <div className="mt-8 pt-8 border-t border-primary-foreground/20 text-center">
          <p className="text-sm text-primary-foreground/60">
            © {new Date().getFullYear()} PreOrder System. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
