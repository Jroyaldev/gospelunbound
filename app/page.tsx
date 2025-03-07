'use client';

import React, { useState, useEffect } from 'react';
import { FileText, BookOpen, Users, Mail, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import type { LucideIcon } from 'lucide-react';
import { colorMap } from './lib/colors';

// Placeholder images with updated solid background colors to match hero green
const placeholderImages = {
  hero: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1200' height='600' viewBox='0 0 1200 600'%3E%3Crect width='1200' height='600' fill='%23F8F7F2'/%3E%3C/svg%3E",
  genesisCourse: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='450' viewBox='0 0 800 450'%3E%3Crect width='800' height='450' fill='%234A7B61'/%3E%3C/svg%3E",
  articlePreview: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='450' viewBox='0 0 800 450'%3E%3Crect width='800' height='450' fill='%234A7B61'/%3E%3C/svg%3E",
  communityPreview: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='450' viewBox='0 0 800 450'%3E%3Crect width='800' height='450' fill='%234A7B61'/%3E%3C/svg%3E",
  newsletter: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 400 400'%3E%3Crect width='400' height='400' fill='%23F8F7F2'/%3E%3C/svg%3E",
  courses: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='450' viewBox='0 0 800 450'%3E%3Crect width='800' height='450' fill='%234A7B61'/%3E%3C/svg%3E",
  resources: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='450' viewBox='0 0 800 450'%3E%3Crect width='800' height='450' fill='%234A7B61'/%3E%3C/svg%3E"
};

interface QuickLinkProps {
  href: string;
  icon: LucideIcon;
  badge: string;
  title: string;
  description: string;
  imageSrc: string;
}

// Feature card component for consistent styling
interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  linkText: string;
  href: string;
}

const FeatureCard = ({ 
  icon: Icon, 
  title, 
  description, 
  linkText,
  href,
}: FeatureCardProps) => {
  // Consistent hero green color for all feature cards
  const accentColor = '#4A7B61';
  
  return (
    <div className="group relative flex flex-col rounded-2xl bg-[#4A7B61] transition-all duration-300 hover:translate-y-[-2px] border border-[#4A7B61]/30 overflow-hidden h-full">
      <div className="p-6 sm:p-8 relative flex flex-col h-full">
        <div className="mb-4">
          <div className="rounded-full p-2.5 inline-flex transition-transform duration-300 group-hover:scale-110 bg-white/20">
            <Icon strokeWidth={1.5} className="h-5 w-5 text-white" />
          </div>
        </div>
        
        <h3 className="text-lg font-semibold mb-3 text-white group-hover:text-white/90 transition-colors duration-300">
          {title}
        </h3>
        
        <p className="text-sm text-white/80 leading-relaxed flex-grow">
          {description}
        </p>
        
        <div className="mt-5 pt-5 border-t border-white/20">
          <a href={href} className="inline-flex items-center text-sm font-medium text-white group-hover:text-white/90">
            {linkText}
            <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </a>
        </div>
      </div>
    </div>
  );
};

const QuickLinkCard: React.FC<QuickLinkProps> = ({ href, icon: Icon, badge, title, description, imageSrc }) => {
  // Consistent hero green color
  const accentColor = '#4A7B61';
  
  return (
    <div className="group relative flex flex-col rounded-2xl bg-white transition-all duration-300 hover:translate-y-[-2px] border border-[#E8E6E1] overflow-hidden h-full">
      {/* Green accent top */}
      <div className="h-2 w-full bg-[#4A7B61]"></div>
      
      <a href={href} className="absolute inset-0 z-10">
        <span className="sr-only">View {title}</span>
      </a>
      
      {/* Card content */}
      <div className="p-6 sm:p-8 relative z-[1] flex flex-col h-full">
        <div className="mb-4 flex items-center space-x-2">
          <div className="rounded-full p-2.5 transition-transform duration-300 group-hover:scale-110 bg-[#F0F0F0]">
            <Icon strokeWidth={1.5} className="h-5 w-5 text-[#706C66]" />
          </div>
          
          {badge && (
            <span className="rounded-full bg-[#F8F7F2] px-2.5 py-0.5 text-xs font-medium text-[#706C66]">
              {badge}
            </span>
          )}
        </div>
        
        <h3 className="text-lg font-semibold mb-3 text-[#2C2925] group-hover:text-[#4A7B61] transition-colors duration-300">
          {title}
        </h3>
        
        <p className="text-sm text-[#706C66] leading-relaxed flex-grow">
          {description}
        </p>
        
        <div className="mt-5 pt-5 border-t border-[#E8E6E1]">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-[#4A7B61]">Learn more</span>
            <div className="rounded-full p-1.5 transition-transform duration-300 group-hover:translate-x-1 text-[#4A7B61]">
              <ArrowRight size={16} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const NewsletterSection: React.FC = () => {
  return (
    <section className="py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl bg-[#F8F7F2] p-6 sm:p-8 lg:p-12 border border-[#E8E6E1]">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between lg:gap-8">
            <div className="mb-6 lg:mb-0 lg:max-w-xl">
              <div className="inline-flex items-center rounded-full bg-[#4A7B61]/10 px-3 py-1 text-xs font-medium text-[#4A7B61] mb-3 sm:mb-4">
                Stay informed
              </div>
              
              <h2 className="text-xl sm:text-2xl font-medium tracking-tight text-[#2C2925] mb-2 sm:mb-3">
                Stay connected with our newsletter
              </h2>
              
              <p className="text-sm sm:text-base text-[#706C66] leading-relaxed">
                Get weekly updates on new resources, courses, and community conversations.
              </p>
            </div>
            
            <div className="flex-shrink-0 w-full lg:w-auto">
              <form className="flex flex-col sm:flex-row gap-3">
                <div className="relative rounded-full flex-grow">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="w-full rounded-full border border-[#E8E6E1] bg-white px-4 py-3 text-sm focus:border-[#4A7B61]/50 focus:outline-none focus:ring-1 focus:ring-[#4A7B61]/50 transition-all duration-200 min-h-[44px]"
                  />
                </div>
                
                <button 
                  type="submit" 
                  className="inline-flex items-center justify-center rounded-full bg-[#4A7B61] font-medium px-5 py-2.5 sm:px-6 sm:py-3 text-sm text-white transition-all duration-300 hover:opacity-90 min-h-[44px]"
                >
                  Subscribe
                </button>
              </form>
              
              <p className="text-xs text-[#706C66]/80 mt-3 max-w-sm">
                By subscribing, you agree to our privacy policy. We'll never share your email.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const Home: React.FC = () => {
  return (
    <main className="min-h-screen bg-[#F8F7F2] text-[#2C2925]">
      {/* Hero section - flat design */}
      <section className="py-12 sm:py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
          <div className="w-full rounded-2xl bg-[#4A7B61] overflow-hidden border border-[#4A7B61]/30 transition-all duration-300 hover:translate-y-[-2px]">
            <div className="p-8 sm:p-10 lg:p-12 relative">
              <div className="max-w-3xl mx-auto text-center">
                <div className="inline-flex items-center rounded-full bg-white/20 px-3 py-1 text-xs font-medium text-white mb-5 sm:mb-6">
                  Explore a progressive approach to faith
                </div>
                
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-medium tracking-tight text-white mb-5 sm:mb-7 leading-tight">
                  Progressive biblical perspectives for spiritual growth
                </h1>
                
                <p className="text-base sm:text-lg text-white/90 mb-7 sm:mb-9 max-w-2xl mx-auto leading-relaxed">
                  Gospel Unbound offers accessible theological education for those
                  seeking a faith that embraces both ancient wisdom and modern understanding.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                  <a
                    href="/courses"
                    className="inline-flex items-center justify-center rounded-full bg-white text-[#4A7B61] font-medium px-6 py-3 text-sm sm:text-base transition-all duration-300 hover:bg-white/90 min-h-[44px]"
                  >
                    Explore Our Courses
                  </a>
                  <a
                    href="/about"
                    className="inline-flex items-center justify-center rounded-full border border-white/40 bg-transparent text-white font-medium px-6 py-3 text-sm sm:text-base transition-all duration-300 hover:bg-white/10 min-h-[44px]"
                  >
                    Learn More
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Quick links section */}
      <section className="py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
          <h2 className="text-xl sm:text-2xl font-medium tracking-tight text-[#2C2925] mb-6 sm:mb-8 text-center">
            Explore our resources
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10 px-2 sm:px-4">
            {/* Courses Quick Link */}
            <QuickLinkCard 
              href="/courses" 
              icon={BookOpen}
              badge="Courses"
              title="Explore our in-depth courses"
              description="Take a guided journey through biblical texts with progressive theological perspectives."
              imageSrc={placeholderImages.courses}
            />
            
            {/* Resources Quick Link */}
            <QuickLinkCard 
              href="/resources" 
              icon={FileText}
              badge="Resources"
              title="Thoughtful content collection"
              description="Articles, podcasts, videos, and other resources to support your spiritual exploration."
              imageSrc={placeholderImages.resources}
            />
            
            {/* Community Quick Link */}
            <QuickLinkCard 
              href="/community" 
              icon={Users}
              badge="Community"
              title="Join the conversation"
              description="Connect with others on similar faith journeys through our online community."
              imageSrc={placeholderImages.communityPreview}
            />
          </div>
        </div>
      </section>
      
      {/* Feature cards section */}
      <section className="py-14 sm:py-16 bg-[#F8F7F2]/60">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
          <div className="text-center mb-10 sm:mb-12">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-medium tracking-tight text-[#2C2925] mb-3 sm:mb-4">
              Guided exploration of modern faith
            </h2>
            <p className="text-sm sm:text-base text-[#706C66] max-w-2xl mx-auto">
              We provide thoughtful resources at the intersection of progressive Christianity and contemporary life.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            <FeatureCard 
              icon={BookOpen}
              title="In-depth courses"
              description="Structured learning experiences that guide you through theological topics with progressive perspectives."
              linkText="Explore courses"
              href="/courses"
            />
            
            <FeatureCard 
              icon={FileText}
              title="Thoughtful resources"
              description="Articles, podcasts, and content that explore questions about faith in the modern world."
              linkText="View resources"
              href="/resources"
            />
            
            <FeatureCard 
              icon={Users}
              title="Supportive community"
              description="Connect with fellow seekers in facilitated discussions and learning cohorts."
              linkText="Join community"
              href="/community"
            />
          </div>
        </div>
      </section>
      
      {/* Testimonials Section */}
      <section className="py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
          <div className="text-center mb-10">
            <h2 className="text-xl sm:text-2xl font-medium tracking-tight text-[#2C2925] mb-3">
              What our community is saying
            </h2>
            <p className="text-sm sm:text-base text-[#706C66] max-w-2xl mx-auto">
              Join thousands who are finding value in our approach to theological education.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Testimonial 1 */}
            <div className="flex flex-col bg-white rounded-2xl p-6 sm:p-8 border border-[#E8E6E1] transition-all duration-300 hover:translate-y-[-2px]">
              <div className="mb-4">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg key={star} className="w-5 h-5 text-[#4A7B61]" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
              
              <div className="flex-1">
                <p className="text-[#2C2925] text-sm leading-relaxed mb-6 italic">
                  "Gospel Unbound has transformed my understanding of scripture. The courses strike a perfect balance between scholarly depth and accessibility."
                </p>
              </div>
              
              <div className="flex items-center mt-auto">
                <div className="w-10 h-10 bg-[#4A7B61]/10 rounded-full flex items-center justify-center text-[#4A7B61] font-medium">
                  JL
                </div>
                <div className="ml-3">
                  <h4 className="text-sm font-medium">Jamie L.</h4>
                  <p className="text-xs text-[#706C66]">Genesis Course Graduate</p>
                </div>
              </div>
            </div>
            
            {/* Testimonial 2 */}
            <div className="flex flex-col bg-white rounded-2xl p-6 sm:p-8 border border-[#E8E6E1] transition-all duration-300 hover:translate-y-[-2px]">
              <div className="mb-4">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg key={star} className="w-5 h-5 text-[#4A7B61]" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
              
              <div className="flex-1">
                <p className="text-[#2C2925] text-sm leading-relaxed mb-6 italic">
                  "The community discussions have been invaluable. I've found a group of people who respect different viewpoints while pursuing deeper understanding."
                </p>
              </div>
              
              <div className="flex items-center mt-auto">
                <div className="w-10 h-10 bg-[#4A7B61]/10 rounded-full flex items-center justify-center text-[#4A7B61] font-medium">
                  MR
                </div>
                <div className="ml-3">
                  <h4 className="text-sm font-medium">Michael R.</h4>
                  <p className="text-xs text-[#706C66]">Community Member</p>
                </div>
              </div>
            </div>
            
            {/* Testimonial 3 */}
            <div className="flex flex-col bg-white rounded-2xl p-6 sm:p-8 border border-[#E8E6E1] transition-all duration-300 hover:translate-y-[-2px]">
              <div className="mb-4">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg key={star} className="w-5 h-5 text-[#4A7B61]" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
              </div>
              
              <div className="flex-1">
                <p className="text-[#2C2925] text-sm leading-relaxed mb-6 italic">
                  "After years of feeling disconnected from faith, the progressive approach here has helped me reconcile my beliefs with modern understanding."
                </p>
              </div>
              
              <div className="flex items-center mt-auto">
                <div className="w-10 h-10 bg-[#4A7B61]/10 rounded-full flex items-center justify-center text-[#4A7B61] font-medium">
                  ST
                </div>
                <div className="ml-3">
                  <h4 className="text-sm font-medium">Sarah T.</h4>
                  <p className="text-xs text-[#706C66]">Course Student</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Newsletter section */}
      <section className="py-12 sm:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl bg-[#F8F7F2] p-6 sm:p-8 lg:p-12 border border-[#E8E6E1]">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between lg:gap-8">
              <div className="mb-6 lg:mb-0 lg:max-w-xl">
                <div className="inline-flex items-center rounded-full bg-[#4A7B61]/10 px-3 py-1 text-xs font-medium text-[#4A7B61] mb-3 sm:mb-4">
                  Stay informed
                </div>
                
                <h2 className="text-xl sm:text-2xl font-medium tracking-tight text-[#2C2925] mb-2 sm:mb-3">
                  Stay connected with our newsletter
                </h2>
                
                <p className="text-sm sm:text-base text-[#706C66] leading-relaxed">
                  Get weekly updates on new resources, courses, and community conversations.
                </p>
              </div>
              
              <div className="flex-shrink-0 w-full lg:w-auto">
                <form className="flex flex-col sm:flex-row gap-3">
                  <div className="relative rounded-full flex-grow">
                    <input
                      type="email"
                      placeholder="Enter your email"
                      className="w-full rounded-full border border-[#E8E6E1] bg-white px-4 py-3 text-sm focus:border-[#4A7B61]/50 focus:outline-none focus:ring-1 focus:ring-[#4A7B61]/50 transition-all duration-200 min-h-[44px]"
                    />
                  </div>
                  
                  <button 
                    type="submit" 
                    className="inline-flex items-center justify-center rounded-full bg-[#4A7B61] font-medium px-5 py-2.5 sm:px-6 sm:py-3 text-sm text-white transition-all duration-300 hover:opacity-90 min-h-[44px]"
                  >
                    Subscribe
                  </button>
                </form>
                
                <p className="text-xs text-[#706C66]/80 mt-3 max-w-sm">
                  By subscribing, you agree to our privacy policy. We'll never share your email.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Home;
