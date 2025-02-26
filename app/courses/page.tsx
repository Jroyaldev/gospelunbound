'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, X, ChevronDown, BookOpen, Clock, Star } from 'lucide-react';

// Define types for our course data
interface Course {
  id: string;
  title: string;
  description: string;
  instructor?: string;
  lessons: number;
  weeks: number;
  rating: number;
  image: string;
  tag?: string;
  level?: 'beginner' | 'intermediate' | 'advanced';
}

export default function CoursesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState({
    level: 'all',
    duration: 'all',
    category: 'all'
  });

  // Simulate loading state
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  // Filter options
  const filterOptions = {
    level: [
      { id: 'all', label: 'All Levels' },
      { id: 'beginner', label: 'Beginner' },
      { id: 'intermediate', label: 'Intermediate' },
      { id: 'advanced', label: 'Advanced' }
    ],
    duration: [
      { id: 'all', label: 'Any Duration' },
      { id: 'short', label: 'Short (< 8 weeks)' },
      { id: 'medium', label: 'Medium (8-12 weeks)' },
      { id: 'long', label: 'Long (> 12 weeks)' }
    ],
    category: [
      { id: 'all', label: 'All Categories' },
      { id: 'biblical-studies', label: 'Biblical Studies' },
      { id: 'theology', label: 'Theology' },
      { id: 'spiritual-formation', label: 'Spiritual Formation' },
      { id: 'church-history', label: 'Church History' },
      { id: 'languages', label: 'Biblical Languages' }
    ]
  };

  // Featured courses data with Unsplash images
  const featuredCourses = [
    {
      id: 'spiritual-formation',
      title: 'Spiritual Formation',
      description: 'Developing a deeper, more authentic faith journey',
      instructor: 'Dr. Emily Martinez',
      lessons: 36,
      weeks: 12,
      rating: 4.7,
      image: 'https://images.unsplash.com/photo-1490730141103-6cac27aaab94?w=1200&auto=format&fit=crop&q=80'
    },
    {
      id: 'biblical-hebrew',
      title: 'Biblical Hebrew',
      description: 'Understanding the Old Testament in its original language',
      instructor: 'Dr. Rachel Brown',
      lessons: 48,
      weeks: 16,
      rating: 4.8,
      image: 'https://images.unsplash.com/photo-1447023029226-ef8f6b52e3ea?w=1200&auto=format&fit=crop&q=80'
    },
    {
      id: 'early-church-history',
      title: 'Early Church History',
      description: 'Exploring the first centuries of Christianity',
      instructor: 'Dr. James Davis',
      lessons: 24,
      weeks: 8,
      rating: 4.7,
      image: 'https://images.unsplash.com/photo-1548407260-da850faa41e3?w=1200&auto=format&fit=crop&q=80'
    }
  ];

  // Biblical studies courses with Unsplash images
  const biblicalStudies = [
    {
      id: 'genesis',
      title: 'Genesis',
      description: 'Origins, creation, and the foundations of faith',
      instructor: 'Dr. Sarah Cohen',
      lessons: 42,
      weeks: 14,
      rating: 4.9,
      tag: 'Old Testament',
      image: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?w=1200&auto=format&fit=crop&q=80'
    },
    {
      id: 'exodus',
      title: 'Exodus',
      description: 'Liberation, law, and the journey to freedom',
      instructor: 'Dr. Michael Thompson',
      lessons: 36,
      weeks: 12,
      rating: 4.7,
      tag: 'Old Testament',
      image: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200&auto=format&fit=crop&q=80'
    },
    {
      id: 'matthew',
      title: 'Matthew',
      description: 'The life and teachings of Jesus Christ',
      instructor: 'Dr. John Anderson',
      lessons: 30,
      weeks: 10,
      rating: 4.9,
      tag: 'New Testament',
      image: 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?w=1200&auto=format&fit=crop&q=80'
    }
  ];

  // Apply filters to courses
  const filterCourses = (courses: Course[]): Course[] => {
    return courses.filter(course => {
      // Search query filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesSearch = 
          course.title.toLowerCase().includes(query) ||
          course.description.toLowerCase().includes(query) ||
          (course.instructor && course.instructor.toLowerCase().includes(query));
        
        if (!matchesSearch) return false;
      }
      
      // Level filter
      if (selectedFilters.level !== 'all') {
        // This is a placeholder - in a real app, each course would have a level property
        const courseLevel = course.level || 'intermediate';
        if (courseLevel !== selectedFilters.level) return false;
      }
      
      // Duration filter
      if (selectedFilters.duration !== 'all') {
        let durationMatch = true;
        
        if (selectedFilters.duration === 'short' && course.weeks >= 8) durationMatch = false;
        if (selectedFilters.duration === 'medium' && (course.weeks < 8 || course.weeks > 12)) durationMatch = false;
        if (selectedFilters.duration === 'long' && course.weeks <= 12) durationMatch = false;
        
        if (!durationMatch) return false;
      }
      
      // Category filter - placeholder implementation
      if (selectedFilters.category !== 'all') {
        // This is a placeholder - in a real app, each course would have a category property
        const courseCategory = course.tag?.toLowerCase() || 'biblical-studies';
        if (!courseCategory.includes(selectedFilters.category)) return false;
      }
      
      return true;
    });
  };

  const filteredFeaturedCourses = filterCourses(featuredCourses);
  const filteredBiblicalStudies = filterCourses(biblicalStudies);

  // Reset all filters
  const resetFilters = () => {
    setSelectedFilters({
      level: 'all',
      duration: 'all',
      category: 'all'
    });
    setSearchQuery('');
  };

  // Skeleton loader for course cards
  const CourseCardSkeleton = () => (
    <div className="relative rounded-2xl overflow-hidden h-[400px] bg-black/40">
      <div className="absolute inset-0 bg-white/5 backdrop-blur-xl" />
      <div className="relative h-48 bg-white/5 animate-pulse" />
      <div className="relative p-6 bg-black/40 h-[208px] flex flex-col">
        <div className="h-4 w-20 bg-white/10 rounded animate-pulse mb-3" />
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
    <main className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900/20 via-black to-black pb-20">
      {/* Background subtle patterns */}
      <div className="fixed inset-0 bg-[url('/noise.png')] opacity-[0.015] pointer-events-none mix-blend-overlay" />
      <div className="fixed inset-0 bg-gradient-to-b from-slate-500/5 via-transparent to-transparent pointer-events-none" />
      
      {/* Content */}
      <div className="relative">
        <div className="relative px-6 lg:px-8 py-24 mx-auto max-w-[90rem]">
          <div className="flex flex-col items-center text-center mb-16">
            <h1 className="text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-white/80 mb-6">
              Courses
            </h1>
            <p className="text-lg text-white/60 max-w-2xl">
              Dive deep into biblical studies, theology, and spiritual formation with our expert-led courses
            </p>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col space-y-4 mb-8 md:mb-16">
            <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4">
              <div className="flex-1 relative group">
                <div className="absolute inset-0 bg-white/5 rounded-2xl blur-md transition-all duration-300 group-hover:bg-white/10" />
                <div className="relative flex items-center bg-black/20 rounded-2xl">
                  <input
                    type="text"
                    placeholder="Search courses..."
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
                  onClick={() => setShowFilters(!showFilters)}
                  className="relative w-full md:w-auto flex items-center justify-between gap-3 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl px-6 py-4 text-white hover:bg-white/[0.12] transition-all duration-300"
                >
                  <div className="flex items-center gap-3">
                    <Filter className="w-4 h-4" />
                    <span className="text-sm font-medium">Filter</span>
                  </div>
                  <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${showFilters ? 'rotate-180' : ''}`} />
                </button>
              </div>
            </div>
            
            {/* Filter panel */}
            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Level filter */}
                      <div>
                        <h3 className="text-white/80 font-medium mb-3">Level</h3>
                        <div className="space-y-2">
                          {filterOptions.level.map(option => (
                            <button
                              key={option.id}
                              onClick={() => setSelectedFilters({...selectedFilters, level: option.id})}
                              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                                selectedFilters.level === option.id
                                  ? 'bg-white/20 text-white'
                                  : 'text-white/60 hover:bg-white/10 hover:text-white/80'
                              }`}
                            >
                              {option.label}
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      {/* Duration filter */}
                      <div>
                        <h3 className="text-white/80 font-medium mb-3">Duration</h3>
                        <div className="space-y-2">
                          {filterOptions.duration.map(option => (
                            <button
                              key={option.id}
                              onClick={() => setSelectedFilters({...selectedFilters, duration: option.id})}
                              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                                selectedFilters.duration === option.id
                                  ? 'bg-white/20 text-white'
                                  : 'text-white/60 hover:bg-white/10 hover:text-white/80'
                              }`}
                            >
                              {option.label}
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      {/* Category filter */}
                      <div>
                        <h3 className="text-white/80 font-medium mb-3">Category</h3>
                        <div className="space-y-2">
                          {filterOptions.category.map(option => (
                            <button
                              key={option.id}
                              onClick={() => setSelectedFilters({...selectedFilters, category: option.id})}
                              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                                selectedFilters.category === option.id
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
                        Reset Filters
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            
            {/* Active filters display */}
            {(selectedFilters.level !== 'all' || selectedFilters.duration !== 'all' || selectedFilters.category !== 'all' || searchQuery) && (
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
                
                {selectedFilters.level !== 'all' && (
                  <div className="flex items-center gap-1.5 bg-white/10 rounded-full px-3 py-1.5">
                    <span className="text-white/80 text-xs">
                      Level: {filterOptions.level.find(o => o.id === selectedFilters.level)?.label}
                    </span>
                    <button 
                      onClick={() => setSelectedFilters({...selectedFilters, level: 'all'})}
                      className="text-white/50 hover:text-white/80"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
                
                {selectedFilters.duration !== 'all' && (
                  <div className="flex items-center gap-1.5 bg-white/10 rounded-full px-3 py-1.5">
                    <span className="text-white/80 text-xs">
                      Duration: {filterOptions.duration.find(o => o.id === selectedFilters.duration)?.label}
                    </span>
                    <button 
                      onClick={() => setSelectedFilters({...selectedFilters, duration: 'all'})}
                      className="text-white/50 hover:text-white/80"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
                
                {selectedFilters.category !== 'all' && (
                  <div className="flex items-center gap-1.5 bg-white/10 rounded-full px-3 py-1.5">
                    <span className="text-white/80 text-xs">
                      Category: {filterOptions.category.find(o => o.id === selectedFilters.category)?.label}
                    </span>
                    <button 
                      onClick={() => setSelectedFilters({...selectedFilters, category: 'all'})}
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

          {/* Featured Courses */}
          <section className="mb-24">
            <div className="flex items-center justify-between mb-10">
              <h2 className="text-2xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/80">Featured Courses</h2>
              <Link href="/courses/featured" className="text-slate-400 hover:text-slate-300 transition-colors">
                View all
              </Link>
            </div>
            
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1, 2, 3].map(i => (
                  <CourseCardSkeleton key={i} />
                ))}
              </div>
            ) : filteredFeaturedCourses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredFeaturedCourses.map((course) => (
                  <motion.div
                    key={course.id}
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
                      <Link href={`/courses/${course.id}`} className="relative block h-full">
                        {/* Image container - static, no transform */}
                        <div className="relative h-48">
                          <div className="absolute inset-0 bg-black/20" />
                          <Image
                            src={course.image}
                            alt={course.title}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
                        </div>
                        
                        {/* Content section */}
                        <div className="relative p-6 bg-black/40 h-[208px] flex flex-col">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="flex items-center gap-1 text-yellow-400">
                              <Star className="w-4 h-4 fill-current" />
                              <span className="text-white/70">{course.rating}</span>
                            </div>
                          </div>
                          <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-slate-300 transition-colors line-clamp-1">{course.title}</h3>
                          <p className="text-white/70 text-sm mb-4 line-clamp-2 flex-grow">{course.description}</p>
                          <div className="flex items-center justify-between text-sm text-white/50">
                            <div className="flex items-center gap-1.5">
                              <BookOpen className="w-3.5 h-3.5" />
                              <span>{course.lessons} lessons</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5" />
                              <span>{course.weeks} weeks</span>
                            </div>
                          </div>
                        </div>

                        {/* Hover overlay with "View Course" button */}
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <div className="px-4 py-2 bg-white/20 backdrop-blur-md rounded-lg text-white text-sm font-medium transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                            View Course
                          </div>
                        </div>
                      </Link>
                      
                      {/* Border overlay */}
                      <div className="absolute inset-0 rounded-2xl border border-white/[0.1] group-hover:border-white/[0.2] transition-colors duration-300 pointer-events-none" />
                    </motion.div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
                <div className="text-white/40 mb-4">
                  <BookOpen className="w-12 h-12" />
                </div>
                <h3 className="text-xl font-medium text-white/80 mb-2">No courses found</h3>
                <p className="text-white/60 text-center max-w-md mb-6">We couldn't find any courses matching your current filters.</p>
                <button
                  onClick={resetFilters}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
                >
                  Reset Filters
                </button>
              </div>
            )}
          </section>

          {/* Biblical Studies */}
          <section>
            <div className="flex items-center justify-between mb-10">
              <h2 className="text-2xl font-semibold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/80">Biblical Studies</h2>
              <Link href="/courses/biblical-studies" className="text-slate-400 hover:text-slate-300 transition-colors">
                View all
              </Link>
            </div>
            
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[1, 2, 3].map(i => (
                  <CourseCardSkeleton key={i} />
                ))}
              </div>
            ) : filteredBiblicalStudies.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredBiblicalStudies.map((course) => (
                  <motion.div
                    key={course.id}
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
                      <Link href={`/courses/${course.id}`} className="relative block h-full">
                        {/* Image container - static, no transform */}
                        <div className="relative h-48">
                          <div className="absolute inset-0 bg-black/20" />
                          <Image
                            src={course.image}
                            alt={course.title}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent" />
                          {course.tag && (
                            <div className="absolute top-4 left-4 z-10">
                              <span className="px-3 py-1.5 text-xs rounded-full bg-black/40 backdrop-blur-md text-white/90 border border-white/20 font-medium">
                                {course.tag}
                              </span>
                            </div>
                          )}
                        </div>
                        
                        {/* Content section */}
                        <div className="relative p-6 bg-black/40 h-[208px] flex flex-col">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="flex items-center gap-1 text-yellow-400">
                              <Star className="w-4 h-4 fill-current" />
                              <span className="text-white/70">{course.rating}</span>
                            </div>
                          </div>
                          <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-slate-300 transition-colors line-clamp-1">{course.title}</h3>
                          <p className="text-white/70 text-sm mb-4 line-clamp-2 flex-grow">{course.description}</p>
                          <div className="flex items-center justify-between text-sm text-white/50">
                            <div className="flex items-center gap-1.5">
                              <BookOpen className="w-3.5 h-3.5" />
                              <span>{course.lessons} lessons</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Clock className="w-3.5 h-3.5" />
                              <span>{course.weeks} weeks</span>
                            </div>
                          </div>
                        </div>

                        {/* Hover overlay with "View Course" button */}
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <div className="px-4 py-2 bg-white/20 backdrop-blur-md rounded-lg text-white text-sm font-medium transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                            View Course
                          </div>
                        </div>
                      </Link>
                      
                      {/* Border overlay */}
                      <div className="absolute inset-0 rounded-2xl border border-white/[0.1] group-hover:border-white/[0.2] transition-colors duration-300 pointer-events-none" />
                    </motion.div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10">
                <div className="text-white/40 mb-4">
                  <BookOpen className="w-12 h-12" />
                </div>
                <h3 className="text-xl font-medium text-white/80 mb-2">No courses found</h3>
                <p className="text-white/60 text-center max-w-md mb-6">We couldn't find any courses matching your current filters.</p>
                <button
                  onClick={resetFilters}
                  className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
                >
                  Reset Filters
                </button>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
