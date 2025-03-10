'use client';

import React, { useState } from 'react';
import { 
  Search, 
  SlidersHorizontal, 
  X, 
  ChevronDown, 
  RefreshCw, 
  Users, 
  Clock, 
  AlignLeft
} from 'lucide-react';
import { GroupExplorerProps, GroupFilters } from '@/app/types/community';
import GroupCard from './GroupCard';
import dynamic from 'next/dynamic';

const LoadingState = dynamic(() => import('@/app/components/LoadingState'));

/**
 * GroupExplorer - Advanced group discovery component
 * 
 * Features:
 * - Search functionality
 * - Category filtering
 * - Sort options
 * - Topic filtering
 * - Responsive design
 * - Load more pagination
 */
const GroupExplorer: React.FC<GroupExplorerProps> = ({
  filters,
  onFilterChange,
  groups,
  isLoading,
  currentUserId,
  onToggleMembership,
  categories,
  hasMore,
  onLoadMore
}) => {
  const [showFilters, setShowFilters] = useState(false);
  const [searchInput, setSearchInput] = useState(filters.search || '');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFilterChange({ ...filters, search: searchInput });
  };

  const handleClearSearch = () => {
    setSearchInput('');
    onFilterChange({ ...filters, search: '' });
  };

  const handleSortChange = (sort: 'newest' | 'popular' | 'alphabetical') => {
    onFilterChange({ ...filters, sort });
  };

  const handleCategoryChange = (category: string) => {
    onFilterChange({ ...filters, category: category === 'All' ? undefined : category });
  };

  const toggleFilters = () => {
    setShowFilters(!showFilters);
  };

  const resetFilters = () => {
    setSearchInput('');
    onFilterChange({
      search: '',
      category: undefined,
      sort: 'newest',
      topics: undefined
    });
  };

  return (
    <div className="space-y-6">
      {/* Search and filter controls */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search bar */}
        <div className="flex-grow">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search groups..."
              className="w-full pl-10 pr-10 py-2.5 bg-white border border-[#E8E6E1] rounded-lg focus:ring-[#4A7B61] focus:border-[#4A7B61]"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#706C66] w-5 h-5" />
            {searchInput && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#706C66] hover:text-[#2C2925]"
              >
                <X className="w-4 h-4" />
                <span className="sr-only">Clear search</span>
              </button>
            )}
          </form>
        </div>

        {/* Filter toggle button */}
        <button
          onClick={toggleFilters}
          className={`flex items-center justify-center px-4 py-2.5 border rounded-lg ${
            showFilters
              ? 'bg-[#4A7B61]/10 border-[#4A7B61]/20 text-[#4A7B61]'
              : 'bg-white border-[#E8E6E1] text-[#706C66]'
          }`}
        >
          <SlidersHorizontal className="w-4 h-4 mr-2" />
          Filters
          <ChevronDown className={`w-4 h-4 ml-2 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
        </button>
      </div>

      {/* Expanded filters */}
      {showFilters && (
        <div className="bg-white border border-[#E8E6E1] rounded-lg p-4 space-y-4 animate-slideDown">
          <div className="flex flex-wrap justify-between items-center mb-4">
            <h3 className="text-sm font-medium text-[#2C2925]">Filters</h3>
            <button
              onClick={resetFilters}
              className="text-sm flex items-center text-[#706C66] hover:text-[#4A7B61]"
            >
              <RefreshCw className="w-3 h-3 mr-1" />
              Reset filters
            </button>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-xs font-medium text-[#58534D] mb-2">Category</h4>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleCategoryChange('All')}
                className={`text-xs px-3 py-1.5 rounded-full ${
                  !filters.category
                    ? 'bg-[#4A7B61] text-white'
                    : 'bg-[#F4F2ED] text-[#58534D] hover:bg-[#E8E6E1]'
                }`}
              >
                All
              </button>
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => handleCategoryChange(category)}
                  className={`text-xs px-3 py-1.5 rounded-full ${
                    filters.category === category
                      ? 'bg-[#4A7B61] text-white'
                      : 'bg-[#F4F2ED] text-[#58534D] hover:bg-[#E8E6E1]'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Sort options */}
          <div>
            <h4 className="text-xs font-medium text-[#58534D] mb-2">Sort by</h4>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleSortChange('newest')}
                className={`text-xs px-3 py-1.5 rounded-full flex items-center ${
                  filters.sort === 'newest' || !filters.sort
                    ? 'bg-[#4A7B61] text-white'
                    : 'bg-[#F4F2ED] text-[#58534D] hover:bg-[#E8E6E1]'
                }`}
              >
                <Clock className="w-3 h-3 mr-1" /> Newest
              </button>
              <button
                onClick={() => handleSortChange('popular')}
                className={`text-xs px-3 py-1.5 rounded-full flex items-center ${
                  filters.sort === 'popular'
                    ? 'bg-[#4A7B61] text-white'
                    : 'bg-[#F4F2ED] text-[#58534D] hover:bg-[#E8E6E1]'
                }`}
              >
                <Users className="w-3 h-3 mr-1" /> Most Members
              </button>
              <button
                onClick={() => handleSortChange('alphabetical')}
                className={`text-xs px-3 py-1.5 rounded-full flex items-center ${
                  filters.sort === 'alphabetical'
                    ? 'bg-[#4A7B61] text-white'
                    : 'bg-[#F4F2ED] text-[#58534D] hover:bg-[#E8E6E1]'
                }`}
              >
                <AlignLeft className="w-3 h-3 mr-1" /> A-Z
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading state */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <LoadingState key={i} />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && groups.length === 0 && (
        <div className="bg-white rounded-lg border border-[#E8E6E1] p-6 text-center">
          <h3 className="text-lg font-medium text-[#2C2925] mb-2">No groups found</h3>
          <p className="text-[#58534D]">
            {filters.search || filters.category
              ? 'Try adjusting your filters or search term'
              : 'No groups have been created yet. Be the first to create one!'}
          </p>
        </div>
      )}

      {/* Groups grid */}
      {!isLoading && groups.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {groups.map((group) => (
              <GroupCard
                key={group.id}
                group={group}
                currentUserId={currentUserId}
                onToggleMembership={onToggleMembership}
              />
            ))}
          </div>

          {/* Load more button */}
          {hasMore && (
            <div className="flex justify-center mt-8">
              <button
                onClick={onLoadMore}
                className="px-6 py-2.5 bg-white border border-[#E8E6E1] rounded-full text-[#58534D] hover:bg-[#F4F2ED] transition-colors"
              >
                Load more groups
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default GroupExplorer; 