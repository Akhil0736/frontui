
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Eye, 
  MessageCircle, 
  Heart, 
  Calendar,
  Filter,
  Download,
  Settings,
  Search,
  BarChart3,
  DollarSign,
  Target,
  Clock,
  Star,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal
} from 'lucide-react';
import {
  AreaChart,
  Area,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  LineChart,
  Line
} from "recharts";

interface MetricCardProps {
  title: string;
  value: string | number;
  change: number;
  icon: React.ReactNode;
  trend: 'up' | 'down';
  color: string;
}

interface TrafficSource {
  source: string;
  visitors: number;
  percentage: number;
  growth: string;
  conversionRate: number;
}

interface SessionData {
  date: string;
  duration: string;
  likes: number;
  comments: number;
  follows: number;
  profileVisits: number;
}

interface GrowthProjection {
  month: string;
  followers: number;
  revenue: number;
  engagement: number;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, change, icon, trend, color }) => (
  <div className="relative overflow-hidden rounded-2xl bg-white/80 dark:bg-slate-800/80 backdrop-blur-xl border border-white/20 dark:border-slate-700/50 p-6 shadow-lg hover:shadow-xl transition-all duration-300 group">
    <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent pointer-events-none" />
    <div className="relative z-10">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl bg-gradient-to-br ${color} shadow-lg`}>
          {icon}
        </div>
        <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
          trend === 'up' 
            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' 
            : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
        }`}>
          {trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
          {Math.abs(change)}%
        </div>
      </div>
      <div className="space-y-1">
        <p className="text-2xl font-bold text-slate-900 dark:text-white">{value}</p>
        <p className="text-sm text-slate-600 dark:text-slate-400">{title}</p>
      </div>
    </div>
  </div>
);

const LunaAnalyticsDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [dateRange, setDateRange] = useState('7d');
  const [isLoading, setIsLoading] = useState(false);

  const growthData = useMemo(() => [
    { name: 'Jan', followers: 1200, revenue: 580, engagement: 4.2 },
    { name: 'Feb', followers: 1890, revenue: 890, engagement: 5.1 },
    { name: 'Mar', followers: 2400, revenue: 1200, engagement: 6.8 },
    { name: 'Apr', followers: 3200, revenue: 1580, engagement: 7.2 },
    { name: 'May', followers: 4100, revenue: 2100, engagement: 8.5 },
    { name: 'Jun', followers: 5200, revenue: 2700, engagement: 9.1 },
  ], []);

  const trafficSources: TrafficSource[] = useMemo(() => [
    { source: 'Luna AI Posts', visitors: 2847, percentage: 78, growth: '+23%', conversionRate: 5.2 },
    { source: 'Organic Search', visitors: 1203, percentage: 15, growth: '+12%', conversionRate: 3.8 },
    { source: 'Direct Traffic', visitors: 456, percentage: 5, growth: '+8%', conversionRate: 7.1 },
    { source: 'Social Media', visitors: 234, percentage: 2, growth: '+15%', conversionRate: 2.9 },
  ], []);

  const sessionHistory: SessionData[] = useMemo(() => [
    { date: '2024-01-15', duration: '2h 34m', likes: 127, comments: 43, follows: 18, profileVisits: 89 },
    { date: '2024-01-14', duration: '1h 52m', likes: 98, comments: 31, follows: 12, profileVisits: 67 },
    { date: '2024-01-13', duration: '3h 12m', likes: 156, comments: 52, follows: 24, profileVisits: 112 },
    { date: '2024-01-12', duration: '2h 18m', likes: 134, comments: 38, follows: 16, profileVisits: 78 },
    { date: '2024-01-11', duration: '1h 45m', likes: 89, comments: 29, follows: 11, profileVisits: 56 },
  ], []);

  const metrics = useMemo(() => [
    {
      title: 'Profile Visits',
      value: '12,847',
      change: 23.5,
      icon: <Eye className="w-5 h-5 text-white" />,
      trend: 'up' as const,
      color: 'from-[#f62369] to-pink-500'
    },
    {
      title: 'New Followers',
      value: '2,394',
      change: 78.2,
      icon: <Users className="w-5 h-5 text-white" />,
      trend: 'up' as const,
      color: 'from-blue-500 to-cyan-500'
    },
    {
      title: 'Engagement Rate',
      value: '8.7%',
      change: 12.3,
      icon: <Heart className="w-5 h-5 text-white" />,
      trend: 'up' as const,
      color: 'from-purple-500 to-indigo-500'
    },
    {
      title: 'Revenue Projection',
      value: '$2,700',
      change: 45.8,
      icon: <DollarSign className="w-5 h-5 text-white" />,
      trend: 'up' as const,
      color: 'from-emerald-500 to-green-500'
    },
    {
      title: 'Conversion Rate',
      value: '5.2%',
      change: 8.9,
      icon: <Target className="w-5 h-5 text-white" />,
      trend: 'up' as const,
      color: 'from-orange-500 to-red-500'
    }
  ], []);

  const tabs = [
    { id: 'overview', label: 'Performance Overview', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'traffic', label: 'Traffic Attribution', icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'growth', label: 'Growth Projections', icon: <Target className="w-4 h-4" /> },
    { id: 'sessions', label: 'Session History', icon: <Clock className="w-4 h-4" /> },
    { id: 'audience', label: 'Audience Insights', icon: <Users className="w-4 h-4" /> }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-background/80 border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#f62369] to-pink-500 flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-lg">L</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-foreground">Luna Analytics</h1>
                  <p className="text-sm text-muted-foreground">AI-Powered Instagram Automation</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search metrics..."
                  className="pl-10 pr-4 py-2 bg-background/50 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 backdrop-blur-sm"
                />
              </div>
              
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="px-4 py-2 bg-background/50 border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 backdrop-blur-sm"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
              </select>
              
              <button className="p-2 bg-background/50 border border-border rounded-xl hover:bg-accent/50 transition-colors backdrop-blur-sm">
                <Settings className="w-4 h-4 text-muted-foreground" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 p-1 bg-background/50 rounded-2xl backdrop-blur-sm border border-border">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-gradient-to-r from-[#f62369] to-pink-500 text-white shadow-lg'
                    : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground'
                }`}
              >
                {tab.icon}
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Performance Overview */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              {metrics.map((metric, index) => (
                <MetricCard key={index} {...metric} />
              ))}
            </div>

            {/* Key Insights */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="rounded-2xl bg-card/80 backdrop-blur-xl border border-border p-6 shadow-lg">
                <h3 className="text-lg font-semibold text-foreground mb-4">Engagement Multipliers</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-xl">
                    <div className="flex items-center gap-3">
                      <Heart className="w-5 h-5 text-blue-400" />
                      <span className="text-sm font-medium text-foreground">Likes → Profile Visits</span>
                    </div>
                    <span className="text-lg font-bold text-blue-400">5.2x</span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-500/10 to-indigo-500/10 rounded-xl">
                    <div className="flex items-center gap-3">
                      <MessageCircle className="w-5 h-5 text-purple-400" />
                      <span className="text-sm font-medium text-foreground">Comments → Profile Visits</span>
                    </div>
                    <span className="text-lg font-bold text-purple-400">7.8x</span>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl bg-card/80 backdrop-blur-xl border border-border p-6 shadow-lg">
                <h3 className="text-lg font-semibold text-foreground mb-4">Luna Attribution</h3>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-[#f62369] mb-2">78%</div>
                    <p className="text-sm text-muted-foreground">of new followers attributed to Luna AI</p>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-[#f62369] to-pink-500 rounded-full" style={{ width: '78%' }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Traffic Attribution */}
        {activeTab === 'traffic' && (
          <div className="space-y-6">
            <div className="rounded-2xl bg-card/80 backdrop-blur-xl border border-border p-6 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-foreground">Traffic Sources</h3>
                <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#f62369] to-pink-500 text-white rounded-xl text-sm font-medium hover:shadow-lg transition-all">
                  <Download className="w-4 h-4" />
                  Export
                </button>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 text-sm font-medium text-muted-foreground">Source</th>
                      <th className="text-right py-3 text-sm font-medium text-muted-foreground">Visitors</th>
                      <th className="text-right py-3 text-sm font-medium text-muted-foreground">Percentage</th>
                      <th className="text-right py-3 text-sm font-medium text-muted-foreground">Growth</th>
                      <th className="text-right py-3 text-sm font-medium text-muted-foreground">Conversion</th>
                    </tr>
                  </thead>
                  <tbody>
                    {trafficSources.map((source, index) => (
                      <tr key={index} className="border-b border-border/50">
                        <td className="py-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-3 h-3 rounded-full ${
                              index === 0 ? 'bg-[#f62369]' : 
                              index === 1 ? 'bg-blue-500' : 
                              index === 2 ? 'bg-emerald-500' : 'bg-purple-500'
                            }`} />
                            <span className="font-medium text-foreground">{source.source}</span>
                          </div>
                        </td>
                        <td className="text-right py-4 font-medium text-foreground">
                          {source.visitors.toLocaleString()}
                        </td>
                        <td className="text-right py-4">
                          <div className="flex items-center justify-end gap-2">
                            <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full ${
                                  index === 0 ? 'bg-[#f62369]' : 
                                  index === 1 ? 'bg-blue-500' : 
                                  index === 2 ? 'bg-emerald-500' : 'bg-purple-500'
                                }`}
                                style={{ width: `${source.percentage}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium text-muted-foreground w-8">
                              {source.percentage}%
                            </span>
                          </div>
                        </td>
                        <td className="text-right py-4">
                          <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">
                            {source.growth}
                          </span>
                        </td>
                        <td className="text-right py-4">
                          <span className="text-sm font-medium text-foreground">
                            {source.conversionRate}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Growth Projections */}
        {activeTab === 'growth' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="rounded-2xl bg-card/80 backdrop-blur-xl border border-border p-6 shadow-lg">
                <h3 className="text-lg font-semibold text-foreground mb-6">3-Month Growth Forecast</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={growthData}>
                      <defs>
                        <linearGradient id="followersGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f62369" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#f62369" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="name" axisLine={false} tickLine={false} className="text-xs" />
                      <YAxis axisLine={false} tickLine={false} className="text-xs" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'var(--color-card-foreground)', 
                          border: 'none', 
                          borderRadius: '12px',
                          backdropFilter: 'blur(10px)'
                        }} 
                      />
                      <Area
                        type="monotone"
                        dataKey="followers"
                        stroke="#f62369"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#followersGradient)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="rounded-2xl bg-card/80 backdrop-blur-xl border border-border p-6 shadow-lg">
                <h3 className="text-lg font-semibold text-foreground mb-6">Revenue Projections</h3>
                <div className="space-y-4">
                  <div className="p-4 bg-gradient-to-r from-emerald-500/10 to-green-500/10 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-foreground">Month 1</span>
                      <span className="text-lg font-bold text-emerald-400">$580</span>
                    </div>
                    <div className="text-xs text-muted-foreground">Conservative estimate</div>
                  </div>
                  <div className="p-4 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-foreground">Month 2</span>
                      <span className="text-lg font-bold text-blue-400">$1,200</span>
                    </div>
                    <div className="text-xs text-muted-foreground">Expected growth</div>
                  </div>
                  <div className="p-4 bg-gradient-to-r from-pink-500/10 to-pink-500/10 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-foreground">Month 3</span>
                      <span className="text-lg font-bold text-[#f62369]">$2,700</span>
                    </div>
                    <div className="text-xs text-muted-foreground">Optimistic projection</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Session History */}
        {activeTab === 'sessions' && (
          <div className="space-y-6">
            <div className="rounded-2xl bg-card/80 backdrop-blur-xl border border-border p-6 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-foreground">Automation Sessions</h3>
                <div className="flex items-center gap-2">
                  <button className="p-2 bg-muted rounded-lg hover:bg-accent transition-colors">
                    <Filter className="w-4 h-4 text-muted-foreground" />
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#f62369] to-pink-500 text-white rounded-xl text-sm font-medium hover:shadow-lg transition-all">
                    <Download className="w-4 h-4" />
                    Export
                  </button>
                </div>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 text-sm font-medium text-muted-foreground">Date</th>
                      <th className="text-right py-3 text-sm font-medium text-muted-foreground">Duration</th>
                      <th className="text-right py-3 text-sm font-medium text-muted-foreground">Likes</th>
                      <th className="text-right py-3 text-sm font-medium text-muted-foreground">Comments</th>
                      <th className="text-right py-3 text-sm font-medium text-muted-foreground">Follows</th>
                      <th className="text-right py-3 text-sm font-medium text-muted-foreground">Profile Visits</th>
                      <th className="text-right py-3 text-sm font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sessionHistory.map((session, index) => (
                      <tr key={index} className="border-b border-border/50 hover:bg-accent/50 transition-colors">
                        <td className="py-4 font-medium text-foreground">
                          {new Date(session.date).toLocaleDateString()}
                        </td>
                        <td className="text-right py-4 text-muted-foreground">
                          {session.duration}
                        </td>
                        <td className="text-right py-4 font-medium text-foreground">
                          {session.likes}
                        </td>
                        <td className="text-right py-4 font-medium text-foreground">
                          {session.comments}
                        </td>
                        <td className="text-right py-4 font-medium text-foreground">
                          {session.follows}
                        </td>
                        <td className="text-right py-4 font-medium text-foreground">
                          {session.profileVisits}
                        </td>
                        <td className="text-right py-4">
                          <button className="p-1 hover:bg-accent rounded transition-colors">
                            <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Audience Insights */}
        {activeTab === 'audience' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="rounded-2xl bg-card/80 backdrop-blur-xl border border-border p-6 shadow-lg">
                <h3 className="text-lg font-semibold text-foreground mb-6">Demographics</h3>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Age 18-24</span>
                      <span className="text-sm font-medium text-foreground">35%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-[#f62369] to-pink-500 rounded-full" style={{ width: '35%' }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Age 25-34</span>
                      <span className="text-sm font-medium text-foreground">42%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full" style={{ width: '42%' }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Age 35+</span>
                      <span className="text-sm font-medium text-foreground">23%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full" style={{ width: '23%' }} />
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl bg-card/80 backdrop-blur-xl border border-border p-6 shadow-lg">
                <h3 className="text-lg font-semibold text-foreground mb-6">Top Locations</h3>
                <div className="space-y-3">
                  {[
                    { country: 'United States', percentage: 45 },
                    { country: 'United Kingdom', percentage: 18 },
                    { country: 'Canada', percentage: 12 },
                    { country: 'Australia', percentage: 8 },
                    { country: 'Germany', percentage: 7 }
                  ].map((location, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-xl">
                      <span className="text-sm font-medium text-foreground">{location.country}</span>
                      <span className="text-sm font-bold text-foreground">{location.percentage}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LunaAnalyticsDashboard;
