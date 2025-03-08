'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { GroupsListProps } from '@/app/types/community';

// Import components
import GroupCard from './GroupCard';
const LoadingState = dynamic(() => import('@/app/components/LoadingState'));

/**
 * GroupsList component renders a grid of community groups
 * 
 * Features:
 * - Responsive grid layout for group cards
 * - Shows loading state while fetching data
 * - Empty state message when no groups are found
 * - Handles join/leave group actions
 */
const GroupsList: React.FC<GroupsListProps> = ({
  groups,
  isLoading,
  currentUserId,
  onToggleMembership
}) => {
  // If loading, show loading skeleton
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <LoadingState key={i} />
        ))}
      </div>
    );
  }
  
  // If no groups, show empty state
  if (!groups || groups.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-[#E8E6E1] p-6 text-center">
        <h3 className="text-lg font-medium text-[#2C2925] mb-2">No groups yet</h3>
        <p className="text-[#58534D]">
          {currentUserId 
            ? 'Create a new group to start connecting with others!'
            : 'Join the community to see and create groups.'}
        </p>
      </div>
    );
  }
  
  // Render the grid of groups
  return (
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
  );
};

export default GroupsList;
