// src/types/instagram.ts

export interface InstagramAuthResponse {
    access_token: string;
    user_id: string;
  }
  
  export interface UserData {
    id: string;
    username: string;
    account_type: string;
    followers_count: number;
    follows_count: number;
    media_count: number;
    profile_picture_url: string;
  }
  
  export interface CarouselItem {
    id: string;
    media_type: string;
    media_url: string;
  }
  
  export interface Comment {
    id: string;
    text: string;
    timestamp: string;
    username?: string;
  }
  
  export interface MediaItem {
    id: string;
    caption?: string;
    media_type: string;
    media_url?: string;
    timestamp?: string;
    like_count: number;
    comments_count: number;
    comments?: Comment[];
    children?: {
      data: CarouselItem[];
    };
    insights?: {
      data: Array<{
        name: string;
        values: Array<{
          value: number;
        }>;
      }>;
    };
    engagement_rate?: number;
    hashtags?: string[];
    mentions?: string[];
    bestTimeToPost?: string;
  }
  
  export interface AccountInsights {
    impressions: number;
    reach: number;
    profile_views: number;
    website_clicks: number;
    total_interactions: number;
    accounts_engaged: number;
  }
  
  export interface ContentAnalysis {
    topHashtags: Array<{ tag: string; count: number; engagement: number }>;
    topMentions: Array<{ mention: string; count: number; engagement: number }>;
    bestPerformingTypes: Array<{ type: string; engagement: number }>;
    postTimings: Array<{ hour: number; engagement: number }>;
    weekdayPerformance: Array<{ day: string; engagement: number }>;
    contentSuggestions: Array<{
      type: string;
      reason: string;
      expectedEngagement: number;
      suggestedHashtags: string[];
      bestTimeToPost: string;
    }>;
  }
  
  export interface TrendAnalysis {
    growthRate: number;
    engagementTrend: number;
    followersGrowth: number;
    topGrowthPeriods: Array<{ period: string; growth: number }>;
    engagementByContentType: Record<string, number>;
    recommendedActions: string[];
  }