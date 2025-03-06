'use client';

import React from 'react';
import { currentUser, discussions, groups } from '@/data/community';
import { Discussion, Group } from '@/types/community';
import Link from 'next/link';
import { Search, Users, MessageSquare, Heart, Pin, ChevronRight, UserPlus, Settings, Bell, Plus } from 'lucide-react';
import { motion } from 'framer-motion';

interface DiscussionCardProps {
  discussion: Discussion;
}

const DiscussionCard = ({ discussion }: DiscussionCardProps): JSX.Element => {
  // Format date for display
  const formattedDate = new Date(discussion.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group bg-white rounded-2xl border border-[#E8E6E1] hover:border-[#4A7B61]/40 hover:shadow-md transition-all p-5 sm:p-6 relative hover:translate-y-[-2px]"
    >
      <div className="flex items-start gap-3">
        <img
          src={discussion.author.image}
          alt={discussion.author.name}
          className="w-9 h-9 rounded-full object-cover"
        />
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-[#2C2925]">{discussion.author.name}</span>
            <span className="text-xs text-[#706C66]">{formattedDate}</span>
          </div>
          
          <h3 className="text-base font-medium text-[#2C2925] mb-1 group-hover:text-[#4A7B61] transition-colors">
            {discussion.title}
          </h3>
          
          <p className="text-sm text-[#706C66] mb-3 line-clamp-2">
            {discussion.content.substring(0, 120)}...
          </p>
          
          <div className="flex items-center text-xs text-[#706C66] gap-3">
            <div className="flex items-center gap-1">
              <Pin size={14} strokeWidth={1.5} className="text-[#706C66]" />
              <span>{discussion.category}</span>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <Heart size={14} strokeWidth={1.5} className="text-[#706C66]" />
                <span>{discussion.likes}</span>
              </div>
              
              <div className="flex items-center gap-1">
                <MessageSquare size={14} strokeWidth={1.5} className="text-[#706C66]" />
                <span>{discussion.replies}</span>
              </div>
            </div>
          </div>
          
          <Link href={`/community/discussions/${discussion.id}`} className="absolute inset-0">
            <span className="sr-only">View discussion: {discussion.title}</span>
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

interface GroupCardProps {
  group: Group;
}

const GroupCard = ({ group }: GroupCardProps): JSX.Element => {
  // Create a set of mock user avatars since the data doesn't have them
  const avatarPlaceholders = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150'
  ];
  
  // Use the first few avatars depending on group size
  const avatarsToShow = avatarPlaceholders.slice(0, Math.min(3, Math.floor(group.members / 50)));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group bg-white rounded-2xl border border-[#E8E6E1] hover:border-[#4A7B61]/40 hover:shadow-md transition-all p-5 sm:p-6 relative hover:translate-y-[-2px]"
    >
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#F8F7F2]/50 flex items-center justify-center">
          <Users size={20} strokeWidth={1.5} className="text-[#2C2925]" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h3 className="text-base font-medium text-[#2C2925] group-hover:text-[#4A7B61] transition-colors">
              {group.name}
            </h3>
            <span className="text-xs text-[#706C66]">{group.members} members</span>
          </div>
          
          <p className="text-sm text-[#706C66] mb-3 line-clamp-2">
            {group.description}
          </p>
          
          <div className="flex items-center justify-between">
            <div className="flex -space-x-2">
              {avatarsToShow.map((avatar, i) => (
                <img 
                  key={i}
                  src={avatar}
                  alt="Member"
                  className="w-6 h-6 rounded-full border-2 border-[#F8F7F2] object-cover"
                />
              ))}
            </div>
            
            <button className="text-xs text-[#4A7B61] font-medium flex items-center">
              <UserPlus size={14} strokeWidth={1.5} className="mr-1 text-[#4A7B61]" />
              Join group
            </button>
          </div>
          
          <Link href={`/community/groups/${group.id}`} className="absolute inset-0">
            <span className="sr-only">View group: {group.name}</span>
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

const CommunityPage = (): JSX.Element => {
  return (
    <main className="min-h-screen bg-[#F8F7F2] text-[#2C2925]">
      <div className="w-full px-4 md:px-6 lg:px-8 py-8 sm:py-10 lg:py-12">
        <div className="max-w-[90rem] mx-auto">
          {/* Header */}
          <div className="relative rounded-xl overflow-hidden mb-8 mx-4 sm:mx-6 lg:mx-8">
            <div className="absolute inset-0 bg-[#F5F0E8] opacity-70"></div>
            <div className="relative z-10 px-6 py-10 md:px-8 md:py-12">
              <h1 className="text-2xl sm:text-3xl font-medium tracking-tight text-[#2C2925] mb-2">Community</h1>
              <p className="text-sm sm:text-base text-[#706C66] max-w-md">
                Connect with others and engage in meaningful discussions
              </p>
            </div>
          </div>
          
          {/* Main content area */}
          <div className="px-4 sm:px-6 lg:px-8">
            {/* User banner */}
            <div className="bg-white border border-[#E8E6E1] rounded-2xl p-5 sm:p-6 mb-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3">
                  <img
                    src={currentUser.image}
                    alt={currentUser.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div>
                    <p className="text-[#2C2925] font-medium">{currentUser.name}</p>
                    <p className="text-sm text-[#706C66]">{currentUser.role}</p>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <Link 
                    href="/community/notifications"
                    className="flex items-center justify-center gap-1 min-h-[44px] p-3 sm:px-4 bg-white border border-[#E8E6E1] rounded-full text-[#2C2925] hover:bg-[#F5F0E8]/50 transition-all"
                  >
                    <Bell size={16} strokeWidth={1.5} className="text-[#706C66]" />
                    <span className="hidden sm:inline-block">Notifications</span>
                  </Link>
                  <Link 
                    href="/community/settings"
                    className="flex items-center justify-center gap-1 min-h-[44px] p-3 sm:px-4 bg-white border border-[#E8E6E1] rounded-full text-[#2C2925] hover:bg-[#F5F0E8]/50 transition-all"
                  >
                    <Settings size={16} strokeWidth={1.5} className="text-[#706C66]" />
                    <span className="hidden sm:inline-block">Settings</span>
                  </Link>
                </div>
              </div>
            </div>
            
            {/* Search bar */}
            <div className="relative w-full max-w-md mb-10">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search size={16} strokeWidth={1.5} className="text-[#706C66]" />
              </div>
              <input
                placeholder="Search discussions and groups..."
                className="block w-full min-h-[44px] py-2.5 pl-10 pr-3 border border-[#E8E6E1] rounded-full bg-white text-[#2C2925] placeholder-[#706C66] focus:border-[#4A7B61] focus:ring-[#4A7B61] transition-all duration-200"
              />
            </div>
            
            {/* Recent Discussions */}
            <div className="mb-12">
              <div className="flex justify-between items-end mb-5">
                <h2 className="text-xl font-medium text-[#2C2925]">Recent Discussions</h2>
                <Link 
                  href="/community/discussions"
                  className="text-sm text-[#4A7B61] flex items-center gap-1 hover:underline underline-offset-4"
                >
                  View all
                  <ChevronRight size={14} strokeWidth={1.5} className="ml-1 text-[#4A7B61]" />
                </Link>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                {discussions.slice(0, 4).map((discussion) => (
                  <DiscussionCard key={discussion.id} discussion={discussion} />
                ))}
              </div>
            </div>
            
            {/* Groups You Might Like */}
            <div>
              <div className="flex justify-between items-end mb-5">
                <h2 className="text-xl font-medium text-[#2C2925]">Groups You Might Like</h2>
                <Link 
                  href="/community/groups"
                  className="text-sm text-[#4A7B61] flex items-center gap-1 hover:underline underline-offset-4"
                >
                  View all
                  <ChevronRight size={14} strokeWidth={1.5} className="ml-1 text-[#4A7B61]" />
                </Link>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                {groups.slice(0, 4).map((group) => (
                  <GroupCard key={group.id} group={group} />
                ))}
              </div>
              
              <div className="mt-8 text-center">
                <button className="flex items-center justify-center gap-2 min-h-[44px] py-2.5 px-6 mx-auto bg-[#4A7B61] text-white rounded-full font-medium hover:bg-[#4A7B61]/90 transition-colors">
                  <Plus size={16} strokeWidth={1.5} className="text-white" />
                  Create a New Group
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
};

export default CommunityPage;
