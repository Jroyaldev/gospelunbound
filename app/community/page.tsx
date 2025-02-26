'use client';

import React from 'react';
import { currentUser, discussions, groups } from '@/data/community';
import { Discussion, Group } from '@/types/community';
import Link from 'next/link';
import { Search, Users, MessageSquare, Heart, Pin, ChevronRight, UserPlus, Settings, Bell, Plus } from 'lucide-react';
import { motion } from 'framer-motion';

function DiscussionCard({ discussion }: { discussion: Discussion }): React.ReactNode {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group bg-white/[0.02] rounded-xl border border-white/[0.05] hover:border-white/[0.1] transition-all p-6"
    >
      <div className="flex items-start gap-4">
        <img
          src={discussion.author.image}
          alt={discussion.author.name}
          className="w-10 h-10 rounded-full object-cover"
        />
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-white/90">{discussion.author.name}</span>
            <span className="text-white/40">·</span>
            <span className="text-sm text-white/40">
              {new Date(discussion.createdAt).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric'
              })}
            </span>
            {discussion.isPinned && (
              <>
                <span className="text-white/40">·</span>
                <span className="text-sm text-purple-400 flex items-center gap-1">
                  <Pin size={12} strokeWidth={2} />
                  Pinned
                </span>
              </>
            )}
          </div>
          
          <h3 className="font-semibold text-lg mb-2 text-white group-hover:text-purple-400 transition-colors">{discussion.title}</h3>
          <p className="text-white/60 text-sm mb-4 line-clamp-2">{discussion.content}</p>
          
          <div className="flex items-center gap-4">
            <span className="px-2.5 py-1 bg-white/5 rounded-full text-sm text-white/60">
              {discussion.category}
            </span>
            <button className="flex items-center gap-1 text-white/40 hover:text-purple-400 transition-colors">
              <Heart size={16} strokeWidth={2} />
              <span className="text-sm">{discussion.likes}</span>
            </button>
            <button className="flex items-center gap-1 text-white/40 hover:text-purple-400 transition-colors">
              <MessageSquare size={16} strokeWidth={2} />
              <span className="text-sm">{discussion.replies}</span>
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function GroupCard({ group }: { group: Group }): React.ReactNode {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group bg-white/[0.02] rounded-xl border border-white/[0.05] hover:border-white/[0.1] transition-all overflow-hidden"
    >
      <div className="aspect-[2/1] relative">
        <img
          src={group.image}
          alt={group.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent" />
        <div className="absolute bottom-4 left-4 right-4">
          <h3 className="text-white font-semibold text-lg group-hover:text-purple-400 transition-colors">{group.name}</h3>
          <div className="flex items-center gap-2 text-white/60 text-sm">
            <Users size={16} strokeWidth={2} />
            {group.members} members
          </div>
        </div>
      </div>
      <div className="p-4">
        <p className="text-white/60 text-sm mb-4 line-clamp-2">{group.description}</p>
        <div className="flex items-center justify-between">
          <span className="px-2.5 py-1 bg-white/5 rounded-full text-sm text-white/60">
            {group.category}
          </span>
          <button className="flex items-center gap-1 text-purple-400 hover:text-purple-300 transition-colors">
            <UserPlus size={16} strokeWidth={2} />
            <span className="text-sm">Join</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
}

export default function CommunityPage() {
  return (
    <main className="min-h-screen bg-black">
      <div className="relative min-h-screen">
        {/* Coming Soon Overlay */}
        <div className="fixed inset-0 z-50 pointer-events-none lg:left-64">
          <div className="absolute inset-0" 
               style={{
                 background: 'radial-gradient(circle at center, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.85) 30%, rgba(0,0,0,0.7) 70%, rgba(0,0,0,0.6) 100%)',
                 backdropFilter: 'blur(12px)'
               }} 
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 md:gap-6 px-4 text-center">
            <motion.h1 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl sm:text-6xl md:text-8xl lg:text-[120px] font-bold tracking-tight text-white/90 select-none"
              style={{
                textShadow: '0 4px 16px rgba(0,0,0,0.2)'
              }}>
              Coming Soon
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-base sm:text-lg md:text-xl lg:text-2xl text-white/70 font-light tracking-wide select-none max-w-xs sm:max-w-md md:max-w-lg lg:max-w-2xl"
              style={{
                textShadow: '0 2px 8px rgba(0,0,0,0.1)'
              }}>
              We're preparing something special for our community
            </motion.p>
          </div>
        </div>

        {/* Original Content (now fully blurred) */}
        <div className="opacity-1000">
          {/* Header */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-black/50 to-black pointer-events-none" />
            <div className="relative px-6 lg:px-8 py-24 mx-auto max-w-[90rem]">
              <div className="flex flex-col items-center text-center mb-12">
                <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl mb-6">
                  Community
                </h1>
                <p className="text-lg text-white/60 max-w-2xl">
                  Join discussions, share insights, and connect with fellow members
                </p>
              </div>

              {/* Search and Actions */}
              <div className="flex flex-col gap-6 mb-12">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search discussions..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500/20"
                  />
                  <Search size={18} strokeWidth={2} className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                </div>
              </div>

              {/* Main Content */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Feed */}
                <div className="lg:col-span-2 space-y-6">
                  {/* New Post */}
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/[0.02] rounded-xl border border-white/[0.05] p-4"
                  >
                    <div className="flex items-center gap-4">
                      <img
                        src={currentUser.image}
                        alt={currentUser.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <button className="flex-1 text-left px-4 py-2 bg-white/5 rounded-lg text-white/40 hover:bg-white/[0.08] transition-colors">
                        Start a discussion...
                      </button>
                    </div>
                  </motion.div>

                  {/* Discussions Feed */}
                  <div className="space-y-4">
                    {discussions.map((discussion) => (
                      <DiscussionCard key={discussion.id} discussion={discussion} />
                    ))}
                  </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                  {/* User Profile Card */}
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/[0.02] rounded-xl border border-white/[0.05] overflow-hidden"
                  >
                    <div className="p-6">
                      <div className="flex items-center gap-4 mb-4">
                        <img
                          src={currentUser.image}
                          alt={currentUser.name}
                          className="w-16 h-16 rounded-full object-cover"
                        />
                        <div>
                          <h3 className="font-semibold text-white">{currentUser.name}</h3>
                          <p className="text-sm text-white/60">{currentUser.location}</p>
                        </div>
                      </div>
                      <p className="text-sm text-white/60 mb-4">{currentUser.bio}</p>
                      <div className="flex flex-wrap gap-2">
                        {currentUser.badges?.map((badge) => (
                          <span
                            key={badge}
                            className="px-2.5 py-1 bg-purple-500/10 text-purple-400 rounded-full text-xs"
                          >
                            {badge}
                          </span>
                        ))}
                      </div>
                    </div>
                  </motion.div>

                  {/* Groups */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h2 className="text-lg font-semibold text-white">Your Groups</h2>
                      <button className="p-1.5 text-white/40 hover:text-purple-400 rounded-lg hover:bg-white/5 transition-colors">
                        <Plus size={16} strokeWidth={2} />
                      </button>
                    </div>
                    <div className="grid gap-4">
                      {groups.map((group) => (
                        <GroupCard key={group.id} group={group} />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
