'use client';

import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { ArrowUp, ArrowDown, ArrowRight, Heart, MessageCircle, Share2, Star } from 'lucide-react';

// Mock data for demonstration
const contentPerformanceData = {
  articles: [
    { 
      id: 1, 
      title: 'Interpreting Parables in Modern Context', 
      views: 4582, 
      trend: 12.3,
      likes: 345,
      comments: 78,
      shares: 156,
      rating: 4.8
    },
    { 
      id: 2, 
      title: 'The Narrative Structure of Genesis', 
      views: 3967, 
      trend: 8.7,
      likes: 289,
      comments: 53,
      shares: 122,
      rating: 4.7
    },
    { 
      id: 3, 
      title: 'Wisdom Literature: Job & Ecclesiastes', 
      views: 3541, 
      trend: -2.1,
      likes: 231,
      comments: 42,
      shares: 87,
      rating: 4.6
    },
    { 
      id: 4, 
      title: 'Historical Context of the Pauline Letters', 
      views: 3102, 
      trend: 5.4,
      likes: 198,
      comments: 35,
      shares: 91,
      rating: 4.5
    },
    { 
      id: 5, 
      title: 'Understanding Apocalyptic Literature', 
      views: 2875, 
      trend: 14.2,
      likes: 215,
      comments: 61,
      shares: 104,
      rating: 4.7
    },
  ],
  lessons: [
    { 
      id: 1, 
      title: 'The Creation Narrative', 
      course: 'Genesis',
      completions: 3541, 
      avgTimeSpent: '18.5 min',
      trend: 8.2,
      rating: 4.9
    },
    { 
      id: 2, 
      title: 'Exodus & the Law', 
      course: 'Exodus & Liberation',
      completions: 3187, 
      avgTimeSpent: '21.3 min',
      trend: 6.7,
      rating: 4.8
    },
    { 
      id: 3, 
      title: 'Wisdom of Solomon', 
      course: 'Wisdom Literature',
      completions: 2956, 
      avgTimeSpent: '16.8 min',
      trend: -1.5,
      rating: 4.6
    },
    { 
      id: 4, 
      title: 'Isaiah & Messianic Prophecy', 
      course: 'Prophetic Vision',
      completions: 2781, 
      avgTimeSpent: '23.1 min',
      trend: 9.3,
      rating: 4.7
    },
    { 
      id: 5, 
      title: 'Jesus & the Kingdom', 
      course: 'New Testament Foundations',
      completions: 2547, 
      avgTimeSpent: '19.7 min',
      trend: 12.5,
      rating: 4.9
    },
  ],
  resources: [
    { 
      id: 1, 
      title: 'Comprehensive Bible Chronology', 
      downloads: 2876, 
      trend: 15.7,
      rating: 4.8,
      type: 'PDF Guide'
    },
    { 
      id: 2, 
      title: 'Ancient Near East Map Collection', 
      downloads: 2543, 
      trend: 9.3,
      rating: 4.7,
      type: 'Digital Maps'
    },
    { 
      id: 3, 
      title: 'Biblical Hebrew Vocabulary Builder', 
      downloads: 2187, 
      trend: 3.6,
      rating: 4.5,
      type: 'Study Tool'
    },
    { 
      id: 4, 
      title: 'New Testament Greek Primer', 
      downloads: 1983, 
      trend: -1.8,
      rating: 4.6,
      type: 'Study Tool'
    },
    { 
      id: 5, 
      title: 'Biblical Archaeology Findings', 
      downloads: 1745, 
      trend: 7.2,
      rating: 4.9,
      type: 'Research Report'
    },
  ]
};

// Trend indicator component
const TrendIndicator = ({ value }: { value: number }) => {
  const isPositive = value >= 0;
  
  return (
    <div 
      className={`flex items-center ${isPositive ? 'text-[#5E8C73]' : 'text-[#8F5849]'}`}
    >
      {isPositive ? 
        <ArrowUp className="h-3.5 w-3.5 mr-1" /> : 
        <ArrowDown className="h-3.5 w-3.5 mr-1" />
      }
      <span className="text-sm font-medium">{Math.abs(value)}%</span>
    </div>
  );
};

// Star rating component
const StarRating = ({ rating }: { rating: number }) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  
  return (
    <div className="flex items-center">
      <div className="flex mr-1">
        {[...Array(5)].map((_, i) => (
          <Star 
            key={i} 
            className={`h-3.5 w-3.5 ${
              i < fullStars 
                ? 'text-[#A69374] fill-[#A69374]' 
                : i === fullStars && hasHalfStar 
                  ? 'text-[#A69374]' 
                  : 'text-[#E8E6E1]'
            }`} 
          />
        ))}
      </div>
      <span className="text-xs text-[#706C66]">{rating.toFixed(1)}</span>
    </div>
  );
};

// Articles tab content
const ArticlesTab = ({ data }: { data: typeof contentPerformanceData.articles }) => {
  return (
    <div className="mt-4">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#E8E6E1]">
              <th className="py-2 px-3 text-left text-xs font-medium text-[#706C66]">Title</th>
              <th className="py-2 px-3 text-right text-xs font-medium text-[#706C66]">Views</th>
              <th className="py-2 px-3 text-right text-xs font-medium text-[#706C66]">Trend</th>
              <th className="py-2 px-3 text-right text-xs font-medium text-[#706C66]">Engagement</th>
              <th className="py-2 px-3 text-right text-xs font-medium text-[#706C66]">Rating</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr key={item.id} className="border-b border-[#E8E6E1] hover:bg-[#F8F7F2]">
                <td className="py-3 px-3 text-sm font-medium text-[#2C2925]">{item.title}</td>
                <td className="py-3 px-3 text-sm text-right text-[#706C66]">{item.views.toLocaleString()}</td>
                <td className="py-3 px-3 text-right">
                  <TrendIndicator value={item.trend} />
                </td>
                <td className="py-3 px-3 text-right">
                  <div className="flex items-center justify-end space-x-3">
                    <div className="flex items-center text-[#706C66]">
                      <Heart className="h-3.5 w-3.5 mr-1" />
                      <span className="text-xs">{item.likes}</span>
                    </div>
                    <div className="flex items-center text-[#706C66]">
                      <MessageCircle className="h-3.5 w-3.5 mr-1" />
                      <span className="text-xs">{item.comments}</span>
                    </div>
                    <div className="flex items-center text-[#706C66]">
                      <Share2 className="h-3.5 w-3.5 mr-1" />
                      <span className="text-xs">{item.shares}</span>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-3 text-right">
                  <StarRating rating={item.rating} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Lessons tab content
const LessonsTab = ({ data }: { data: typeof contentPerformanceData.lessons }) => {
  return (
    <div className="mt-4">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#E8E6E1]">
              <th className="py-2 px-3 text-left text-xs font-medium text-[#706C66]">Lesson</th>
              <th className="py-2 px-3 text-left text-xs font-medium text-[#706C66]">Course</th>
              <th className="py-2 px-3 text-right text-xs font-medium text-[#706C66]">Completions</th>
              <th className="py-2 px-3 text-right text-xs font-medium text-[#706C66]">Avg. Time</th>
              <th className="py-2 px-3 text-right text-xs font-medium text-[#706C66]">Trend</th>
              <th className="py-2 px-3 text-right text-xs font-medium text-[#706C66]">Rating</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr key={item.id} className="border-b border-[#E8E6E1] hover:bg-[#F8F7F2]">
                <td className="py-3 px-3 text-sm font-medium text-[#2C2925]">{item.title}</td>
                <td className="py-3 px-3 text-sm text-[#4A7B61]">{item.course}</td>
                <td className="py-3 px-3 text-sm text-right text-[#706C66]">{item.completions.toLocaleString()}</td>
                <td className="py-3 px-3 text-sm text-right text-[#706C66]">{item.avgTimeSpent}</td>
                <td className="py-3 px-3 text-right">
                  <TrendIndicator value={item.trend} />
                </td>
                <td className="py-3 px-3 text-right">
                  <StarRating rating={item.rating} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Resources tab content
const ResourcesTab = ({ data }: { data: typeof contentPerformanceData.resources }) => {
  return (
    <div className="mt-4">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-[#E8E6E1]">
              <th className="py-2 px-3 text-left text-xs font-medium text-[#706C66]">Resource</th>
              <th className="py-2 px-3 text-left text-xs font-medium text-[#706C66]">Type</th>
              <th className="py-2 px-3 text-right text-xs font-medium text-[#706C66]">Downloads</th>
              <th className="py-2 px-3 text-right text-xs font-medium text-[#706C66]">Trend</th>
              <th className="py-2 px-3 text-right text-xs font-medium text-[#706C66]">Rating</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item) => (
              <tr key={item.id} className="border-b border-[#E8E6E1] hover:bg-[#F8F7F2]">
                <td className="py-3 px-3 text-sm font-medium text-[#2C2925]">{item.title}</td>
                <td className="py-3 px-3">
                  <span className="px-2 py-1 text-xs font-medium rounded-full bg-[#F8F7F2] text-[#675C52]">
                    {item.type}
                  </span>
                </td>
                <td className="py-3 px-3 text-sm text-right text-[#706C66]">{item.downloads.toLocaleString()}</td>
                <td className="py-3 px-3 text-right">
                  <TrendIndicator value={item.trend} />
                </td>
                <td className="py-3 px-3 text-right">
                  <StarRating rating={item.rating} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Main content performance component
export default function ContentPerformance() {
  const [activeTab, setActiveTab] = useState('articles');
  
  return (
    <div className="bg-white rounded-lg border border-[#E8E6E1] p-5 shadow-sm">
      <h3 className="text-lg font-medium text-[#2C2925] mb-4">Content Performance</h3>
      
      <Tabs defaultValue="articles" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full flex justify-start border-b border-[#E8E6E1] mb-4 pb-1">
          <TabsTrigger 
            value="articles" 
            className={`px-4 py-2 text-sm font-medium transition-colors duration-200 ${
              activeTab === 'articles' 
                ? 'text-[#4A7B61] border-b-2 border-[#4A7B61]' 
                : 'text-[#706C66] hover:text-[#2C2925]'
            }`}
          >
            Articles
          </TabsTrigger>
          <TabsTrigger 
            value="lessons" 
            className={`px-4 py-2 text-sm font-medium transition-colors duration-200 ${
              activeTab === 'lessons' 
                ? 'text-[#4A7B61] border-b-2 border-[#4A7B61]' 
                : 'text-[#706C66] hover:text-[#2C2925]'
            }`}
          >
            Lessons
          </TabsTrigger>
          <TabsTrigger 
            value="resources" 
            className={`px-4 py-2 text-sm font-medium transition-colors duration-200 ${
              activeTab === 'resources' 
                ? 'text-[#4A7B61] border-b-2 border-[#4A7B61]' 
                : 'text-[#706C66] hover:text-[#2C2925]'
            }`}
          >
            Resources
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="articles">
          <ArticlesTab data={contentPerformanceData.articles} />
        </TabsContent>
        
        <TabsContent value="lessons">
          <LessonsTab data={contentPerformanceData.lessons} />
        </TabsContent>
        
        <TabsContent value="resources">
          <ResourcesTab data={contentPerformanceData.resources} />
        </TabsContent>
      </Tabs>
      
      <div className="mt-4 flex justify-end">
        <button className="flex items-center text-[#4A7B61] text-sm font-medium hover:underline">
          <span>View full report</span>
          <ArrowRight className="h-4 w-4 ml-1" />
        </button>
      </div>
    </div>
  );
}
