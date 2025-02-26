'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, FileText, Video, Headphones, FileJson, Book, Image as ImageIcon, X, ChevronDown, Calendar, Clock, User } from 'lucide-react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

// Define types for our resource data
interface Resource {
  id: number;
  title: string;
  description: string;
  type: string;
  author: string;
  date: string;
  readTime: string;
  image: string;
}

interface ResourceType {
  id: string;
  label: string;
  icon: React.ElementType;
}

interface FilterOption {
  id: string;
  label: string;
}

const resources: Resource[] = [
  {
    id: 1,
    title: 'Understanding Progressive Christianity',
    description: 'A comprehensive guide to modern interpretations of faith',
    type: 'articles',
    author: 'Dr. Sarah Thompson',
    date: '2024-02-15',
    readTime: '15 min read',
    image: 'https://images.unsplash.com/photo-1447069387593-a5de0862481e?w=1200&auto=format&fit=crop&q=80'
  },
  {
    id: 2,
    title: 'Faith and Science Dialogue',
    description: 'Exploring the intersection of belief and scientific inquiry',
    type: 'study-guides',
    author: 'Prof. Michael Chen',
    date: '2024-02-10',
    readTime: '20 min read',
    image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&auto=format&fit=crop&q=80'
  },
  {
    id: 3,
    title: 'Biblical Archaeology Today',
    description: 'Latest discoveries and their theological implications',
    type: 'articles',
    author: 'Dr. Emily Martinez',
    date: '2024-02-08',
    readTime: '12 min read',
    image: 'https://images.unsplash.com/photo-1461360370896-922624d12aa1?w=1200&auto=format&fit=crop&q=80'
  },
  {
    id: 4,
    title: 'Modern Worship Music',
    description: 'Contemporary expressions of faith through music',
    type: 'audios',
    author: 'Rev. David Kim',
    date: '2024-02-05',
    readTime: '25 min listen',
    image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1200&auto=format&fit=crop&q=80'
  },
  {
    id: 5,
    title: 'Social Justice in Scripture',
    description: 'Biblical foundations for advocacy and action',
    type: 'study-guides',
    author: 'Dr. Rachel Brown',
    date: '2024-02-01',
    readTime: '18 min read',
    image: 'https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=1200&auto=format&fit=crop&q=80'
  },
  {
    id: 6,
    title: 'Early Church Practices',
    description: 'Understanding the roots of Christian worship',
    type: 'videos',
    author: 'Prof. John Anderson',
    date: '2024-01-28',
    readTime: '30 min watch',
    image: 'https://images.unsplash.com/photo-1548407260-da850faa41e3?w=1200&auto=format&fit=crop&q=80'
  }
];

const resourceTypes: ResourceType[] = [
  { id: 'all', label: 'All', icon: FileText },
  { id: 'articles', label: 'Articles', icon: FileText },
  { id: 'videos', label: 'Videos', icon: Video },
  { id: 'audios', label: 'Audio', icon: Headphones },
  { id: 'pdfs', label: 'PDFs', icon: FileJson },
  { id: 'study-guides', label: 'Study Guides', icon: Book },
  { id: 'infographics', label: 'Infographics', icon: ImageIcon }
];

export default function ResourcesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [advancedFilters, setAdvancedFilters] = useState({
    date: 'all',
    author: 'all',
    readTime: 'all'
  });

  // Simulate loading state
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Advanced filter options
  const filterOptions = {
    date: [
      { id: 'all', label: 'All Dates' },
      { id: 'last-week', label: 'Last Week' },
      { id: 'last-month', label: 'Last Month' },
      { id: 'last-year', label: 'Last Year' }
    ],
    author: [
      { id: 'all', label: 'All Authors' },
      { id: 'sarah-thompson', label: 'Dr. Sarah Thompson' },
      { id: 'michael-chen', label: 'Prof. Michael Chen' },
      { id: 'emily-martinez', label: 'Dr. Emily Martinez' },
      { id: 'david-kim', label: 'Rev. David Kim' },
      { id: 'rachel-brown', label: 'Dr. Rachel Brown' },
      { id: 'john-anderson', label: 'Prof. John Anderson' }
    ],
    readTime: [
      { id: 'all', label: 'Any Length' },
      { id: 'short', label: 'Short (< 15 min)' },
      { id: 'medium', label: 'Medium (15-25 min)' },
      { id: 'long', label: 'Long (> 25 min)' }
    ]
  };

  // Reset all filters
  const resetFilters = () => {
    setSearchQuery('');
    setSelectedType('all');
    setAdvancedFilters({
      date: 'all',
      author: 'all',
      readTime: 'all'
    });
  };

  const filteredResources = resources.filter(resource => {
    // Type filter
    if (selectedType !== 'all' && resource.type !== selectedType) return false;
    
    // Search query filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesSearch = 
        resource.title.toLowerCase().includes(query) ||
        resource.description.toLowerCase().includes(query) ||
        resource.author.toLowerCase().includes(query);
      
      if (!matchesSearch) return false;
    }
    
    // Advanced filters
    // Date filter (placeholder implementation)
    if (advancedFilters.date !== 'all') {
      const resourceDate = new Date(resource.date);
      const now = new Date();
      
      if (advancedFilters.date === 'last-week') {
        const lastWeek = new Date(now.setDate(now.getDate() - 7));
        if (resourceDate < lastWeek) return false;
      } else if (advancedFilters.date === 'last-month') {
        const lastMonth = new Date(now.setMonth(now.getMonth() - 1));
        if (resourceDate < lastMonth) return false;
      } else if (advancedFilters.date === 'last-year') {
        const lastYear = new Date(now.setFullYear(now.getFullYear() - 1));
        if (resourceDate < lastYear) return false;
      }
    }
    
    // Author filter
    if (advancedFilters.author !== 'all') {
      // Convert author name to ID format for comparison
      const authorId = resource.author.toLowerCase().replace(/\s+/g, '-');
      if (authorId !== advancedFilters.author) return false;
    }
    
    // Read time filter
    if (advancedFilters.readTime !== 'all') {
      // Extract minutes from readTime string (e.g., "15 min read" -> 15)
      const minutes = parseInt(resource.readTime.split(' ')[0]);
      
      if (advancedFilters.readTime === 'short' && minutes >= 15) return false;
      if (advancedFilters.readTime === 'medium' && (minutes < 15 || minutes > 25)) return false;
      if (advancedFilters.readTime === 'long' && minutes <= 25) return false;
    }
    
    return true;
  });

  // Skeleton loader for resource cards
  const ResourceCardSkeleton = () => (
    <div className="relative rounded-2xl overflow-hidden h-[400px] bg-black/40">
      <div className="absolute inset-0 bg-white/5 backdrop-blur-xl" />
      <div className="relative h-48 bg-white/5 animate-pulse" />
      <div className="relative p-6 bg-black/40 h-[208px] flex flex-col">
        <div className="h-4 w-32 bg-white/10 rounded animate-pulse mb-3" />
        <div className="h-6 w-3/4 bg-white/10 rounded animate-pulse mb-2" />
        <div className="h-4 w-full bg-white/10 rounded animate-pulse mb-2" />
        <div className="h-4 w-2/3 bg-white/10 rounded animate-pulse mb-4" />
        <div className="mt-auto flex justify-between">
          <div className="h-4 w-24 bg-white/10 rounded animate-pulse" />
          <div className="h-4 w-24 bg-white/10 rounded animate-pulse" />
        </div>
      </div>
      <div className="absolute inset-0 rounded-2xl border border-white/[0.1]" />
    </div>
  );

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900/20 via-black to-black pb-20">
      {/* Background subtle patterns */}
      <div className="fixed inset-0 bg-[url('/noise.png')] opacity-[0.015] pointer-events-none mix-blend-overlay" />
      <div className="fixed inset-0 bg-gradient-to-b from-slate-500/5 via-transparent to-transparent pointer-events-none" />
      
      {/* Content */}
      <div className="relative">
        <div className="relative px-6 lg:px-8 py-24 mx-auto max-w-[90rem]">
          {/* Header */}
          <div className="flex flex-col items-center text-center mb-16">
            <h1 className="text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-white/80 mb-6">
              Resources
            </h1>
            <p className="text-lg text-white/60 max-w-2xl">
              Access our curated library of progressive faith resources and study materials
            </p>
          </div>

          {/* Search and Filter Bar */}
          <div className="flex flex-col space-y-4 mb-8">
            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4">
              <div className="flex-1 relative group">
                <div className="absolute inset-0 bg-white/5 rounded-2xl blur-md transition-all duration-300 group-hover:bg-white/10" />
                <div className="relative flex items-center bg-black/20 rounded-2xl">
                  <input
                    type="text"
                    placeholder="Search resources..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl pl-6 pr-12 py-4 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-slate-500/30 focus:border-slate-500/30 transition-all duration-300"
                  />
                  {searchQuery && (
                    <button 
                      onClick={() => setSearchQuery('')}
                      className="absolute right-12 p-2 text-white/40 hover:text-white/70 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                  <div className="absolute right-4 p-2 rounded-xl bg-white/5 backdrop-blur-sm">
                    <Search className="w-4 h-4 text-white/60" />
                  </div>
                </div>
              </div>
              <div className="relative">
                <div className="absolute inset-0 bg-white/5 rounded-2xl blur-md transition-all duration-300 group-hover:bg-white/10" />
                <button 
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                  className="relative w-full md:w-auto flex items-center justify-between gap-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl px-6 py-4 text-white hover:bg-white/[0.12] transition-all duration-300"
                >
                  <div className="flex items-center gap-3">
                    <Filter className="w-4 h-4" />
                    <span className="text-sm font-medium">Advanced Filters</span>
                  </div>
                  <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${showAdvancedFilters ? 'rotate-180' : ''}`} />
                </button>
              </div>
            </div>
            
            {/* Advanced Filter panel */}
            <AnimatePresence>
              {showAdvancedFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Date filter */}
                      <div>
                        <h3 className="text-white/80 font-medium mb-3">Date</h3>
                        <div className="space-y-2">
                          {filterOptions.date.map(option => (
                            <button
                              key={option.id}
                              onClick={() => setAdvancedFilters({...advancedFilters, date: option.id})}
                              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                                advancedFilters.date === option.id
                                  ? 'bg-white/20 text-white'
                                  : 'text-white/60 hover:bg-white/10 hover:text-white/80'
                              }`}
                            >
                              {option.label}
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      {/* Author filter */}
                      <div>
                        <h3 className="text-white/80 font-medium mb-3">Author</h3>
                        <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                          {filterOptions.author.map(option => (
                            <button
                              key={option.id}
                              onClick={() => setAdvancedFilters({...advancedFilters, author: option.id})}
                              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                                advancedFilters.author === option.id
                                  ? 'bg-white/20 text-white'
                                  : 'text-white/60 hover:bg-white/10 hover:text-white/80'
                              }`}
                            >
                              {option.label}
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      {/* Read Time filter */}
                      <div>
                        <h3 className="text-white/80 font-medium mb-3">Length</h3>
                        <div className="space-y-2">
                          {filterOptions.readTime.map(option => (
                            <button
                              key={option.id}
                              onClick={() => setAdvancedFilters({...advancedFilters, readTime: option.id})}
                              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                                advancedFilters.readTime === option.id
                                  ? 'bg-white/20 text-white'
                                  : 'text-white/60 hover:bg-white/10 hover:text-white/80'
                              }`}
                            >
                              {option.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    {/* Reset filters button */}
                    <div className="mt-6 flex justify-end">
                      <button
                        onClick={resetFilters}
                        className="px-4 py-2 bg-white/5 hover:bg-white/10 text-white/70 hover:text-white rounded-lg text-sm transition-colors"
                      >
                        Reset All Filters
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Active filters display */}
            {(selectedType !== 'all' || advancedFilters.date !== 'all' || advancedFilters.author !== 'all' || advancedFilters.readTime !== 'all' || searchQuery) && (
              <div className="flex flex-wrap items-center gap-2 pt-2">
                <span className="text-white/50 text-sm">Active filters:</span>
                
                {searchQuery && (
                  <div className="flex items-center gap-1.5 bg-white/10 rounded-full px-3 py-1.5">
                    <span className="text-white/80 text-xs">Search: {searchQuery}</span>
                    <button onClick={() => setSearchQuery('')} className="text-white/50 hover:text-white/80">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
                
                {selectedType !== 'all' && (
                  <div className="flex items-center gap-1.5 bg-white/10 rounded-full px-3 py-1.5">
                    <span className="text-white/80 text-xs">
                      Type: {resourceTypes.find(t => t.id === selectedType)?.label}
                    </span>
                    <button 
                      onClick={() => setSelectedType('all')}
                      className="text-white/50 hover:text-white/80"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
                
                {advancedFilters.date !== 'all' && (
                  <div className="flex items-center gap-1.5 bg-white/10 rounded-full px-3 py-1.5">
                    <span className="text-white/80 text-xs">
                      Date: {filterOptions.date.find(o => o.id === advancedFilters.date)?.label}
                    </span>
                    <button 
                      onClick={() => setAdvancedFilters({...advancedFilters, date: 'all'})}
                      className="text-white/50 hover:text-white/80"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
                
                {advancedFilters.author !== 'all' && (
                  <div className="flex items-center gap-1.5 bg-white/10 rounded-full px-3 py-1.5">
                    <span className="text-white/80 text-xs">
                      Author: {filterOptions.author.find(o => o.id === advancedFilters.author)?.label}
                    </span>
                    <button 
                      onClick={() => setAdvancedFilters({...advancedFilters, author: 'all'})}
                      className="text-white/50 hover:text-white/80"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
                
                {advancedFilters.readTime !== 'all' && (
                  <div className="flex items-center gap-1.5 bg-white/10 rounded-full px-3 py-1.5">
                    <span className="text-white/80 text-xs">
                      Length: {filterOptions.readTime.find(o => o.id === advancedFilters.readTime)?.label}
                    </span>
                    <button 
                      onClick={() => setAdvancedFilters({...advancedFilters, readTime: 'all'})}
                      className="text-white/50 hover:text-white/80"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
                
                <button 
                  onClick={resetFilters}
                  className="text-white/50 hover:text-white/80 text-xs underline"
                >
                  Clear all
                </button>
              </div>
            )}
          </div>

          {/* Resource Type Tabs */}
          <div className="flex flex-wrap gap-2 mb-12 overflow-x-auto pb-2 custom-scrollbar">
            {resourceTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => setSelectedType(type.id)}
                className={`
                  relative group flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-300
                  ${selectedType === type.id 
                    ? 'bg-slate-500/20 text-slate-300' 
                    : 'bg-white/[0.08] text-white/60 hover:bg-white/[0.12] hover:text-white/90'}
                `}
              >
                <type.icon className="h-4 w-4" />
                {type.label}
                <div className="absolute inset-0 bg-white/5 rounded-xl blur-sm opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            ))}
          </div>

          {/* Resources Grid */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <ResourceCardSkeleton key={i} />
              ))}
            </div>
          ) : filteredResources.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredResources.map((resource) => {
                const ResourceIcon = resourceTypes.find(t => t.id === resource.type)?.icon || FileText;
                return (
                  <motion.div
                    key={resource.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="group"
                  >
                    {/* Card container with hover animation */}
                    <motion.div
                      whileHover={{ scale: 1.02, y: -5 }}
                      transition={{ duration: 0.3 }}
                      className="relative rounded-2xl overflow-hidden h-[400px] bg-black/40 will-change-transform"
                    >
                      {/* Blur effect container */}
                      <div className="absolute inset-0 bg-white/5 backdrop-blur-xl" />
                      
                      {/* Content wrapper */}
                      <div className="relative block h-full">
                        {/* Image container - static, no transform */}
                        <div className="relative h-48">
                          <div className="absolute inset-0 bg-black/20" />
                          <Image
                            src={resource.image}
                            alt={resource.title}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
                        </div>
                        
                        {/* Content section */}
                        <div className="relative p-6 bg-black/40 h-[208px] flex flex-col">
                          <div className="flex items-center gap-2 mb-3">
                            <span className="inline-flex items-center gap-1.5 bg-white/[0.08] backdrop-blur-sm rounded-full px-3 py-1 text-xs font-medium text-white/90">
                              <ResourceIcon className="h-3.5 w-3.5" />
                              {resource.type.charAt(0).toUpperCase() + resource.type.slice(1).replace('-', ' ')}
                            </span>
                            <span className="text-white/50 text-xs flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {resource.readTime}
                            </span>
                          </div>
                          <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-slate-300 transition-colors line-clamp-1">{resource.title}</h3>
                          <p className="text-white/70 text-sm mb-4 line-clamp-2 flex-grow">{resource.description}</p>
                          <div className="flex items-center justify-between text-sm text-white/50">
                            <span className="flex items-center gap-1.5">
                              <User className="h-3.5 w-3.5" />
                              {resource.author}
                            </span>
                            <div className="flex items-center gap-1.5">
                              <Calendar className="h-3.5 w-3.5" />
                              <span>{resource.date}</span>
                            </div>
                          </div>
                        </div>

                        {/* Hover overlay with "View Resource" button */}
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <div className="px-4 py-2 bg-white/20 backdrop-blur-md rounded-lg text-white text-sm font-medium transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                            View Resource
                          </div>
                        </div>
                      </div>
                      
                      {/* Border overlay */}
                      <div className="absolute inset-0 rounded-2xl border border-white/[0.1] group-hover:border-white/[0.2] transition-colors duration-300 pointer-events-none" />
                    </motion.div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-16 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
              <div className="text-white/40 mb-4">
                <FileText className="w-12 h-12" />
              </div>
              <h3 className="text-xl font-medium text-white/80 mb-2">No resources found</h3>
              <p className="text-white/60 text-center max-w-md mb-6">We couldn't find any resources matching your current filters.</p>
              <button
                onClick={resetFilters}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
              >
                Reset Filters
              </button>
            </div>
          )}
          
          {/* Add custom scrollbar styles */}
          <style jsx global>{`
            .custom-scrollbar::-webkit-scrollbar {
              width: 6px;
              height: 6px;
            }
            .custom-scrollbar::-webkit-scrollbar-track {
              background: rgba(255, 255, 255, 0.05);
              border-radius: 10px;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb {
              background: rgba(255, 255, 255, 0.1);
              border-radius: 10px;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb:hover {
              background: rgba(255, 255, 255, 0.2);
            }
          `}</style>
        </div>
      </div>
    </div>
  );
}
