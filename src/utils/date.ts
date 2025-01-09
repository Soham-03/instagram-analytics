// src/utils/date.ts

export const formatDate = (timestamp: string): string => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };
  
  export const getTimeDifference = (timestamp: string): string => {
    const now = new Date();
    const date = new Date(timestamp);
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return `${diffInSeconds}s ago`;
    }
    
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    }
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    }
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) {
      return `${diffInDays}d ago`;
    }
    
    return formatDate(timestamp);
  };
  
  export const getPostHour = (timestamp: string): number => {
    return new Date(timestamp).getHours();
  };
  
  export const getPostWeekday = (timestamp: string): string => {
    return new Date(timestamp).toLocaleDateString('en-US', { weekday: 'long' });
  };
  
  export const groupByDate = <T extends { timestamp?: string }>(
    items: T[],
    format: 'day' | 'week' | 'month' = 'day'
  ): Record<string, T[]> => {
    return items.reduce((groups, item) => {
      if (!item.timestamp) return groups;
      
      let key: string;
      const date = new Date(item.timestamp);
      
      switch (format) {
        case 'week':
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          key = weekStart.toISOString().split('T')[0];
          break;
        case 'month':
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          break;
        default: // day
          key = date.toISOString().split('T')[0];
      }
      
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(item);
      return groups;
    }, {} as Record<string, T[]>);
  };
  
  export const getBestPostingTimes = (
    engagementByHour: Record<number, number>
  ): number[] => {
    return Object.entries(engagementByHour)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([hour]) => parseInt(hour));
  };
  
  export const getBestPostingDays = (
    engagementByDay: Record<string, number>
  ): string[] => {
    return Object.entries(engagementByDay)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([day]) => day);
  };