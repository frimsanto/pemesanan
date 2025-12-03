import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Settings } from '@/lib/types';

export function useSettings() {
  return useQuery({
    queryKey: ['settings'],
    queryFn: async (): Promise<Settings> => {
      const { data, error } = await supabase
        .from('settings')
        .select('key, value');

      if (error) throw error;

      const settings: Settings = {
        whatsapp_admin: '',
        po_start_date: '',
        po_end_date: '',
        terms: '',
        max_order_quantity: '100',
      };

      data.forEach((item) => {
        if (item.key in settings) {
          settings[item.key as keyof Settings] = item.value || '';
        }
      });

      return settings;
    },
  });
}

export function useUpdateSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (settings: Partial<Settings>) => {
      const updates = Object.entries(settings).map(([key, value]) => ({
        key,
        value,
      }));

      for (const update of updates) {
        const { error } = await supabase
          .from('settings')
          .update({ value: update.value })
          .eq('key', update.key);

        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    },
  });
}

export function isPOOpen(settings: Settings): boolean {
  const now = new Date();
  const startDate = new Date(settings.po_start_date);
  const endDate = new Date(settings.po_end_date);

  return now >= startDate && now <= endDate;
}
