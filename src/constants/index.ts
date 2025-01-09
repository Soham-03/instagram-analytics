// src/constants/index.ts

// API Configuration
export const API_CONFIG = {
    INSTAGRAM_BASE_URL: 'https://graph.instagram.com',
    API_VERSION: 'v21.0',
    REDIRECT_URI: process.env.NEXT_PUBLIC_REDIRECT_URI || 'https://localhost:3001/',
    APP_ID: process.env.NEXT_PUBLIC_INSTAGRAM_APP_ID,
  } as const;
  
  // Auth Scopes
  export const INSTAGRAM_SCOPES = [
    'instagram_business_basic',
    'instagram_business_manage_messages',
    'instagram_business_manage_comments',
    'instagram_business_content_publish'
  ].join('%2C');
  
  // Media Types
  export const MEDIA_TYPES = {
    IMAGE: 'IMAGE',
    VIDEO: 'VIDEO',
    CAROUSEL_ALBUM: 'CAROUSEL_ALBUM'
  } as const;
  
  // Chart Colors
  export const CHART_COLORS = {
    PRIMARY: '#8B5CF6',     // Purple
    SECONDARY: '#EC4899',   // Pink
    TERTIARY: '#EF4444',    // Red
    QUATERNARY: '#F59E0B',  // Orange
    SUCCESS: '#10B981',     // Green
    INFO: '#3B82F6',        // Blue
  } as const;
  
  // Time Periods
  export const TIME_PERIODS = {
    DAY: 'day',
    WEEK: 'week',
    MONTH: 'month',
    YEAR: 'year'
  } as const;
  
  // Analytics Constants
  export const ANALYTICS = {
    MIN_POSTS_FOR_ANALYSIS: 5,
    ENGAGEMENT_RATE_THRESHOLD: {
      LOW: 1,
      MEDIUM: 3,
      HIGH: 5
    },
    GROWTH_RATE_THRESHOLD: {
      NEGATIVE: -5,
      STABLE: 0,
      POSITIVE: 5,
      EXCELLENT: 10
    },
    ANALYSIS_PERIODS: 4,
    TOP_HASHTAGS_LIMIT: 10,
    TOP_POSTS_LIMIT: 5
  } as const;
  
  // Date Formats
  export const DATE_FORMATS = {
    FULL: 'MMMM d, yyyy h:mm a',
    SHORT: 'MMM d, yyyy',
    TIME: 'h:mm a',
    WEEKDAY: 'EEEE',
    MONTH_YEAR: 'MMMM yyyy'
  } as const;
  
  // Cache Keys
  export const CACHE_KEYS = {
    USER_DATA: 'instagram_user_data',
    MEDIA_DATA: 'instagram_media_data',
    AUTH_TOKEN: 'instagram_token',
    ANALYTICS: 'instagram_analytics'
  } as const;
  
  // Error Messages
  export const ERROR_MESSAGES = {
    AUTH_FAILED: 'Authentication failed. Please try again.',
    TOKEN_EXPIRED: 'Your session has expired. Please login again.',
    NO_POSTS: 'No posts found for analysis.',
    API_ERROR: 'Failed to fetch data from Instagram API.',
    INVALID_TOKEN: 'Invalid or expired access token.',
    RATE_LIMIT: 'Rate limit exceeded. Please try again later.',
    NETWORK_ERROR: 'Network error. Please check your connection.'
  } as const;
  
  // Success Messages
  export const SUCCESS_MESSAGES = {
    AUTH_SUCCESS: 'Successfully authenticated with Instagram',
    DATA_FETCHED: 'Data successfully fetched',
    ANALYSIS_COMPLETE: 'Analysis completed successfully'
  } as const;
  
  // Loading States
  export const LOADING_MESSAGES = {
    AUTH: 'Authenticating with Instagram...',
    FETCH_DATA: 'Fetching your Instagram data...',
    ANALYZE: 'Analyzing your content...',
    PROCESS: 'Processing results...'
  } as const;
  
  // UI Constants
  export const UI = {
    SIDEBAR_WIDTH: '16rem',
    HEADER_HEIGHT: '4rem',
    MODAL_SIZES: {
      SM: '20rem',
      MD: '30rem',
      LG: '40rem',
      XL: '50rem'
    },
    BREAKPOINTS: {
      SM: '640px',
      MD: '768px',
      LG: '1024px',
      XL: '1280px'
    },
    GRID_COLUMNS: {
      SM: 1,
      MD: 2,
      LG: 3,
      XL: 4
    }
  } as const;
  
  // Dummy Data (for development and testing)
  export const DUMMY_DATA = {
    FOLLOWERS_COUNT: 15243,
    FOLLOWING_COUNT: 892,
    MEDIA_COUNT: 348,
    ENGAGEMENT_RATE: 3.5,
    PROFILE_VIEWS: 12345,
    WEBSITE_CLICKS: 2345
  } as const;
  
  // Navigation
  export const NAVIGATION = {
    ROUTES: {
      HOME: '/',
      ANALYTICS: '/analytics',
      POSTS: '/posts',
      INSIGHTS: '/insights',
      SETTINGS: '/settings'
    },
    TABS: [
      { id: 'account', label: 'Account & Posts', icon: 'LayoutGrid' },
      { id: 'analytics', label: 'Analytics & Insights', icon: 'BarChart2' },
      { id: 'trends', label: 'Trends', icon: 'TrendingUp' },
      { id: 'suggestions', label: 'Content Suggestions', icon: 'Sparkles' }
    ]
  } as const;
  
  // File Size Limits
  export const FILE_LIMITS = {
    IMAGE: 8 * 1024 * 1024, // 8MB
    VIDEO: 100 * 1024 * 1024, // 100MB
    CAROUSEL: 50 * 1024 * 1024 // 50MB per item
  } as const;
  
  export type MediaType = keyof typeof MEDIA_TYPES;
  export type TimePeriod = keyof typeof TIME_PERIODS;
  export type ChartColor = keyof typeof CHART_COLORS;