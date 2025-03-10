'use client';

import React from 'react';
import Link from 'next/link';
import { Users, MessageSquare, Calendar, Tag } from 'lucide-react';
import { GroupCardProps } from '@/app/types/community';

/**
 * GroupCard component displays a community group
 * 
 * Features:
 * - Displays group name, description, and image
 * - Shows member count and activity indicators
 * - Shows category and topics
 * - Join/leave button for logged-in users
 * - Link to group details
 * - Modern, dynamic design optimized for student engagement
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
  
  // Format creation date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };
  
  return (
    <div className="bg-white rounded-lg border border-[#E8E6E1] shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden relative h-[240px] mb-4">
      {/* Group cover image */}
      <div 
        className="h-1/3 bg-[#F4F2ED] relative"
        style={group.image_url ? { backgroundImage: `url(${group.image_url})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
      >
        {!group.image_url && (
          <div className="absolute inset-0 flex items-center justify-center opacity-30">
            <Users size={32} className="text-[#706C66]" />
          </div>
        )}
        
        {/* Category badge */}
        {group.category && (
          <div className="absolute top-2 left-2">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-[#4A7B61]/20 text-[#4A7B61] backdrop-blur-sm">
              <Tag size={10} className="mr-1" />
              {group.category}
            </span>
          </div>
        )}
        
        {/* Date badge */}
        <div className="absolute top-2 right-2">
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-black/20 text-white backdrop-blur-sm">
            <Calendar size={10} className="mr-1" />
            {formatDate(group.created_at)}
          </span>
        </div>
      </div>
      
      {/* Group content */}
      <div className="p-4 h-2/3 flex flex-col">
        <h3 className="font-semibold text-[#2C2925] line-clamp-1 text-lg">{group.name}</h3>
        
        {/* Stats row */}
        <div className="flex items-center gap-3 text-xs text-[#706C66] mt-1.5">
          <div className="flex items-center">
            <Users size={12} className="mr-1" />
            <span>{memberCountDisplay}</span>
          </div>
          
          <div className="flex items-center">
            <MessageSquare size={12} className="mr-1" />
            <span>Discussions</span>
          </div>
        </div>
        
        {/* Description */}
        <p className="text-sm text-[#58534D] mt-2 line-clamp-3 flex-grow">
          {group.description}
        </p>
        
        {/* Topics */}
        {group.topics && group.topics.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1 mb-2">
            {group.topics.slice(0, 3).map((topic, index) => (
              <span
                key={index}
                className="inline-block px-1.5 py-0.5 text-xs bg-[#F4F2ED] text-[#706C66] rounded-full truncate max-w-[80px]"
              >
                {topic}
              </span>
            ))}
            {group.topics.length > 3 && (
              <span className="inline-block px-1.5 py-0.5 text-xs bg-[#F4F2ED] text-[#706C66] rounded-full">
                +{group.topics.length - 3}
              </span>
            )}
          </div>
        )}
        
        {/* Join/Leave button */}
        {currentUserId && (
          <button
            onClick={handleMembershipToggle}
            className={`text-sm font-medium px-4 py-1.5 rounded-full transition-all mt-auto ${
              group.is_member 
                ? 'bg-[#4A7B61]/10 text-[#4A7B61] hover:bg-[#4A7B61]/20 border border-[#4A7B61]/20' 
                : 'bg-[#4A7B61] text-white hover:bg-[#3A6B51]'
            }`}
          >
            {group.is_member ? 'Joined' : 'Join'}
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
