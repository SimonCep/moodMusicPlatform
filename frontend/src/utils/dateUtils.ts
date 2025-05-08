export const formatDate = (dateString: string, type: 'long' | 'short' = 'long') => {
    const options: Intl.DateTimeFormatOptions = type === 'short' ? 
        { month: 'short', day: 'numeric' } :
        { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }; 
    return new Date(dateString).toLocaleString(undefined, options);
  }; 