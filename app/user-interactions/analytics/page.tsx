'use client';

import { useState, useEffect } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { UserInteraction } from '@/lib/interactionTracker';
import { Activity, BarChart3, PieChart as PieIcon, TrendingUp } from 'lucide-react';
import DashboardSkeleton from '@/components/DashboardSkeleton';

export default function AnalyticsPage() {
  const [interactions, setInteractions] = useState<UserInteraction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInteractions = async () => {
      try {
        const response = await fetch('/api/user-interactions?limit=1000');
        const data = await response.json();
        setInteractions(data);
      } catch (error) {
        console.error('Error fetching interactions:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchInteractions();
  }, []);

  // Process data for charts
  const processTimelineData = () => {
    const grouped = interactions.reduce((acc, curr) => {
      const date = new Date(curr.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(grouped)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-30); // Last 30 days
  };

  const processActionData = () => {
    const grouped = interactions.reduce((acc, curr) => {
      const action = curr.type.replace(/_/g, ' ');
      acc[action] = (acc[action] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(grouped)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5); // Top 5 actions
  };

  const processHourlyData = () => {
    const hours = Array(24).fill(0);
    interactions.forEach(i => {
      const hour = new Date(i.timestamp).getHours();
      hours[hour]++;
    });

    return hours.map((count, hour) => ({
      hour: `${hour}:00`,
      count
    }));
  };

  const timelineData = processTimelineData();
  const actionData = processActionData();
  const hourlyData = processHourlyData();

  const COLORS = ['#81D7B4', '#5BBF99', '#2D7A5D', '#A8E6CF', '#D1F2E5'];

  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">User Analytics</h1>
        <p className="text-sm sm:text-base text-slate-500 mt-1">Deep dive into user behavior and platform trends.</p>
      </div>

      {/* Activity Timeline */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#81D7B4]" />
            Activity Timeline
          </h3>
        </div>
        <div className="h-64 sm:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={timelineData}>
              <defs>
                <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#81D7B4" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#81D7B4" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis 
                dataKey="date" 
                tick={{fontSize: 12, fill: '#64748b'}} 
                axisLine={false} 
                tickLine={false} 
                minTickGap={30}
              />
              <YAxis tick={{fontSize: 12, fill: '#64748b'}} axisLine={false} tickLine={false} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Area type="monotone" dataKey="count" stroke="#81D7B4" fillOpacity={1} fill="url(#colorCount)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        {/* Action Distribution */}
        <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <PieIcon className="w-5 h-5 text-[#81D7B4]" />
              Action Distribution
            </h3>
          </div>
          <div className="h-64 sm:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={actionData}
                  cx="50%"
                  cy="50%"
                  innerRadius="60%"
                  outerRadius="80%"
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                >
                  {actionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                   contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Hourly Activity Heatmap */}
        <div className="bg-white p-4 sm:p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <Activity className="w-5 h-5 text-[#81D7B4]" />
              Hourly Activity (UTC)
            </h3>
          </div>
          <div className="h-64 sm:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hourlyData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="hour" 
                  tick={{fontSize: 12, fill: '#64748b'}} 
                  axisLine={false} 
                  tickLine={false}
                  minTickGap={15}
                />
                <YAxis tick={{fontSize: 12, fill: '#64748b'}} axisLine={false} tickLine={false} />
                <Tooltip 
                   cursor={{ fill: '#f8fafc' }}
                   contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="count" fill="#81D7B4" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
