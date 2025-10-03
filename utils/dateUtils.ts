/**
 * Utility functions for date formatting and manipulation
 */

/**
 * Formats a timestamp (in seconds) to a readable date string
 * @param timestamp - Unix timestamp in seconds
 * @param options - Intl.DateTimeFormatOptions for customization
 * @returns Formatted date string
 */
export const formatTimestamp = (
  timestamp: number,
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }
): string => {
  if (!timestamp || timestamp === 0) return 'Not set';
  
  // Convert seconds to milliseconds
  const date = new Date(timestamp * 1000);
  
  if (isNaN(date.getTime())) return 'Invalid date';
  
  return date.toLocaleDateString('en-US', options);
};

/**
 * Formats a timestamp to show both date and time
 * @param timestamp - Unix timestamp in seconds
 * @returns Formatted date and time string
 */
export const formatTimestampWithTime = (timestamp: number): string => {
  return formatTimestamp(timestamp, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Formats a date range for savings plans
 * @param startTime - Start timestamp in seconds
 * @param endTime - End timestamp in seconds
 * @returns Formatted date range string
 */
export const formatDateRange = (startTime: number, endTime: number): string => {
  const startDate = formatTimestamp(startTime);
  const endDate = formatTimestamp(endTime);
  
  if (startDate === 'Not set' || endDate === 'Not set') {
    return 'Date not available';
  }
  
  return `${startDate} - ${endDate}`;
};

/**
 * Calculate the duration between two timestamps in days
 * @param startTime - Start timestamp in seconds
 * @param endTime - End timestamp in seconds
 * @returns Duration in days
 */
export const calculateDurationInDays = (startTime: number, endTime: number): number => {
  if (!startTime || !endTime) return 0;
  
  const startDate = new Date(startTime * 1000);
  const endDate = new Date(endTime * 1000);
  
  const diffInMs = endDate.getTime() - startDate.getTime();
  return Math.ceil(diffInMs / (1000 * 60 * 60 * 24));
};