import { format } from 'date-fns';

export function formatSimpleDate(date: Date) {
  return format(date, 'yyy-MM-dd');
}
