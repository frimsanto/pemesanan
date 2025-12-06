import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Settings } from '@/lib/types';
import { getSettings as apiGetSettings, updateSettingsApi } from '@/lib/api';

export function useSettings() {
  return useQuery({
    queryKey: ['settings'],
    queryFn: async (): Promise<Settings> => {
      const data = await apiGetSettings();
      return data as Settings;
    },
  });
}

export function useUpdateSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (settings: Partial<Settings>) => {
      await updateSettingsApi(settings);
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
