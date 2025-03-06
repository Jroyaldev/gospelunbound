'use client';

import { FileText, BookOpen, Users, Mail, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import React from 'react';
import type { IconType } from 'lucide-react';
import { colorMap } from './lib/colors';

// Placeholder images with updated solid background colors to match new sophisticated palette
const placeholderImages = {
  hero: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='1200' height='600' viewBox='0 0 1200 600'%3E%3Crect width='1200' height='600' fill='%23F8F7F2'/%3E%3C/svg%3E",
  genesisCourse: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='450' viewBox='0 0 800 450'%3E%3Crect width='800' height='450' fill='%234D453D'/%3E%3C/svg%3E",
  articlePreview: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='450' viewBox='0 0 800 450'%3E%3Crect width='800' height='450' fill='%23675C52'/%3E%3C/svg%3E",
  communityPreview: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='450' viewBox='0 0 800 450'%3E%3Crect width='800' height='450' fill='%23887D73'/%3E%3C/svg%3E",
  newsletter: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='400' viewBox='0 0 400 400'%3E%3Crect width='400' height='400' fill='%23F8F7F2'/%3E%3C/svg%3E",
  courses: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='450' viewBox='0 0 800 450'%3E%3Crect width='800' height='450' fill='%234D453D'/%3E%3C/svg%3E",
  resources: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='800' height='450' viewBox='0 0 800 450'%3E%3Crect width='800' height='450' fill='%23675C52'/%3E%3C/svg%3E"
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
  const bgColor = imageSrc?.includes('4D453D') ? 'bg-[#4D453D]/10 text-[#4D453D]' :
                 imageSrc?.includes('675C52') ? 'bg-[#675C52]/10 text-[#675C52]' :
                 imageSrc?.includes('887D73') ? 'bg-[#887D73]/10 text-[#887D73]' :
                 'bg-accent/10 text-accent';
  
  // Determine hover text color
  const hoverColor = imageSrc?.includes('4D453D') ? 'group-hover:text-[#4D453D]' :
                    imageSrc?.includes('675C52') ? 'group-hover:text-[#675C52]' :
                    imageSrc?.includes('887D73') ? 'group-hover:text-[#887D73]' :
                    'group-hover:text-accent';
  
  return (
    <div className="group relative flex flex-col justify-between rounded-2xl bg-white shadow-sm transition-all duration-300 hover:shadow-md hover:translate-y-[-2px] border border-[#E8E6E1] hover:border-[#E8E6E1]/80">
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
              <span className="rounded-full bg-[#F8F7F2]/80 px-2.5 py-0.5 text-xs font-medium text-[#2C2925]">
                {badge}
              </span>
            )}
          </div>
          
          <h3 className={`mb-2 text-base sm:text-lg font-semibold tracking-tight transition-colors duration-300 ${hoverColor}`}>
            {title}
          </h3>
          
          <p className="text-sm text-[#706C66] leading-relaxed">
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl bg-[#F8F7F2] p-6 sm:p-8 lg:p-12 border border-[#E8E6E1] shadow-sm">
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
                  className="inline-flex items-center justify-center rounded-full bg-[#4A7B61] font-medium px-5 py-2.5 sm:px-6 sm:py-3 text-sm text-white transition-all duration-300 hover:opacity-90 hover:shadow-sm min-h-[44px]"
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
      {/* Hero section - keeping as requested */}
      <section className="py-12 sm:py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
          <div className="w-full rounded-2xl bg-gradient-to-br from-[#4A7B61]/90 to-[#3D644E]/80 overflow-hidden border border-[#4A7B61]/30 shadow-sm transition-all duration-300 hover:shadow-md">
            <div className="p-8 sm:p-10 lg:p-12 relative">
              <div className="max-w-3xl mx-auto text-center z-10 relative">
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
                    className="inline-flex items-center justify-center rounded-full bg-white text-[#4A7B61] font-medium px-6 py-3 text-sm sm:text-base transition-all duration-300 hover:bg-white/90 hover:shadow-md min-h-[44px]"
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
              
              {/* Decorative elements */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#6E9C85]/20 rounded-full -mr-20 -mt-20 blur-xl"></div>
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#6E9C85]/20 rounded-full -ml-16 -mb-16 blur-xl"></div>
              <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-white/5 rounded-full transform -translate-y-1/2 blur-sm"></div>
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
            {/* Course Feature Card */}
            <div className="group relative flex flex-col rounded-2xl bg-white shadow-sm p-6 sm:p-8 transition-all duration-300 hover:shadow-md hover:translate-y-[-2px] border border-[#E8E6E1] hover:border-[#4D453D]/40 h-full">
              <div className="mb-6">
                <div className="mb-4">
                  <div className="rounded-full bg-[#4D453D]/10 p-2.5 inline-flex transition-transform duration-300 group-hover:scale-110">
                    <BookOpen strokeWidth={1.5} className="h-5 w-5 text-[#4D453D]" />
                  </div>
                </div>
                
                <h3 className="text-lg font-semibold mb-3 group-hover:text-[#4D453D] transition-colors duration-300">
                  In-depth courses
                </h3>
                
                <p className="text-sm text-[#706C66] leading-relaxed">
                  Academically rigorous yet accessible courses taught by theological scholars and religious leaders.
                </p>
              </div>
              
              <div className="mt-auto">
                <a 
                  href="/courses" 
                  className="text-sm font-medium text-[#4D453D] hover:underline inline-flex items-center group/link"
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
            <div className="group relative flex flex-col rounded-2xl bg-white shadow-sm p-6 sm:p-8 transition-all duration-300 hover:shadow-md hover:translate-y-[-2px] border border-[#E8E6E1] hover:border-[#675C52]/40 h-full">
              <div className="mb-6">
                <div className="mb-4">
                  <div className="rounded-full bg-[#675C52]/10 p-2.5 inline-flex transition-transform duration-300 group-hover:scale-110">
                    <FileText strokeWidth={1.5} className="h-5 w-5 text-[#675C52]" />
                  </div>
                </div>
                
                <h3 className="text-lg font-semibold mb-3 group-hover:text-[#675C52] transition-colors duration-300">
                  Thoughtful resources
                </h3>
                
                <p className="text-sm text-[#706C66] leading-relaxed">
                  Articles, podcasts, and content that explore questions about faith in the modern world.
                </p>
              </div>
              
              <div className="mt-auto">
                <a 
                  href="/resources" 
                  className="text-sm font-medium text-[#675C52] hover:underline inline-flex items-center group/link"
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
            <div className="group relative flex flex-col rounded-2xl bg-white shadow-sm p-6 sm:p-8 transition-all duration-300 hover:shadow-md hover:translate-y-[-2px] border border-[#E8E6E1] hover:border-[#887D73]/40 h-full">
              <div className="mb-6">
                <div className="mb-4">
                  <div className="rounded-full bg-[#887D73]/10 p-2.5 inline-flex transition-transform duration-300 group-hover:scale-110">
                    <Users strokeWidth={1.5} className="h-5 w-5 text-[#887D73]" />
                  </div>
                </div>
                
                <h3 className="text-lg font-semibold mb-3 group-hover:text-[#887D73] transition-colors duration-300">
                  Supportive community
                </h3>
                
                <p className="text-sm text-[#706C66] leading-relaxed">
                  Connect with fellow seekers in facilitated discussions and learning cohorts.
                </p>
              </div>
              
              <div className="mt-auto">
                <a 
                  href="/community" 
                  className="text-sm font-medium text-[#887D73] hover:underline inline-flex items-center group/link"
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
      
      {/* Testimonials Section */}
      <section className="py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
          <div className="text-center mb-10 sm:mb-12">
            <h2 className="text-xl sm:text-2xl font-medium tracking-tight text-[#2C2925] mb-3">
              What our community is saying
            </h2>
            <p className="text-sm sm:text-base text-[#706C66] max-w-2xl mx-auto">
              Join thousands who are finding value in our approach to theological education.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {/* Testimonial 1 */}
            <div className="flex flex-col bg-white rounded-2xl p-6 sm:p-8 border border-[#E8E6E1] shadow-sm transition-all duration-300 hover:shadow-md hover:translate-y-[-2px]">
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
                <div className="w-10 h-10 bg-[#F8F7F2] rounded-full flex items-center justify-center text-[#4D453D] font-medium">
                  JL
                </div>
                <div className="ml-3">
                  <h4 className="text-sm font-medium">Jamie L.</h4>
                  <p className="text-xs text-[#706C66]">Genesis Course Graduate</p>
                </div>
              </div>
            </div>
            
            {/* Testimonial 2 */}
            <div className="flex flex-col bg-white rounded-2xl p-6 sm:p-8 border border-[#E8E6E1] shadow-sm transition-all duration-300 hover:shadow-md hover:translate-y-[-2px]">
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
                <div className="w-10 h-10 bg-[#F8F7F2] rounded-full flex items-center justify-center text-[#675C52] font-medium">
                  MR
                </div>
                <div className="ml-3">
                  <h4 className="text-sm font-medium">Michael R.</h4>
                  <p className="text-xs text-[#706C66]">Community Member</p>
                </div>
              </div>
            </div>
            
            {/* Testimonial 3 */}
            <div className="flex flex-col bg-white rounded-2xl p-6 sm:p-8 border border-[#E8E6E1] shadow-sm transition-all duration-300 hover:shadow-md hover:translate-y-[-2px]">
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
                <div className="w-10 h-10 bg-[#F8F7F2] rounded-full flex items-center justify-center text-[#887D73] font-medium">
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
      
      {/* Newsletter container */}
      <div className="px-6 sm:px-8">
        <NewsletterSection />
      </div>
    </main>
  );
};

export default Home;
