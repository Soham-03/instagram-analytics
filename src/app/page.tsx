"use client";
import { useState, useEffect, useMemo } from "react";
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, Cell, AreaChart, Area
} from 'recharts';
import { 
  Instagram, 
  LayoutGrid, 
  BarChart2, 
  LogOut,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Binary,
  Calendar,
  Clock,
  Users,
  Hash,
  MessageCircle,
  Heart,
  Eye,
  Bot
} from "lucide-react";
import Link from 'next/link';

// Interfaces
interface InstagramAuthResponse {
  access_token: string;
  user_id: string;
}

interface UserData {
  id: string;
  username: string;
  account_type: string;
  followers_count: number;
  follows_count: number;
  media_count: number;
  profile_picture_url: string;
}

interface CarouselItem {
  id: string;
  media_type: string;
  media_url: string;
}

interface Comment {
  id: string;
  text: string;
  timestamp: string;
  username?: string;
}

interface MediaItem {
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

interface AccountInsights {
  impressions: number;
  reach: number;
  profile_views: number;
  website_clicks: number;
  total_interactions: number;
  accounts_engaged: number;
}

interface ContentAnalysis {
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

interface TrendAnalysis {
  growthRate: number;
  engagementTrend: number;
  followersGrowth: number;
  topGrowthPeriods: Array<{ period: string; growth: number }>;
  engagementByContentType: Record<string, number>;
  recommendedActions: string[];
}

// Dummy Data
const DUMMY_USER: UserData = {
  id: "dummy_123",
  username: "awesome_creator",
  account_type: "BUSINESS",
  followers_count: 15243,
  follows_count: 892,
  media_count: 348,
  profile_picture_url: "/api/placeholder/150/150"
};

const DUMMY_COMMENTS: Comment[] = [
  {
    id: "comment1",
    text: "This is amazing! 🔥",
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    username: "fan_account"
  },
  {
    id: "comment2",
    text: "Love your content! Keep it up 👏",
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    username: "social_butterfly"
  },
  {
    id: "comment3",
    text: "Fantastic shot! What camera do you use?",
    timestamp: new Date(Date.now() - 10800000).toISOString(),
    username: "photo_enthusiast"
  }
];

const generateDummyMedia = (count: number): MediaItem[] => {
  const mediaTypes = ["IMAGE", "VIDEO", "CAROUSEL_ALBUM"];
  const hashtags = [
    "#photography", "#lifestyle", "#fashion", "#travel", 
    "#food", "#fitness", "#art", "#beauty", "#nature", "#style"
  ];
  const mentions = [
    "@influencer_friend", "@brand_collab", "@photography_hub",
    "@lifestyle_mag", "@travel_community"
  ];

  return Array.from({ length: count }, (_, index) => {
    const mediaType = mediaTypes[Math.floor(Math.random() * mediaTypes.length)];
    const likesBase = Math.floor(Math.random() * (2000 - 500) + 500);
    const commentsBase = Math.floor(likesBase * (Math.random() * 0.1));
    const randomHashtags = [...hashtags]
      .sort(() => 0.5 - Math.random())
      .slice(0, Math.floor(Math.random() * 5) + 1);
    const randomMentions = [...mentions]
      .sort(() => 0.5 - Math.random())
      .slice(0, Math.floor(Math.random() * 2));

    const daysAgo = Math.floor(Math.random() * 30);
    const timestamp = new Date(Date.now() - (daysAgo * 24 * 60 * 60 * 1000)).toISOString();

    return {
      id: `media_${index}`,
      caption: `Amazing ${mediaType.toLowerCase()} content! ${randomHashtags.join(" ")} ${randomMentions.join(" ")}`,
      media_type: mediaType,
      media_url: "/api/placeholder/600/600",
      timestamp,
      like_count: likesBase,
      comments_count: commentsBase,
      comments: DUMMY_COMMENTS.map(comment => ({
        ...comment,
        timestamp: new Date(Date.now() - Math.random() * 86400000).toISOString()
      })),
      hashtags: randomHashtags,
      mentions: randomMentions,
      children: mediaType === "CAROUSEL_ALBUM" ? {
        data: Array(3).fill(null).map((_, i) => ({
          id: `carousel_${index}_${i}`,
          media_type: "IMAGE",
          media_url: "/api/placeholder/600/600"
        }))
      } : undefined,
      engagement_rate: ((likesBase + commentsBase) / DUMMY_USER.followers_count) * 100
    };
  });
};

const DUMMY_ACCOUNT_INSIGHTS: AccountInsights = {
  impressions: 85432,
  reach: 45678,
  profile_views: 12345,
  website_clicks: 2345,
  total_interactions: 34567,
  accounts_engaged: 23456
};

// Utility Functions
const extractHashtags = (text: string): string[] => {
  const hashtagRegex = /#[\w\u0590-\u05ff]+/g;
  return text?.match(hashtagRegex) || [];
};

const extractMentions = (text: string): string[] => {
  const mentionRegex = /@[\w\u0590-\u05ff]+/g;
  return text?.match(mentionRegex) || [];
};

const getPostHour = (timestamp: string): number => {
  return new Date(timestamp).getHours();
};

const getPostWeekday = (timestamp: string): string => {
  return new Date(timestamp).toLocaleDateString('en-US', { weekday: 'long' });
};

const calculateEngagementRate = (likes: number, comments: number, followers: number): number => {
  if (!followers) return 0;
  return ((likes + comments) / followers) * 100;
};

const calculateBestTimeToPost = (
  posts: MediaItem[],
  followers: number
): { hour: number; weekday: string } => {
  const engagementByHour: Record<number, { total: number; count: number }> = {};
  const engagementByDay: Record<string, { total: number; count: number }> = {};

  posts.forEach(post => {
    if (post.timestamp) {
      const hour = getPostHour(post.timestamp);
      const weekday = getPostWeekday(post.timestamp);
      const engagement = calculateEngagementRate(post.like_count, post.comments_count, followers);

      if (!engagementByHour[hour]) engagementByHour[hour] = { total: 0, count: 0 };
      if (!engagementByDay[weekday]) engagementByDay[weekday] = { total: 0, count: 0 };

      engagementByHour[hour].total += engagement;
      engagementByHour[hour].count++;
      engagementByDay[weekday].total += engagement;
      engagementByDay[weekday].count++;
    }
  });

  const bestHour = Object.entries(engagementByHour)
    .map(([hour, data]) => ({
      hour: Number(hour),
      average: data.total / data.count
    }))
    .sort((a, b) => b.average - a.average)[0]?.hour || 9;

  const bestDay = Object.entries(engagementByDay)
    .map(([day, data]) => ({
      day,
      average: data.total / data.count
    }))
    .sort((a, b) => b.average - a.average)[0]?.day || 'Wednesday';

  return { hour: bestHour, weekday: bestDay };
};

export default function Home() {
  // State Management
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeView, setActiveView] = useState<'account' | 'analytics' | 'trends' | 'suggestions'|'chat-bot'>('account');
  const [userData, setUserData] = useState<UserData | null>(null);
  const [mediaData, setMediaData] = useState<MediaItem[]>([]);
  const [accountInsights, setAccountInsights] = useState<AccountInsights | null>(null);
  const [currentSlides, setCurrentSlides] = useState<Record<string, number>>({});
  const [selectedPost, setSelectedPost] = useState<MediaItem | null>(null);
  const [contentAnalysis, setContentAnalysis] = useState<ContentAnalysis | null>(null);
  const [trendAnalysis, setTrendAnalysis] = useState<TrendAnalysis | null>(null);
  const [useDummyData, setUseDummyData] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const INSTAGRAM_APP_ID = process.env.NEXT_PUBLIC_INSTAGRAM_APP_ID;
  const REDIRECT_URI = "https://localhost:3001/";

  // Basic Functions
  const loginWithInstagram = () => {
    if (!INSTAGRAM_APP_ID) {
      console.error("Instagram App ID not configured");
      alert("Instagram integration is not configured. Would you like to try the demo version?");
      setUseDummyData(true);
      loadDummyData();
      return;
    }

    setIsLoading(true);
    
    const authUrl = `https://www.instagram.com/oauth/authorize?enable_fb_login=0&force_authentication=1&client_id=${INSTAGRAM_APP_ID}&redirect_uri=${REDIRECT_URI}&response_type=code&scope=instagram_business_basic%2Cinstagram_business_manage_messages%2Cinstagram_business_manage_comments%2Cinstagram_business_content_publish`;
    window.location.href = authUrl;
  };

  const loadDummyData = () => {
    setIsLoggedIn(true);
    setUserData(DUMMY_USER);
    setAccountInsights(DUMMY_ACCOUNT_INSIGHTS);
    const dummyMedia = generateDummyMedia(12);
    setMediaData(dummyMedia);
    analyzeContent(dummyMedia, DUMMY_USER.followers_count);
    analyzeTrends(dummyMedia);
  };

  const handlePrevSlide = (mediaId: string) => {
    setCurrentSlides((prev) => ({
      ...prev,
      [mediaId]: Math.max(0, (prev[mediaId] || 0) - 1),
    }));
  };

  const handleNextSlide = (mediaId: string, maxSlides: number) => {
    setCurrentSlides((prev) => ({
      ...prev,
      [mediaId]: Math.min(maxSlides - 1, (prev[mediaId] || 0) + 1),
    }));
  };

  const handleLogout = () => {
    localStorage.removeItem("instagram_token");
    setIsLoggedIn(false);
    setUserData(null);
    setMediaData([]);
    setAccountInsights(null);
    setContentAnalysis(null);
    setTrendAnalysis(null);
    setUseDummyData(false);
  };

  const calculateAverageEngagementRate = () => {
    if (mediaData.length === 0 || !userData?.followers_count) return 0;
    
    const totalEngagement = mediaData.reduce((sum, post) => 
      sum + post.like_count + post.comments_count, 0);
    
    return calculateEngagementRate(totalEngagement, 0, userData.followers_count);
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Authentication and Data Fetching
  const exchangeCodeForToken = async (code: string) => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/auth/instagram", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          code,
          redirect_uri: REDIRECT_URI,
        }),
      });

      const data = await response.json();

      if (data.access_token) {
        const longLivedToken = await getLongLivedToken(data.access_token);
        localStorage.setItem("instagram_token", longLivedToken);
        setIsLoggedIn(true);
        fetchUserData(longLivedToken);
        window.history.replaceState({}, document.title, window.location.pathname);
      } else {
        throw new Error("No access token received");
      }
    } catch (error) {
      console.error("Authentication failed:", error);
      alert("Instagram login failed. Would you like to try the demo version instead?");
      setUseDummyData(true);
      loadDummyData();
    } finally {
      setIsLoading(false);
    }
  };

  const getLongLivedToken = async (shortLivedToken: string) => {
    try {
      const response = await fetch("/api/auth/instagram/long-lived", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ access_token: shortLivedToken }),
      });
      const data = await response.json();
      return data.access_token || shortLivedToken;
    } catch (error) {
      console.error("Error getting long-lived token:", error);
      return shortLivedToken;
    }
  };

  useEffect(() => {
    const savedToken = localStorage.getItem("instagram_token");
    if (savedToken) {
      setIsLoggedIn(true);
      fetchUserData(savedToken);
    } else {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get("code");
      if (code) {
        exchangeCodeForToken(code);
      }
    }
  }, []);

  const fetchUserData = async (accessToken: string) => {
    if (useDummyData) {
      setUserData(DUMMY_USER);
      fetchAccountInsights(DUMMY_USER.id, accessToken);
      fetchMediaInsights(DUMMY_USER.id, accessToken);
      return;
    }

    try {
      const response = await fetch(
        `https://graph.instagram.com/me?fields=id,username,account_type,profile_picture_url,followers_count,follows_count,media_count&access_token=${accessToken}`
      );
      const data = await response.json();

      if (data.error) {
        console.error("Instagram API error, using dummy data:", data.error);
        setUseDummyData(true);
        loadDummyData();
        return;
      }

      setUserData(data);
      if (data.id) {
        fetchAccountInsights(data.id, accessToken);
        fetchMediaInsights(data.id, accessToken);
      }
    } catch (error) {
      console.error("Error fetching user data, using dummy data:", error);
      setUseDummyData(true);
      loadDummyData();
    }
  };

  const fetchAccountInsights = async (userId: string, accessToken: string) => {
    if (useDummyData) {
      setAccountInsights(DUMMY_ACCOUNT_INSIGHTS);
      return;
    }

    try {
      const mediaResponse = await fetch(
        `https://graph.instagram.com/me/media?fields=id,like_count,comments_count&access_token=${accessToken}`
      );
      const mediaData = await mediaResponse.json();

      if (mediaData.error) {
        setAccountInsights(DUMMY_ACCOUNT_INSIGHTS);
        return;
      }

      let totalLikes = 0;
      let totalComments = 0;

      if (mediaData.data) {
        mediaData.data.forEach((media: any) => {
          totalLikes += media.like_count || 0;
          totalComments += media.comments_count || 0;
        });
      }

      const processedInsights: AccountInsights = {
        profile_views: Math.floor(totalLikes * 0.8),
        reach: totalLikes + totalComments,
        impressions: Math.floor(totalLikes * 2.5),
        total_interactions: totalLikes + totalComments,
        website_clicks: Math.floor(totalLikes * 0.15),
        accounts_engaged: Math.floor((totalLikes + totalComments) * 0.7),
      };

      setAccountInsights(processedInsights);
    } catch (error) {
      console.error("Error fetching insights, using dummy data:", error);
      setAccountInsights(DUMMY_ACCOUNT_INSIGHTS);
    }
  };

  const fetchMediaInsights = async (userId: string, accessToken: string) => {
    if (useDummyData) {
      const dummyMedia = generateDummyMedia(12);
      setMediaData(dummyMedia);
      analyzeContent(dummyMedia, DUMMY_USER.followers_count);
      analyzeTrends(dummyMedia);
      return;
    }

    try {
      const mediaResponse = await fetch(
        `https://graph.instagram.com/me/media?fields=id,caption,media_type,media_url,timestamp,children{media_type,media_url}&access_token=${accessToken}`
      );
      const mediaList = await mediaResponse.json();

      if (!mediaList.data || mediaList.error) {
        throw new Error("No media data found");
      }

      const detailedMediaData = await Promise.all(
        mediaList.data.map(async (media: any) => {
          try {
            const mediaDetailsResponse = await fetch(
              `https://graph.instagram.com/${media.id}?fields=id,media_type,media_url,like_count,comments_count,timestamp,children{media_type,media_url}&access_token=${accessToken}`
            );
            const mediaDetails = await mediaDetailsResponse.json();

            const commentsResponse = await fetch(
              `https://graph.instagram.com/v21.0/${media.id}/comments?access_token=${accessToken}`
            );
            const commentsData = await commentsResponse.json();

            const processedMedia = {
              ...mediaDetails,
              caption: media.caption,
              comments: commentsData.data || [],
              hashtags: extractHashtags(media.caption || ''),
              mentions: extractMentions(media.caption || ''),
              engagement_rate: calculateEngagementRate(
                mediaDetails.like_count || 0,
                mediaDetails.comments_count || 0,
                userData?.followers_count || 1
              )
            };

            return processedMedia;
          } catch (error) {
            console.error(`Error processing media ${media.id}:`, error);
            return generateDummyMedia(1)[0];
          }
        })
      );

      setMediaData(detailedMediaData);

      if (userData?.followers_count) {
        analyzeContent(detailedMediaData, userData.followers_count);
        analyzeTrends(detailedMediaData);
      }
    } catch (error) {
      console.error("Error in main fetch, using dummy data:", error);
      const dummyMedia = generateDummyMedia(12);
      setMediaData(dummyMedia);
      analyzeContent(dummyMedia, DUMMY_USER.followers_count);
      analyzeTrends(dummyMedia);
    }
  };

  const analyzeContent = (posts: MediaItem[], followers: number) => {
    const hashtagStats: Record<string, { count: number; engagement: number }> = {};
    const mentionStats: Record<string, { count: number; engagement: number }> = {};
    const typeStats: Record<string, { count: number; engagement: number }> = {};
    const hourlyEngagement: Record<number, { total: number; count: number }> = {};
    const weekdayEngagement: Record<string, { total: number; count: number }> = {};

    posts.forEach(post => {
      const engagement = calculateEngagementRate(post.like_count, post.comments_count, followers);
      
      // Process hashtags
      const hashtags = post.hashtags || extractHashtags(post.caption || '');
      hashtags.forEach(tag => {
        if (!hashtagStats[tag]) {
          hashtagStats[tag] = { count: 0, engagement: 0 };
        }
        hashtagStats[tag].count++;
        hashtagStats[tag].engagement += engagement;
      });

      // Process mentions
      const mentions = post.mentions || extractMentions(post.caption || '');
      mentions.forEach(mention => {
        if (!mentionStats[mention]) {
          mentionStats[mention] = { count: 0, engagement: 0 };
        }
        mentionStats[mention].count++;
        mentionStats[mention].engagement += engagement;
      });

      // Process media types
      const type = post.media_type;
      if (!typeStats[type]) {
        typeStats[type] = { count: 0, engagement: 0 };
      }
      typeStats[type].count++;
      typeStats[type].engagement += engagement;

      // Process timing
      if (post.timestamp) {
        const hour = getPostHour(post.timestamp);
        const weekday = getPostWeekday(post.timestamp);

        if (!hourlyEngagement[hour]) {
          hourlyEngagement[hour] = { total: 0, count: 0 };
        }
        if (!weekdayEngagement[weekday]) {
          weekdayEngagement[weekday] = { total: 0, count: 0 };
        }

        hourlyEngagement[hour].total += engagement;
        hourlyEngagement[hour].count++;
        weekdayEngagement[weekday].total += engagement;
        weekdayEngagement[weekday].count++;
      }
    });

    // Transform data for visualization
    const topHashtags = Object.entries(hashtagStats)
      .map(([tag, stats]) => ({
        tag,
        count: stats.count,
        engagement: stats.engagement / stats.count
      }))
      .sort((a, b) => b.engagement - a.engagement)
      .slice(0, 10);

    const topMentions = Object.entries(mentionStats)
      .map(([mention, stats]) => ({
        mention,
        count: stats.count,
        engagement: stats.engagement / stats.count
      }))
      .sort((a, b) => b.engagement - a.engagement)
      .slice(0, 10);

    const bestPerformingTypes = Object.entries(typeStats)
      .map(([type, stats]) => ({
        type,
        engagement: stats.engagement / stats.count
      }))
      .sort((a, b) => b.engagement - a.engagement);

    const postTimings = Object.entries(hourlyEngagement)
      .map(([hour, stats]) => ({
        hour: parseInt(hour),
        engagement: stats.total / stats.count
      }))
      .sort((a, b) => a.hour - b.hour);

    const weekdayPerformance = Object.entries(weekdayEngagement)
      .map(([day, stats]) => ({
        day,
        engagement: stats.total / stats.count
      }))
      .sort((a, b) => b.engagement - a.engagement);

    // Generate content suggestions based on analysis
    const bestType = bestPerformingTypes[0];
    const bestHashtags = topHashtags.slice(0, 5).map(h => h.tag);
    const { hour: bestHour, weekday: bestDay } = calculateBestTimeToPost(posts, followers);

    const contentSuggestions = [
      {
        type: bestType.type,
        reason: `This content type has shown the highest engagement rate of ${bestType.engagement.toFixed(2)}%`,
        expectedEngagement: bestType.engagement,
        suggestedHashtags: bestHashtags,
        bestTimeToPost: `${bestHour}:00 on ${bestDay}`
      },
      {
        type: 'MIXED_CONTENT',
        reason: 'Diversifying content types helps maintain audience interest',
        expectedEngagement: bestType.engagement * 0.9,
        suggestedHashtags: topHashtags.slice(5, 10).map(h => h.tag),
        bestTimeToPost: `${(bestHour + 2) % 24}:00 on ${weekdayPerformance[1]?.day || 'Thursday'}`
      }
    ];

    setContentAnalysis({
      topHashtags,
      topMentions,
      bestPerformingTypes,
      postTimings,
      weekdayPerformance,
      contentSuggestions
    });
  };

  const analyzeTrends = (posts: MediaItem[]) => {
    const sortedPosts = [...posts].sort((a, b) => 
      new Date(a.timestamp || '').getTime() - new Date(b.timestamp || '').getTime()
    );

    const periodsToAnalyze = 4;
    const postsPerPeriod = Math.ceil(posts.length / periodsToAnalyze);
    
    const periods = Array.from({ length: periodsToAnalyze }, (_, i) => {
      const periodPosts = sortedPosts.slice(
        i * postsPerPeriod,
        (i + 1) * postsPerPeriod
      );
      
      const totalEngagement = periodPosts.reduce((sum, post) => 
        sum + post.like_count + post.comments_count, 0
      );

      const avgEngagement = totalEngagement / (periodPosts.length || 1);
      
      return {
        period: `Period ${i + 1}`,
        growth: avgEngagement,
        posts: periodPosts.length
      };
    });

    const latestPeriod = periods[periods.length - 1];
    const previousPeriod = periods[periods.length - 2];
    const growthRate = previousPeriod?.growth
      ? ((latestPeriod.growth - previousPeriod.growth) / previousPeriod.growth) * 100
      : 0;

    const engagementByType = posts.reduce((acc, post) => {
      const type = post.media_type;
      if (!acc[type]) acc[type] = 0;
      acc[type] += post.like_count + post.comments_count;
      return acc;
    }, {} as Record<string, number>);

    const typePreferences = Object.entries(engagementByType)
      .map(([type, engagement]) => ({
        type,
        engagement,
        average: engagement / posts.filter(p => p.media_type === type).length
      }))
      .sort((a, b) => b.average - a.average);

    const recommendedActions = [
      `Focus on ${typePreferences[0].type.toLowerCase()} content which generates ${(typePreferences[0].average / (typePreferences[1]?.average || 1)).toFixed(1)}x more engagement`,
      "Increase posting frequency during peak engagement hours",
      `Experiment with trending hashtags like ${contentAnalysis?.topHashtags.slice(0, 3).map(h => h.tag).join(', ')}`,
      `Engage more with accounts mentioned in your top-performing posts`,
      `Consider posting more frequently on ${contentAnalysis?.weekdayPerformance[0]?.day} when engagement is highest`
    ];

    setTrendAnalysis({
      growthRate,
      engagementTrend: latestPeriod.growth,
      followersGrowth: Math.floor(growthRate * 0.7),
      topGrowthPeriods: periods,
      engagementByContentType: engagementByType,
      recommendedActions
    });
  };

  // Landing Page Component
  const LandingPage = () => (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-600 via-pink-500 to-red-500 relative overflow-hidden">
      <div className="text-center space-y-8 p-8 rounded-2xl bg-white/10 backdrop-blur-lg z-10">
        <div className="animate-spin-slow">
          <Instagram size={64} className="text-white mx-auto" />
        </div>
        <h1 className="text-4xl font-bold text-white">Instagram Analytics Dashboard</h1>
        <p className="text-xl text-white/80">Advanced analytics and content insights for your Instagram</p>
        {isLoading ? (
          <div className="bg-white/20 text-white px-8 py-3 rounded-full font-medium text-lg flex items-center gap-2">
            <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
            Connecting...
          </div>
        ) : (
          <div className="space-y-4">
            <button
              onClick={loginWithInstagram}
              className="bg-white text-purple-600 px-8 py-3 rounded-full font-medium text-lg
                       hover:bg-purple-50 transition-all duration-300 flex items-center gap-2
                       hover:scale-105 transform text-center mx-auto"
            >
              <Instagram size={20} />
              Login with Instagram
            </button>
            <button
              onClick={() => {
                setUseDummyData(true);
                loadDummyData();
              }}
              className="text-white/80 hover:text-white text-sm transition-colors duration-300"
            >
              Try Demo Version Instead
            </button>
          </div>
        )}
      </div>
      
      {/* Animated background */}
      <div className="absolute top-0 left-0 w-full h-full -z-0">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white/10 backdrop-blur-3xl animate-float"
            style={{
              width: Math.random() * 300 + 100,
              height: Math.random() * 300 + 100,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${i * 0.5}s`,
            }}
          />
        ))}
      </div>
    </div>
  );

  // Dashboard Layout Component
  const DashboardLayout = () => (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed left-0 top-0 h-full w-64 bg-white shadow-lg p-6">
        <div className="flex flex-col h-full">
          <div className="flex items-center gap-3 mb-8">
            <Instagram className="text-purple-600" size={32} />
            <h2 className="text-xl font-bold">Instagram Analytics</h2>
          </div>
          
          <div className="space-y-2">
            <button
              onClick={() => setActiveView('account')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                        ${activeView === 'account' 
                          ? 'bg-purple-100 text-purple-600' 
                          : 'hover:bg-gray-100'}`}
            >
              <LayoutGrid size={20} />
              Account & Posts
            </button>
            
            <button
              onClick={() => setActiveView('analytics')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                        ${activeView === 'analytics' 
                          ? 'bg-purple-100 text-purple-600' 
                          : 'hover:bg-gray-100'}`}
            >
              <BarChart2 size={20} />
              Analytics & Insights
            </button>
            
            <Link 
              href="/chat-app" 
              className="w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors hover:bg-gray-100"
            >
              <Bot size={20} />
              Chat Bot
            </Link>

            <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-100">
              <p className="text-sm text-gray-600 italic">
                📊 Data Source:{' '}
                <span className="font-medium text-purple-600">
                  50% Instagram API
                </span>
                {' + '}
                <span className="font-medium text-pink-600">
                  50% Our Imagination
                </span>
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Because Instagram's API is like that friend who only tells half the story... 
                We filled in the gaps with educated guesses! 🔮✨
              </p>
            </div>

            {useDummyData && (
              <div className="mt-4 px-4 py-2 bg-yellow-50 rounded-lg text-sm text-yellow-700">
                Using demo data for preview
              </div>
            )}
          </div>
          
          <button
            onClick={handleLogout}
            className="mt-auto flex items-center gap-3 px-4 py-3 rounded-lg text-red-500
                     hover:bg-red-50 transition-colors"
          >
            <LogOut size={20} />
            {useDummyData ? "Exit Demo" : "Logout"}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-64 p-8">
        {/* Quick Stats Bar */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-8">
          <div className="grid grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-sm text-gray-600">Total Posts</p>
              <p className="text-xl font-bold text-purple-600">
                {mediaData.length}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Total Likes</p>
              <p className="text-xl font-bold text-pink-600">
                {mediaData.reduce((sum, post) => sum + post.like_count, 0).toLocaleString()}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Total Comments</p>
              <p className="text-xl font-bold text-orange-600">
                {mediaData.reduce((sum, post) => sum + post.comments_count, 0).toLocaleString()}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Best Time to Post</p>
              <p className="text-xl font-bold text-purple-600">
                {contentAnalysis?.postTimings[0]?.hour || 0}:00
              </p>
            </div>
          </div>
        </div>

        {/* Main Content Views */}
        {activeView === 'account' ? (
          <AccountView />
        ) : (
          <AnalyticsView />
        )}
      </div>
    </div>
  );

  const AnalyticsView = () => {
    const COLORS = ['#8B5CF6', '#EC4899', '#EF4444', '#F59E0B', '#10B981'];

    // Prepare data from available media data
    const mediaTypePerformance = useMemo(() => {
      const typeStats = mediaData.reduce((acc, media) => {
        const type = media.media_type;
        if (!acc[type]) {
          acc[type] = {
            type,
            totalLikes: 0,
            totalComments: 0,
            count: 0
          };
        }
        acc[type].totalLikes += media.like_count;
        acc[type].totalComments += media.comments_count;
        acc[type].count++;
        return acc;
      }, {} as Record<string, any>);

      return Object.values(typeStats).map(stat => ({
        type: stat.type,
        engagement: ((stat.totalLikes + stat.totalComments) / stat.count).toFixed(1),
        likes: (stat.totalLikes / stat.count).toFixed(1),
        comments: (stat.totalComments / stat.count).toFixed(1)
      }));
    }, [mediaData]);

    // Generate time-based data
    const timeData = useMemo(() => {
      return Array.from({ length: 24 }, (_, hour) => ({
        hour,
        engagement: Math.random() * 5 + 2
      }));
    }, []);

    // Generate weekday data
    const weekdayData = useMemo(() => {
      const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
      return days.map(day => ({
        day,
        engagement: Math.random() * 8 + 2
      }));
    }, []);

    // Calculate totals
    const totalLikes = mediaData.reduce((sum, post) => sum + post.like_count, 0);
    const totalComments = mediaData.reduce((sum, post) => sum + post.comments_count, 0);
    const totalEngagement = totalLikes + totalComments;
    const avgEngagementRate = (totalEngagement / (mediaData.length || 1)).toFixed(1);
    const estimatedReach = Math.floor(totalEngagement * 1.5);

    return (
      <div className="space-y-8">
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <TrendingUp className="text-purple-600" />
              <h3 className="text-lg font-semibold text-gray-800">Growth Rate</h3>
            </div>
            <p className="text-3xl font-bold text-purple-600">
              {((totalEngagement / (mediaData.length || 1)) * 0.1).toFixed(1)}%
            </p>
            <p className="text-sm text-gray-500 mt-2">vs last period</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <Users className="text-pink-600" />
              <h3 className="text-lg font-semibold text-gray-800">Engagement Rate</h3>
            </div>
            <p className="text-3xl font-bold text-pink-600">
              {avgEngagementRate}
            </p>
            <p className="text-sm text-gray-500 mt-2">average per post</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <Heart className="text-red-600" />
              <h3 className="text-lg font-semibold text-gray-800">Total Interactions</h3>
            </div>
            <p className="text-3xl font-bold text-red-600">
              {totalEngagement.toLocaleString()}
            </p>
            <p className="text-sm text-gray-500 mt-2">likes and comments</p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <Eye className="text-orange-600" />
              <h3 className="text-lg font-semibold text-gray-800">Total Reach</h3>
            </div>
            <p className="text-3xl font-bold text-orange-600">
              {estimatedReach.toLocaleString()}
            </p>
            <p className="text-sm text-gray-500 mt-2">estimated unique viewers</p>
          </div>
        </div>

        {/* Content Performance Analysis */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Post Timing Analysis */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-6">
              Best Posting Times
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timeData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="hour" 
                    tickFormatter={(hour) => `${hour}:00`}
                  />
                  <YAxis />
                  <Tooltip 
                    formatter={(value: number) => `${value.toFixed(2)}%`}
                    labelFormatter={(hour) => `${hour}:00`}
                  />
                  <Area
                    type="monotone"
                    dataKey="engagement"
                    stroke="#8B5CF6"
                    fill="#8B5CF6"
                    fillOpacity={0.3}
                    name="Engagement Rate"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Weekday Performance */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-6">
              Weekday Performance
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weekdayData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip formatter={(value: number) => `${value.toFixed(2)}%`} />
                  <Bar dataKey="engagement" fill="#EC4899" name="Engagement Rate" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Media Type Performance */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-6">
              Content Type Performance
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mediaTypePerformance}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="type" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="likes" fill="#8B5CF6" name="Avg. Likes">
                    {mediaTypePerformance.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                  <Bar dataKey="comments" fill="#EC4899" name="Avg. Comments" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Engagement Distribution */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-6">
              Engagement Distribution
            </h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Likes', value: totalLikes },
                      { name: 'Comments', value: totalComments },
                    ]}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {[0, 1].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Performance Summary */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-6">
            Performance Summary
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {mediaTypePerformance.map((type, index) => (
              <div key={index} className="bg-purple-50 rounded-lg p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <Binary className="text-purple-600" />
                  <h4 className="font-semibold">{type.type} Content</h4>
                </div>
                <div>
                  <p className="text-gray-700 mb-2">
                    Average engagement: <span className="font-semibold">{type.engagement}</span>
                  </p>
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div>
                      <p className="text-sm text-gray-600">Avg. Likes</p>
                      <p className="font-bold text-purple-600">{type.likes}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Avg. Comments</p>
                      <p className="font-bold text-pink-600">{type.comments}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const AccountView = () => (
    <div className="space-y-8">
      {/* User Profile */}
      {userData && (
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="flex items-center gap-8">
            <img
              src={userData.profile_picture_url || "/api/placeholder/150/150"}
              alt={userData.username}
              className="w-32 h-32 rounded-full ring-4 ring-purple-100"
            />
            <div>
              <h2 className="text-3xl font-bold mb-4">@{userData.username}</h2>
              <div className="grid grid-cols-3 gap-8">
                <div>
                  <p className="text-gray-600">Followers</p>
                  <p className="text-2xl font-bold">{userData.followers_count.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-gray-600">Following</p>
                  <p className="text-2xl font-bold">{userData.follows_count.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-gray-600">Posts</p>
                  <p className="text-2xl font-bold">{userData.media_count.toLocaleString()}</p>
                </div>
              </div>

              {/* Account Insights Summary */}
              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="bg-purple-50 rounded-lg p-4">
                  <p className="text-purple-600 font-medium">Avg. Engagement Rate</p>
                  <p className="text-2xl font-bold text-purple-700">
                    {((mediaData.reduce((acc, post) => 
                      acc + post.like_count + post.comments_count, 0) / 
                      (mediaData.length * userData.followers_count)) * 100).toFixed(2)}%
                  </p>
                </div>
                <div className="bg-pink-50 rounded-lg p-4">
                  <p className="text-pink-600 font-medium">Peak Performance Time</p>
                  <p className="text-2xl font-bold text-pink-700">
                    {contentAnalysis?.postTimings[0]?.hour || 0}:00
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Posts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mediaData.map((media) => (
          <div
            key={media.id}
            className="bg-white rounded-xl shadow-lg overflow-hidden cursor-pointer
                     transform transition-all duration-300 hover:scale-105"
            onClick={() => setSelectedPost(media)}
          >
            {/* Media Preview */}
            <div className="aspect-square relative">
              {media.media_type === "IMAGE" && media.media_url && (
                <img
                  src={media.media_url}
                  alt={media.caption || "Instagram post"}
                  className="w-full h-full object-cover"
                />
              )}
              {media.media_type === "VIDEO" && media.media_url && (
                <video
                  src={media.media_url}
                  className="w-full h-full object-cover"
                />
              )}
              {media.media_type === "CAROUSEL_ALBUM" && media.children && (
                <div className="relative h-full">
                  <img
                    src={media.children.data[0].media_url}
                    alt="Carousel preview"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2 bg-black/50 text-white px-2 py-1 rounded-lg text-sm">
                    {media.children.data.length} items
                  </div>
                </div>
              )}
              
              {/* Overlay with stats */}
              <div className="absolute inset-0 bg-black/50 opacity-0 hover:opacity-100
                          transition-opacity duration-300 flex flex-col items-center justify-center">
                <div className="text-white text-center space-y-2">
                  <div className="flex items-center gap-2">
                    <Heart size={20} />
                    <p className="font-bold text-xl">{media.like_count.toLocaleString()}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <MessageCircle size={20} />
                    <p className="text-xl">{media.comments_count.toLocaleString()}</p>
                  </div>
                  <p className="text-sm mt-2">
                    Engagement: {((media.like_count + media.comments_count) / 
                    (userData?.followers_count || 1) * 100).toFixed(2)}%
                  </p>
                </div>
              </div>
            </div>
            
            {/* Post Info */}
            <div className="p-4">
              <div className="flex justify-between items-center mb-2">
                <p className="text-gray-600 text-sm">
                  {media.timestamp && formatDate(media.timestamp)}
                </p>
                <div className="flex items-center gap-1">
                {media.hashtags && media.hashtags.length > 0 && (
                    <span className="bg-purple-100 text-purple-600 text-xs px-2 py-1 rounded-full">
                      {media.hashtags.length} tags
                    </span>
                  )}
                </div>
              </div>
              <p className="text-gray-800 line-clamp-2">
                {media.caption || "No caption"}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Post Modal */}
      {selectedPost && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedPost(null)}
        >
          <div
            className="bg-white rounded-xl max-w-5xl w-full max-h-[90vh] overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            <div className="grid grid-cols-1 md:grid-cols-2">
              {/* Media Display */}
              <div className="relative aspect-square bg-black">
                {selectedPost.media_type === "IMAGE" && selectedPost.media_url && (
                  <img
                    src={selectedPost.media_url}
                    alt={selectedPost.caption || "Post"}
                    className="w-full h-full object-contain"
                  />
                )}
                {selectedPost.media_type === "VIDEO" && selectedPost.media_url && (
                  <video
                    src={selectedPost.media_url}
                    controls
                    className="w-full h-full object-contain"
                  />
                )}
                {selectedPost.media_type === "CAROUSEL_ALBUM" && selectedPost.children && (
                  <div className="relative h-full">
                    {selectedPost.children.data.map((item, index) => (
                      <div
                        key={item.id}
                        className={`absolute inset-0 transition-opacity duration-300 ${
                          index === currentSlides[selectedPost.id]
                            ? "opacity-100"
                            : "opacity-0 pointer-events-none"
                        }`}
                      >
                        {item.media_type === "VIDEO" ? (
                          <video
                            src={item.media_url}
                            controls
                            className="w-full h-full object-contain"
                          />
                        ) : (
                          <img
                            src={item.media_url}
                            alt={`Carousel item ${index + 1}`}
                            className="w-full h-full object-contain"
                          />
                        )}
                      </div>
                    ))}
                    
                    {/* Carousel Controls */}
                    {selectedPost.children.data.length > 1 && (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePrevSlide(selectedPost.id);
                          }}
                          className={`absolute left-2 top-1/2 transform -translate-y-1/2 
                                    bg-white/20 hover:bg-white/40 text-white p-2 rounded-full z-10 
                                    ${currentSlides[selectedPost.id] === 0 ? "hidden" : ""}`}
                        >
                          <ChevronLeft size={24} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleNextSlide(selectedPost.id, selectedPost.children?.data.length || 0);
                          }}
                          className={`absolute right-2 top-1/2 transform -translate-y-1/2 
                                    bg-white/20 hover:bg-white/40 text-white p-2 rounded-full z-10
                                    ${currentSlides[selectedPost.id] === selectedPost.children.data.length - 1 
                                      ? "hidden" : ""}`}
                        >
                          <ChevronRight size={24} />
                        </button>
                        
                        {/* Carousel Indicators */}
                        <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
                          {selectedPost.children.data.map((_, index) => (
                            <div
                              key={index}
                              className={`h-2 w-2 rounded-full transition-colors duration-300 ${
                                index === currentSlides[selectedPost.id]
                                  ? "bg-white"
                                  : "bg-white/50"
                              }`}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>

              {/* Post Details */}
              <div className="p-6 flex flex-col h-[600px] overflow-y-auto">
                <div className="flex justify-between items-start mb-4">
                  <p className="text-sm text-gray-500">
                    {selectedPost.timestamp && formatDate(selectedPost.timestamp)}
                  </p>
                  <button
                    onClick={() => setSelectedPost(null)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ×
                  </button>
                </div>

                {/* Caption */}
                <p className="text-gray-800 whitespace-pre-wrap mb-6">
                  {selectedPost.caption || "No caption"}
                </p>

                {/* Hashtags */}
                {selectedPost.hashtags && selectedPost.hashtags.length > 0 && (
                  <div className="mb-6">
                    <p className="text-sm text-gray-600 mb-2">Hashtags:</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedPost.hashtags.map((tag) => (
                        <span 
                          key={tag}
                          className="bg-purple-100 text-purple-600 px-2 py-1 rounded-full text-sm"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Engagement Stats */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-600">Likes</p>
                    <p className="text-xl font-bold">{selectedPost.like_count.toLocaleString()}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-600">Comments</p>
                    <p className="text-xl font-bold">{selectedPost.comments_count.toLocaleString()}</p>
                  </div>
                </div>

                {/* Comments */}
                {selectedPost.comments && selectedPost.comments.length > 0 ? (
                  <div className="mt-4">
                    <h4 className="text-lg font-semibold mb-4">
                      Comments ({selectedPost.comments.length})
                    </h4>
                    <div className="space-y-3">
                      {selectedPost.comments.map((comment) => (
                        <div
                          key={comment.id}
                          className="bg-gray-50 p-3 rounded-lg"
                        >
                          {comment.username && (
                            <p className="text-sm font-semibold text-gray-700 mb-1">
                              @{comment.username}
                            </p>
                          )}
                          <p className="text-gray-800">{comment.text}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {formatDate(comment.timestamp)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="mt-4">
                    <p className="text-gray-500">No comments yet</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // Main Return
  return (
    <main>
      {!isLoggedIn ? (
        <LandingPage />
      ) : (
        <DashboardLayout />
      )}

      <style jsx>{`
        @keyframes shine {
          from {
            transform: translateX(-100%) skewX(45deg);
          }
          to {
            transform: translateX(200%) skewX(45deg);
          }
        }

        @keyframes gradient-x {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }

        @keyframes blob {
          0%,
          100% {
            transform: translate(0, 0) scale(1);
          }
          25% {
            transform: translate(20px, -20px) scale(1.1);
          }
          50% {
            transform: translate(-20px, 20px) scale(0.9);
          }
          75% {
            transform: translate(20px, 20px) scale(1.1);
          }
        }

        .animate-shine {
          animation: shine 3s infinite;
        }

        .animate-shine-fast {
          animation: shine 2s infinite;
        }

        .animate-gradient-x {
          animation: gradient-x 15s linear infinite;
        }

        .animate-blob {
          animation: blob 10s infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }

        .animate-spin-slow {
          animation: spin 6s linear infinite;
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-20px);
          }
        }

        .animate-float {
          animation: float 6s ease-in-out infinite;
        }

        /* Custom scrollbar styles */
        ::-webkit-scrollbar {
          width: 6px;
          height: 6px;
        }

        ::-webkit-scrollbar-track {
          background: #f1f1f1;
          border-radius: 3px;
        }

        ::-webkit-scrollbar-thumb {
          background: #c4b5fd;
          border-radius: 3px;
        }

        ::-webkit-scrollbar-thumb:hover {
          background: #8b5cf6;
        }

        /* Carousel transitions */
        .carousel-item-enter {
          opacity: 0;
        }
        
        .carousel-item-enter-active {
          opacity: 1;
          transition: opacity 300ms ease-in;
        }
        
        .carousel-item-exit {
          opacity: 1;
        }
        
        .carousel-item-exit-active {
          opacity: 0;
          transition: opacity 300ms ease-out;
        }

        /* Modal animations */
        .modal-enter {
          opacity: 0;
          transform: scale(0.9);
        }
        
        .modal-enter-active {
          opacity: 1;
          transform: scale(1);
          transition: opacity 300ms, transform 300ms;
        }
        
        .modal-exit {
          opacity: 1;
          transform: scale(1);
        }
        
        .modal-exit-active {
          opacity: 0;
          transform: scale(0.9);
          transition: opacity 300ms, transform 300ms;
        }

        /* Responsive adjustments */
        @media (max-width: 768px) {
          .grid-cols-4 {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 640px) {
          .grid-cols-4 {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </main>
  );
}