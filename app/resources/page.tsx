'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, FileText, Video, Headphones, FileJson, Book, Image as ImageIcon, X, ChevronDown, Calendar, Clock, User, RotateCcw, Check, XCircle } from 'lucide-react';
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

// Define the hero green and its light version (using opacity)
const HERO_GREEN = '#4A7B61';
const LIGHT_GREEN_BG = 'rgba(74, 123, 97, 0.15)'; // Lighter version with opacity

export default function ResourcesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
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

  // Handle filter change
  const handleFilterChange = (key: keyof typeof advancedFilters, value: string) => {
    setAdvancedFilters(prev => ({
      ...prev,
      [key]: value
    }));
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
    <div className="relative rounded-2xl overflow-hidden h-[400px] bg-white border border-border shadow-sm hover:shadow-md transition-all duration-300 hover:translate-y-[-2px]">
      <div className="h-48 bg-[#F5F0E8]/50 animate-pulse" />
      <div className="p-6 flex flex-col">
        <div className="h-4 w-32 bg-[#F5F0E8] animate-pulse mb-3" />
        <div className="h-6 w-3/4 bg-[#F5F0E8] animate-pulse mb-2" />
        <div className="h-4 w-full bg-[#F5F0E8] animate-pulse mb-2" />
        <div className="h-4 w-2/3 bg-[#F5F0E8] animate-pulse mb-4" />
        <div className="mt-auto flex justify-between">
          <div className="h-4 w-24 bg-[#F5F0E8] animate-pulse" />
          <div className="h-4 w-24 bg-[#F5F0E8] animate-pulse" />
        </div>
      </div>
    </div>
  );

  return (
    <main className="min-h-screen bg-[#F8F7F2] text-[#2C2925]">
      {/* Content */}
      <div className="w-full px-4 md:px-6 lg:px-8 py-8 sm:py-10 lg:py-12">
        <div className="max-w-[90rem] mx-auto">
          {/* Header with light green background */}
          <div className="relative rounded-2xl overflow-hidden mb-8 mx-4 sm:mx-6 lg:mx-8 border border-[#4A7B61]/20">
            <div className="absolute inset-0 bg-[#4A7B61]/15"></div>
            <div className="relative z-10 px-6 py-8 md:px-8 md:py-10">
              <div className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-[#4A7B61]/20 text-[#4A7B61] mb-4">
                <span>Curated content for progressive faith</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-medium tracking-tight text-[#2C2925] mb-2">
                Resources
              </h1>
              <p className="text-sm sm:text-base text-[#706C66] max-w-md">
                Access our curated library of progressive faith resources and study materials
              </p>
            </div>
          </div>
          
          {/* Search and Filter Bar */}
          <div className="px-5 sm:px-8 lg:px-10">
            <div className="flex flex-col space-y-4 md:flex-row md:justify-between md:items-center md:space-y-0 mb-8">
              {/* Search */}
              <div className="flex items-center gap-3 w-full md:w-auto">
                <div className="relative flex-1 md:min-w-[280px]">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Search size={16} strokeWidth={1.5} className="text-[#706C66]" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search resources..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="block w-full py-2.5 pl-10 pr-3 border border-[#E8E6E1] rounded-full bg-white text-[#2C2925] placeholder-[#706C66] focus:border-[#4A7B61]/50 focus:ring-[#4A7B61]/50 transition-all duration-200 min-h-[44px]"
                  />
                </div>
                
                <button
                  onClick={() => setShowFilters(true)}
                  className="flex items-center justify-center min-h-[44px] px-4 py-2 bg-white border border-[#E8E6E1] rounded-full text-[#2C2925] hover:bg-[#F8F7F2] transition-all duration-200"
                >
                  <Filter size={16} strokeWidth={1.5} className="mr-2 text-[#706C66]" />
                  <span className="text-sm">Filters</span>
                </button>
              </div>
            </div>
          </div>
          
          {/* Active filters */}
          {(selectedType !== 'all' || advancedFilters.date !== 'all' || advancedFilters.author !== 'all' || advancedFilters.readTime !== 'all' || searchQuery) && (
            <div className="px-5 sm:px-8 lg:px-10 mb-6">
              <div className="flex flex-wrap items-center gap-2">
                {searchQuery && (
                  <div className="flex items-center gap-1.5 bg-[#4A7B61]/15 rounded-full px-3 py-1.5">
                    <span className="text-[#2C2925]/80 text-xs">Search: {searchQuery}</span>
                    <button 
                      onClick={() => setSearchQuery('')}
                      className="text-[#2C2925]/50 hover:text-[#2C2925] transition-colors"
                    >
                      <X size={14} strokeWidth={1.5} />
                    </button>
                  </div>
                )}
                
                {selectedType !== 'all' && (
                  <div className="flex items-center gap-1.5 bg-[#4A7B61]/15 rounded-full px-3 py-1.5">
                    <span className="text-[#2C2925]/80 text-xs">Type: {resourceTypes.find(t => t.id === selectedType)?.label}</span>
                    <button 
                      onClick={() => setSelectedType('all')}
                      className="text-[#2C2925]/50 hover:text-[#2C2925] transition-colors"
                    >
                      <X size={14} strokeWidth={1.5} />
                    </button>
                  </div>
                )}
                
                {advancedFilters.date !== 'all' && (
                  <div className="flex items-center gap-1.5 bg-[#4A7B61]/15 rounded-full px-3 py-1.5">
                    <span className="text-[#2C2925]/80 text-xs">Date: {filterOptions.date.find(option => option.id === advancedFilters.date)?.label}</span>
                    <button 
                      onClick={() => setAdvancedFilters({...advancedFilters, date: 'all'})}
                      className="text-[#2C2925]/50 hover:text-[#2C2925] transition-colors"
                    >
                      <X size={14} strokeWidth={1.5} />
                    </button>
                  </div>
                )}
                
                {advancedFilters.author !== 'all' && (
                  <div className="flex items-center gap-1.5 bg-[#4A7B61]/15 rounded-full px-3 py-1.5">
                    <span className="text-[#2C2925]/80 text-xs">Author: {filterOptions.author.find(option => option.id === advancedFilters.author)?.label}</span>
                    <button 
                      onClick={() => setAdvancedFilters({...advancedFilters, author: 'all'})}
                      className="text-[#2C2925]/50 hover:text-[#2C2925] transition-colors"
                    >
                      <X size={14} strokeWidth={1.5} />
                    </button>
                  </div>
                )}
                
                {advancedFilters.readTime !== 'all' && (
                  <div className="flex items-center gap-1.5 bg-[#4A7B61]/15 rounded-full px-3 py-1.5">
                    <span className="text-[#2C2925]/80 text-xs">Read time: {filterOptions.readTime.find(option => option.id === advancedFilters.readTime)?.label}</span>
                    <button 
                      onClick={() => setAdvancedFilters({...advancedFilters, readTime: 'all'})}
                      className="text-[#2C2925]/50 hover:text-[#2C2925] transition-colors"
                    >
                      <X size={14} strokeWidth={1.5} />
                    </button>
                  </div>
                )}
                
                <button
                  onClick={resetFilters}
                  className="flex items-center gap-1.5 text-xs text-[#706C66] hover:text-[#4A7B61] transition-colors"
                >
                  <RotateCcw size={14} strokeWidth={1.5} />
                  <span>Reset filters</span>
                </button>
              </div>
            </div>
          )}
          
          {/* Mobile Filters Drawer */}
          <AnimatePresence>
            {showFilters && (
              <>
                {/* Backdrop */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="fixed inset-0 bg-[#2C2925]/20 backdrop-blur-sm z-40"
                  onClick={() => setShowFilters(false)}
                />
                
                {/* Drawer */}
                <motion.div
                  initial={{ x: '100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '100%' }}
                  transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                  className="fixed top-0 right-0 h-full w-[85%] max-w-md bg-[#F8F7F2] border-l border-[#E8E6E1] z-50 overflow-y-auto"
                >
                  <div className="sticky top-0 bg-[#F8F7F2] border-b border-[#E8E6E1] z-10 flex justify-between items-center p-4">
                    <h2 className="font-medium text-lg tracking-tight text-[#2C2925]">Filters</h2>
                    <button 
                      onClick={() => setShowFilters(false)}
                      className="p-2 text-[#706C66] hover:bg-[#4A7B61]/15 rounded-full transition-colors"
                    >
                      <X size={20} strokeWidth={1.5} />
                      <span className="sr-only">Close</span>
                    </button>
                  </div>
                  
                  <div className="p-4 space-y-6">
                    {/* Resource Type Filter */}
                    <div className="space-y-3">
                      <h3 className="font-medium text-[#2C2925]/90 tracking-tight">Resource Type</h3>
                      <div className="grid grid-cols-1 gap-2 ml-1">
                        {resourceTypes.map((type) => (
                          <button
                            key={type.id}
                            onClick={() => setSelectedType(type.id)}
                            className={`flex items-center justify-between w-full px-3 py-2 text-left rounded-md transition-colors ${
                              selectedType === type.id
                                ? 'bg-[#4A7B61]/15 text-[#2C2925] font-medium'
                                : 'hover:bg-[#4A7B61]/10 text-[#706C66]'
                            }`}
                          >
                            <div className="flex items-center">
                              <type.icon size={16} strokeWidth={1.5} className="mr-2" />
                              <span>{type.label}</span>
                            </div>
                            {selectedType === type.id && (
                              <Check size={16} strokeWidth={1.5} className="text-[#4A7B61]" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    {/* Date Filter */}
                    <div className="space-y-3">
                      <h3 className="font-medium text-[#2C2925]/90 tracking-tight">Date</h3>
                      <div className="grid grid-cols-1 gap-2 ml-1">
                        {filterOptions.date.map((option) => (
                          <button
                            key={option.id}
                            onClick={() => handleFilterChange('date', option.id)}
                            className={`flex items-center justify-between w-full px-3 py-2 text-left rounded-md transition-colors ${
                              advancedFilters.date === option.id
                                ? 'bg-[#4A7B61]/15 text-[#2C2925] font-medium'
                                : 'hover:bg-[#4A7B61]/10 text-[#706C66]'
                            }`}
                          >
                            <span>{option.label}</span>
                            {advancedFilters.date === option.id && (
                              <Check size={16} strokeWidth={1.5} className="text-[#4A7B61]" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    {/* Author Filter */}
                    <div className="space-y-3">
                      <h3 className="font-medium text-[#2C2925]/90 tracking-tight">Author</h3>
                      <div className="grid grid-cols-1 gap-2 ml-1 max-h-48 overflow-y-auto">
                        {filterOptions.author.map((option) => (
                          <button
                            key={option.id}
                            onClick={() => handleFilterChange('author', option.id)}
                            className={`flex items-center justify-between w-full px-3 py-2 text-left rounded-md transition-colors ${
                              advancedFilters.author === option.id
                                ? 'bg-[#4A7B61]/15 text-[#2C2925] font-medium'
                                : 'hover:bg-[#4A7B61]/10 text-[#706C66]'
                            }`}
                          >
                            <span>{option.label}</span>
                            {advancedFilters.author === option.id && (
                              <Check size={16} strokeWidth={1.5} className="text-[#4A7B61]" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    {/* Read Time Filter */}
                    <div className="space-y-3">
                      <h3 className="font-medium text-[#2C2925]/90 tracking-tight">Read Time</h3>
                      <div className="grid grid-cols-1 gap-2 ml-1">
                        {filterOptions.readTime.map((option) => (
                          <button
                            key={option.id}
                            onClick={() => handleFilterChange('readTime', option.id)}
                            className={`flex items-center justify-between w-full px-3 py-2 text-left rounded-md transition-colors ${
                              advancedFilters.readTime === option.id
                                ? 'bg-[#4A7B61]/15 text-[#2C2925] font-medium'
                                : 'hover:bg-[#4A7B61]/10 text-[#706C66]'
                            }`}
                          >
                            <span>{option.label}</span>
                            {advancedFilters.readTime === option.id && (
                              <Check size={16} strokeWidth={1.5} className="text-[#4A7B61]" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="sticky bottom-0 bg-[#F8F7F2] border-t border-[#E8E6E1] p-4">
                    <button
                      onClick={() => setShowFilters(false)}
                      className="w-full py-2.5 px-4 bg-[#4A7B61] text-white rounded-full transition-all hover:bg-[#4A7B61]/90"
                    >
                      Apply Filters
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* Resource Type Pills */}
          <div className="px-5 sm:px-8 lg:px-10 mb-8 overflow-x-auto no-scrollbar">
            <div className="flex space-x-2 pb-2">
              {resourceTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setSelectedType(type.id)}
                  className={`flex items-center px-4 py-2 rounded-full text-sm whitespace-nowrap transition-all duration-200 ${
                    selectedType === type.id
                      ? 'bg-[#4A7B61] text-white'
                      : 'bg-white text-[#706C66] border border-[#E8E6E1] hover:bg-[#4A7B61]/10'
                  }`}
                >
                  <type.icon size={16} strokeWidth={1.5} className="mr-2" />
                  <span>{type.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Resource Cards */}
          <div className="px-5 sm:px-8 lg:px-10">
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <ResourceCardSkeleton key={i} />
                ))}
              </div>
            ) : filteredResources.length === 0 ? (
              <div className="text-center py-16">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#4A7B61]/15 text-[#4A7B61] mb-4">
                  <FileText size={24} strokeWidth={1.5} />
                </div>
                <h3 className="text-lg font-medium text-[#2C2925] mb-2">No resources found</h3>
                <p className="text-[#706C66] mb-6">Try adjusting your filters or search term</p>
                <button
                  onClick={resetFilters}
                  className="inline-flex items-center px-4 py-2 rounded-full bg-[#4A7B61] text-white hover:bg-[#4A7B61]/90 transition-colors"
                >
                  <RotateCcw size={16} strokeWidth={1.5} className="mr-2" />
                  <span>Reset filters</span>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredResources.map((resource) => (
                  <div
                    key={resource.id}
                    className="group relative flex flex-col rounded-2xl overflow-hidden h-[400px] bg-white border border-[#E8E6E1] transition-all duration-300 hover:translate-y-[-2px]"
                  >
                    <div className="relative h-48">
                      <img
                        src={resource.image}
                        alt={resource.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      {/* Type Badge */}
                      <div className="absolute top-4 left-4 z-10">
                        <div className="bg-white/90 text-[#2C2925] text-xs rounded-full px-3 py-1 font-medium shadow-sm">
                          {resourceTypes.find(t => t.id === resource.type)?.label}
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-6 flex flex-col flex-grow">
                      <h3 className="text-lg font-medium text-[#2C2925] mb-2 line-clamp-2 group-hover:text-[#4A7B61] transition-colors">
                        {resource.title}
                      </h3>
                      <p className="text-[#706C66] text-sm mb-4 line-clamp-2">
                        {resource.description}
                      </p>
                      
                      <div className="mt-auto flex justify-between items-center">
                        <div className="flex items-center text-[#706C66] text-xs">
                          <Clock size={14} strokeWidth={1.5} className="mr-1.5" />
                          <span>{resource.readTime}</span>
                        </div>
                        <div className="flex items-center text-[#706C66] text-xs">
                          <User size={14} strokeWidth={1.5} className="mr-1.5" />
                          <span>{resource.author.split(' ').slice(-1)[0]}</span>
                        </div>
                      </div>
                    </div>
                    
                    <a href="#" className="absolute inset-0 z-10">
                      <span className="sr-only">View {resource.title}</span>
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
