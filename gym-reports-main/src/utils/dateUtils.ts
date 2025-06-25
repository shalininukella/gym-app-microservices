/**
 * Format date to DD-MM-YYYY format if it's not already
 */
export const formatDate = (dateString: string): string => {
    // If already in DD-MM-YYYY format, return as is
    if (/^\d{2}-\d{2}-\d{4}$/.test(dateString)) {
      return dateString;
    }
    
    // Otherwise try to parse and format
    try {
      const date = new Date(dateString);
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      
      return `${day}-${month}-${year}`;
    } catch (error) {
      return dateString; // Return original if parsing fails
    }
  };
  
  /**
   * Calculate percentage change between two numbers
   */
  export const calculatePercentageChange = (oldValue: number, newValue: number): string => {
    if (oldValue === 0) {
      return newValue > 0 ? '+100%' : '0%';
    }
    
    const change = ((newValue - oldValue) / oldValue) * 100;
    return change > 0 ? `+${change.toFixed(0)}%` : `${change.toFixed(0)}%`;
  };
  
  /**
   * Subtract days from a date string (DD-MM-YYYY)
   */
  export const subtractDaysFromDate = (dateString: string, days: number): string => {
    const [day, month, year] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    
    date.setDate(date.getDate() - days);
    
    const newDay = String(date.getDate()).padStart(2, '0');
    const newMonth = String(date.getMonth() + 1).padStart(2, '0');
    const newYear = date.getFullYear();
    
    return `${newDay}-${newMonth}-${newYear}`;
  };