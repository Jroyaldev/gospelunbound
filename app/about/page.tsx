'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { Heart, Users, BookOpen, MessageCircle, Globe, Sparkles } from 'lucide-react';

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

const values = [
  {
    icon: Heart,
    title: 'Inclusive Community',
    description: 'We welcome all seekers, embracing diversity in thought and experience.'
  },
  {
    icon: BookOpen,
    title: 'Academic Excellence',
    description: 'Rigorous scholarship meets accessible learning for meaningful growth.'
  },
  {
    icon: Users,
    title: 'Authentic Dialogue',
    description: 'Creating space for honest conversations about faith and doubt.'
  },
  {
    icon: MessageCircle,
    title: 'Open Discussion',
    description: 'Encouraging questions and diverse perspectives in theological exploration.'
  },
  {
    icon: Globe,
    title: 'Global Perspective',
    description: 'Engaging with faith traditions and insights from around the world.'
  },
  {
    icon: Sparkles,
    title: 'Progressive Vision',
    description: 'Embracing contemporary insights while honoring ancient wisdom.'
  }
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      {/* Subtle gradient overlay */}
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-zinc-800/5 via-black to-black pointer-events-none" />
      
      {/* Content */}
      <div className="relative">
        <div className="relative px-6 lg:px-8 py-32 mx-auto max-w-6xl">
          {/* Hero Section */}
          <div className="flex flex-col items-start mb-32">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative mb-8 w-full"
            >
              <div className="absolute inset-0 bg-[#111]/80 backdrop-blur-2xl rounded-2xl" />
              <div className="relative px-8 py-12">
                <h1 className="text-3xl md:text-4xl font-light tracking-tight text-white/90 mb-6">
                  About <span className="font-medium">Gospel Unbound</span>
                </h1>
                <p className="text-base md:text-lg text-white/60 max-w-2xl font-light leading-relaxed">
                  Empowering spiritual growth through progressive theology, inclusive community, and transformative education.
                </p>
              </div>
              <div className="absolute inset-0 border border-white/[0.05] rounded-2xl pointer-events-none" />
            </motion.div>
          </div>

          {/* Mission Section */}
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-32"
          >
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-[#111]/80 backdrop-blur-2xl rounded-2xl" />
                <div className="relative p-8">
                  <h2 className="text-xl font-light text-white/90 mb-6 tracking-wide uppercase">Our Mission</h2>
                  <p className="text-white/60 font-light leading-relaxed mb-6">
                    Gospel Unbound exists to create an inclusive space where faith meets contemporary understanding. 
                    We believe in fostering a community where questions are welcomed, doubt is honored, and spiritual 
                    growth is nurtured through academic excellence and authentic dialogue.
                  </p>
                </div>
                <div className="absolute inset-0 border border-white/[0.05] rounded-2xl pointer-events-none" />
              </div>
              <div className="relative">
                <div className="absolute inset-0 bg-[#111]/80 backdrop-blur-2xl rounded-2xl" />
                <div className="relative p-8">
                  <h2 className="text-xl font-light text-white/90 mb-6 tracking-wide uppercase">Our Vision</h2>
                  <p className="text-white/60 font-light leading-relaxed mb-6">
                    Our platform brings together progressive theology, biblical scholarship, and spiritual formation 
                    resources to support individuals and communities in their journey of faith exploration and 
                    transformation.
                  </p>
                </div>
                <div className="absolute inset-0 border border-white/[0.05] rounded-2xl pointer-events-none" />
              </div>
            </div>
          </motion.section>

          {/* Values Section */}
          <motion.section 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-32"
          >
            <h2 className="text-xl font-light text-white/90 mb-12 tracking-wide uppercase">Our Values</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {values.map((value, index) => (
                <motion.div
                  key={value.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="relative group"
                >
                  <div className="absolute inset-0 bg-[#111]/80 backdrop-blur-2xl rounded-xl" />
                  <div className="relative p-6">
                    <value.icon className="w-5 h-5 text-white/30 mb-4" />
                    <h3 className="text-base font-medium text-white/80 mb-2">{value.title}</h3>
                    <p className="text-white/50 text-sm font-light leading-relaxed">{value.description}</p>
                  </div>
                  <div className="absolute inset-0 border border-white/[0.05] rounded-xl group-hover:border-white/[0.1] transition-colors duration-300 pointer-events-none" />
                </motion.div>
              ))}
            </div>
          </motion.section>

          {/* Team Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <h2 className="text-xl font-light text-white/90 mb-12 tracking-wide uppercase">Our Team</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {teamMembers.map((member, index) => (
                <motion.div
                  key={member.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="relative group"
                >
                  <div className="absolute inset-0 bg-[#111]/80 backdrop-blur-2xl rounded-xl" />
                  <div className="relative p-6">
                    <div className="relative w-16 h-16 mx-auto mb-4 rounded-lg overflow-hidden">
                      <Image
                        src={member.image}
                        alt={member.name}
                        fill
                        className="object-cover filter grayscale hover:grayscale-0 transition-all duration-300"
                      />
                    </div>
                    <h3 className="text-sm font-medium text-white/80 text-center mb-1">{member.name}</h3>
                    <p className="text-white/40 text-xs text-center mb-3 font-light tracking-wide uppercase">{member.role}</p>
                    <p className="text-white/50 text-xs text-center font-light leading-relaxed">{member.description}</p>
                  </div>
                  <div className="absolute inset-0 border border-white/[0.05] rounded-xl group-hover:border-white/[0.1] transition-colors duration-300 pointer-events-none" />
                </motion.div>
              ))}
            </div>
          </motion.section>
        </div>
      </div>
    </div>
  );
}
