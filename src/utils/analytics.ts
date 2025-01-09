// src/utils/analytics.ts

import { MediaItem, ContentAnalysis, TrendAnalysis } from '../types/instagram';

// Utility functions
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

const calculateEngagementRate = (
  likes: number,
  comments: number,
  followers: number
): number => {
  return ((likes + comments) / followers) * 100;
};

export const analyzeContent = (
  posts: MediaItem[],
  followersCount: number
): ContentAnalysis => {
  const hashtagStats: Record<string, { count: number; engagement: number }> = {};
  const mentionStats: Record<string, { count: number; engagement: number }> = {};
  const typeStats: Record<string, { count: number; engagement: number }> = {};
  const hourlyEngagement: Record<number, { total: number; count: number }> = {};
  const weekdayEngagement: Record<string, { total: number; count: number }> = {};

  posts.forEach(post => {
    const engagement = calculateEngagementRate(
      post.like_count,
      post.comments_count,
      followersCount
    );

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

  // Generate content suggestions based on analysis
  const bestType = Object.entries(typeStats)
    .map(([type, stats]) => ({
      type,
      averageEngagement: stats.engagement / stats.count
    }))
    .sort((a, b) => b.averageEngagement - a.averageEngagement)[0];

  const bestHashtags = Object.entries(hashtagStats)
    .map(([tag, stats]) => ({
      tag,
      averageEngagement: stats.engagement / stats.count
    }))
    .sort((a, b) => b.averageEngagement - a.averageEngagement)
    .slice(0, 5)
    .map(item => item.tag);

  const bestHour = Object.entries(hourlyEngagement)
    .map(([hour, stats]) => ({
      hour: parseInt(hour),
      averageEngagement: stats.total / stats.count
    }))
    .sort((a, b) => b.averageEngagement - a.averageEngagement)[0];

  const bestDay = Object.entries(weekdayEngagement)
    .map(([day, stats]) => ({
      day,
      averageEngagement: stats.total / stats.count
    }))
    .sort((a, b) => b.averageEngagement - a.averageEngagement)[0];

  return {
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
        engagement: stats.total / stats.count
      }))
      .sort((a, b) => b.engagement - a.engagement),

    weekdayPerformance: Object.entries(weekdayEngagement)
      .map(([day, stats]) => ({
        day,
        engagement: stats.total / stats.count
      }))
      .sort((a, b) => b.engagement - a.engagement),

    contentSuggestions: [{
      type: bestType.type,
      reason: `This content type shows highest engagement rate of ${bestType.averageEngagement.toFixed(2)}%`,
      expectedEngagement: bestType.averageEngagement,
      suggestedHashtags: bestHashtags,
      bestTimeToPost: `${bestHour.hour}:00 on ${bestDay.day}`
    }]
  };
};

export const analyzeTrends = (posts: MediaItem[]): TrendAnalysis => {
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

  // Calculate growth rate
  const latestPeriod = periods[periods.length - 1];
  const previousPeriod = periods[periods.length - 2];
  const growthRate = previousPeriod?.growth
    ? ((latestPeriod.growth - previousPeriod.growth) / previousPeriod.growth) * 100
    : 0;

  // Calculate engagement by content type
  const engagementByType = posts.reduce((acc, post) => {
    const type = post.media_type;
    if (!acc[type]) acc[type] = 0;
    acc[type] += post.like_count + post.comments_count;
    return acc;
  }, {} as Record<string, number>);

  // Generate recommended actions
  const recommendedActions = [
    `Focus on ${Object.entries(engagementByType)
      .sort((a, b) => b[1] - a[1])[0][0].toLowerCase()} content for highest engagement`,
    'Maintain consistent posting schedule',
    'Engage with your audience through comments',
    'Use trending hashtags in your niche',
    'Experiment with different content formats'
  ];

  return {
    growthRate,
    engagementTrend: latestPeriod.growth,
    followersGrowth: Math.floor(growthRate * 0.7), // Estimated follower growth
    topGrowthPeriods: periods,
    engagementByContentType: engagementByType,
    recommendedActions
  };
};