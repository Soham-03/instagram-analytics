// src/utils/formatting.ts

export const formatNumber = (num: number): string => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    }
    if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toLocaleString();
  };
  
  export const formatPercentage = (num: number, decimals: number = 1): string => {
    return `${num.toFixed(decimals)}%`;
  };
  
  export const formatEngagementRate = (
    likes: number,
    comments: number,
    followers: number
  ): string => {
    const rate = ((likes + comments) / followers) * 100;
    return formatPercentage(rate);
  };
  
  export const extractHashtags = (text: string): string[] => {
    const hashtagRegex = /#[\w\u0590-\u05ff]+/g;
    return text?.match(hashtagRegex) || [];
  };
  
  export const extractMentions = (text: string): string[] => {
    const mentionRegex = /@[\w\u0590-\u05ff]+/g;
    return text?.match(mentionRegex) || [];
  };
  
  export const truncateText = (text: string, maxLength: number): string => {
    if (text.length <= maxLength) return text;
    return `${text.slice(0, maxLength)}...`;
  };
  
  export const formatCaption = (caption: string): string => {
    // Replace multiple newlines with a single one
    const cleanedCaption = caption.replace(/\n{3,}/g, '\n\n');
    
    // Make hashtags and mentions clickable
    return cleanedCaption
      .replace(/(#\w+)/g, '<span class="text-blue-600">$1</span>')
      .replace(/(@\w+)/g, '<span class="text-blue-600">$1</span>');
  };
  
  export const getPostTypeIcon = (mediaType: string): string => {
    switch (mediaType.toUpperCase()) {
      case 'IMAGE':
        return '🖼️';
      case 'VIDEO':
        return '🎥';
      case 'CAROUSEL_ALBUM':
        return '📑';
      default:
        return '📝';
    }
  };
  
  export const formatGrowthIndicator = (value: number): string => {
    if (value > 0) {
      return `↗️ +${formatPercentage(value)}`;
    }
    if (value < 0) {
      return `↘️ ${formatPercentage(value)}`;
    }
    return `→ ${formatPercentage(value)}`;
  };
  
  export const formatTimeRange = (startHour: number, endHour: number): string => {
    const formatHour = (hour: number) => {
      const period = hour >= 12 ? 'PM' : 'AM';
      const displayHour = hour % 12 || 12;
      return `${displayHour}${period}`;
    };
    
    return `${formatHour(startHour)} - ${formatHour(endHour)}`;
  };
  
  export const formatInsightValue = (
    value: number,
    type: 'engagement' | 'reach' | 'impressions' | 'profile_views' | 'followers'
  ): string => {
    switch (type) {
      case 'engagement':
        return `${formatPercentage(value)} Engagement Rate`;
      case 'reach':
        return `${formatNumber(value)} People Reached`;
      case 'impressions':
        return `${formatNumber(value)} Impressions`;
      case 'profile_views':
        return `${formatNumber(value)} Profile Views`;
      case 'followers':
        return `${formatNumber(value)} Followers`;
      default:
        return formatNumber(value);
    }
  };