import { useEffect, useCallback } from 'react';

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

export function useAnalytics() {
  const trackView = useCallback(async (postId: string) => {
    try {
      // Get viewer IP (simplified - in production you might want to use a service)
      const viewerIP = 'anonymous';
      
      const response = await fetch('/api/blog/analytics', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ postId, viewerIP }),
      });

      if (!response.ok) {
        // Silently fail for analytics - don't show errors to users
        // Only log in development
        if (process.env.NODE_ENV === 'development') {
          console.warn('Analytics tracking failed:', response.status);
        }
        return;
      }
    } catch (error) {
      // Silently fail for analytics - don't show errors to users
      // Only log in development
      if (process.env.NODE_ENV === 'development') {
        console.warn('Analytics tracking error:', error);
      }
    }
  }, []);

  const getAnalytics = useCallback(async (postId: string): Promise<AnalyticsData | null> => {
    try {
      const response = await fetch(`/api/blog/analytics?postId=${postId}`);
      
      if (!response.ok) {
        console.error('Failed to fetch analytics');
        return null;
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching analytics:', error);
      return null;
    }
  }, []);

  return {
    trackView,
    getAnalytics
  };
}

// Hook for tracking page views automatically
export function usePageView(postId: string | null) {
  const { trackView } = useAnalytics();

  useEffect(() => {
    if (postId) {
      // Track view after a short delay to ensure the page has loaded
      const timer = setTimeout(() => {
        trackView(postId);
      }, 1000);

      return () => clearTimeout(timer);
    }
  }, [postId, trackView]);
}