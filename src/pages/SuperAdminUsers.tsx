import { useState } from 'react';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { useAdminUsers, useCreateAdminUser, useToggleAdminUserActive } from '@/hooks/useAdminUsers';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import Swal from 'sweetalert2';

export default function SuperAdminUsers() {
  const { data: users = [], isLoading, error } = useAdminUsers();
  const createUser = useCreateAdminUser();
  const toggleActive = useToggleAdminUserActive();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'admin' as 'admin' | 'super_admin',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) {
      await Swal.fire({
        icon: 'error',
        title: 'Oops',
        text: 'Nama, email, dan password wajib diisi',
      });
      return;
    }
    try {
      await createUser.mutateAsync(form);
      await Swal.fire({
        icon: 'success',
        title: 'Admin baru berhasil dibuat',
        timer: 1500,
        showConfirmButton: false,
      });
      setForm({ name: '', email: '', password: '', role: 'admin' });
    } catch (err: any) {
      await Swal.fire({
        icon: 'error',
        title: 'Gagal membuat admin',
        text: err?.message || 'Terjadi kesalahan',
      });
    }
  };

  const handleToggleActive = async (id: number, current: boolean) => {
    try {
      await toggleActive.mutateAsync({ id, is_active: !current });
    } catch (err: any) {
      await Swal.fire({
        icon: 'error',
        title: 'Gagal mengubah status admin',
        text: err?.message || 'Terjadi kesalahan',
      });
    }
  };

  return (
    <AdminLayout
      title="Manajemen Admin"
      description="Kelola akun admin dan super admin yang memiliki akses ke dashboard."
    >
      <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
        {/* Daftar admin */}
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Daftar Admin</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-2">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : error ? (
              <div className="py-4 text-sm text-destructive">Gagal memuat daftar admin.</div>
            ) : users.length === 0 ? (
              <div className="py-4 text-sm text-muted-foreground">Belum ada admin terdaftar.</div>
            ) : (
              <div className="space-y-2 text-sm">
                {users.map((user) => (
                  <div
                    key={user.id}
                    className="flex items-center justify-between rounded border border-border/60 px-3 py-2 bg-background"
                  >
                    <div>
                      <div className="font-medium">{user.name}</div>
                      <div className="text-xs text-muted-foreground">{user.email}</div>
                      <div className="text-[11px] text-muted-foreground">
                        Role: {user.role} • Dibuat: {new Date(user.created_at).toLocaleString('id-ID')}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-[11px] text-muted-foreground mb-1">
                        {user.is_active ? 'Aktif' : 'Nonaktif'}
                      </span>
                      <Switch
                        checked={user.is_active}
                        onCheckedChange={() => handleToggleActive(user.id, user.is_active)}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Form tambah admin */}
        <Card className="border-border/60">
          <CardHeader>
            <CardTitle className="text-sm font-semibold">Tambah Admin Baru</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-3" onSubmit={handleSubmit}>
              <div className="space-y-1">
                <Label>Nama</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-1">
                <Label>Email</Label>
                <Input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-1">
                <Label>Password</Label>
                <Input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-1">
                <Label>Role</Label>
                <select
                  className="border border-input bg-background rounded px-2 py-1 text-sm"
                  value={form.role}
                  onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as 'admin' | 'super_admin' }))}
                >
                  <option value="admin">Admin</option>
                  <option value="super_admin">Super Admin</option>
                </select>
              </div>
              <div className="flex justify-end pt-2">
                <Button type="submit" size="sm" disabled={createUser.isPending}>
                  Buat Admin
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
