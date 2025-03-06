'use client';

import { useState, useEffect } from 'react';
import { 
  BarChart, 
  LineChart, 
  PieChart, 
  Users, 
  Clock, 
  BookOpen, 
  TrendingUp, 
  Activity, 
  Calendar, 
  ArrowUpRight, 
  ArrowDownRight, 
  Filter, 
  Download,
  Lightbulb
} from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';

// Import our custom components
import LearningInsights from './components/LearningInsights';

// Type definitions for our analytics data
interface AnalyticsSummary {
  totalUsers: number;
  activeUsers: number;
  totalCourseViews: number;
  avgEngagementTime: number;
  userGrowthRate: number;
  completionRate: number;
}

interface DataPoint {
  date: string;
  value: number;
}

interface AnalyticsData {
  summary: AnalyticsSummary;
  userGrowth: DataPoint[];
  engagementByDay: DataPoint[];
  coursePopularity: { name: string; views: number; completions: number }[];
  userActivity: { time: string; active: number }[];
  demographics: { label: string; value: number }[];
}

// Mock data for display purposes
const mockAnalyticsData: AnalyticsData = {
  summary: {
    totalUsers: 15842,
    activeUsers: 8976,
    totalCourseViews: 42367,
    avgEngagementTime: 23.4,
    userGrowthRate: 7.8,
    completionRate: 68.2
  },
  userGrowth: [
    { date: 'Jan', value: 2100 },
    { date: 'Feb', value: 2300 },
    { date: 'Mar', value: 2500 },
    { date: 'Apr', value: 2800 },
    { date: 'May', value: 3200 },
    { date: 'Jun', value: 3800 },
    { date: 'Jul', value: 4500 },
  ],
  engagementByDay: [
    { date: 'Mon', value: 75 },
    { date: 'Tue', value: 68 },
    { date: 'Wed', value: 82 },
    { date: 'Thu', value: 85 },
    { date: 'Fri', value: 72 },
    { date: 'Sat', value: 91 },
    { date: 'Sun', value: 87 },
  ],
  coursePopularity: [
    { name: 'Genesis', views: 12432, completions: 8563 },
    { name: 'Exodus & Liberation', views: 10238, completions: 6927 },
    { name: 'Wisdom Literature', views: 8765, completions: 5842 },
    { name: 'Prophetic Vision', views: 6542, completions: 4319 },
    { name: 'Early Church', views: 4390, completions: 2861 },
  ],
  userActivity: [
    { time: '6am', active: 320 },
    { time: '9am', active: 1240 },
    { time: '12pm', active: 2180 },
    { time: '3pm', active: 2350 },
    { time: '6pm', active: 3100 },
    { time: '9pm', active: 2700 },
    { time: '12am', active: 1020 },
  ],
  demographics: [
    { label: '25-34', value: 32 },
    { label: '35-44', value: 28 },
    { label: '45-54', value: 19 },
    { label: '55+', value: 14 },
    { label: '18-24', value: 7 },
  ]
};

// Stat Card Component for summary metrics
const StatCard = ({ 
  title, 
  value, 
  change, 
  icon: Icon, 
  trend = 'neutral',
  prefix = '',
  suffix = ''
}: { 
  title: string; 
  value: number | string; 
  change?: number; 
  icon: React.ElementType; 
  trend?: 'up' | 'down' | 'neutral';
  prefix?: string;
  suffix?: string;
}) => {
  const trendColor = trend === 'up' 
    ? 'text-[#5E8C73]' 
    : trend === 'down' 
      ? 'text-[#8F5849]' 
      : 'text-[#706C66]';

  const TrendIcon = trend === 'up' 
    ? ArrowUpRight 
    : trend === 'down' 
      ? ArrowDownRight 
      : Activity;

  const formattedValue = typeof value === 'number' 
    ? value >= 1000 
      ? `${prefix}${Math.floor(value / 1000)}${suffix ? suffix : 'k'}` 
      : `${prefix}${value}${suffix}` 
    : `${prefix}${value}${suffix}`;

  return (
    <div className="bg-white rounded-lg border border-[#E8E6E1] p-5 h-full shadow-sm hover:shadow-md transition-shadow duration-300">
      <div className="flex justify-between items-start mb-2">
        <div className="text-[#706C66] text-sm font-medium">{title}</div>
        <div className="p-2 rounded-full bg-[#F8F7F2]">
          <Icon className="h-4 w-4 text-[#4A7B61]" />
        </div>
      </div>
      <div className="text-[#2C2925] text-2xl sm:text-3xl font-medium tracking-tight mt-2">
        {formattedValue}
      </div>
      {change !== undefined && (
        <div className={`flex items-center mt-3 text-sm ${trendColor}`}>
          <TrendIcon className="h-3.5 w-3.5 mr-1" />
          <span>{Math.abs(change)}% {trend !== 'neutral' ? trend : ''}</span>
        </div>
      )}
    </div>
  );
};

// Chart components
const SimpleBarChart = ({ data, title, description }: { data: any[]; title: string; description?: string }) => {
  // Calculate the max value for scaling
  const maxValue = Math.max(...data.map(item => item.value)) * 1.1;
  
  return (
    <div className="bg-white rounded-lg border border-[#E8E6E1] p-5 h-full shadow-sm hover:shadow-md transition-shadow duration-300">
      <div className="flex flex-col mb-4">
        <h3 className="text-[#2C2925] text-lg font-medium">{title}</h3>
        {description && <p className="text-[#706C66] text-sm mt-1">{description}</p>}
      </div>
      <div className="h-[200px] mt-2 flex items-end justify-between">
        {data.map((item, index) => (
          <div key={index} className="flex flex-col items-center justify-end h-full">
            <div 
              className="w-8 sm:w-12 bg-[#4A7B61] hover:bg-[#3D644E] rounded-t-sm transition-all duration-300" 
              style={{ 
                height: `${(item.value / maxValue) * 100}%`,
                opacity: 0.7 + (index % 3) * 0.1 // Slight variation in opacity
              }}
            ></div>
            <div className="text-[#706C66] text-xs mt-2">{item.date}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

const SimpleLineChart = ({ data, title, description }: { data: any[]; title: string; description?: string }) => {
  // Calculate the max value for scaling
  const maxValue = Math.max(...data.map(item => item.value)) * 1.1;
  const minValue = Math.min(...data.map(item => item.value)) * 0.9;
  const range = maxValue - minValue;
  
  // Create points for SVG polyline
  const points = data.map((item, index) => {
    const x = (index / (data.length - 1)) * 100;
    const y = 100 - (((item.value - minValue) / range) * 100);
    return `${x},${y}`;
  }).join(' ');
  
  return (
    <div className="bg-white rounded-lg border border-[#E8E6E1] p-5 h-full shadow-sm hover:shadow-md transition-shadow duration-300">
      <div className="flex flex-col mb-4">
        <h3 className="text-[#2C2925] text-lg font-medium">{title}</h3>
        {description && <p className="text-[#706C66] text-sm mt-1">{description}</p>}
      </div>
      <div className="h-[200px] mt-2 relative">
        <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
          {/* Grid lines */}
          <line x1="0" y1="25" x2="100" y2="25" stroke="#E8E6E1" strokeWidth="0.5" />
          <line x1="0" y1="50" x2="100" y2="50" stroke="#E8E6E1" strokeWidth="0.5" />
          <line x1="0" y1="75" x2="100" y2="75" stroke="#E8E6E1" strokeWidth="0.5" />
          
          {/* Data line */}
          <polyline
            fill="none"
            stroke="#4A7B61"
            strokeWidth="2"
            points={points}
          />
          
          {/* Data points */}
          {data.map((item, index) => {
            const x = (index / (data.length - 1)) * 100;
            const y = 100 - (((item.value - minValue) / range) * 100);
            return (
              <circle 
                key={index} 
                cx={x} 
                cy={y} 
                r="2" 
                fill="#4A7B61" 
              />
            );
          })}
        </svg>
        
        {/* X-axis labels */}
        <div className="flex justify-between mt-2">
          {data.map((item, index) => (
            <div key={index} className="text-[#706C66] text-xs">{item.date}</div>
          ))}
        </div>
      </div>
    </div>
  );
};

const SimplePieChart = ({ data, title, description }: { data: any[]; title: string; description?: string }) => {
  // Calculate total for percentages
  const total = data.reduce((sum, item) => sum + item.value, 0);
  
  // Calculate the segments of the pie
  let cumulativePercentage = 0;
  const segments = data.map((item, index) => {
    const percentage = (item.value / total) * 100;
    const startAngle = cumulativePercentage * 3.6; // 3.6 degrees per percent (360/100)
    cumulativePercentage += percentage;
    const endAngle = cumulativePercentage * 3.6;
    
    // Calculate SVG arc path
    const startX = 50 + 40 * Math.cos((startAngle - 90) * (Math.PI / 180));
    const startY = 50 + 40 * Math.sin((startAngle - 90) * (Math.PI / 180));
    const endX = 50 + 40 * Math.cos((endAngle - 90) * (Math.PI / 180));
    const endY = 50 + 40 * Math.sin((endAngle - 90) * (Math.PI / 180));
    
    // Colors - using a sophisticated palette
    const colors = ['#4A7B61', '#675C52', '#887D73', '#4D453D', '#5E8C73'];
    
    return {
      path: `M 50 50 L ${startX} ${startY} A 40 40 0 ${percentage > 50 ? 1 : 0} 1 ${endX} ${endY} Z`,
      color: colors[index % colors.length],
      label: item.label,
      value: item.value,
      percentage
    };
  });
  
  return (
    <div className="bg-white rounded-lg border border-[#E8E6E1] p-5 h-full shadow-sm hover:shadow-md transition-shadow duration-300">
      <div className="flex flex-col mb-4">
        <h3 className="text-[#2C2925] text-lg font-medium">{title}</h3>
        {description && <p className="text-[#706C66] text-sm mt-1">{description}</p>}
      </div>
      <div className="flex flex-col sm:flex-row items-center justify-between">
        <div className="w-40 h-40 relative">
          <svg width="100%" height="100%" viewBox="0 0 100 100">
            {segments.map((segment, index) => (
              <path
                key={index}
                d={segment.path}
                fill={segment.color}
                stroke="#FFFFFF"
                strokeWidth="1"
              />
            ))}
          </svg>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-4 grid grid-cols-1 gap-2">
          {segments.map((segment, index) => (
            <div key={index} className="flex items-center">
              <div 
                className="w-3 h-3 mr-2 rounded-sm" 
                style={{ backgroundColor: segment.color }}
              ></div>
              <span className="text-[#2C2925] text-sm">{segment.label}: </span>
              <span className="text-[#706C66] text-sm ml-1">{segment.percentage.toFixed(1)}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const RankingTable = ({ data, title, description }: { 
  data: Array<{name: string; views: number; completions: number}>; 
  title: string; 
  description?: string 
}) => {
  return (
    <div className="bg-white rounded-lg border border-[#E8E6E1] p-5 h-full shadow-sm hover:shadow-md transition-shadow duration-300">
      <div className="flex flex-col mb-4">
        <h3 className="text-[#2C2925] text-lg font-medium">{title}</h3>
        {description && <p className="text-[#706C66] text-sm mt-1">{description}</p>}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#E8E6E1]">
              <th className="py-2 px-1 text-left text-xs font-medium text-[#706C66]">Course</th>
              <th className="py-2 px-1 text-right text-xs font-medium text-[#706C66]">Views</th>
              <th className="py-2 px-1 text-right text-xs font-medium text-[#706C66]">Completions</th>
              <th className="py-2 px-1 text-right text-xs font-medium text-[#706C66]">Rate</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => {
              const completionRate = ((item.completions / item.views) * 100).toFixed(1);
              return (
                <tr key={index} className="border-b border-[#E8E6E1] hover:bg-[#F8F7F2]">
                  <td className="py-3 px-1 text-sm font-medium text-[#2C2925]">{item.name}</td>
                  <td className="py-3 px-1 text-sm text-right text-[#706C66]">{item.views.toLocaleString()}</td>
                  <td className="py-3 px-1 text-sm text-right text-[#706C66]">{item.completions.toLocaleString()}</td>
                  <td className="py-3 px-1 text-sm text-right font-medium text-[#4A7B61]">{completionRate}%</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Date range filter component
const DateRangeFilter = ({ onChange }: { onChange: (range: string) => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedRange, setSelectedRange] = useState('Last 7 days');
  
  const ranges = [
    'Last 7 days',
    'Last 30 days',
    'Last 3 months',
    'Last 6 months',
    'Year to date',
    'All time'
  ];
  
  const handleSelect = (range: string) => {
    setSelectedRange(range);
    onChange(range);
    setIsOpen(false);
  };
  
  return (
    <div className="relative">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 bg-white rounded-md border border-[#E8E6E1] text-sm font-medium text-[#2C2925] hover:border-[#706C66] transition-colors"
      >
        <Calendar className="h-4 w-4 text-[#706C66]" />
        <span>{selectedRange}</span>
        <Filter className="h-4 w-4 text-[#706C66]" />
      </button>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-[#E8E6E1] z-10"
          >
            <div className="py-1">
              {ranges.map((range) => (
                <button
                  key={range}
                  onClick={() => handleSelect(range)}
                  className={`block w-full text-left px-4 py-2 text-sm ${
                    selectedRange === range
                      ? 'bg-[#F8F7F2] text-[#4A7B61] font-medium'
                      : 'text-[#2C2925] hover:bg-[#F8F7F2]'
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// Main Analytics Page Component
export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData>(mockAnalyticsData);
  const [dateRange, setDateRange] = useState('Last 7 days');
  const [loaded, setLoaded] = useState(false);
  
  // Simulate data loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoaded(true);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Handle date range changes (in real app, this would fetch new data)
  const handleDateRangeChange = (range: string) => {
    setDateRange(range);
    // In a real app, you would fetch new data based on the range
    // For now we'll just simulate a loading state
    setLoaded(false);
    setTimeout(() => setLoaded(true), 500);
  };
  
  return (
    <div className="min-h-screen bg-[#F8F7F2] pb-12">
      {/* Page Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl font-medium text-[#2C2925] tracking-tight">Analytics Dashboard</h1>
            <p className="mt-1 text-sm text-[#706C66]">Monitor engagement, growth, and user activity across the platform.</p>
          </div>
          <div className="mt-4 sm:mt-0 flex space-x-3">
            <DateRangeFilter onChange={handleDateRangeChange} />
            <button className="flex items-center space-x-2 px-3 py-2 bg-white rounded-md border border-[#E8E6E1] text-sm font-medium text-[#2C2925] hover:border-[#706C66] transition-colors">
              <Download className="h-4 w-4 text-[#706C66]" />
              <span>Export</span>
            </button>
          </div>
        </div>
        
        {/* Key Metrics Summary */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-5 mb-8">
          <StatCard 
            title="Total Users" 
            value={data.summary.totalUsers} 
            change={5.2}
            trend="up"
            icon={Users}
          />
          <StatCard 
            title="Active Users" 
            value={data.summary.activeUsers} 
            change={3.1}
            trend="up"
            icon={Activity}
          />
          <StatCard 
            title="Course Views" 
            value={data.summary.totalCourseViews} 
            icon={BookOpen}
          />
          <StatCard 
            title="Avg. Time" 
            value={data.summary.avgEngagementTime} 
            suffix=" min"
            change={1.5}
            trend="up"
            icon={Clock}
          />
          <StatCard 
            title="Growth Rate" 
            value={data.summary.userGrowthRate} 
            suffix="%"
            change={0.5}
            trend="down"
            icon={TrendingUp}
          />
          <StatCard 
            title="Completion Rate" 
            value={data.summary.completionRate} 
            suffix="%"
            change={2.3}
            trend="up"
            icon={BookOpen}
          />
        </div>
        
        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: loaded ? 1 : 0, y: loaded ? 0 : 20 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <SimpleBarChart 
              data={data.userGrowth} 
              title="User Growth" 
              description="Monthly user acquisition trend"
            />
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: loaded ? 1 : 0, y: loaded ? 0 : 20 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <SimpleLineChart 
              data={data.engagementByDay} 
              title="Daily Engagement" 
              description="Average engagement score by day of week"
            />
          </motion.div>
        </div>
        
        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: loaded ? 1 : 0, y: loaded ? 0 : 20 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <RankingTable 
                data={data.coursePopularity} 
                title="Course Performance" 
                description="Views, completions and completion rates"
              />
            </motion.div>
          </div>
          
          <div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: loaded ? 1 : 0, y: loaded ? 0 : 20 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <SimplePieChart 
                data={data.demographics} 
                title="Age Demographics" 
                description="User distribution by age group"
              />
            </motion.div>
          </div>
        </div>
        
        {/* Learning Insights Section */}
        <div className="mt-10">
          <div className="flex items-center mb-6">
            <Lightbulb className="h-5 w-5 text-[#A69374] mr-2" />
            <h2 className="text-xl sm:text-2xl font-medium text-[#2C2925] tracking-tight">Learning Insights</h2>
          </div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: loaded ? 1 : 0, y: loaded ? 0 : 20 }}
            transition={{ duration: 0.5, delay: 0.5 }}
          >
            <LearningInsights />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
