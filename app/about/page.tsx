'use client';

import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Heart, Users, BookOpen, MessageCircle, Globe, Sparkles } from 'lucide-react';

// Define proper typing for the values array
interface ValueItem {
  icon: ReactNode;
  title: string;
  description: string;
}

const teamMembers = [
  {
    name: 'Dr. Sarah Thompson',
    role: 'Founder & Lead Theologian',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80',
    description: 'Progressive theology expert with 15+ years of academic and pastoral experience.'
  },
  {
    name: 'Rev. Michael Chen',
    role: 'Community Director',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
    description: 'Passionate about building inclusive faith communities and interfaith dialogue.'
  },
  {
    name: 'Dr. Emily Martinez',
    role: 'Biblical Studies Director',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&auto=format&fit=crop&q=80',
    description: 'Specializes in historical-critical methods and contemporary biblical interpretation.'
  },
  {
    name: 'Prof. James Wilson',
    role: 'Education Director',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&auto=format&fit=crop&q=80',
    description: 'Expert in digital theology education and pedagogical innovation.'
  }
];

// Generate values with pre-rendered icons to avoid TypeScript errors
const values: ValueItem[] = [
  {
    icon: React.createElement(Heart, { className: "w-6 h-6 text-[#D7A392]", strokeWidth: 1.5 }),
    title: 'Inclusive Community',
    description: 'We welcome all seekers, embracing diversity in thought and experience.'
  },
  {
    icon: React.createElement(BookOpen, { className: "w-6 h-6 text-[#D7A392]", strokeWidth: 1.5 }),
    title: 'Academic Excellence',
    description: 'Rigorous scholarship meets accessible learning for meaningful growth.'
  },
  {
    icon: React.createElement(MessageCircle, { className: "w-6 h-6 text-[#D7A392]", strokeWidth: 1.5 }),
    title: 'Authentic Dialogue',
    description: 'Creating space for honest conversations about faith and doubt.'
  },
  {
    icon: React.createElement(Users, { className: "w-6 h-6 text-[#D7A392]", strokeWidth: 1.5 }),
    title: 'Open Discussion',
    description: 'Encouraging questions and diverse perspectives in theological exploration.'
  },
  {
    icon: React.createElement(Globe, { className: "w-6 h-6 text-[#D7A392]", strokeWidth: 1.5 }),
    title: 'Global Perspective',
    description: 'Engaging with faith traditions and insights from around the world.'
  },
  {
    icon: React.createElement(Sparkles, { className: "w-6 h-6 text-[#D7A392]", strokeWidth: 1.5 }),
    title: 'Progressive Vision',
    description: 'Embracing contemporary insights while honoring ancient wisdom.'
  }
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Content */}
      <div className="w-full px-4 md:px-6 lg:px-8 py-8 sm:py-10 lg:py-12">
        <div className="max-w-[90rem] mx-auto">
          {/* Header Section */}
          <div className="relative rounded-xl overflow-hidden mb-10 mx-4 sm:mx-6 lg:mx-8">
            <div className="absolute inset-0 bg-[#F5F0E8] opacity-70"></div>
            <div className="relative z-10 px-6 py-10 md:px-8 md:py-12">
              <h1 className="text-2xl sm:text-3xl font-medium tracking-tight text-foreground mb-2">
                About <span className="font-medium">Gospel Unbound</span>
              </h1>
              <p className="text-base sm:text-lg text-muted-foreground max-w-2xl">
                Empowering spiritual growth through progressive theology, inclusive community, and transformative education.
              </p>
            </div>
          </div>

          <div className="px-4 sm:px-6 lg:px-8">
            {/* Mission & Vision Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
              <div className="bg-white border border-border rounded-2xl p-6 sm:p-8 hover:shadow-md transition-all duration-300">
                <h2 className="text-xl font-medium text-foreground mb-4">OUR MISSION</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Gospel Unbound exists to create an inclusive space where faith meets contemporary understanding. We believe in fostering a community where questions are welcomed, doubt is honored, and spiritual growth is nurtured through academic excellence and authentic dialogue.
                </p>
              </div>
              <div className="bg-white border border-border rounded-2xl p-6 sm:p-8 hover:shadow-md transition-all duration-300">
                <h2 className="text-xl font-medium text-foreground mb-4">OUR VISION</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Our platform brings together progressive theology, biblical scholarship, and spiritual formation resources to support individuals and communities in their journey of faith exploration and transformation.
                </p>
              </div>
            </div>

            {/* Values Section */}
            <section className="mb-16">
              <h2 className="text-2xl font-medium text-foreground mb-8 text-center">OUR VALUES</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
                {values.map((value, index) => (
                  <div 
                    key={index}
                    className="bg-white border border-border rounded-2xl p-6 sm:p-8 flex flex-col hover:shadow-md hover:translate-y-[-2px] transition-all duration-300"
                  >
                    <div className="mb-4">
                      {value.icon}
                    </div>
                    <h3 className="text-lg font-medium text-foreground mb-2">{value.title}</h3>
                    <p className="text-muted-foreground text-sm">{value.description}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Team Section */}
            <section className="mb-16">
              <h2 className="text-2xl font-medium text-foreground mb-8 text-center">OUR TEAM</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {teamMembers.map((member, index) => {
                  // Use createElement for the Image component to avoid TypeScript errors
                  const memberImage = React.createElement(Image, {
                    src: member.image,
                    alt: member.name,
                    fill: true,
                    sizes: "(max-width: 640px) 100vw, 33vw",
                    className: "object-cover"
                  });
                  
                  return (
                    <div 
                      key={index}
                      className="bg-white border border-border rounded-2xl overflow-hidden flex flex-col sm:flex-row hover:shadow-md hover:translate-y-[-2px] transition-all duration-300"
                    >
                      <div className="w-full sm:w-1/3 h-40 sm:h-auto relative">
                        {memberImage}
                      </div>
                      <div className="p-5 sm:p-6 flex-1">
                        <h3 className="text-lg font-medium text-foreground mb-1">{member.name}</h3>
                        <p className="text-sm text-[#D7A392] mb-3">{member.role}</p>
                        <p className="text-sm text-muted-foreground">{member.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Contact Section */}
            <section className="text-center">
              <h2 className="text-2xl font-medium text-foreground mb-4">Get in Touch</h2>
              <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
                Have questions or want to learn more about Gospel Unbound? We'd love to hear from you.
              </p>
              <a 
                href="/contact" 
                className="inline-flex items-center justify-center px-6 py-3 min-h-[44px] bg-[#D7A392] text-white rounded-full hover:bg-[#D7A392]/90 transition-all duration-300"
              >
                Contact Us
              </a>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
} 