
'use client';
import {
  Users,
  Heart,
  MessageSquare,
  Eye,
  TrendingUp,
  ShieldCheck,
  MapPin,
  BarChart,
  DollarSign,
  Clock,
  Zap,
} from 'lucide-react';
import { ChartContainer, ChartTooltip, ChartTooltipContent, BarChart as RechartsBarChart } from '@/components/ui/chart';
import { Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer } from 'recharts';


const chartData = [
  { date: 'Mon', actions: 50, visits: 30, followers: 5 },
  { date: 'Tue', actions: 75, visits: 45, followers: 10 },
  { date: 'Wed', actions: 60, visits: 50, followers: 12 },
  { date: 'Thu', actions: 90, visits: 80, followers: 20 },
  { date: 'Fri', actions: 120, visits: 100, followers: 25 },
  { date: 'Sat', actions: 150, visits: 140, followers: 35 },
  { date: 'Sun', actions: 130, visits: 110, followers: 30 },
];

const chartConfig = {
  actions: {
    label: 'Luna Actions',
    color: 'hsl(var(--primary))',
  },
  visits: {
    label: 'Profile Visits',
    color: '#82ca9d',
  },
  followers: {
    label: 'New Followers',
    color: '#8884d8',
  },
};

const GlassCard = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div
    className={`bg-white/20 backdrop-blur-lg rounded-2xl border border-white/10 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl ${className}`}
  >
    {children}
  </div>
);

export function AnalyticsDashboard() {
  return (
    <div className="text-white max-w-screen-2xl mx-auto">
      {/* Navigation */}
      <nav className="bg-white/10 backdrop-blur-xl rounded-2xl p-2 mb-8 shadow-md">
        <ul className="flex items-center space-x-2">
          {['Overview', 'Profile Traffic', 'Engagement Details', 'Growth Impact', 'Growth Projections'].map((item, index) => (
            <li key={item}>
              <a
                href="#"
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  index === 0 ? 'bg-white/25 text-white' : 'text-white/70 hover:bg-white/10'
                }`}
              >
                {item}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      {/* Time Filters */}
      <div className="flex justify-center items-center space-x-2 mb-8">
        {['Week', 'Month', 'All Time'].map((item, index) => (
          <button
            key={item}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              index === 1 ? 'bg-primary/80 text-white' : 'bg-white/10 text-white/80 hover:bg-white/20'
            }`}
          >
            {item}
          </button>
        ))}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-12 gap-6">
        {/* Summary Cards */}
        <div className="col-span-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            <GlassCard className="p-5 flex flex-col items-center justify-center">
                <Eye className="w-8 h-8 text-white/80 mb-2"/>
                <div className="text-4xl font-bold text-white">0</div>
                <div className="text-sm text-white/70">Profile Visits</div>
                <div className="text-xs text-white/50 mt-1">Start a session</div>
            </GlassCard>
            <GlassCard className="p-5 flex flex-col items-center justify-center">
                <Users className="w-8 h-8 text-white/80 mb-2"/>
                <div className="text-4xl font-bold text-white">0</div>
                <div className="text-sm text-white/70">New Followers</div>
                <div className="text-xs text-white/50 mt-1">Start a session</div>
            </GlassCard>
            <GlassCard className="p-5 flex flex-col items-center justify-center">
                <Heart className="w-8 h-8 text-white/80 mb-2"/>
                <div className="text-4xl font-bold text-white">0</div>
                <div className="text-sm text-white/70">Likes Generated</div>
                <div className="text-xs text-white/50 mt-1">Start a session</div>
            </GlassCard>
            <GlassCard className="p-5 flex flex-col items-center justify-center">
                <MessageSquare className="w-8 h-8 text-white/80 mb-2"/>
                <div className="text-4xl font-bold text-white">0</div>
                <div className="text-sm text-white/70">Comments Left</div>
                <div className="text-xs text-white/50 mt-1">Start a session</div>
            </GlassCard>
        </div>

        {/* Weekly Performance */}
        <div className="col-span-12 lg:col-span-8">
            <GlassCard className="p-6 h-full">
            <h3 className="font-bold text-lg text-white mb-4">Weekly Performance</h3>
             <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                    <RechartsBarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 5 }} >
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.2)" />
                        <XAxis dataKey="date" stroke="rgba(255,255,255,0.7)" fontSize={12} />
                        <YAxis stroke="rgba(255,255,255,0.7)" fontSize={12} />
                        <RechartsTooltip 
                          contentStyle={{ 
                            background: 'rgba(30,41,59,0.8)', 
                            backdropFilter: 'blur(5px)',
                            border: '1px solid rgba(255,255,255,0.2)',
                            borderRadius: '1rem',
                            color: '#fff'
                          }}
                          cursor={{fill: 'rgba(255,255,255,0.1)'}}
                        />
                        <Legend wrapperStyle={{fontSize: "14px"}}/>
                        <Bar dataKey="actions" fill="hsl(var(--primary))" name="Luna Actions" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="visits" fill="#82ca9d" name="Profile Visits" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="followers" fill="#8884d8" name="New Followers" radius={[4, 4, 0, 0]} />
                    </RechartsBarChart>
                </ResponsiveContainer>
            </div>
            </GlassCard>
        </div>

        {/* Performance Score */}
        <div className="col-span-12 lg:col-span-4">
            <GlassCard className="p-6 h-full text-center">
            <h3 className="font-bold text-lg text-white mb-4">Luna Performance Score</h3>
            <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-pink-500 to-primary flex items-center justify-center text-4xl font-bold text-white shadow-lg mb-4">
                0
            </div>
            <p className="text-sm text-white/80">Luna is driving significant traffic to your profile</p>
            <div className="space-y-4 mt-4 text-left">
                {[
                { label: 'Profile Visit Efficiency', value: 92 },
                { label: 'Follower Conversion', value: 78 },
                { label: 'Engagement Reciprocity', value: 85 },
                ].map(item => (
                <div key={item.label}>
                    <div className="flex justify-between text-sm mb-1">
                    <span className="text-white/90">{item.label}</span>
                    <span className="font-semibold text-white">{item.value}%</span>
                    </div>
                    <div className="w-full bg-white/20 rounded-full h-2">
                    <div className="bg-gradient-to-r from-pink-500 to-primary h-2 rounded-full" style={{ width: `${item.value}%` }}></div>
                    </div>
                </div>
                ))}
            </div>
            </GlassCard>
        </div>
        
        {/* ROI Summary */}
        <div className="col-span-12 lg:col-span-4">
            <GlassCard className="p-6 h-full text-center flex flex-col justify-between">
                <div>
                    <h3 className="font-bold text-lg text-white mb-4">Luna ROI Summary</h3>
                    <div className="text-6xl font-bold bg-gradient-to-br from-pink-400 to-orange-400 text-transparent bg-clip-text">4.3x</div>
                    <p className="text-sm text-white/80 mt-2">Luna has significantly accelerated your account growth</p>
                </div>
                <div className="space-y-3 mt-6 text-left">
                    <div className="flex items-center justify-between text-sm"><Clock className="w-4 h-4 mr-2 text-green-300"/>Time Saved <span className="font-bold">18 hours/week</span></div>
                    <div className="flex items-center justify-between text-sm"><TrendingUp className="w-4 h-4 mr-2 text-green-300"/>Growth Multiplier <span className="font-bold">3.7x faster</span></div>
                    <div className="flex items-center justify-between text-sm"><Zap className="w-4 h-4 mr-2 text-green-300"/>Engagement Boost <span className="font-bold">4.2x higher</span></div>
                </div>
            </GlassCard>
        </div>
        
        {/* Content Engagement Map */}
        <div className="col-span-12 lg:col-span-8">
            <GlassCard className="p-6 h-full">
            <h3 className="font-bold text-lg text-white mb-2">Content Engagement Map</h3>
            <p className="text-sm text-white/70 mb-6">Most Engaging Content Types</p>
            <div className="space-y-5">
                {[
                    { label: 'Carousel Posts', value: 82 },
                    { label: 'Reels', value: 93 },
                    { label: 'Photo Posts', value: 68 },
                    { label: 'Stories', value: 45 },
                ].map(item => (
                <div key={item.label}>
                    <div className="flex justify-between text-sm mb-1">
                        <span className="text-white/90 font-medium">{item.label}</span>
                        <span className="font-semibold text-white">{item.value}%</span>
                    </div>
                    <div className="w-full bg-white/20 rounded-full h-2.5">
                        <div className="bg-gradient-to-r from-pink-500 to-primary h-2.5 rounded-full" style={{ width: `${item.value}%` }}></div>
                    </div>
                </div>
                ))}
            </div>
            </GlassCard>
        </div>

        {/* Traffic Sources & Demographics */}
        <div className="col-span-12 lg:col-span-8">
            <GlassCard className="p-6 h-full">
            <h3 className="font-bold text-lg text-white mb-4">Traffic Analysis</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-white/90 mb-4">Traffic Sources</h4>
                <div className="space-y-3">
                  {['Luna Likes', 'Luna Comments', 'Luna Follows', 'Organic Discovery'].map(source => (
                     <div key={source} className="flex justify-between items-center text-sm">
                        <div className="flex items-center">
                            <div className="w-2 h-2 rounded-full bg-primary mr-3"></div>
                            <span className="text-white/80">{source}</span>
                        </div>
                        <span className="font-bold text-white">0%</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-white/90 mb-4">Geographic Distribution</h4>
                <div className="space-y-4">
                 {[
                    { label: 'United States', value: 42 },
                    { label: 'United Kingdom', value: 18 },
                    { label: 'Canada', value: 15 },
                  ].map(item => (
                    <div key={item.label}>
                        <div className="flex justify-between text-sm mb-1">
                            <span className="text-white/80">{item.label}</span>
                            <span className="font-semibold text-white">{item.value}%</span>
                        </div>
                        <div className="w-full bg-white/20 rounded-full h-1.5">
                            <div className="bg-gradient-to-r from-pink-500 to-primary h-1.5 rounded-full" style={{ width: `${item.value}%` }}></div>
                        </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            </GlassCard>
        </div>

        {/* Safety Shield */}
         <div className="col-span-12 lg:col-span-4">
            <GlassCard className="p-6 h-full">
                <h3 className="font-bold text-lg text-white mb-4">Safety Shield</h3>
                <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                        <ShieldCheck className="w-7 h-7 text-white"/>
                    </div>
                    <div>
                        <div className="font-bold text-green-300">Overall Safety</div>
                        <div className="text-sm text-white/80">High Safety • 100%</div>
                    </div>
                </div>
                <div className="w-full bg-white/20 rounded-full h-2 my-4">
                    <div className="bg-gradient-to-r from-green-400 to-emerald-500 h-2 rounded-full" style={{ width: `100%` }}></div>
                </div>
                <p className="text-xs text-white/70 leading-relaxed mb-4">
                    Luna's Intelligent Safety Shield constantly monitors your automation settings to maintain a natural engagement pattern.
                </p>
                <div className="text-center bg-black/20 p-4 rounded-lg">
                    <h4 className="text-sm font-semibold text-white/90 mb-2">Best Time to Engage</h4>
                    <div className="text-2xl font-bold text-primary">6-8 PM</div>
                    <p className="text-xs text-white/60">Maximum profile traffic generation</p>
                </div>
            </GlassCard>
        </div>
      </div>
    </div>
  );
}
