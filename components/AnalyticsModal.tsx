'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Eye, Clock, Users, BarChart3 } from 'lucide-react';
import { useAnalytics } from '@/hooks/useAnalytics';

interface AnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  postId: string;
  postTitle?: string;
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

export default function AnalyticsModal({ isOpen, onClose, postId, postTitle }: AnalyticsModalProps) {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const { getAnalytics } = useAnalytics();

  useEffect(() => {
    if (isOpen && postId) {
      fetchAnalytics();
    }
  }, [isOpen, postId]);

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const getTabData = () => {
    if (!analytics) return [];
    
    switch (activeTab) {
      case 'daily':
        return analytics.analytics.dailyViews.slice(-7); // Last 7 days
      case 'weekly':
        return analytics.analytics.weeklyViews.slice(-4); // Last 4 weeks
      case 'monthly':
        return analytics.analytics.monthlyViews.slice(-6); // Last 6 months
      default:
        return [];
    }
  };

  const getMaxViews = () => {
    const data = getTabData();
    return Math.max(...data.map(item => item.views), 1);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-[#81D7B4] to-[#66C4A3] p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-1">📊 Post Analytics</h2>
                <p className="text-white/90 text-sm">
                  {analytics?.title || postTitle || 'Loading...'}
                </p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#81D7B4]"></div>
              </div>
            ) : analytics ? (
              <div className="space-y-6">
                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-blue-600">Total Views</p>
                        <p className="text-2xl font-bold text-blue-800">{analytics.viewCount}</p>
                      </div>
                      <Eye className="w-8 h-8 text-blue-500" />
                    </div>
                  </div>
                  
                  <div className="bg-green-50 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-green-600">Unique Views</p>
                        <p className="text-2xl font-bold text-green-800">{analytics.uniqueViews}</p>
                      </div>
                      <Users className="w-8 h-8 text-green-500" />
                    </div>
                  </div>
                  
                  <div className="bg-purple-50 rounded-xl p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-purple-600">Last Viewed</p>
                        <p className="text-sm font-bold text-purple-800">
                          {analytics.lastViewedAt 
                            ? new Date(analytics.lastViewedAt).toLocaleDateString()
                            : 'Never'
                          }
                        </p>
                      </div>
                      <Clock className="w-8 h-8 text-purple-500" />
                    </div>
                  </div>
                </div>

                {/* Chart Section */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                      <BarChart3 className="w-5 h-5" />
                      Views Over Time
                    </h3>
                    
                    {/* Tab Buttons */}
                    <div className="flex bg-white rounded-lg p-1 shadow-sm">
                      {(['daily', 'weekly', 'monthly'] as const).map((tab) => (
                        <button
                          key={tab}
                          onClick={() => setActiveTab(tab)}
                          className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                            activeTab === tab
                              ? 'bg-[#81D7B4] text-white'
                              : 'text-gray-600 hover:text-gray-800'
                          }`}
                        >
                          {tab.charAt(0).toUpperCase() + tab.slice(1)}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Simple Bar Chart */}
                  <div className="space-y-3">
                    {getTabData().map((item, index) => {
                      const percentage = (item.views / getMaxViews()) * 100;
                      return (
                        <div key={index} className="flex items-center gap-3">
                          <div className="w-16 text-xs text-gray-600 text-right">
                            {activeTab === 'daily' ? formatDate((item as { date: string; views: number }).date) :
                             activeTab === 'weekly' ? `Week ${(item as { week: string; views: number }).week}` :
                             (item as { month: string; views: number }).month}
                          </div>
                          <div className="flex-1 bg-gray-200 rounded-full h-6 relative">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${percentage}%` }}
                              transition={{ duration: 0.5, delay: index * 0.1 }}
                              className="bg-gradient-to-r from-[#81D7B4] to-[#66C4A3] h-full rounded-full flex items-center justify-end pr-2"
                            >
                              {item.views > 0 && (
                                <span className="text-xs font-medium text-white">
                                  {item.views}
                                </span>
                              )}
                            </motion.div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  {getTabData().length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <BarChart3 className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p>No data available for this period</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="text-4xl mb-4">📊</div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">No Analytics Data</h3>
                <p className="text-gray-500">Unable to load analytics for this post.</p>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}