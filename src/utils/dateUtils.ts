import { formatDistanceToNow } from 'date-fns';

export const formatRelativeTime = (dateString: string): string => {
  try {
    // Try parsing the date string
    const date = new Date(dateString);
    
    // Check if the date is valid
    if (isNaN(date.getTime())) {
      return 'Invalid date';
    }
    
    return formatDistanceToNow(date, { addSuffix: true });
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid date';
  }
};