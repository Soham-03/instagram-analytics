// src/hooks/useContentAnalysis.ts
import { useState } from 'react';
import { ContentAnalysis, TrendAnalysis, MediaItem } from '../types/instagram';
import { analyzeContent, analyzeTrends } from '@/utils/analytics';

export const useContentAnalysis = () => {
  const [contentAnalysis, setContentAnalysis] = useState<ContentAnalysis | null>(null);
  const [trendAnalysis, setTrendAnalysis] = useState<TrendAnalysis | null>(null);

  const performAnalysis = (posts: MediaItem[], followersCount: number) => {
    const content = analyzeContent(posts, followersCount);
    const trends = analyzeTrends(posts);
    
    setContentAnalysis(content);
    setTrendAnalysis(trends);
    
    return { content, trends };
  };

  return {
    contentAnalysis,
    trendAnalysis,
    performAnalysis,
  };
};