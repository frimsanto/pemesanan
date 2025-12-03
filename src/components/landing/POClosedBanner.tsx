import { AlertTriangle, Calendar } from 'lucide-react';
import { useSettings } from '@/hooks/useSettings';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

export function POClosedBanner() {
  const { data: settings } = useSettings();

  if (!settings) return null;

  const now = new Date();
  const startDate = new Date(settings.po_start_date);
  const endDate = new Date(settings.po_end_date);

  const isBeforeStart = now < startDate;
  const isAfterEnd = now > endDate;

  if (!isBeforeStart && !isAfterEnd) return null;

  return (
    <div className="bg-warning/10 border-b border-warning/30">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-center gap-3 text-warning">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <p className="text-sm font-medium">
            {isBeforeStart ? (
              <>
                Pre-Order akan dibuka pada{' '}
                <span className="font-bold">
                  {format(startDate, 'dd MMMM yyyy', { locale: id })}
                </span>
              </>
            ) : (
              <>
                Pre-Order telah berakhir pada{' '}
                <span className="font-bold">
                  {format(endDate, 'dd MMMM yyyy', { locale: id })}
                </span>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
