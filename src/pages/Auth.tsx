import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Swal from 'sweetalert2';
import { Loader2, Lock, Mail, ArrowLeft, ShieldCheck } from 'lucide-react';

export default function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, user, isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && isAdmin) {
      navigate('/admin');
    }
  }, [user, isAdmin, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await signIn(email, password);

    if (error) {
      await Swal.fire({
        icon: 'error',
        title: 'Login gagal',
        text: error.message === 'Invalid login credentials' 
          ? 'Email atau password salah'
          : error.message,
        confirmButtonText: 'OK',
      });
    } else {
      await Swal.fire({
        icon: 'success',
        title: 'Login berhasil',
        showConfirmButton: false,
        timer: 1500,
      });
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-indigo-600 via-purple-600 to-slate-900 flex items-start md:items-center justify-center px-4 py-6 md:py-8">
      <div className="absolute inset-0 opacity-30 pointer-events-none">
        <div className="absolute -right-40 -top-40 h-80 w-80 rounded-full bg-indigo-400 blur-3xl" />
        <div className="absolute -left-20 bottom-0 h-72 w-72 rounded-full bg-pink-400 blur-3xl" />
      </div>

      <div className="relative z-10 flex w-full max-w-5xl flex-col gap-6 md:gap-8 md:flex-row items-start md:items-stretch">
        {/* Left panel / brand */}
        <div className="hidden md:flex flex-1 flex-col justify-between text-indigo-50/90 rounded-3xl border border-white/10 bg-white/5 backdrop-blur-md shadow-[0_24px_80px_rgba(15,23,42,0.45)] p-8">
          <div>
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-xs font-medium text-indigo-100/80 hover:text-white transition-colors mb-6"
            >
              <ArrowLeft className="w-4 h-4" />
              Kembali ke Beranda
            </Link>

            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-2xl bg-white/10 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 text-amber-300" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-indigo-100/70">DnF Pre-Order Hub</p>
                <p className="text-base font-semibold">Admin &amp; Super Admin Panel</p>
              </div>
            </div>

            <h2 className="text-3xl font-semibold leading-tight mb-3">
              Kelola pre-order bisnis kamu dengan <span className="text-amber-300">lebih tenang</span>.
            </h2>
            <p className="text-sm text-indigo-100/80 max-w-md">
              Pantau pesanan, atur produk dan jadwal pre-order, serta kelola tim admin dalam satu dashboard
              yang rapi dan modern.
            </p>
          </div>

          <p className="mt-8 text-[11px] text-indigo-100/70">
            © {new Date().getFullYear()} DnF Pre-Order Hub. Semua hak cipta dilindungi.
          </p>
        </div>

        {/* Login card */}
        <div className="flex-1 flex items-start md:items-center justify-center">
          <div className="w-full max-w-md space-y-4">
            {/* Mobile back to home */}
            <div className="md:hidden flex justify-start mb-1">
              <Link
                to="/"
                className="inline-flex items-center gap-2 text-xs font-medium text-indigo-100/80 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Kembali ke Beranda
              </Link>
            </div>

            <Card className="w-full rounded-2xl md:rounded-3xl border-white/10 bg-slate-950/85 text-slate-50 md:shadow-[0_24px_80px_rgba(15,23,42,0.65)] backdrop-blur-lg animate-[fadeInUp_0.35s_ease-out]">
            <CardHeader className="pb-3 text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-500 shadow-lg shadow-indigo-900/40">
                <Lock className="h-7 w-7 text-white" />
              </div>
              <CardTitle className="text-2xl font-semibold tracking-tight">Admin Login</CardTitle>
              <CardDescription className="text-xs text-slate-300 mt-1">
                Masuk ke panel administrasi untuk mengelola pesanan dan pengaturan pre-order.
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-6 pt-2">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-xs text-slate-200">
                    Email
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="admin@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 h-11 rounded-xl bg-slate-900/80 border-slate-700/70 text-slate-50 placeholder:text-slate-500 focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-0"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-xs text-slate-200">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 h-11 rounded-xl bg-slate-900/80 border-slate-700/70 text-slate-50 placeholder:text-slate-500 focus-visible:ring-2 focus-visible:ring-indigo-400 focus-visible:ring-offset-0"
                      required
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-11 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-sm font-semibold shadow-lg shadow-indigo-900/40 hover:from-indigo-400 hover:via-purple-400 hover:to-pink-400 transition-all duration-150"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Memproses...
                    </>
                  ) : (
                    'Masuk ke Dashboard'
                  )}
                </Button>
              </form>

              <div className="mt-4 flex flex-col items-center gap-1 text-[11px] text-slate-400 md:hidden">
                <span>© {new Date().getFullYear()} DnF Pre-Order Hub</span>
              </div>
            </CardContent>
          </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
