'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, X, ChevronDown, BookOpen, Clock, Star, ChevronRight, Check, RotateCcw } from 'lucide-react';

// Define the hero green with consistent opacity 
const HERO_GREEN = '#4A7B61';

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

// Course card component with consistent styling for featured items
const CourseCard = ({ course, featured = false, className = "" }: { course: Course, featured?: boolean, className?: string }) => {
  return (
    <div className={`group relative flex flex-col rounded-2xl border border-[#E8E6E1] bg-white hover:border-[#4A7B61]/40 hover:shadow-md transition-all duration-300 hover:translate-y-[-2px] ${className}`}>
      <div className="relative aspect-video overflow-hidden rounded-t-2xl">
        <Image 
          src={course.image} 
          alt={course.title}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          priority={featured}
          className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#2C2925]/50 via-[#2C2925]/10 to-transparent"></div>
        
        {featured && (
          <div className="absolute top-3 left-3 bg-[#4A7B61] text-white text-xs px-3 py-1 rounded-full">
            Featured
          </div>
        )}
        
        {course.tag && !featured && (
          <div className="absolute top-3 left-3 bg-[#F8F7F2] text-[#2C2925]/70 text-xs px-3 py-1 rounded-full shadow-sm">
            {course.tag}
          </div>
        )}
        
        {course.level && (
          <div className="absolute bottom-3 left-3 bg-white/90 text-[#2C2925]/70 text-xs px-3 py-1 rounded-full shadow-sm">
            {course.level.charAt(0).toUpperCase() + course.level.slice(1)}
          </div>
        )}
      </div>
      
      <div className="flex flex-col flex-grow p-5 sm:p-6">
        <h3 className="text-base sm:text-lg font-medium mb-1 text-[#2C2925] group-hover:text-[#4A7B61] transition-colors">
          {course.title}
        </h3>
        
        <p className="text-sm text-[#706C66] mb-4 line-clamp-2">
          {course.description}
        </p>
        
        <div className="mt-auto">
          {course.instructor && (
            <div className="text-xs text-[#706C66] mb-3">
              Instructor: <span className="text-[#2C2925]">{course.instructor}</span>
            </div>
          )}
          
          <div className="flex items-center justify-between text-xs sm:text-sm">
            <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-3 space-y-2 sm:space-y-0">
              <div className="flex items-center text-[#706C66]">
                <BookOpen size={14} strokeWidth={1.5} className="mr-1.5" />
                <span>{course.lessons} lessons</span>
              </div>
              <div className="flex items-center text-[#706C66]">
                <Clock size={14} strokeWidth={1.5} className="mr-1.5" />
                <span>{course.weeks} weeks</span>
              </div>
            </div>
            
            <div className="flex items-center text-[#4A7B61]">
              <Star size={14} strokeWidth={1.5} className="mr-1" fill="currentColor" />
              <span className="font-medium">{course.rating}</span>
            </div>
          </div>
        </div>
        
        <Link 
          href={`/courses/${course.id}`} 
          className="absolute inset-0"
          aria-label={`View ${course.title} course details`}
        >
          <span className="sr-only">View {course.title}</span>
        </Link>
      </div>
    </div>
  );
};

// Course Section Component
const CourseSection = ({ title, subtitle, courses }: { title: string, subtitle?: string, courses: Course[] }) => {
  return (
    <section className="mb-12">
      <div className="mb-5">
        <h2 className="text-xl font-medium text-[#2C2925] mb-1">{title}</h2>
        {subtitle && <p className="text-sm text-[#706C66]">{subtitle}</p>}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {courses.map((course) => (
          <CourseCard key={course.id} course={course} />
        ))}
      </div>
    </section>
  );
};

// Mobile filters drawer
const MobileFilters = ({ 
  isOpen, 
  onClose, 
  filterOptions, 
  selectedFilters, 
  onFilterChange 
}: {
  isOpen: boolean,
  onClose: () => void,
  filterOptions: Record<string, { id: string, label: string }[]>,
  selectedFilters: Record<string, string>,
  onFilterChange: (key: string, value: string) => void
}) => {
  // Wrapper function to handle type conversion
  const handleChange = (key: string, value: string) => {
    if (key === 'level' || key === 'duration' || key === 'category') {
      onFilterChange(key, value);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-[#2C2925]/20 backdrop-blur-sm z-40"
            onClick={onClose}
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
                onClick={onClose}
                className="p-2 text-[#706C66] hover:bg-[#4A7B61]/15 rounded-full transition-colors"
              >
                <X size={20} strokeWidth={1.5} />
                <span className="sr-only">Close</span>
              </button>
            </div>
            
            <div className="p-4 space-y-6">
              {Object.entries(filterOptions).map(([key, options]) => (
                <div key={key} className="space-y-3">
                  <h3 className="font-medium capitalize text-[#2C2925]/90 tracking-tight">
                    {key === 'category' ? 'Categories' : key === 'level' ? 'Level' : 'Duration'}
                  </h3>
                  
                  <div className="grid grid-cols-1 gap-2 ml-1">
                    {options.map((option) => (
                      <button
                        key={option.id}
                        onClick={() => handleChange(key, option.id)}
                        className={`flex items-center justify-between w-full px-3 py-2 text-left rounded-md transition-colors ${
                          selectedFilters[key] === option.id
                            ? 'bg-[#4A7B61]/15 text-[#2C2925] font-medium'
                            : 'hover:bg-[#4A7B61]/10 text-[#706C66]'
                        }`}
                      >
                        <span>{option.label}</span>
                        {selectedFilters[key] === option.id && (
                          <Check size={16} strokeWidth={1.5} className="text-[#4A7B61]" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="sticky bottom-0 bg-[#F8F7F2] border-t border-[#E8E6E1] p-4">
              <button
                onClick={onClose}
                className="w-full py-2.5 px-4 bg-[#4A7B61] text-white rounded-full transition-all hover:bg-[#4A7B61]/90"
              >
                Apply Filters
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

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
      image: 'https://images.unsplash.com/photo-1544033527-b192daee1f5b?w=1200&auto=format&fit=crop&q=80'
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

  // Theology courses
  const theologyCourses = [
    {
      id: 'progressive-theology',
      title: 'Progressive Theology',
      description: 'Exploring modern theological interpretations and their ethical implications',
      instructor: 'Dr. Sarah Williams',
      lessons: 28,
      weeks: 10,
      rating: 4.9,
      image: 'https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=1200&auto=format&fit=crop&q=80'
    },
    {
      id: 'liberation-theology',
      title: 'Liberation Theology',
      description: 'Understanding theological perspectives focused on social justice and freedom',
      instructor: 'Dr. Miguel Rodriguez',
      lessons: 24,
      weeks: 8,
      rating: 4.8,
      image: 'https://images.unsplash.com/photo-1588345921523-c2dcdb7f1dcd?w=1200&auto=format&fit=crop&q=80'
    },
    {
      id: 'feminist-theology',
      title: 'Feminist Theology',
      description: 'Exploring theological concepts through feminist interpretation and critique',
      instructor: 'Dr. Elizabeth Chen',
      lessons: 20,
      weeks: 8,
      rating: 4.7,
      image: 'https://images.unsplash.com/photo-1504052434569-70ad5836ab65?w=1200&auto=format&fit=crop&q=80'
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
  const filteredTheologyCourses = filterCourses(theologyCourses);

  // Reset all filters
  const resetFilters = () => {
    setSelectedFilters({
      level: 'all',
      duration: 'all',
      category: 'all'
    });
    setSearchQuery('');
  };

  const handleFilterChange = (key: string, value: string) => {
    setSelectedFilters({ ...selectedFilters, [key]: value });
  };

  return (
    <main className="min-h-screen bg-[#F8F7F2] text-[#2C2925]">
      {/* Content */}
      <div className="w-full px-4 md:px-6 lg:px-8 py-8 sm:py-10 lg:py-12">
        <div className="max-w-[90rem] mx-auto">
          {/* Header with light green background - matches resources page */}
          <div className="relative rounded-2xl overflow-hidden mb-8 mx-4 sm:mx-6 lg:mx-8 border border-[#4A7B61]/20">
            <div className="absolute inset-0 bg-[#4A7B61]/15"></div>
            <div className="relative z-10 px-6 py-8 md:px-8 md:py-10">
              <div className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-[#4A7B61]/20 text-[#4A7B61] mb-4">
                <span>Learn at your own pace</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-medium tracking-tight text-[#2C2925] mb-2">
                Explore Our Courses
              </h1>
              <p className="text-sm sm:text-base text-[#706C66] max-w-md">
                Thoughtfully designed courses for progressive faith journeys
              </p>
            </div>
          </div>
          
          {/* Search and Filters */}
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
                    placeholder="Search courses..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="block w-full py-2.5 pl-10 pr-3 border border-[#E8E6E1] rounded-full bg-white text-[#2C2925] placeholder-[#706C66] focus:border-[#4A7B61]/50 focus:outline-none focus:ring-1 focus:ring-[#4A7B61]/50 transition-all duration-200 min-h-[44px]"
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
          {(selectedFilters.level !== 'all' || selectedFilters.duration !== 'all' || selectedFilters.category !== 'all' || searchQuery) && (
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
                
                {selectedFilters.level !== 'all' && (
                  <div className="flex items-center gap-1.5 bg-[#4A7B61]/15 rounded-full px-3 py-1.5">
                    <span className="text-[#2C2925]/80 text-xs">Level: {filterOptions.level.find(option => option.id === selectedFilters.level)?.label}</span>
                    <button 
                      onClick={() => handleFilterChange('level', 'all')}
                      className="text-[#2C2925]/50 hover:text-[#2C2925] transition-colors"
                    >
                      <X size={14} strokeWidth={1.5} />
                    </button>
                  </div>
                )}
                
                {selectedFilters.duration !== 'all' && (
                  <div className="flex items-center gap-1.5 bg-[#4A7B61]/15 rounded-full px-3 py-1.5">
                    <span className="text-[#2C2925]/80 text-xs">Duration: {filterOptions.duration.find(option => option.id === selectedFilters.duration)?.label}</span>
                    <button 
                      onClick={() => handleFilterChange('duration', 'all')}
                      className="text-[#2C2925]/50 hover:text-[#2C2925] transition-colors"
                    >
                      <X size={14} strokeWidth={1.5} />
                    </button>
                  </div>
                )}
                
                {selectedFilters.category !== 'all' && (
                  <div className="flex items-center gap-1.5 bg-[#4A7B61]/15 rounded-full px-3 py-1.5">
                    <span className="text-[#2C2925]/80 text-xs">Category: {filterOptions.category.find(option => option.id === selectedFilters.category)?.label}</span>
                    <button 
                      onClick={() => handleFilterChange('category', 'all')}
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

          {/* Mobile Filters */}
          <MobileFilters
            isOpen={showFilters}
            onClose={() => setShowFilters(false)}
            filterOptions={filterOptions}
            selectedFilters={selectedFilters}
            onFilterChange={handleFilterChange}
          />

          {/* Featured Courses */}
          <div className="px-5 sm:px-8 lg:px-10">
            <div className="mb-5">
              <h2 className="text-xl font-medium tracking-tight text-[#2C2925] mb-1">Featured Courses</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {isLoading ? (
                Array(3).fill(0).map((_, index) => (
                  <div key={index} className="rounded-2xl bg-white border border-[#E8E6E1] animate-pulse">
                    <div className="aspect-video bg-[#F8F7F2] rounded-t-2xl"></div>
                    <div className="p-4 space-y-3">
                      <div className="h-5 bg-[#F8F7F2] rounded-full w-2/3"></div>
                      <div className="h-4 bg-[#F8F7F2] rounded-full w-full"></div>
                      <div className="h-4 bg-[#F8F7F2] rounded-full w-3/4"></div>
                      <div className="h-4 bg-[#F8F7F2] rounded-full w-1/2"></div>
                    </div>
                  </div>
                ))
              ) : filteredFeaturedCourses.length > 0 ? (
                filteredFeaturedCourses.map((course) => (
                  <CourseCard key={course.id} course={course} featured={true} />
                ))
              ) : (
                <div className="col-span-1 md:col-span-3 py-10 text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#F8F7F2] mb-4">
                    <Search size={20} strokeWidth={1.5} className="text-[#4A7B61]" />
                  </div>
                  <p className="text-[#2C2925] font-medium mb-2">No courses found matching your filters</p>
                  <p className="text-[#706C66] text-sm mb-4">Try adjusting your search or filters to find what you're looking for</p>
                  <button
                    onClick={resetFilters}
                    className="text-[#4A7B61] hover:underline underline-offset-4 text-sm flex items-center mx-auto gap-1"
                  >
                    <RotateCcw size={14} strokeWidth={1.5} />
                    Reset filters
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Biblical Studies */}
          <div className="space-y-12 sm:space-y-16 mt-8 px-5 sm:px-8 lg:px-10">
            <div className="mb-5 flex justify-between items-end">
              <div>
                <h2 className="text-xl font-medium tracking-tight text-[#2C2925] mb-1">Biblical Studies</h2>
                <p className="text-sm text-[#706C66]">Explore the foundations of faith</p>
              </div>
              <Link 
                href="/courses/biblical-studies"
                className="text-sm text-[#4A7B61] flex items-center gap-1 hover:underline underline-offset-4"
              >
                View all
                <ChevronRight size={14} strokeWidth={1.5} />
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {isLoading ? (
                Array(3).fill(0).map((_, index) => (
                  <div key={index} className="rounded-2xl bg-white border border-[#E8E6E1] animate-pulse">
                    <div className="aspect-video bg-[#F8F7F2] rounded-t-2xl"></div>
                    <div className="p-4 space-y-3">
                      <div className="h-5 bg-[#F8F7F2] rounded-full w-2/3"></div>
                      <div className="h-4 bg-[#F8F7F2] rounded-full w-full"></div>
                      <div className="h-4 bg-[#F8F7F2] rounded-full w-3/4"></div>
                      <div className="h-4 bg-[#F8F7F2] rounded-full w-1/2"></div>
                    </div>
                  </div>
                ))
              ) : filteredBiblicalStudies.length > 0 ? (
                filteredBiblicalStudies.map((course) => (
                  <CourseCard key={course.id} course={course} />
                ))
              ) : (
                <div className="col-span-1 md:col-span-3 py-10 text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#F8F7F2] mb-4">
                    <Search size={20} strokeWidth={1.5} className="text-[#4A7B61]" />
                  </div>
                  <p className="text-[#2C2925] font-medium mb-2">No biblical studies courses found matching your filters</p>
                  <p className="text-[#706C66] text-sm mb-4">Try adjusting your search or filters to find what you're looking for</p>
                  <button
                    onClick={resetFilters}
                    className="text-[#4A7B61] hover:underline underline-offset-4 text-sm flex items-center mx-auto gap-1"
                  >
                    <RotateCcw size={14} strokeWidth={1.5} />
                    Reset filters
                  </button>
                </div>
              )}
            </div>
          </div>
          
          {/* Theology Studies */}
          <div className="space-y-12 sm:space-y-16 mt-8 px-5 sm:px-8 lg:px-10">
            <div className="mb-5 flex justify-between items-end">
              <div>
                <h2 className="text-xl font-medium tracking-tight text-[#2C2925] mb-1">Theology</h2>
                <p className="text-sm text-[#706C66]">Examine theological concepts with contemporary perspectives</p>
              </div>
              <Link 
                href="/courses/theology"
                className="text-sm text-[#4A7B61] flex items-center gap-1 hover:underline underline-offset-4"
              >
                View all
                <ChevronRight size={14} strokeWidth={1.5} />
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {isLoading ? (
                Array(3).fill(0).map((_, index) => (
                  <div key={index} className="rounded-2xl bg-white border border-[#E8E6E1] animate-pulse">
                    <div className="aspect-video bg-[#F8F7F2] rounded-t-2xl"></div>
                    <div className="p-4 space-y-3">
                      <div className="h-5 bg-[#F8F7F2] rounded-full w-2/3"></div>
                      <div className="h-4 bg-[#F8F7F2] rounded-full w-full"></div>
                      <div className="h-4 bg-[#F8F7F2] rounded-full w-3/4"></div>
                      <div className="h-4 bg-[#F8F7F2] rounded-full w-1/2"></div>
                    </div>
                  </div>
                ))
              ) : filteredTheologyCourses.length > 0 ? (
                filteredTheologyCourses.map((course) => (
                  <CourseCard key={course.id} course={course} />
                ))
              ) : (
                <div className="col-span-1 md:col-span-3 py-10 text-center">
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-[#F8F7F2] mb-4">
                    <Search size={20} strokeWidth={1.5} className="text-[#4A7B61]" />
                  </div>
                  <p className="text-[#2C2925] font-medium mb-2">No theology courses found matching your filters</p>
                  <p className="text-[#706C66] text-sm mb-4">Try adjusting your search or filters to find what you're looking for</p>
                  <button
                    onClick={resetFilters}
                    className="text-[#4A7B61] hover:underline underline-offset-4 text-sm flex items-center mx-auto gap-1"
                  >
                    <RotateCcw size={14} strokeWidth={1.5} />
                    Reset filters
                  </button>
                </div>
              )}
            </div>
          </div>
          
          {/* Show no results message if all sections are empty */}
          {filteredFeaturedCourses.length === 0 && filteredBiblicalStudies.length === 0 && filteredTheologyCourses.length === 0 && (
            <div className="px-5 sm:px-8 lg:px-10 py-16 text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#4A7B61]/15 text-[#4A7B61] mb-4">
                <BookOpen size={24} strokeWidth={1.5} />
              </div>
              <h3 className="text-lg font-medium text-[#2C2925] mb-2">No courses found</h3>
              <p className="text-[#706C66] mb-6 max-w-md mx-auto">Try adjusting your filters or search term</p>
              <button
                onClick={resetFilters}
                className="inline-flex items-center px-4 py-2 rounded-full bg-[#4A7B61] text-white hover:bg-[#4A7B61]/90 transition-colors"
              >
                <RotateCcw size={16} strokeWidth={1.5} className="mr-2" />
                <span>Reset filters</span>
              </button>
            </div>
          )}
          
          {/* Pagination */}
          <div className="flex justify-center items-center space-x-2 mt-10 mb-6">
            <button className="inline-flex items-center justify-center rounded-full border border-[#E8E6E1] w-10 h-10 text-sm text-[#706C66] hover:bg-[#F8F7F2]/30 hover:text-[#2C2925]">
              <span className="sr-only">Previous page</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
            </button>
            <button className="inline-flex items-center justify-center rounded-full w-10 h-10 text-sm bg-[#4A7B61] text-white">1</button>
            <button className="inline-flex items-center justify-center rounded-full border border-[#E8E6E1] w-10 h-10 text-sm text-[#706C66] hover:bg-[#F8F7F2]/30 hover:text-[#2C2925]">2</button>
            <button className="inline-flex items-center justify-center rounded-full border border-[#E8E6E1] w-10 h-10 text-sm text-[#706C66] hover:bg-[#F8F7F2]/30 hover:text-[#2C2925]">3</button>
            <span className="text-[#706C66] mx-1">...</span>
            <button className="inline-flex items-center justify-center rounded-full border border-[#E8E6E1] w-10 h-10 text-sm text-[#706C66] hover:bg-[#F8F7F2]/30 hover:text-[#2C2925]">6</button>
            <button className="inline-flex items-center justify-center rounded-full border border-[#E8E6E1] w-10 h-10 text-sm text-[#706C66] hover:bg-[#F8F7F2]/30 hover:text-[#2C2925]">
              <span className="sr-only">Next page</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
