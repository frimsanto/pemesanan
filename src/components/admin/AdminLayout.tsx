import { ReactNode, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Menu, X } from 'lucide-react';

interface AdminLayoutProps {
  title: string;
  description?: string;
  children: ReactNode;
}

export function AdminLayout({ title, description, children }: AdminLayoutProps) {
  const { role, user, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const isSuperAdmin = role === 'super_admin';
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const navItems = [
    { to: '/admin', label: 'Dashboard' },
    { to: '/admin/orders', label: 'Pesanan' },
    { to: '/admin/products', label: 'Produk' },
    { to: '/admin/settings', label: 'Pengaturan Sistem' },
    { to: '/admin/reports', label: 'Laporan' },
  ];

  const superNavItems = isSuperAdmin
    ? [
        { to: '/super-admin/users', label: 'Manajemen Admin' },
        { to: '/super-admin/settings', label: 'Pengaturan Global' },
      ]
    : [];

  const closeMobileNav = () => setMobileNavOpen(false);

  return (
    <div className="min-h-screen flex bg-slate-100 text-slate-900">
      {/* Sidebar - desktop */}
      <aside className="hidden md:flex w-64 bg-slate-950 text-slate-100 flex-col shadow-xl">
        <div className="px-5 py-4 border-b border-slate-800">
          <Link
            to="/"
            className="block mb-1 text-sm font-semibold tracking-wide text-slate-100"
          >
            DnF Pre-Order Hub
          </Link>
          <p className="text-[11px] text-slate-400">Panel {isSuperAdmin ? 'Super Admin' : 'Admin'}</p>
          <div className="mt-3 flex flex-col gap-1 text-xs text-slate-400">
            <span className="inline-flex items-center rounded-full border border-emerald-500/40 px-2 py-0.5 bg-emerald-500/10 w-fit">
              <span className="mr-1 h-1.5 w-1.5 rounded-full bg-emerald-400" />
              {isSuperAdmin ? 'Super Admin' : 'Admin'}
            </span>
            {user?.email && <span className="truncate text-slate-300">{user.email}</span>}
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1 text-sm">
          <p className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
            Navigasi
          </p>
          {navItems.map((item) => {
            const active = location.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center rounded-md px-3 py-2 text-xs font-medium transition-colors ${
                  active
                    ? 'bg-slate-100 text-slate-900 shadow-sm'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-50'
                }`}
              >
                {item.label}
              </Link>
            );
          })}

          {superNavItems.length > 0 && (
            <div className="pt-4 mt-4 border-t border-slate-800 space-y-1">
              <p className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                Super Admin
              </p>
              {superNavItems.map((item) => {
                const active = location.pathname === item.to;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`flex items-center rounded-md px-3 py-2 text-xs font-medium transition-colors ${
                      active
                        ? 'bg-violet-500 text-white shadow-sm'
                        : 'text-slate-400 hover:bg-slate-800 hover:text-slate-50'
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          )}
        </nav>

        <div className="px-3 py-4 border-t border-slate-800">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full justify-center text-red-400 border-red-400/40 hover:bg-red-500/10 hover:text-red-200 bg-transparent text-xs"
            onClick={async () => {
              await signOut();
              navigate('/auth');
            }}
          >
            Logout
          </Button>
        </div>
      </aside>

      {/* Sidebar - mobile drawer */}
      {mobileNavOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          <div className="w-64 bg-slate-950 text-slate-100 flex flex-col shadow-xl">
            <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between">
              <div>
                <Link
                  to="/"
                  className="block mb-1 text-sm font-semibold tracking-wide text-slate-100"
                  onClick={closeMobileNav}
                >
                  DnF Pre-Order Hub
                </Link>
                <p className="text-[11px] text-slate-400">
                  Panel {isSuperAdmin ? 'Super Admin' : 'Admin'}
                </p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="icon"
                className="h-8 w-8 rounded-full border-slate-700 bg-slate-900/80 text-slate-100"
                onClick={closeMobileNav}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1 text-sm">
              <p className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                Navigasi
              </p>
              {navItems.map((item) => {
                const active = location.pathname === item.to;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`flex items-center rounded-md px-3 py-2 text-xs font-medium transition-colors ${
                      active
                        ? 'bg-slate-100 text-slate-900 shadow-sm'
                        : 'text-slate-400 hover:bg-slate-800 hover:text-slate-50'
                    }`}
                    onClick={closeMobileNav}
                  >
                    {item.label}
                  </Link>
                );
              })}

              {superNavItems.length > 0 && (
                <div className="pt-4 mt-4 border-t border-slate-800 space-y-1">
                  <p className="px-3 pb-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                    Super Admin
                  </p>
                  {superNavItems.map((item) => {
                    const active = location.pathname === item.to;
                    return (
                      <Link
                        key={item.to}
                        to={item.to}
                        className={`flex items-center rounded-md px-3 py-2 text-xs font-medium transition-colors ${
                          active
                            ? 'bg-violet-500 text-white shadow-sm'
                            : 'text-slate-400 hover:bg-slate-800 hover:text-slate-50'
                        }`}
                        onClick={closeMobileNav}
                      >
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              )}
            </nav>

            <div className="px-3 py-4 border-t border-slate-800">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full justify-center text-red-400 border-red-400/40 hover:bg-red-500/10 hover:text-red-200 bg-transparent text-xs"
                onClick={async () => {
                  await signOut();
                  navigate('/auth');
                  closeMobileNav();
                }}
              >
                Logout
              </Button>
            </div>
          </div>
          <button
            type="button"
            className="flex-1 bg-black/40"
            onClick={closeMobileNav}
            aria-label="Tutup navigasi"
          />
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 flex flex-col">
        {/* Topbar */}
        <div className="h-12 sm:h-14 flex items-center justify-between px-3 sm:px-4 md:px-6 border-b border-slate-200 bg-white/85 backdrop-blur">
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-md border border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-50 md:hidden h-8 w-8"
              onClick={() => setMobileNavOpen(true)}
            >
              <Menu className="w-4 h-4" />
            </button>
            <h1 className="text-sm font-semibold text-slate-800 truncate">{title}</h1>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 text-[11px] sm:text-xs text-slate-500">
            <span className="hidden sm:inline">
              {isSuperAdmin ? 'Super Admin' : 'Admin'} mode
            </span>
            <div className="h-7 w-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-[10px] font-semibold text-white">
              {user?.email?.[0]?.toUpperCase() ?? 'A'}
            </div>
          </div>
        </div>

        {/* Page content */}
        <div className="flex-1 py-3 sm:py-4 px-3 sm:px-4 md:px-6">
          <div className="w-full max-w-5xl mx-auto">
            {description && (
              <p className="mb-4 text-xs text-slate-600 max-w-3xl hidden md:block">{description}</p>
            )}
            <div className="space-y-4">{children}</div>
          </div>
        </div>
      </main>
    </div>
  );
}
