// src/hooks/useMediaAnalytics.ts
import { useState, useCallback, useMemo } from 'react';
import { 
  MediaItem, 
  ContentAnalysis, 
  TrendAnalysis,
  AccountInsights
} from '../types/instagram';

interface MediaAnalyticsHook {
  contentAnalysis: ContentAnalysis | null;
  trendAnalysis: TrendAnalysis | null;
  isAnalyzing: boolean;
  error: string | null;
  analyzeContent: (posts: MediaItem[], followersCount: number) => void;
  analyzeTrends: (posts: MediaItem[]) => void;
  getTopPerformingPosts: (limit?: number) => MediaItem[];
  getBestPostingTimes: () => { hour: number; weekday: string };
  generatePerformanceReport: () => PerformanceReport;
  resetAnalytics: () => void;
}

interface PerformanceReport {
  overallEngagement: number;
  bestPerformingContent: {
    type: string;
    averageEngagement: number;
  };
  topHashtags: string[];
  bestTimesToPost: {
    hours: number[];
    days: string[];
  };
  growthMetrics: {
    rate: number;
    trend: string;
  };
}

interface EngagementStats {
  count: number;
  total: number;
  average: number;
}

export const useMediaAnalytics = (): MediaAnalyticsHook => {
  const [contentAnalysis, setContentAnalysis] = useState<ContentAnalysis | null>(null);
  const [trendAnalysis, setTrendAnalysis] = useState<TrendAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analyzedPosts, setAnalyzedPosts] = useState<MediaItem[]>([]);
    // Utility functions
  const calculateEngagementRate = (
    likes: number, 
    comments: number, 
    followers: number
  ): number => {
    return ((likes + comments) / followers) * 100;
  };

  const getPostHour = (timestamp: string): number => {
    return new Date(timestamp).getHours();
  };

  const getPostWeekday = (timestamp: string): string => {
    return new Date(timestamp).toLocaleDateString('en-US', { weekday: 'long' });
  };

  const groupByTime = (posts: MediaItem[]): Record<number, EngagementStats> => {
    const hourlyStats: Record<number, EngagementStats> = {};
    
    posts.forEach(post => {
      if (post.timestamp) {
        const hour = getPostHour(post.timestamp);
        const engagement = post.like_count + post.comments_count;
        
        if (!hourlyStats[hour]) {
          hourlyStats[hour] = { count: 0, total: 0, average: 0 };
        }
        
        hourlyStats[hour].count++;
        hourlyStats[hour].total += engagement;
        hourlyStats[hour].average = hourlyStats[hour].total / hourlyStats[hour].count;
      }
    });
    
    return hourlyStats;
  };

  const groupByWeekday = (posts: MediaItem[]): Record<string, EngagementStats> => {
    const weekdayStats: Record<string, EngagementStats> = {};
    
    posts.forEach(post => {
      if (post.timestamp) {
        const weekday = getPostWeekday(post.timestamp);
        const engagement = post.like_count + post.comments_count;
        
        if (!weekdayStats[weekday]) {
          weekdayStats[weekday] = { count: 0, total: 0, average: 0 };
        }
        
        weekdayStats[weekday].count++;
        weekdayStats[weekday].total += engagement;
        weekdayStats[weekday].average = weekdayStats[weekday].total / weekdayStats[weekday].count;
      }
    });
    
    return weekdayStats;
  };

  const calculateGrowthRate = (
    periods: Array<{ period: string; growth: number }>
  ): number => {
    if (periods.length < 2) return 0;
    
    const latest = periods[periods.length - 1].growth;
    const previous = periods[periods.length - 2].growth;
    
    return previous ? ((latest - previous) / previous) * 100 : 0;
  };

  const generateRecommendedActions = (
    posts: MediaItem[],
    growthPeriods: Array<{ period: string; growth: number }>
  ): string[] => {
    const recommendations: string[] = [];
    const growthRate = calculateGrowthRate(growthPeriods);
    const hourlyStats = groupByTime(posts);
    const weekdayStats = groupByWeekday(posts);
    
    // Best performing hours
    const bestHours = Object.entries(hourlyStats)
      .sort((a, b) => b[1].average - a[1].average)
      .slice(0, 3)
      .map(([hour]) => parseInt(hour));
      
    // Best performing days
    const bestDays = Object.entries(weekdayStats)
      .sort((a, b) => b[1].average - a[1].average)
      .slice(0, 3)
      .map(([day]) => day);

    recommendations.push(
      `Schedule posts around ${bestHours.map(h => `${h}:00`).join(', ')} for maximum engagement`
    );
    recommendations.push(
      `Focus on posting during ${bestDays.join(', ')} when your audience is most active`
    );

    if (growthRate < 0) {
      recommendations.push('Consider increasing posting frequency to boost engagement');
    }

    return recommendations;
  };

  const analyzeContent = useCallback((posts: MediaItem[], followersCount: number) => {
    try {
      setIsAnalyzing(true);
      setError(null);
      setAnalyzedPosts(posts);

      const hashtagStats: Record<string, { count: number; engagement: number }> = {};
      const mentionStats: Record<string, { count: number; engagement: number }> = {};
      const typeStats: Record<string, { count: number; engagement: number }> = {};
      const hourlyEngagement = groupByTime(posts);
      const weekdayEngagement = groupByWeekday(posts);

      posts.forEach(post => {
        const engagement = calculateEngagementRate(
          post.like_count,
          post.comments_count,
          followersCount
        );
        
        // Process hashtags
        post.hashtags?.forEach(tag => {
          if (!hashtagStats[tag]) {
            hashtagStats[tag] = { count: 0, engagement: 0 };
          }
          hashtagStats[tag].count++;
          hashtagStats[tag].engagement += engagement;
        });

        // Process mentions
        post.mentions?.forEach(mention => {
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
      });

      const analysis: ContentAnalysis = {
        topHashtags: Object.entries(hashtagStats)
          .map(([tag, stats]) => ({
            tag,
            count: stats.count,
            engagement: stats.engagement / stats.count
          }))
          .sort((a, b) => b.engagement - a.engagement),

        topMentions: Object.entries(mentionStats)
          .map(([mention, stats]) => ({
            mention,
            count: stats.count,
            engagement: stats.engagement / stats.count
          }))
          .sort((a, b) => b.engagement - a.engagement),

        bestPerformingTypes: Object.entries(typeStats)
          .map(([type, stats]) => ({
            type,
            engagement: stats.engagement / stats.count
          }))
          .sort((a, b) => b.engagement - a.engagement),

        postTimings: Object.entries(hourlyEngagement)
          .map(([hour, stats]) => ({
            hour: parseInt(hour),
            engagement: stats.average
          }))
          .sort((a, b) => b.engagement - a.engagement),

        weekdayPerformance: Object.entries(weekdayEngagement)
          .map(([day, stats]) => ({
            day,
            engagement: stats.average
          }))
          .sort((a, b) => b.engagement - a.engagement),

        contentSuggestions: generateContentSuggestions(
          typeStats,
          hashtagStats,
          hourlyEngagement,
          weekdayEngagement
        )
      };

      setContentAnalysis(analysis);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to analyze content');
      console.error("Error analyzing content:", error);
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  const analyzeTrends = useCallback((posts: MediaItem[]) => {
    try {
      setIsAnalyzing(true);
      setError(null);

      const sortedPosts = [...posts].sort((a, b) => 
        new Date(a.timestamp || '').getTime() - new Date(b.timestamp || '').getTime()
      );

      // Calculate growth rates
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

        return {
          period: `Period ${i + 1}`,
          growth: totalEngagement / (periodPosts.length || 1),
          posts: periodPosts.length
        };
      });

      // Calculate engagement by content type
      const engagementByType = posts.reduce((acc, post) => {
        const type = post.media_type;
        if (!acc[type]) acc[type] = 0;
        acc[type] += post.like_count + post.comments_count;
        return acc;
      }, {} as Record<string, number>);

      const trends: TrendAnalysis = {
        growthRate: calculateGrowthRate(periods),
        engagementTrend: periods[periods.length - 1].growth,
        followersGrowth: Math.floor(calculateGrowthRate(periods) * 0.7),
        topGrowthPeriods: periods,
        engagementByContentType: engagementByType,
        recommendedActions: generateRecommendedActions(posts, periods)
      };

      setTrendAnalysis(trends);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to analyze trends');
      console.error("Error analyzing trends:", error);
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  const getTopPerformingPosts = useCallback((limit: number = 5): MediaItem[] => {
    return [...analyzedPosts]
      .sort((a, b) => {
        const engagementA = a.like_count + a.comments_count;
        const engagementB = b.like_count + b.comments_count;
        return engagementB - engagementA;
      })
      .slice(0, limit);
  }, [analyzedPosts]);

  const getBestPostingTimes = useCallback(() => {
    if (!contentAnalysis) {
      return { hour: 12, weekday: 'Wednesday' };
    }

    const bestHour = contentAnalysis.postTimings[0]?.hour || 12;
    const bestWeekday = contentAnalysis.weekdayPerformance[0]?.day || 'Wednesday';

    return { hour: bestHour, weekday: bestWeekday };
  }, [contentAnalysis]);

  const generatePerformanceReport = useCallback((): PerformanceReport => {
    const topPosts = getTopPerformingPosts(10);
    const { hour, weekday } = getBestPostingTimes();
    
    return {
      overallEngagement: topPosts.reduce((sum, post) => 
        sum + post.like_count + post.comments_count, 0) / topPosts.length,
      bestPerformingContent: {
        type: contentAnalysis?.bestPerformingTypes[0]?.type || 'IMAGE',
        averageEngagement: contentAnalysis?.bestPerformingTypes[0]?.engagement || 0
      },
      topHashtags: contentAnalysis?.topHashtags.slice(0, 5).map(h => h.tag) || [],
      bestTimesToPost: {
        hours: contentAnalysis?.postTimings.slice(0, 3).map(t => t.hour) || [hour],
        days: contentAnalysis?.weekdayPerformance.slice(0, 3).map(d => d.day) || [weekday]
      },
      growthMetrics: {
        rate: trendAnalysis?.growthRate || 0,
        trend: trendAnalysis?.growthRate > 0 ? 'Growing' : 'Declining'
      }
    };
  }, [contentAnalysis, trendAnalysis, getTopPerformingPosts, getBestPostingTimes]);

  const generateContentSuggestions = (
    typeStats: Record<string, { count: number; engagement: number }>,
    hashtagStats: Record<string, { count: number; engagement: number }>,
    hourlyEngagement: Record<number, EngagementStats>,
    weekdayEngagement: Record<string, EngagementStats>
  ) => {
    // Find best performing content type
    const bestType = Object.entries(typeStats)
      .sort((a, b) => (b[1].engagement / b[1].count) - (a[1].engagement / a[1].count))[0];

    // Get top performing hashtags
    const topHashtags = Object.entries(hashtagStats)
      .sort((a, b) => (b[1].engagement / b[1].count) - (a[1].engagement / a[1].count))
      .slice(0, 5)
      .map(([tag]) => tag);

    // Find best posting time
    const bestHour = Object.entries(hourlyEngagement)
      .sort((a, b) => b[1].average - a[1].average)[0];
    const bestDay = Object.entries(weekdayEngagement)
      .sort((a, b) => b[1].average - a[1].average)[0];

    return [{
      type: bestType[0],
      reason: `This content type shows highest engagement rate of ${(bestType[1].engagement / bestType[1].count).toFixed(2)}%`,
      expectedEngagement: bestType[1].engagement / bestType[1].count,
      suggestedHashtags: topHashtags,
      bestTimeToPost: `${bestHour[0]}:00 on ${bestDay[0]}`
    }];
  };

  const resetAnalytics = useCallback(() => {
    setContentAnalysis(null);
    setTrendAnalysis(null);
    setError(null);
    setAnalyzedPosts([]);
  }, []);

  // Memoize frequently accessed calculations
  const topPosts = useMemo(() => getTopPerformingPosts(), [getTopPerformingPosts]);
  const bestTimes = useMemo(() => getBestPostingTimes(), [getBestPostingTimes]);
  const performanceReport = useMemo(() => generatePerformanceReport(), [generatePerformanceReport]);

  return {
    contentAnalysis,
    trendAnalysis,
    isAnalyzing,
    error,
    analyzeContent,
    analyzeTrends,
    getTopPerformingPosts,
    getBestPostingTimes,
    generatePerformanceReport,
    resetAnalytics
  };
};