'use client';

import React from 'react';
import { MessageSquare, Users } from 'lucide-react';
import { CommunityTabsProps } from '@/app/types/community';

/**
 * CommunityTabs component provides tab navigation between 
 * discussions and groups in the community section
 * 
 * Features:
 * - Two tabs: Discussions and Groups
 * - Shows count of items in each tab
 * - Active tab indicator
 * - Proper accessibility attributes
 * - Visual feedback on hover/focus
 */
const CommunityTabs: React.FC<CommunityTabsProps> = ({
  activeTab,
  onTabChange,
  postsCount,
  groupsCount
}) => {
  return (
    <div className="flex items-center border-b border-[#E8E6E1] mt-4 overflow-x-auto scrollbar-hide">
      <button 
        onClick={() => onTabChange('discussions')}
        className={`group relative flex items-center gap-2 py-3 px-4 text-sm font-medium transition-all ${
          activeTab === 'discussions' 
            ? 'text-[#4A7B61] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#4A7B61]' 
            : 'text-[#706C66] hover:text-[#58534D] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-transparent hover:after:bg-[#E8E6E1] after:transition-colors'
        }`}
        aria-selected={activeTab === 'discussions'}
        role="tab"
      >
        <MessageSquare 
          size={18} 
          className={`${activeTab === 'discussions' ? '' : 'transition-transform group-hover:scale-110'}`}
        />
        <span>Discussions</span>
        {postsCount > 0 && (
          <span className={`text-xs px-2.5 py-1 rounded-full transition-colors ${
            activeTab === 'discussions' 
              ? 'bg-[#4A7B61]/10 text-[#4A7B61]' 
              : 'bg-[#F4F2ED] text-[#706C66] group-hover:bg-[#E8E6E1]'
          }`}>
            {postsCount > 99 ? '99+' : postsCount}
          </span>
        )}
      </button>
      
      <button 
        onClick={() => onTabChange('groups')}
        className={`group relative flex items-center gap-2 py-3 px-4 text-sm font-medium transition-all ${
          activeTab === 'groups' 
            ? 'text-[#4A7B61] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[#4A7B61]' 
            : 'text-[#706C66] hover:text-[#58534D] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-transparent hover:after:bg-[#E8E6E1] after:transition-colors'
        }`}
        aria-selected={activeTab === 'groups'}
        role="tab"
      >
        <Users 
          size={18} 
          className={`${activeTab === 'groups' ? '' : 'transition-transform group-hover:scale-110'}`}
        />
        <span>Groups</span>
        {groupsCount > 0 && (
          <span className={`text-xs px-2.5 py-1 rounded-full transition-colors ${
            activeTab === 'groups' 
              ? 'bg-[#4A7B61]/10 text-[#4A7B61]' 
              : 'bg-[#F4F2ED] text-[#706C66] group-hover:bg-[#E8E6E1]'
          }`}>
            {groupsCount > 99 ? '99+' : groupsCount}
          </span>
        )}
      </button>
    </div>
  );
};

export default CommunityTabs;
