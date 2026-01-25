'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, 
  Activity, 
  Globe, 
  Server, 
  Database, 
  Clock,
  ArrowRight,
  Cpu,
  AlertTriangle,
  CheckCircle as CheckCircleIcon
} from 'lucide-react';
import { UserInteraction } from '@/lib/interactionTracker';
import DashboardSkeleton from '@/components/DashboardSkeleton';

interface SystemHealth {
  status: string;
  cpu: {
    usage: number;
    count: number;
    model: string;
  };
  memory: {
    usage: number;
    total: number;
    free: number;
  };
  uptime: number;
  timestamp: string;
}

export default function RealTimeMonitoringPage() {
  const [events, setEvents] = useState<UserInteraction[]>([]);
  const [activeUsers, setActiveUsers] = useState(0);
  const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
  const [tps, setTps] = useState(0); 
  const [loading, setLoading] = useState(true);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected'>('connected');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const lastFetchRef = useRef<number>(Date.now());

  useEffect(() => {
    // Initial fetch
    const fetchLatest = async () => {
      try {
        // Fetch System Health
        const healthRes = await fetch('/api/system-health');
        if (healthRes.ok) {
          const healthData = await healthRes.json();
          setSystemHealth(healthData);
          setConnectionStatus('connected');
        } else {
          setConnectionStatus('disconnected');
        }

        // Fetch Interactions
        const response = await fetch('/api/user-interactions?limit=100');
        let data: UserInteraction[] = [];
        
        if (response.ok) {
          const json = await response.json();
          if (Array.isArray(json)) {
            data = json;
          } else if (json.interactions && Array.isArray(json.interactions)) {
            data = json.interactions;
          }
        }
        
        // Sort by timestamp desc
        const sorted = data.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
        setEvents(sorted.slice(0, 50)); // Keep last 50 events
        
        // Calculate "Active Users" (users seen in last 15 mins)
        const now = Date.now();
        const active = new Set(
          sorted.filter(e => now - new Date(e.timestamp).getTime() < 15 * 60 * 1000)
                .map(e => e.walletAddress)
                .filter(Boolean)
        ).size;
        setActiveUsers(active);

        // Calculate TPS (Events in last minute / 60)
        const eventsLastMinute = sorted.filter(e => now - new Date(e.timestamp).getTime() < 60 * 1000).length;
        setTps(parseFloat((eventsLastMinute / 60).toFixed(2)));

      } catch (error) {
        console.error('Error fetching live data:', error);
        setConnectionStatus('disconnected');
      } finally {
        setLoading(false);
      }
    };

    fetchLatest();

    // Polling every 2 seconds for more "real-time" feel
    const interval = setInterval(fetchLatest, 2000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <DashboardSkeleton />;
  }

  const totalPages = Math.ceil(events.length / itemsPerPage);
  const currentEvents = events.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const getSystemStatusColor = (status: string) => {
    switch (status) {
      case 'Operational': return 'text-[#81D7B4]';
      case 'High Load': return 'text-yellow-500';
      case 'Critical': return 'text-red-500';
      default: return 'text-slate-500';
    }
  };

  const getStatusIcon = (status: string) => {
    if (connectionStatus === 'disconnected') return <AlertTriangle className="w-4 h-4 mr-1" />;
    switch (status) {
      case 'Operational': return <CheckCircleIcon className="w-4 h-4 mr-1" />;
      case 'High Load': return <Activity className="w-4 h-4 mr-1" />;
      case 'Critical': return <AlertTriangle className="w-4 h-4 mr-1" />;
      default: return <Clock className="w-4 h-4 mr-1" />;
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 flex items-center gap-3">
            <span className="relative flex h-3 w-3 sm:h-4 sm:w-4">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${connectionStatus === 'connected' ? 'bg-[#81D7B4]' : 'bg-red-500'}`}></span>
              <span className={`relative inline-flex rounded-full h-3 w-3 sm:h-4 sm:w-4 ${connectionStatus === 'connected' ? 'bg-[#81D7B4]' : 'bg-red-500'}`}></span>
            </span>
            Live Monitor
          </h1>
          <p className="text-sm sm:text-base text-slate-500 mt-1">Real-time system activity and event stream.</p>
        </div>
        <div className="bg-slate-900 text-white px-3 py-2 sm:px-4 rounded-lg font-mono text-xs sm:text-sm flex items-center gap-2 self-start sm:self-auto w-full sm:w-auto justify-between sm:justify-start">
          {connectionStatus === 'connected' ? (
            <span className="text-[#81D7B4] text-xs">● Connected</span>
          ) : (
            <span className="text-red-500 text-xs">● Disconnected</span>
          )}
          <span className="border-l border-slate-700 pl-2 ml-2">
            {new Date().toLocaleTimeString()}
          </span>
        </div>
      </div>

      {/* Live Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
        {/* Active Users Card */}
        <div className="bg-slate-900 rounded-2xl p-4 sm:p-6 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Globe className="w-16 h-16 sm:w-24 sm:h-24" />
          </div>
          <div className="relative z-10">
            <h3 className="text-slate-400 font-medium mb-1 text-sm sm:text-base">Active Users (15m)</h3>
            <div className="text-3xl sm:text-4xl font-bold">{activeUsers}</div>
            <div className="mt-4 flex items-center text-[#81D7B4] text-xs sm:text-sm">
              <Activity className="w-4 h-4 mr-1" />
              Live counting
            </div>
          </div>
        </div>

        {/* System Load Card */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-100 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <Cpu className="w-16 h-16 sm:w-24 sm:h-24" />
          </div>
          <div className="relative z-10">
            <h3 className="text-slate-500 font-medium mb-1 text-sm sm:text-base">System Status</h3>
            <div className={`text-3xl sm:text-4xl font-bold ${connectionStatus === 'disconnected' ? 'text-red-500' : getSystemStatusColor(systemHealth?.status || 'Unknown')}`}>
              {connectionStatus === 'disconnected' ? 'Offline' : systemHealth?.status || 'Loading...'}
            </div>
            <div className="mt-4 flex flex-col gap-1 text-xs sm:text-sm">
              <div className={`flex items-center ${connectionStatus === 'disconnected' ? 'text-red-500' : getSystemStatusColor(systemHealth?.status || 'Unknown')}`}>
                {getStatusIcon(systemHealth?.status || 'Unknown')}
                {connectionStatus === 'disconnected' ? 'Connection lost' : 'System Operational'}
              </div>
              {systemHealth && (
                <div className="text-slate-400 text-xs font-mono mt-1">
                  CPU: {systemHealth.cpu.usage}% | MEM: {systemHealth.memory.usage}%
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Latest Event / TPS Card */}
        <div className="bg-white rounded-2xl p-4 sm:p-6 border border-gray-100 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <Server className="w-16 h-16 sm:w-24 sm:h-24" />
          </div>
          <div className="relative z-10">
            <h3 className="text-slate-500 font-medium mb-1 text-sm sm:text-base">Event Throughput</h3>
            <div className="text-3xl sm:text-4xl font-bold text-slate-900">
              {tps} <span className="text-base sm:text-lg text-slate-400 font-normal">events/sec</span>
            </div>
            <div className="mt-4 text-slate-400 text-xs sm:text-sm">
              Latest: {events[0] ? new Date(events[0].timestamp).toLocaleTimeString() : '--:--:--'}
            </div>
          </div>
        </div>
      </div>

      {/* Live Feed */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-gray-50/50">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <Activity className="w-5 h-5 text-[#81D7B4]" />
            Live Event Stream
          </h2>
          <span className="text-xs font-mono text-gray-500 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#81D7B4] animate-pulse"></span>
            Auto-refreshing (2s)
          </span>
        </div>
        
        <div className="max-h-[600px] overflow-y-auto p-3 sm:p-4 space-y-3 bg-slate-50/50">
          <AnimatePresence initial={false} mode="popLayout">
            {currentEvents.map((event) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
                className="bg-white p-3 sm:p-4 rounded-xl border border-gray-200 shadow-sm flex items-start sm:items-center gap-3 sm:gap-4"
              >
                <div className={`p-2 sm:p-3 rounded-full flex-shrink-0 ${
                  event.type.includes('error') ? 'bg-red-50 text-red-600' : 
                  'bg-[#81D7B4]/10 text-[#81D7B4]'
                }`}>
                  {event.type.includes('error') ? <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5" /> : <Zap className="w-4 h-4 sm:w-5 sm:h-5" />}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-1 gap-1">
                    <span className="font-bold text-slate-800 text-xs sm:text-sm uppercase tracking-wide">{event.type.replace(/_/g, ' ')}</span>
                    <span className="text-[10px] sm:text-xs font-mono text-gray-400">{new Date(event.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-xs text-slate-500 font-mono">
                    <span className="bg-gray-100 px-2 py-0.5 rounded text-slate-600 self-start">
                      {(event.walletAddress || 'Anonymous').slice(0, 6)}...{(event.walletAddress || 'Anonymous').slice(-4)}
                    </span>
                    <span className="hidden sm:inline text-gray-300">•</span>
                    <span className="truncate w-full sm:max-w-[300px] block text-gray-500">
                      {JSON.stringify(event.data).replace(/{|}|"/g, '').replace(/:/g, ': ')}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Pagination Controls */}
        <div className="p-4 border-t border-gray-100 bg-white flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-xs sm:text-sm text-slate-500 text-center sm:text-left">
            Showing <span className="font-medium text-slate-900">{(currentPage - 1) * itemsPerPage + 1}</span> to <span className="font-medium text-slate-900">{Math.min(currentPage * itemsPerPage, events.length)}</span> of <span className="font-medium text-slate-900">{events.length}</span> events
          </div>
          <div className="flex flex-wrap justify-center items-center gap-2">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-2 sm:py-1 text-sm font-medium text-slate-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                // Logic to show page numbers around current page
                let pageNum = i + 1;
                if (totalPages > 5) {
                  if (currentPage > 3) {
                    pageNum = currentPage - 2 + i;
                  }
                  if (pageNum > totalPages) {
                    pageNum = totalPages - 4 + i;
                  }
                }
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-8 h-8 sm:w-8 sm:h-8 flex items-center justify-center text-sm font-medium rounded-lg transition-colors ${
                      currentPage === pageNum
                        ? 'bg-[#81D7B4] text-white'
                        : 'text-slate-600 hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-2 sm:py-1 text-sm font-medium text-slate-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

