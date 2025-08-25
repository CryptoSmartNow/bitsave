'use client';

import React, { useState, useEffect } from 'react';
import { useAnalytics } from '@/hooks/useAnalytics';
import { Eye } from 'lucide-react';

interface ViewCounterProps {
  postId: string;
  className?: string;
  showIcon?: boolean;
}

interface AnalyticsData {
  postId: string;
  title: string;
  viewCount: number;
  uniqueViews: number;
  lastViewedAt?: string;
  analytics: {
    dailyViews: Array<{ date: string; views: number }>;
    weeklyViews: Array<{ week: string; views: number }>;
    monthlyViews: Array<{ month: string; views: number }>;
  };
}

export default function ViewCounter({ 
  postId, 
  className = '',
  showIcon = true 
}: ViewCounterProps) {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const { getAnalytics } = useAnalytics();

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        const data = await getAnalytics(postId);
        setAnalytics(data);
      } catch (error) {
        console.error('Error fetching analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    if (postId) {
      fetchAnalytics();
    }
  }, [postId, getAnalytics]);

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  if (loading) {
    return (
      <div className={`animate-pulse flex items-center space-x-2 ${className}`}>
        {showIcon && <div className="w-4 h-4 bg-gray-300 rounded"></div>}
        <div className="w-12 h-4 bg-gray-300 rounded"></div>
      </div>
    );
  }

  if (!analytics) {
    return null;
  }

  return (
    <div className={`flex items-center space-x-2 text-gray-600 ${className}`}>
      {showIcon && (
        <Eye className="w-4 h-4 text-blue-500" style={{ color: 'var(--primary)' }} />
      )}
      <span className="text-sm font-medium text-gray-700">
        {formatNumber(analytics.viewCount)} {analytics.viewCount === 1 ? 'view' : 'views'}
      </span>
    </div>
  );
}