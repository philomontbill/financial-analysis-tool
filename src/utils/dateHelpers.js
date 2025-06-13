import { 
  format, 
  parseISO, 
  isValid, 
  startOfDay, 
  endOfDay,
  subDays,
  subMonths,
  subYears,
  differenceInDays,
  differenceInHours
} from 'date-fns';

export const formatDate = (date, formatString = 'PPP') => {
  if (!date) return '';
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return isValid(dateObj) ? format(dateObj, formatString) : '';
};

export const formatDateForChart = (date, timeRange) => {
  if (!date) return '';
  
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(dateObj)) return '';

  switch (timeRange) {
    case '24h':
      return format(dateObj, 'HH:mm');
    case '7d':
      return format(dateObj, 'EEE HH:mm');
    case '30d':
      return format(dateObj, 'MMM dd');
    case '90d':
      return format(dateObj, 'MMM dd');
    case '1y':
      return format(dateObj, 'MMM yyyy');
    default:
      return format(dateObj, 'MMM dd');
  }
};

export const getDateRangeForTimeframe = (timeframe) => {
  const end = endOfDay(new Date());
  let start;

  switch (timeframe) {
    case '24h':
      start = subDays(end, 1);
      break;
    case '7d':
      start = subDays(end, 7);
      break;
    case '30d':
      start = subDays(end, 30);
      break;
    case '90d':
      start = subDays(end, 90);
      break;
    case '1y':
      start = subYears(end, 1);
      break;
    case '5y':
      start = subYears(end, 5);
      break;
    default:
      start = subDays(end, 30);
  }

  return {
    start: startOfDay(start),
    end,
    days: differenceInDays(end, start),
    hours: differenceInHours(end, start)
  };
};

export const getRelativeTimeString = (date) => {
  const now = new Date();
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  
  const diffInHours = differenceInHours(now, dateObj);
  
  if (diffInHours < 1) {
    const diffInMinutes = Math.floor((now - dateObj) / 60000);
    return `${diffInMinutes}m ago`;
  } else if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  } else {
    const diffInDays = differenceInDays(now, dateObj);
    return `${diffInDays}d ago`;
  }
};

export const isMarketOpen = () => {
  const now = new Date();
  const day = now.getDay();
  const hour = now.getHours();
  
  // Crypto markets are 24/7
  return true;
};
