'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { 
  Loader2, 
  AlertCircle, 
  DollarSign, 
  Users, 
  Activity, 
  TrendingUp,
  RefreshCw,
  Clock
} from 'lucide-react';

// BizFi Brand Palette
const BIZFI_COLORS = {
  background: '#0F1825',
  cardBg: '#1A2538',
  primary: '#81D7B4',     // Mint Green (Brand Core)
  secondary: '#81D7B4CC', // 80% Opacity Mint (Brand Secondary)
  muted: '#81D7B480',     // 50% Opacity Mint (Brand Neutral)
  text: {
    primary: '#F9F9FB',
    secondary: '#9BA8B5',
    muted: '#7B8B9A'
  },
  // Strict Brand Status Colors
  status: {
    active: '#81D7B4',    // 100% Mint
    pending: '#81D7B4CC', // 80% Mint
    rejected: '#EF4444',  // Red (System Error)
    hold: '#81D7B480',    // 50% Mint
    default: '#81D7B44D'  // 30% Mint
  },
  // Strict Brand Tier Colors
  tier: {
    enterprise: '#81D7B4',   // 100% Mint
    premium: '#81D7B4CC',    // 80% Mint
    standard: '#81D7B480',   // 50% Mint
    default: '#81D7B44D'     // 30% Mint
  }
};

export default function BizFiAnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsRefreshing(true);
    setError('');
    try {
      const res = await fetch('/api/bizfi/admin/analytics');
      if (!res.ok) throw new Error('Failed to fetch analytics data');
      const json = await res.json();
      setData(json.metrics);
      setLastUpdated(new Date());
    } catch (err) {
      console.error(err);
      setError('Could not load analytics data. Please try again.');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleRefresh = () => {
    fetchData();
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <Loader2 
          className="w-10 h-10 animate-spin" 
          style={{ color: BIZFI_COLORS.primary }}
        />
        <p className="animate-pulse" style={{ color: BIZFI_COLORS.text.secondary }}>
          Loading analytics...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] space-y-4">
        <div 
          className="p-6 rounded-2xl flex flex-col items-center gap-3 max-w-md text-center border"
          style={{ 
            backgroundColor: `${BIZFI_COLORS.status.rejected}1A`,
            borderColor: `${BIZFI_COLORS.status.rejected}4D`,
            color: BIZFI_COLORS.status.rejected
          }}
        >
          <AlertCircle className="w-8 h-8" />
          <h3 className="text-lg font-bold">Error Loading Data</h3>
          <p className="text-sm opacity-80" style={{ color: BIZFI_COLORS.text.secondary }}>{error}</p>
          <button 
            onClick={handleRefresh}
            className="mt-4 px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
            style={{ 
              backgroundColor: `${BIZFI_COLORS.status.rejected}33`,
              color: BIZFI_COLORS.status.rejected
            }}
          >
            <RefreshCw className="w-4 h-4" />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Data Preparation with Fallbacks
  const revenueData = data?.revenueTrend?.map((d: any) => ({
    name: format(new Date(d._id), 'MMM dd'),
    value: d.totalRevenue
  })) || [];

  const activityData = data?.userActivity?.map((d: any) => ({
    name: format(new Date(d._id), 'MMM dd'),
    value: d.activeUsers
  })) || [];

  const statusData = data?.statusDistribution?.map((d: any) => ({
    name: d._id || 'Unknown',
    value: d.count
  })) || [];

  const tierData = data?.tierDistribution?.map((d: any) => ({
    name: d._id || 'Unknown',
    value: d.count
  })) || [];

  // Summary Calculations
  const arpu = data?.totalBusinesses > 0 
    ? (data.totalRevenue / data.totalBusinesses).toFixed(2) 
    : '0.00';

  const activeRate = data?.totalBusinesses > 0
    ? ((data.activeBusinesses / data.totalBusinesses) * 100).toFixed(1)
    : '0.0';

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#F9F9FB]">Analytics Dashboard</h1>
          <p className="text-[#9BA8B5]">Real-time platform performance insights</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          {lastUpdated && (
            <div className="flex items-center gap-2 text-sm text-[#7B8B9A] bg-[#1A2538]/50 px-3 py-1.5 rounded-lg border border-[#7B8B9A]/10">
              <Clock className="w-4 h-4" />
              <span>Updated {format(lastUpdated, 'h:mm a')}</span>
            </div>
          )}
          <button 
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-2 bg-[#81D7B4]/10 hover:bg-[#81D7B4]/20 text-[#81D7B4] rounded-lg border border-[#81D7B4]/20 transition-all disabled:opacity-50"
            title="Refresh Data"
          >
            <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <SummaryCard 
          title="Total Revenue (Est.)" 
          value={`$${data?.totalRevenue?.toLocaleString() || 0}`}
          icon={DollarSign}
          color={BIZFI_COLORS.primary}
        />
        <SummaryCard 
          title="Total Businesses" 
          value={data?.totalBusinesses?.toLocaleString() || 0}
          icon={Users}
          color={BIZFI_COLORS.secondary}
        />
        <SummaryCard 
          title="Active Rate" 
          value={`${activeRate}%`}
          icon={Activity}
          color={BIZFI_COLORS.primary}
        />
        <SummaryCard 
          title="Avg. Revenue/User" 
          value={`$${arpu}`}
          icon={TrendingUp}
          color={BIZFI_COLORS.secondary}
        />
      </div>

      {/* Charts Row 1: Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <ChartCard title="Revenue Trend (Est.)">
          {revenueData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke={BIZFI_COLORS.text.muted} strokeOpacity={0.1} vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke={BIZFI_COLORS.text.muted} 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                  tickMargin={10}
                />
                <YAxis 
                  stroke={BIZFI_COLORS.text.muted} 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                  tickFormatter={(value) => `$${value}`}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: BIZFI_COLORS.cardBg, 
                    border: `1px solid ${BIZFI_COLORS.text.muted}33`, 
                    borderRadius: '12px', 
                    color: BIZFI_COLORS.text.primary,
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                  }}
                  itemStyle={{ color: BIZFI_COLORS.primary }}
                  formatter={(value: any) => [`$${value}`, 'Revenue']}
                />
                <Line 
                  type="monotone" 
                  dataKey="value" 
                  stroke={BIZFI_COLORS.primary} 
                  strokeWidth={3} 
                  dot={{ fill: BIZFI_COLORS.primary, r: 4, strokeWidth: 0 }} 
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState message="No revenue data available yet" />
          )}
        </ChartCard>

        <ChartCard title="User Activity (New Businesses)">
          {activityData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={activityData}>
                <CartesianGrid strokeDasharray="3 3" stroke={BIZFI_COLORS.text.muted} strokeOpacity={0.1} vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke={BIZFI_COLORS.text.muted} 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false}
                  tickMargin={10}
                />
                <YAxis 
                  stroke={BIZFI_COLORS.text.muted} 
                  fontSize={12} 
                  tickLine={false} 
                  axisLine={false} 
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: BIZFI_COLORS.cardBg, 
                    border: `1px solid ${BIZFI_COLORS.text.muted}33`, 
                    borderRadius: '12px', 
                    color: BIZFI_COLORS.text.primary,
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                  }}
                  cursor={{ fill: `${BIZFI_COLORS.secondary}1A` }}
                  itemStyle={{ color: BIZFI_COLORS.secondary }}
                  formatter={(value: any) => [value, 'New Businesses']}
                />
                <Bar 
                  dataKey="value" 
                  fill={BIZFI_COLORS.secondary} 
                  radius={[4, 4, 0, 0]} 
                  maxBarSize={50}
                />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState message="No activity data available yet" />
          )}
        </ChartCard>
      </div>

      {/* Charts Row 2: Distributions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <ChartCard title="Business Status Distribution">
          {statusData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {statusData.map((entry: any, index: number) => {
                    const statusKey = entry.name.toLowerCase() as keyof typeof BIZFI_COLORS.status;
                    const color = BIZFI_COLORS.status[statusKey] || BIZFI_COLORS.status.default;
                    return <Cell key={`cell-${index}`} fill={color} />;
                  })}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: BIZFI_COLORS.cardBg, 
                    border: `1px solid ${BIZFI_COLORS.text.muted}33`, 
                    borderRadius: '12px', 
                    color: BIZFI_COLORS.text.primary 
                  }}
                  itemStyle={{ color: BIZFI_COLORS.text.primary }}
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={36} 
                  iconType="circle" 
                  formatter={(value) => <span style={{ color: BIZFI_COLORS.text.secondary }}>{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState message="No status data available" />
          )}
        </ChartCard>

        <ChartCard title="Subscription Tier Distribution">
          {tierData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={tierData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={120}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {tierData.map((entry: any, index: number) => {
                    const tierKey = entry.name.toLowerCase() as keyof typeof BIZFI_COLORS.tier;
                    const color = BIZFI_COLORS.tier[tierKey] || BIZFI_COLORS.tier.default;
                    return <Cell key={`cell-${index}`} fill={color} />;
                  })}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: BIZFI_COLORS.cardBg, 
                    border: `1px solid ${BIZFI_COLORS.text.muted}33`, 
                    borderRadius: '12px', 
                    color: BIZFI_COLORS.text.primary 
                  }}
                  itemStyle={{ color: BIZFI_COLORS.text.primary }}
                />
                <Legend 
                  verticalAlign="bottom" 
                  height={36} 
                  iconType="circle" 
                  formatter={(value) => <span style={{ color: BIZFI_COLORS.text.secondary }}>{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <EmptyState message="No tier data available" />
          )}
        </ChartCard>
      </div>
    </motion.div>
  );
}

// Sub-components for cleaner code
function SummaryCard({ title, value, icon: Icon, color }: { title: string, value: string | number, icon: any, color: string }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className="bg-[#1A2538]/50 backdrop-blur-sm p-6 rounded-2xl border transition-all duration-300 flex items-center gap-4"
      style={{
        borderColor: isHovered ? `${color}4D` : '#7B8B9A1A', // 4D is 30% opacity
        boxShadow: isHovered ? `0 4px 20px -5px ${color}26` : 'none' // 26 is 15% opacity
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div 
        className="p-4 rounded-xl flex items-center justify-center transition-colors duration-300"
        style={{ backgroundColor: `${color}1A`, color: color }}
      >
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-sm text-[#9BA8B5] mb-1">{title}</p>
        <p className="text-2xl font-bold text-[#F9F9FB] tracking-tight">{value}</p>
      </div>
    </div>
  );
}

function ChartCard({ title, children }: { title: string, children: React.ReactNode }) {
  return (
    <div className="bg-[#1A2538]/50 backdrop-blur-sm p-6 rounded-2xl border border-[#7B8B9A]/10 flex flex-col h-[400px]">
      <h3 className="text-lg font-bold text-[#F9F9FB] mb-6">{title}</h3>
      <div className="flex-1 w-full min-h-0">
        {children}
      </div>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-[#9BA8B5] space-y-2">
      <div className="p-3 bg-[#7B8B9A]/10 rounded-full">
        <Activity className="w-6 h-6 opacity-50" />
      </div>
      <p>{message}</p>
    </div>
  );
}
