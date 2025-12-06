import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getAdminUsers, createAdminUserApi, toggleAdminUserActiveApi } from '@/lib/api';

export function useAdminUsers() {
  return useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const data = await getAdminUsers();
      return data as Array<{
        id: number;
        name: string;
        email: string;
        role: 'admin' | 'super_admin';
        is_active: boolean;
        created_at: string;
      }>;
    },
  });
}

export function useCreateAdminUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { name: string; email: string; password: string; role: 'admin' | 'super_admin' }) => {
      return createAdminUserApi(input);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
  });
}

export function useToggleAdminUserActive() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { id: number; is_active: boolean }) => {
      return toggleAdminUserActiveApi(payload.id, payload.is_active);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
  });
}
