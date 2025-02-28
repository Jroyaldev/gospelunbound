'use client';

import { useState, useEffect } from 'react';
import { Search, Filter, FileText, Video, Headphones, FileJson, Book, Image as ImageIcon, X, ChevronDown, Calendar, Clock, User, RotateCcw, Check } from 'lucide-react';
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
    <main className="min-h-screen bg-background text-foreground">
      {/* Content */}
      <div className="w-full px-4 md:px-6 lg:px-8 py-8 sm:py-10 lg:py-12">
        <div className="max-w-[90rem] mx-auto">
          {/* Header with decorative background - updated to match courses page */}
          <div className="relative rounded-xl overflow-hidden mb-8 mx-4 sm:mx-6 lg:mx-8">
            <div className="absolute inset-0 bg-[#F5F0E8] opacity-70"></div>
            <div className="relative z-10 px-6 py-8 md:px-8 md:py-10">
              <div className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-white/90 text-foreground/70 mb-4">
                <span>Curated content for progressive faith</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-medium tracking-tight text-foreground mb-2">
                Resources
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground max-w-md">
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
                    <Search size={16} strokeWidth={1.5} className="text-muted-foreground" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search resources..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="block w-full py-2.5 pl-10 pr-3 border border-border rounded-full bg-white text-foreground placeholder-muted-foreground focus:border-[#E8D5C8] focus:ring-[#E8D5C8] transition-all duration-200 min-h-[44px]"
                  />
                </div>
                
                <button
                  onClick={() => setShowFilters(true)}
                  className="flex items-center justify-center min-h-[44px] px-4 py-2 bg-white border border-border rounded-full text-foreground hover:bg-[#F5F0E8]/30 transition-all duration-200"
                >
                  <Filter size={16} strokeWidth={1.5} className="mr-2" />
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
                  <div className="flex items-center gap-1.5 bg-[#F5F0E8]/30 rounded-full px-3 py-1.5">
                    <span className="text-foreground/80 text-xs">Search: {searchQuery}</span>
                    <button 
                      onClick={() => setSearchQuery('')}
                      className="text-foreground/50 hover:text-foreground transition-colors"
                    >
                      <X size={14} strokeWidth={1.5} />
                    </button>
                  </div>
                )}
                
                {selectedType !== 'all' && (
                  <div className="flex items-center gap-1.5 bg-[#F5F0E8]/30 rounded-full px-3 py-1.5">
                    <span className="text-foreground/80 text-xs">Type: {resourceTypes.find(t => t.id === selectedType)?.label}</span>
                    <button 
                      onClick={() => setSelectedType('all')}
                      className="text-foreground/50 hover:text-foreground transition-colors"
                    >
                      <X size={14} strokeWidth={1.5} />
                    </button>
                  </div>
                )}
                
                {advancedFilters.date !== 'all' && (
                  <div className="flex items-center gap-1.5 bg-[#F5F0E8]/30 rounded-full px-3 py-1.5">
                    <span className="text-foreground/80 text-xs">Date: {advancedFilters.date}</span>
                    <button 
                      onClick={() => setAdvancedFilters({...advancedFilters, date: 'all'})}
                      className="text-foreground/50 hover:text-foreground transition-colors"
                    >
                      <X size={14} strokeWidth={1.5} />
                    </button>
                  </div>
                )}
                
                {advancedFilters.author !== 'all' && (
                  <div className="flex items-center gap-1.5 bg-[#F5F0E8]/30 rounded-full px-3 py-1.5">
                    <span className="text-foreground/80 text-xs">Author: {advancedFilters.author}</span>
                    <button 
                      onClick={() => setAdvancedFilters({...advancedFilters, author: 'all'})}
                      className="text-foreground/50 hover:text-foreground transition-colors"
                    >
                      <X size={14} strokeWidth={1.5} />
                    </button>
                  </div>
                )}
                
                {advancedFilters.readTime !== 'all' && (
                  <div className="flex items-center gap-1.5 bg-[#F5F0E8]/30 rounded-full px-3 py-1.5">
                    <span className="text-foreground/80 text-xs">Read time: {advancedFilters.readTime}</span>
                    <button 
                      onClick={() => setAdvancedFilters({...advancedFilters, readTime: 'all'})}
                      className="text-foreground/50 hover:text-foreground transition-colors"
                    >
                      <X size={14} strokeWidth={1.5} />
                    </button>
                  </div>
                )}
                
                <button
                  onClick={resetFilters}
                  className="flex items-center gap-1.5 text-xs text-foreground/60 hover:text-foreground/80 transition-colors"
                >
                  <XCircle size={14} strokeWidth={1.5} />
                  <span>Clear all</span>
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
                  className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40"
                  onClick={() => setShowFilters(false)}
                />
                
                {/* Drawer */}
                <motion.div
                  initial={{ x: '100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '100%' }}
                  transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                  className="fixed top-0 right-0 h-full w-[85%] max-w-md bg-background border-l border-border z-50 overflow-y-auto"
                >
                  <div className="sticky top-0 bg-background border-b border-border z-10 flex justify-between items-center p-4">
                    <h2 className="font-medium text-lg tracking-tight">Filters</h2>
                    <button 
                      onClick={() => setShowFilters(false)}
                      className="p-2 text-foreground hover:bg-[#F5F0E8]/50 rounded-full transition-colors"
                    >
                      <X size={20} strokeWidth={1.5} />
                      <span className="sr-only">Close</span>
                    </button>
                  </div>
                  
                  <div className="p-4 space-y-6">
                    {/* Resource Type Filter */}
                    <div className="space-y-3">
                      <h3 className="font-medium text-foreground/90 tracking-tight">Resource Type</h3>
                      <div className="grid grid-cols-1 gap-2 ml-1">
                        {resourceTypes.map((type) => (
                          <button
                            key={type.id}
                            onClick={() => setSelectedType(type.id)}
                            className={`flex items-center justify-between w-full px-3 py-2 text-left rounded-md transition-colors ${
                              selectedType === type.id ? 
                                type.id === 'articles' ? 'bg-[#F5F0E8] text-foreground' : 
                                type.id === 'videos' ? 'bg-[#E8D5C8] text-foreground' : 
                                type.id === 'audios' ? 'bg-[#D7A392]/70 text-white' :
                                type.id === 'study-guides' ? 'bg-[#F5F0E8]/80 text-foreground' :
                                type.id === 'pdfs' ? 'bg-[#D7A392]/80 text-white' :
                                type.id === 'infographics' ? 'bg-[#E8D5C8]/90 text-foreground' :
                                'bg-[#F5F0E8] text-foreground/70'
                              : 'bg-white border border-border text-muted-foreground hover:text-foreground hover:bg-[#F5F0E8]/10'
                            }`}
                          >
                            <div className="flex items-center">
                              <type.icon size={16} strokeWidth={1.5} className="mr-2" />
                              <span>{type.label}</span>
                            </div>
                            {selectedType === type.id && (
                              <Check size={16} strokeWidth={1.5} className="text-[#D7A392]" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    {/* Date Filter */}
                    <div className="space-y-3">
                      <h3 className="font-medium text-foreground/90 tracking-tight">Date</h3>
                      <div className="grid grid-cols-1 gap-2 ml-1">
                        {filterOptions.date.map((option) => (
                          <button
                            key={option.id}
                            onClick={() => handleFilterChange('date', option.id)}
                            className={`flex items-center justify-between w-full px-3 py-2 text-left rounded-md transition-colors ${
                              advancedFilters.date === option.id
                                ? 'bg-[#F5F0E8] text-foreground font-medium'
                                : 'hover:bg-[#F5F0E8]/30 text-muted-foreground'
                            }`}
                          >
                            <span>{option.label}</span>
                            {advancedFilters.date === option.id && (
                              <Check size={16} strokeWidth={1.5} className="text-[#D7A392]" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    {/* Author Filter */}
                    <div className="space-y-3">
                      <h3 className="font-medium text-foreground/90 tracking-tight">Author</h3>
                      <div className="grid grid-cols-1 gap-2 ml-1 max-h-48 overflow-y-auto">
                        {filterOptions.author.map((option) => (
                          <button
                            key={option.id}
                            onClick={() => handleFilterChange('author', option.id)}
                            className={`flex items-center justify-between w-full px-3 py-2 text-left rounded-md transition-colors ${
                              advancedFilters.author === option.id
                                ? 'bg-[#F5F0E8] text-foreground font-medium'
                                : 'hover:bg-[#F5F0E8]/30 text-muted-foreground'
                            }`}
                          >
                            <span>{option.label}</span>
                            {advancedFilters.author === option.id && (
                              <Check size={16} strokeWidth={1.5} className="text-[#D7A392]" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    {/* Read Time Filter */}
                    <div className="space-y-3">
                      <h3 className="font-medium text-foreground/90 tracking-tight">Length</h3>
                      <div className="grid grid-cols-1 gap-2 ml-1">
                        {filterOptions.readTime.map((option) => (
                          <button
                            key={option.id}
                            onClick={() => handleFilterChange('readTime', option.id)}
                            className={`flex items-center justify-between w-full px-3 py-2 text-left rounded-md transition-colors ${
                              advancedFilters.readTime === option.id
                                ? 'bg-[#F5F0E8] text-foreground font-medium'
                                : 'hover:bg-[#F5F0E8]/30 text-muted-foreground'
                            }`}
                          >
                            <span>{option.label}</span>
                            {advancedFilters.readTime === option.id && (
                              <Check size={16} strokeWidth={1.5} className="text-[#D7A392]" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="sticky bottom-0 bg-background border-t border-border p-4">
                    <button
                      onClick={() => setShowFilters(false)}
                      className="w-full py-2.5 px-4 bg-[#D7A392] text-white rounded-full transition-all hover:bg-[#D7A392]/90"
                    >
                      Apply Filters
                    </button>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* Resource Type Filters */}
          <div className="px-5 sm:px-8 lg:px-10 mb-8 overflow-x-auto pb-2">
            <div className="flex space-x-2 min-w-max">
              {resourceTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setSelectedType(type.id)}
                  className={`flex items-center justify-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all duration-300 min-h-[44px] ${
                    selectedType === type.id ? 
                      type.id === 'articles' ? 'bg-[#F5F0E8] text-foreground' : 
                      type.id === 'videos' ? 'bg-[#E8D5C8] text-foreground' : 
                      type.id === 'audios' ? 'bg-[#D7A392]/70 text-white' :
                      type.id === 'study-guides' ? 'bg-[#F5F0E8]/80 text-foreground' :
                      type.id === 'pdfs' ? 'bg-[#D7A392]/80 text-white' :
                      type.id === 'infographics' ? 'bg-[#E8D5C8]/90 text-foreground' :
                      'bg-[#F5F0E8] text-foreground/70'
                    : 'bg-white border border-border text-muted-foreground hover:text-foreground hover:bg-[#F5F0E8]/10'
                  }`}
                >
                  <type.icon className="w-4 h-4" strokeWidth={1.5} />
                  <span className="tracking-tight">{type.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Resource Cards */}
          <div className="px-5 sm:px-8 lg:px-10 mb-12">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {isLoading ? (
                // Skeleton loaders
                Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="relative rounded-2xl overflow-hidden bg-white border border-border shadow-sm hover:shadow-md transition-all duration-300 hover:translate-y-[-2px]">
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
                ))
              ) : filteredResources.length > 0 ? (
                // Resource cards
                filteredResources.map((resource) => (
                  <div key={resource.id} className="group relative rounded-2xl overflow-hidden border border-border bg-white hover:shadow-md transition-all duration-300 hover:translate-y-[-2px] hover:border-[#D7A392]/40">
                    <div className="aspect-video relative">
                      <Image
                        src={resource.image}
                        alt={resource.title}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                      />
                      <div className="absolute inset-0 bg-gradient-to-b from-black/0 to-black/40"></div>
                    </div>
                    <div className="p-6">
                      <div className="flex items-center mb-3 text-xs text-muted-foreground">
                        <div className={`rounded-full px-3 py-1 text-xs font-medium ${
                          resource.type === 'articles' ? 'bg-[#E8D5C8]/20 text-[#E8D5C8]' : 
                          resource.type === 'videos' ? 'bg-[#D7A392]/20 text-[#D7A392]' : 
                          resource.type === 'audios' ? 'bg-[#D2D3C9]/20 text-[#D2D3C9]' : 
                          resource.type === 'study-guides' ? 'bg-[#F5F0E8]/20 text-foreground/70' : 
                          'bg-[#F5F0E8]/20 text-foreground/70'
                        }`}>
                          <div className="flex items-center">
                            {resource.type === 'articles' && <FileText className="w-3.5 h-3.5 mr-1.5" strokeWidth={1.5} />}
                            {resource.type === 'videos' && <Video className="w-3.5 h-3.5 mr-1.5" strokeWidth={1.5} />}
                            {resource.type === 'study-guides' && <Book className="w-3.5 h-3.5 mr-1.5" strokeWidth={1.5} />}
                            {resource.type === 'audios' && <Headphones className="w-3.5 h-3.5 mr-1.5" strokeWidth={1.5} />}
                            {resource.type === 'infographics' && <ImageIcon className="w-3.5 h-3.5 mr-1.5" strokeWidth={1.5} />}
                            {resource.type === 'pdfs' && <FileJson className="w-3.5 h-3.5 mr-1.5" strokeWidth={1.5} />}
                            <span>{resource.readTime}</span>
                          </div>
                        </div>
                      </div>
                      <h3 className="text-lg font-medium text-foreground mb-2 tracking-tight">{resource.title}</h3>
                      <p className="text-sm text-muted-foreground mb-4">{resource.description}</p>
                      <div className="flex items-center justify-between mt-auto pt-4 border-t border-border text-xs text-muted-foreground">
                        <div className="flex items-center">
                          <User className="w-3.5 h-3.5 mr-1.5" strokeWidth={1.5} />
                          <span>{resource.author}</span>
                        </div>
                        <div className="flex items-center">
                          <Calendar className="w-3.5 h-3.5 mr-1.5" strokeWidth={1.5} />
                          <span>
                            {new Date(resource.date).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                    <a href="#" className="absolute inset-0" aria-label={`View ${resource.title}`}>
                      <span className="sr-only">View resource</span>
                    </a>
                  </div>
                ))
              ) : (
                // No results message
                <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-16 h-16 rounded-full bg-[#F5F0E8] flex items-center justify-center mb-4">
                    <Search className="w-8 h-8 text-[#E8D5C8]" strokeWidth={1.5} />
                  </div>
                  <h3 className="text-xl font-medium text-foreground mb-2">No resources found</h3>
                  <p className="text-muted-foreground mb-6 max-w-md">
                    We couldn't find any resources matching your current filters. Try adjusting your search criteria.
                  </p>
                  <button
                    onClick={resetFilters}
                    className="flex items-center gap-2 border border-border rounded-full px-6 py-3 text-sm font-medium text-foreground hover:bg-[#F5F0E8]/10 transition-all duration-200"
                  >
                    <X className="w-4 h-4" strokeWidth={1.5} />
                    Clear all filters
                  </button>
                </div>
              )}
            </div>

            {/* Pagination */}
            <div className="flex justify-center items-center space-x-2 mt-8">
              <button className="inline-flex items-center justify-center rounded-full border border-border w-10 h-10 text-sm text-muted-foreground hover:bg-[#F5F0E8]/30 hover:text-foreground">
                <span className="sr-only">Previous page</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
              </button>
              <button className="inline-flex items-center justify-center rounded-full w-10 h-10 text-sm bg-[#E8D5C8] text-foreground">1</button>
              <button className="inline-flex items-center justify-center rounded-full border border-border w-10 h-10 text-sm text-muted-foreground hover:bg-[#F5F0E8]/30 hover:text-foreground">2</button>
              <button className="inline-flex items-center justify-center rounded-full border border-border w-10 h-10 text-sm text-muted-foreground hover:bg-[#F5F0E8]/30 hover:text-foreground">3</button>
              <span className="text-muted-foreground mx-1">...</span>
              <button className="inline-flex items-center justify-center rounded-full border border-border w-10 h-10 text-sm text-muted-foreground hover:bg-[#F5F0E8]/30 hover:text-foreground">8</button>
              <button className="inline-flex items-center justify-center rounded-full border border-border w-10 h-10 text-sm text-muted-foreground hover:bg-[#F5F0E8]/30 hover:text-foreground">
                <span className="sr-only">Next page</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
