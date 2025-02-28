'use client';

import { FileText, BookOpen, Users, Mail, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import React from 'react';
import type { IconType } from 'lucide-react';

// Placeholder images with solid background colors that match Anthropic's aesthetic
const placeholderImages = {
  hero: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1200' height='600' viewBox='0 0 1200 600'%3E%3Crect width='1200' height='600' fill='%23F5F0E8'/%3E%3C/svg%3E",
  genesisCourse: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='450' viewBox='0 0 800 450'%3E%3Crect width='800' height='450' fill='%23D7A392'/%3E%3C/svg%3E",
  articlePreview: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='450' viewBox='0 0 800 450'%3E%3Crect width='800' height='450' fill='%23E8D5C8'/%3E%3C/svg%3E",
  communityPreview: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='450' viewBox='0 0 800 450'%3E%3Crect width='800' height='450' fill='%23D2D3C9'/%3E%3C/svg%3E",
  newsletter: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 400 400'%3E%3Crect width='400' height='400' fill='%23EFE6DD'/%3E%3C/svg%3E",
  courses: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='450' viewBox='0 0 800 450'%3E%3Crect width='800' height='450' fill='%23D7A392'/%3E%3C/svg%3E",
  resources: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='450' viewBox='0 0 800 450'%3E%3Crect width='800' height='450' fill='%23E8D5C8'/%3E%3C/svg%3E"
};

interface QuickLinkProps {
  href: string;
  icon: IconType;
  badge: string;
  title: string;
  description: string;
  imageSrc: string;
}

const QuickLinkCard: React.FC<QuickLinkProps> = ({ href, icon: Icon, badge, title, description, imageSrc }) => {
  // Extract the background color from the imageSrc to determine the icon color
  const bgColor = imageSrc?.includes('D7A392') ? 'bg-[#D7A392]/10 text-[#D7A392]' :
                 imageSrc?.includes('E8D5C8') ? 'bg-[#E8D5C8]/10 text-[#E8D5C8]' :
                 imageSrc?.includes('D2D3C9') ? 'bg-[#D2D3C9]/10 text-[#D2D3C9]' :
                 'bg-accent/10 text-accent';
  
  return (
    <div className="group relative flex flex-col justify-between rounded-2xl bg-white shadow-sm transition-all duration-300 hover:shadow-md hover:translate-y-[-2px]">
      <a href={href} className="absolute inset-0 z-10">
        <span className="sr-only">View {title}</span>
      </a>
      
      {/* Card content */}
      <div className="p-6 sm:p-8">
        <div className="mb-5">
          <div className="mb-4 flex items-center space-x-2">
            <div className={`rounded-full ${bgColor} p-2.5 transition-transform duration-300 group-hover:scale-110`}>
              <Icon strokeWidth={1.5} className="h-5 w-5" />
            </div>
            
            {badge && (
              <span className="rounded-full bg-background/80 px-2.5 py-0.5 text-xs font-medium text-foreground">
                {badge}
              </span>
            )}
          </div>
          
          <h3 className="mb-2 text-base sm:text-lg font-semibold tracking-tight group-hover:text-[#D7A392] transition-colors duration-300">
            {title}
          </h3>
          
          <p className="text-sm text-muted-foreground leading-relaxed">
            {description}
          </p>
        </div>
      </div>
      
      {/* Card image at bottom */}
      {imageSrc && (
        <div className="relative mt-auto overflow-hidden rounded-b-2xl">
          <img
            src={imageSrc}
            alt={title}
            className="h-48 w-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-105"
          />
        </div>
      )}
    </div>
  );
};

const NewsletterSection: React.FC = () => {
  return (
    <section className="py-12 sm:py-16">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
        <div className="rounded-2xl bg-[#F5F0E8]/30 p-6 sm:p-10 lg:p-12 border border-[#F5F0E8] shadow-sm">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="mb-8 lg:mb-0 lg:mr-10 lg:max-w-xl">
              <div className="inline-flex items-center rounded-full bg-[#D7A392]/10 px-3 py-1 text-xs font-medium text-[#D7A392] mb-4">
                Stay informed
              </div>
              
              <h2 className="text-xl sm:text-2xl font-medium tracking-tight text-foreground mb-3">
                Stay connected with our newsletter
              </h2>
              
              <p className="text-sm sm:text-base text-muted-foreground">
                Get weekly updates on new resources, courses, and community conversations.
              </p>
            </div>
            
            <div className="flex-shrink-0 w-full lg:w-auto">
              <form className="flex flex-col sm:flex-row gap-3">
                <div className="relative rounded-full flex-grow">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="w-full rounded-full border border-border bg-white px-4 py-3 text-sm focus:border-[#D7A392]/50 focus:outline-none focus:ring-1 focus:ring-[#D7A392]/50 transition-all duration-200"
                  />
                </div>
                
                <button 
                  type="submit" 
                  className="inline-flex items-center justify-center rounded-full bg-foreground font-medium px-6 py-3 text-sm text-background transition-all duration-300 hover:opacity-90 hover:shadow-sm"
                >
                  Subscribe
                </button>
              </form>
              
              <p className="text-xs text-muted-foreground/80 mt-3 max-w-sm">
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
    <main className="min-h-screen bg-background text-foreground">
      {/* Hero section */}
      <section className="relative py-12 sm:py-20 overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[#F5F0E8]/30"></div>
        <div className="absolute inset-y-0 right-0 -z-10 w-[40%] bg-[#F5F0E8]/70 rounded-l-[3rem] hidden lg:block"></div>
        
        <div className="max-w-7xl mx-auto px-6 sm:px-8 relative">
          <div className="flex flex-col lg:flex-row lg:items-center gap-10 lg:gap-12">
            <div className="lg:max-w-2xl">
              <div className="inline-flex items-center rounded-full bg-[#D7A392]/10 px-3 py-1 text-xs font-medium text-[#D7A392] mb-5">
                Explore a progressive approach to faith
              </div>
              
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-medium tracking-tight text-foreground mb-6">
                Progressive biblical <br className="hidden sm:block" />
                perspectives for <br className="hidden sm:block" />
                spiritual growth
              </h1>
              
              <p className="text-base sm:text-lg text-muted-foreground mb-8 max-w-xl">
                Gospel Unbound offers accessible theological education for those
                seeking a faith that embraces both ancient wisdom and modern understanding.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href="/courses"
                  className="inline-flex items-center justify-center rounded-full bg-foreground text-background font-medium px-6 py-3 text-sm sm:text-base transition-opacity hover:opacity-90 shadow-sm"
                >
                  Explore Our Courses
                </a>
                <a
                  href="/about"
                  className="inline-flex items-center justify-center rounded-full border border-border bg-background text-foreground font-medium px-6 py-3 text-sm sm:text-base transition-colors hover:bg-muted/10"
                >
                  Learn More
                </a>
              </div>
            </div>
            
            <div className="flex-shrink-0 w-full max-w-md mx-auto lg:mx-0">
              <div className="aspect-[4/3] relative rounded-2xl overflow-hidden shadow-md">
                <img
                  src={placeholderImages.hero}
                  alt="Gospel Unbound Hero"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Quick links section */}
      <section className="py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
          <h2 className="text-xl sm:text-2xl font-medium tracking-tight text-foreground mb-6 sm:mb-8 text-center">
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
            <div className="group relative flex flex-col justify-between rounded-2xl bg-white shadow-sm transition-all duration-300 hover:shadow-md hover:translate-y-[-2px] hover:border-[#D2D3C9]/40 border border-border">
              <div className="p-6 sm:p-8">
                <div className="mb-5">
                  <div className="mb-4 flex items-center space-x-2">
                    <div className="rounded-full bg-[#D2D3C9]/10 p-2.5 transition-transform duration-300 group-hover:scale-110">
                      <Users strokeWidth={1.5} className="h-5 w-5 text-[#D2D3C9]" />
                    </div>
                    
                    <span className="rounded-full bg-background/80 px-2.5 py-0.5 text-xs font-medium text-foreground">
                      Community
                    </span>
                  </div>
                  
                  <h3 className="mb-2 text-base sm:text-lg font-semibold tracking-tight group-hover:text-[#D2D3C9] transition-colors duration-300">
                    Join the conversation
                  </h3>
                  
                  <p className="text-sm text-muted-foreground leading-relaxed mb-5">
                    Connect with others on similar faith journeys through our online community.
                  </p>
                  
                  <a 
                    href="/community" 
                    className="inline-flex items-center justify-center rounded-full bg-foreground text-background font-medium px-4 py-2 text-sm transition-all duration-300 hover:opacity-90 hover:shadow-sm"
                  >
                    Community Preview
                  </a>
                </div>
              </div>
              
              {/* Image for consistency with other cards */}
              <div className="relative mt-auto overflow-hidden rounded-b-2xl">
                <img
                  src={placeholderImages.communityPreview}
                  alt="Community Preview"
                  className="h-48 w-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-105"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Feature cards section */}
      <section className="py-16 bg-[#F5F0E8]/30">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
          <div className="text-center mb-8 sm:mb-12">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-medium tracking-tight text-foreground mb-3 sm:mb-4">
              Guided exploration of modern faith
            </h2>
            <p className="text-muted-foreground text-sm sm:text-base max-w-2xl mx-auto">
              We provide thoughtful resources at the intersection of progressive Christianity and contemporary life.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10">
            {/* Course Feature Card */}
            <div className="group relative flex flex-col rounded-2xl bg-white shadow-sm p-6 sm:p-8 transition-all duration-300 hover:shadow-md hover:translate-y-[-2px]">
              <div className="mb-5">
                <div className="mb-4">
                  <div className="rounded-full bg-[#D7A392]/10 p-2.5 inline-flex transition-transform duration-300 group-hover:scale-110">
                    <BookOpen strokeWidth={1.5} className="h-5 w-5 text-[#D7A392]" />
                  </div>
                </div>
                
                <h3 className="text-lg font-semibold mb-2 group-hover:text-[#D7A392] transition-colors duration-300">
                  In-depth courses
                </h3>
                
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Academically rigorous yet accessible courses taught by theological scholars and religious leaders.
                </p>
              </div>
              
              <div className="mt-auto">
                <a 
                  href="/courses" 
                  className="text-sm font-medium text-[#D7A392] hover:underline inline-flex items-center group/link"
                >
                  Browse courses
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="ml-1 transform transition-transform duration-300 group-hover/link:translate-x-1">
                    <path d="M5 12h14"></path>
                    <path d="m12 5 7 7-7 7"></path>
                  </svg>
                </a>
              </div>
            </div>
            
            {/* Resources Feature Card */}
            <div className="group relative flex flex-col rounded-2xl bg-white shadow-sm p-6 sm:p-8 transition-all duration-300 hover:shadow-md hover:translate-y-[-2px]">
              <div className="mb-5">
                <div className="mb-4">
                  <div className="rounded-full bg-[#E8D5C8]/10 p-2.5 inline-flex transition-transform duration-300 group-hover:scale-110">
                    <FileText strokeWidth={1.5} className="h-5 w-5 text-[#E8D5C8]" />
                  </div>
                </div>
                
                <h3 className="text-lg font-semibold mb-2 group-hover:text-[#E8D5C8] transition-colors duration-300">
                  Thoughtful resources
                </h3>
                
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Articles, podcasts, and content that explore questions about faith in the modern world.
                </p>
              </div>
              
              <div className="mt-auto">
                <a 
                  href="/resources" 
                  className="text-sm font-medium text-[#E8D5C8] hover:underline inline-flex items-center group/link"
                >
                  View resources
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="ml-1 transform transition-transform duration-300 group-hover/link:translate-x-1">
                    <path d="M5 12h14"></path>
                    <path d="m12 5 7 7-7 7"></path>
                  </svg>
                </a>
              </div>
            </div>
            
            {/* Community Feature Card */}
            <div className="group relative flex flex-col rounded-2xl bg-white shadow-sm p-6 sm:p-8 transition-all duration-300 hover:shadow-md hover:translate-y-[-2px]">
              <div className="mb-5">
                <div className="mb-4">
                  <div className="rounded-full bg-[#D2D3C9]/10 p-2.5 inline-flex transition-transform duration-300 group-hover:scale-110">
                    <Users strokeWidth={1.5} className="h-5 w-5 text-[#D2D3C9]" />
                  </div>
                </div>
                
                <h3 className="text-lg font-semibold mb-2 group-hover:text-[#D2D3C9] transition-colors duration-300">
                  Supportive community
                </h3>
                
                <p className="text-sm text-muted-foreground leading-relaxed">
                  Connect with fellow seekers in facilitated discussions and learning cohorts.
                </p>
              </div>
              
              <div className="mt-auto">
                <a 
                  href="/community" 
                  className="text-sm font-medium text-[#D2D3C9] hover:underline inline-flex items-center group/link"
                >
                  Join community
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="ml-1 transform transition-transform duration-300 group-hover/link:translate-x-1">
                    <path d="M5 12h14"></path>
                    <path d="m12 5 7 7-7 7"></path>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Newsletter container */}
      <div className="px-6 sm:px-8">
        <NewsletterSection />
      </div>
    </main>
  );
};

export default Home;
