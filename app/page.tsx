'use client';

import { FileText, BookOpen, Users, Mail, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import React from 'react';
import { useVideoAutoplay } from './hooks/useVideoAutoplay';

type QuickLinkProps = {
  href: string;
  icon: typeof FileText;
  badge: string;
  title: string;
  description: string;
  imageSrc: string;
}

function QuickLinkCard({ href, icon: Icon, badge, title, description, imageSrc }: QuickLinkProps): React.ReactNode {
  const cardStyles = {
    resources: 'from-slate-800/40 to-slate-900/40 hover:from-slate-800/50 hover:to-slate-900/50 group-hover:border-slate-700/50',
    courses: 'from-slate-700/40 to-slate-800/40 hover:from-slate-700/50 hover:to-slate-800/50 group-hover:border-slate-600/50',
    community: 'from-slate-600/40 to-slate-700/40 hover:from-slate-600/50 hover:to-slate-700/50 group-hover:border-slate-500/50'
  };

  const getStyle = (path: string) => {
    if (path.includes('resources')) return cardStyles.resources;
    if (path.includes('courses')) return cardStyles.courses;
    return cardStyles.community;
  };

  return (
    <div className="group relative flex flex-col justify-between rounded-2xl border border-white/[0.1] transition-all duration-500 hover:scale-[1.02] hover:-translate-y-1 overflow-hidden shadow-lg shadow-black/30">
      <a href={href} className="absolute inset-0 z-10">
        <span className="sr-only">View {title}</span>
      </a>
      
      {/* Background Image with Gradient Overlay */}
      <div className="absolute inset-0">
        <div style={{ position: 'relative', width: '100%', height: '100%' }}>
          {/* @ts-ignore */}
          <Image
            src={imageSrc}
            alt={title}
            fill
            className="object-cover opacity-40 transition-all duration-500 group-hover:opacity-50 group-hover:scale-110"
            priority={true}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            onError={(e) => {
              // Fallback to a default image if loading fails
              const target = e.target as HTMLImageElement;
              target.src = '/images/card-background.jpg';
            }}
          />
        </div>
        <div className={`absolute inset-0 bg-gradient-to-br transition-all duration-500 ${getStyle(href)}`} />
      </div>

      <div className="relative p-6">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-black/60 backdrop-blur-md border border-white/[0.15] group-hover:border-white/30 transition-all duration-500 group-hover:rotate-[10deg] shadow-md shadow-black/20">
              {/* @ts-ignore */}
              <Icon size={20} strokeWidth={2} className="text-white group-hover:text-white transition-colors duration-500" />
            </div>
            <span className="text-[13px] font-medium text-white bg-black/50 backdrop-blur-md px-2.5 py-0.5 rounded-full border border-white/[0.15] group-hover:border-white/30 transition-all duration-500 shadow-sm shadow-black/20">
              {badge}
            </span>
          </div>
        </div>
        <h3 className="text-lg font-medium text-white mb-2 group-hover:text-white transition-colors duration-500 drop-shadow-sm">
          {title}
        </h3>
        <p className="text-sm text-white/80 group-hover:text-white transition-colors duration-500 drop-shadow-sm">
          {description}
        </p>
      </div>
      <div className="relative flex items-center gap-1.5 p-6 pt-0">
        <span className="font-medium text-white/90 group-hover:text-white transition-colors duration-500 drop-shadow-sm">
          Explore {title.toLowerCase()}
        </span>
        <span className="transform group-hover:translate-x-1 transition-transform duration-500 text-white/90 group-hover:text-white">→</span>
      </div>
    </div>
  );
}

// Newsletter subscription component
function NewsletterSection(): React.ReactNode {
  return (
    <section className="mx-auto w-full py-12 lg:py-16 bg-slate-900/80 border-t border-white/5 backdrop-blur-md">
      <div className="container px-4 md:px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-6">
          <div>
            <h2 className="text-3xl font-bold tracking-tight mb-4">Stay Connected</h2>
            <p className="text-white/70 mb-4 max-w-md">
              Subscribe to our newsletter for curated resources, upcoming events, and exclusive content to support you in your faith journey.
            </p>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  {/* @ts-ignore */}
                  <Mail size={16} strokeWidth={2} className="text-white/40" />
                </div>
                <input
                  placeholder="Enter your email"
                  type="email"
                  className="block w-full rounded-lg border border-white/10 bg-white/5 p-2.5 pl-10 text-white placeholder-white/40 focus:border-purple-500 focus:ring-purple-500"
                />
              </div>
              <button className="inline-flex items-center justify-center whitespace-nowrap rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-md hover:bg-gradient-to-br hover:from-purple-500 hover:to-indigo-500 focus:outline-none focus:ring-4 focus:ring-purple-300/50">
                Subscribe
                {/* @ts-ignore */}
                <ArrowRight size={16} strokeWidth={2} className="ml-2" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  const backgroundVideoRef = useVideoAutoplay();
  const heroVideoRef = useVideoAutoplay();
  
  const quickLinks = [
    {
      href: '/resources',
      icon: FileText,
      badge: 'New',
      title: 'Resources',
      description: 'Access our curated library of progressive faith resources and study materials',
      imageSrc: '/images/card-background.jpg'
    },
    {
      href: '/courses',
      icon: BookOpen,
      badge: 'Featured',
      title: 'Courses',
      description: 'Engage with structured learning paths and in-depth theological discussions',
      imageSrc: '/images/card-background.jpg'
    },
    {
      href: '/community',
      icon: Users,
      badge: 'Active',
      title: 'Community',
      description: 'Connect with others exploring progressive Christianity and social justice',
      imageSrc: '/images/card-background.jpg'
    }
  ];

  return (
    <div className="relative min-h-screen bg-black selection:bg-slate-800/30 selection:text-white">
      {/* Hero Background */}
      <div className="absolute inset-0 z-0">
        <video
          ref={backgroundVideoRef}
          src="/videos/hero-bg.mp4"
          className="object-cover w-full h-full opacity-15"
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black/95 to-black" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        {/* Hero Section */}
        <div className="px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
          <div className="mx-auto max-w-[90rem]">
            <div className="relative overflow-hidden rounded-[1.5rem] sm:rounded-[2.5rem] border border-white/[0.08] bg-black/40 backdrop-blur-xl shadow-2xl shadow-black/20">
              {/* Background Video */}
              <div className="absolute inset-0 z-0">
                <video
                  ref={heroVideoRef}
                  src="/videos/hero-bg.mp4"
                  className="object-cover w-full h-full opacity-100"
                  autoPlay
                  loop
                  muted
                  playsInline
                  preload="auto"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-black/50 via-black/40 to-transparent" />
                {/* Dynamic Gradient Overlay */}
                <div 
                  className="absolute inset-0 opacity-30"
                  style={{
                    background: 'radial-gradient(circle at 50% 50%, transparent 0%, rgba(0,0,0,0.7) 100%)',
                    mixBlendMode: 'overlay'
                  }}
                />
              </div>

              {/* Content */}
              <div className="relative z-10 px-6 py-16 sm:px-8 sm:py-24 lg:px-16 lg:py-32">
                <div className="max-w-2xl">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/80 backdrop-blur-md border border-slate-600/60 mb-3 shadow-md shadow-black/20">
                    <span className="text-sm font-medium text-white">Welcome</span>
                    <span className="text-xs text-white/80">·</span>
                    <span className="text-sm text-white/80">Gospel Unbound</span>
                  </div>
                  
                  <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-white mb-6">
                    Explore Faith<br />
                    and Theology
                  </h1>
                  
                  <p className="text-base sm:text-lg text-white/90 max-w-2xl mb-8">
                    Join a community dedicated to inclusive spirituality,
                    theological exploration, and meaningful social change.
                  </p>
                  
                  <div className="flex flex-wrap gap-4">
                    <a
                      href="/courses"
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-medium transition-colors duration-200 shadow-lg shadow-black/30"
                    >
                      Start Exploring 
                      {/* @ts-ignore */}
                      <ArrowRight size={14} strokeWidth={2} />
                    </a>
                    <a
                      href="/about"
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-white/10 hover:bg-white/15 text-white font-medium transition-colors duration-200 shadow-lg shadow-black/20"
                    >
                      Learn more 
                      {/* @ts-ignore */}
                      <ArrowRight size={14} strokeWidth={2} />
                    </a>
                  </div>
                </div>

                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 -mt-32 -mr-32 opacity-40">
                  <div className="w-[40rem] h-[40rem] rounded-full bg-slate-800/10 blur-3xl animate-pulse" />
                </div>
                <div className="absolute bottom-0 right-1/4 -mb-32 opacity-30">
                  <div className="w-[30rem] h-[30rem] rounded-full bg-slate-800/10 blur-3xl animate-pulse" 
                       style={{ animationDelay: '1s' }} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Links Section */}
        <div className="px-4 sm:px-6 lg:px-8 -mt-4">
          <div className="mx-auto max-w-[90rem]">
            <div className="flex items-center gap-3 mb-6">
              <h2 className="text-lg font-medium text-white drop-shadow-sm">Quick Links</h2>
              <div className="h-4 w-px bg-gradient-to-b from-white/[0.1] to-transparent" />
              <span className="text-xs font-medium text-white/60">Explore our offerings</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {quickLinks.map((link, index) => (
                // @ts-ignore
                <QuickLinkCard key={link.href} {...link} />
              ))}
            </div>
          </div>
        </div>

        {/* Newsletter Section */}
        <div className="px-4 sm:px-6 lg:px-8 py-12 mt-12">
          <div className="mx-auto max-w-[90rem]">
            {/* @ts-ignore */}
            <NewsletterSection />
          </div>
        </div>
      </div>
    </div>
  );
}
