'use client';

import React from 'react';
import Link from 'next/link';
import { Users } from 'lucide-react';
import { GroupCardProps } from '@/app/types/community';

/**
 * GroupCard component displays a community group
 * 
 * Features:
 * - Displays group name, description, and image
 * - Shows member count
 * - Join/leave button for logged-in users
 * - Link to group details
 */
const GroupCard: React.FC<GroupCardProps> = ({
  group,
  currentUserId,
  onToggleMembership
}) => {
  // Format member count for display
  const memberCountDisplay = group.member_count === 1 
    ? '1 member' 
    : `${group.member_count} members`;
  
  // Handle join/leave button click
  const handleMembershipToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onToggleMembership(group.id);
  };
  
  return (
    <div className="bg-white rounded-lg border border-[#E8E6E1] shadow-sm hover:shadow-md transition-shadow overflow-hidden relative h-[180px] mb-4">
      {/* Group cover image */}
      <div 
        className="h-1/2 bg-[#F4F2ED] relative"
        style={group.image_url ? { backgroundImage: `url(${group.image_url})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
      >
        {!group.image_url && (
          <div className="absolute inset-0 flex items-center justify-center opacity-30">
            <Users size={32} className="text-[#706C66]" />
          </div>
        )}
      </div>
      
      {/* Group content */}
      <div className="p-3 absolute bottom-0 left-0 right-0 bg-white">
        <h3 className="font-semibold text-[#2C2925] line-clamp-1">{group.name}</h3>
        
        <div className="flex items-center text-xs text-[#706C66] mt-1">
          <Users size={12} className="mr-1" />
          <span>{memberCountDisplay}</span>
        </div>
        
        <p className="text-sm text-[#58534D] mt-1.5 line-clamp-2">
          {group.description}
        </p>
        
        {currentUserId && (
          <button
            onClick={handleMembershipToggle}
            className={`text-sm font-medium px-4 py-2 rounded-full transition-all ${
              group.is_member 
                ? 'bg-red-100/80 text-red-600 hover:bg-red-100 border border-red-200' 
                : 'bg-[#4A7B61]/15 text-[#4A7B61] hover:bg-[#4A7B61]/20 border border-[#4A7B61]/20'
            }`}
          >
            {group.is_member ? 'Leave' : 'Join'}
          </button>
        )}
      </div>
      
      <Link 
        href={`/community/groups/${group.id}`} 
        className="absolute inset-0 no-underline hover:no-underline focus:no-underline"
      >
        <span className="sr-only">View group: {group.name}</span>
      </Link>
    </div>
  );
};

export default GroupCard;
