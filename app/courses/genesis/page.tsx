'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Clock, BookOpen, Users, Star, Play, BookmarkPlus, GraduationCap, ChevronDown, CheckCircle, Lock, Share2, Download, Heart } from 'lucide-react';

type LessonProps = {
  title: string;
  description: string;
  duration: string;
  isCompleted?: boolean;
  isLocked?: boolean;
};

function LessonRow({ title, description, duration, isCompleted, isLocked }: LessonProps) {
  return (
    <div className={`group flex items-center gap-4 p-3 hover:bg-white/[0.02] rounded-xl cursor-pointer transition-all duration-200 backdrop-blur-sm border border-transparent hover:border-white/[0.03] ${isLocked ? 'opacity-70' : ''}`}>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          {isCompleted ? (
            <div className="w-5 h-5 rounded-full bg-green-500/20 flex items-center justify-center">
              <CheckCircle className="w-3.5 h-3.5 text-green-400" />
            </div>
          ) : (
            <div className="w-1.5 h-1.5 rounded-full bg-purple-500/20 group-hover:bg-purple-500/30 transition-colors duration-200 ring-1 ring-purple-500/10" />
          )}
          <h3 className="text-sm text-white/80 group-hover:text-white transition-colors duration-200 truncate">{title}</h3>
          <div className="flex items-center gap-1.5 text-white/40 text-xs bg-white/[0.02] px-2 py-0.5 rounded-xl backdrop-blur-sm">
            <Clock className="w-3 h-3" />
            <span>{duration}</span>
          </div>
        </div>
        <p className="mt-1 text-xs text-white/40 truncate pl-3.5">{description}</p>
      </div>
      <div className="shrink-0 text-white/20 group-hover:text-purple-400/90 transition-colors duration-200">
        <div className="p-1.5 rounded-lg bg-white/[0.02] group-hover:bg-white/[0.04] backdrop-blur-sm">
          {isLocked ? (
            <Lock className="w-3.5 h-3.5" />
          ) : (
            <Play className="w-3.5 h-3.5" />
          )}
        </div>
      </div>
    </div>
  );
}

export default function GenesisCoursePage() {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    'Introduction to Genesis': true,
    'Creation Narratives': true
  });
  
  const [isSaved, setIsSaved] = useState(false);
  const [progress, setProgress] = useState(15); // Percentage of course completed
  
  const toggleSection = (sectionTitle: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionTitle]: !prev[sectionTitle]
    }));
  };

  const sections = [
    {
      title: 'Introduction to Genesis',
      lessons: [
        {
          title: 'Course Overview & Introduction to Genesis',
          description: 'An overview of the book of Genesis and its significance in the Bible.',
          duration: '45 mins',
          isCompleted: true
        },
        {
          title: 'Structure and Composition',
          description: 'Understanding how Genesis is organized and its literary features.',
          duration: '40 mins'
        }
      ]
    },
    {
      title: 'Creation Narratives',
      lessons: [
        {
          title: 'The First Creation Account (Genesis 1:1-2:3)',
          description: 'Exploring the seven days of creation and their theological significance.',
          duration: '50 mins'
        },
        {
          title: 'The Second Creation Account (Genesis 2:4-25)',
          description: 'Analyzing the Garden of Eden narrative and human purpose.',
          duration: '45 mins',
          isLocked: true
        }
      ]
    },
    {
      title: 'The Fall and Its Consequences',
      lessons: [
        {
          title: 'The Fall of Humanity (Genesis 3)',
          description: 'Examining the narrative of human disobedience and its consequences.',
          duration: '55 mins',
          isLocked: true
        },
        {
          title: 'Cain and Abel (Genesis 4)',
          description: 'Analyzing the first murder and the spread of sin.',
          duration: '40 mins',
          isLocked: true
        },
        {
          title: 'The Flood Narrative (Genesis 6-9)',
          description: 'Understanding the flood as divine judgment and new beginning.',
          duration: '60 mins',
          isLocked: true
        }
      ]
    },
    {
      title: 'The Patriarchal Narratives',
      lessons: [
        {
          title: 'Abraham\'s Call and Covenant (Genesis 12-17)',
          description: 'Exploring God\'s promises to Abraham and their significance.',
          duration: '65 mins',
          isLocked: true
        },
        {
          title: 'Isaac and Jacob (Genesis 21-36)',
          description: 'Following the covenant through the next generations.',
          duration: '70 mins',
          isLocked: true
        },
        {
          title: 'Joseph and His Brothers (Genesis 37-50)',
          description: 'Analyzing the Joseph narrative and God\'s providential care.',
          duration: '75 mins',
          isLocked: true
        }
      ]
    }
  ];

  const totalLessons = sections.reduce((acc, section) => acc + section.lessons.length, 0);
  const completedLessons = sections.reduce((acc, section) => 
    acc + section.lessons.filter(lesson => lesson.isCompleted).length, 0);

  return (
    <div className="min-h-screen bg-black selection:bg-purple-500/20 selection:text-purple-200">
      {/* Hero Section */}
      <div className="relative min-h-[360px] flex items-center">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <div className="relative h-full max-w-[calc(100%-320px)]">
            <Image
              src="/images/card-background.jpg"
              alt="Genesis Course Background"
              fill
              className="object-cover opacity-[0.06]"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black via-black/95 to-black/90" />
          </div>
        </div>

        {/* Content */}
        <div className="relative z-10 w-full">
          <div className="mx-auto max-w-[90rem] px-6 lg:px-8 py-12">
            <div className="max-w-[calc(100%-320px)]">
              <div className="inline-flex items-center gap-3 mb-3 p-1 bg-white/[0.02] rounded-2xl backdrop-blur-sm">
                <span className="px-3 py-1 text-xs text-purple-300/90 bg-purple-500/10 rounded-xl">Old Testament</span>
                <div className="flex items-center gap-1 text-white/60 px-3 py-1">
                  <Star className="w-3.5 h-3.5 fill-purple-400/90 text-transparent" />
                  <span className="text-xs">4.8</span>
                </div>
              </div>

              <h1 className="text-4xl font-medium tracking-tight text-white mb-3">
                Genesis
              </h1>

              <p className="text-base text-white/60 max-w-2xl mb-6">
                Explore the foundational book of the Bible, discovering the origins of creation, humanity's
                relationship with God, and the beginnings of God's redemptive plan.
              </p>

              {/* Course progress bar */}
              <div className="mb-6 max-w-md">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-white/60">Course Progress</span>
                  <span className="text-xs text-white/80">{completedLessons}/{totalLessons} lessons</span>
                </div>
                <div className="h-1.5 w-full bg-white/[0.06] rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              <div className="inline-flex items-center gap-6 mb-6 bg-white/[0.02] rounded-2xl backdrop-blur-sm border border-white/[0.03] p-1">
                <div className="flex items-center gap-6 px-4 py-2">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-purple-400/80" />
                    <span className="text-xs text-white/60">8 weeks</span>
                  </div>
                  <div className="w-px h-3 bg-white/[0.06]" />
                  <div className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-purple-400/80" />
                    <span className="text-xs text-white/60">24 lessons</span>
                  </div>
                  <div className="w-px h-3 bg-white/[0.06]" />
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-purple-400/80" />
                    <span className="text-xs text-white/60">1,234 enrolled</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button className="px-5 py-2 bg-purple-500/90 hover:bg-purple-500 text-white/90 hover:text-white rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-2 backdrop-blur-sm">
                  <Play className="w-4 h-4" />
                  Continue Learning
                </button>
                <button 
                  className={`px-5 py-2 bg-white/[0.02] hover:bg-white/[0.04] text-white/70 hover:text-white/90 rounded-xl text-sm font-medium transition-all duration-200 flex items-center gap-2 backdrop-blur-sm border border-white/[0.03] ${isSaved ? 'text-purple-400/90 border-purple-500/20' : ''}`}
                  onClick={() => setIsSaved(!isSaved)}
                >
                  {isSaved ? (
                    <>
                      <Heart className="w-4 h-4 fill-purple-400/50 text-purple-400/90" />
                      Saved
                    </>
                  ) : (
                    <>
                      <BookmarkPlus className="w-4 h-4" />
                      Save for Later
                    </>
                  )}
                </button>
                
                <div className="ml-auto flex items-center gap-2">
                  <button className="p-2 rounded-lg bg-white/[0.02] hover:bg-white/[0.04] text-white/60 hover:text-white/90 transition-all duration-200">
                    <Share2 className="w-4 h-4" />
                  </button>
                  <button className="p-2 rounded-lg bg-white/[0.02] hover:bg-white/[0.04] text-white/60 hover:text-white/90 transition-all duration-200">
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 border-t border-white/[0.03] pt-8 pb-24">
        <div className="mx-auto max-w-[90rem] px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr,320px] gap-12">
            {/* Course Content */}
            <div>
              <div className="flex items-center justify-between mb-8 px-4 py-2 bg-white/[0.02] rounded-xl backdrop-blur-sm border border-white/[0.03]">
                <h2 className="text-sm font-medium text-white">Course Content</h2>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-white/40">•</span>
                  <div className="text-xs text-white/40">{sections.length} sections • {totalLessons} lessons</div>
                </div>
              </div>
              <div className="space-y-8">
                {sections.map((section, index) => (
                  <div key={section.title} className="group">
                    <div 
                      className="flex items-center justify-between mb-3 px-4 py-3 bg-white/[0.02] rounded-xl backdrop-blur-sm border border-white/[0.03] cursor-pointer"
                      onClick={() => toggleSection(section.title)}
                    >
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-lg bg-purple-500/10 flex items-center justify-center">
                          <span className="text-xs text-purple-400/90 font-medium">{String(index + 1).padStart(2, '0')}</span>
                        </div>
                        <h2 className="text-sm text-white/90 font-medium">{section.title}</h2>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="text-xs text-white/30 bg-white/[0.02] px-2 py-0.5 rounded-xl backdrop-blur-sm">
                          {section.lessons.length} lessons
                        </div>
                        <ChevronDown 
                          className={`h-4 w-4 text-white/50 transition-transform duration-300 ${
                            expandedSections[section.title] ? 'rotate-180' : ''
                          }`} 
                        />
                      </div>
                    </div>
                    {expandedSections[section.title] && (
                      <div className="space-y-0.5 pl-4 animate-fadeIn">
                        {section.lessons.map((lesson) => (
                          <LessonRow key={lesson.title} {...lesson} />
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-8 space-y-5">
                <div className="group p-5 bg-white/[0.02] hover:bg-white/[0.03] rounded-xl backdrop-blur-sm border border-white/[0.03] transition-all duration-200">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="relative">
                      <div className="absolute -inset-1 bg-gradient-to-br from-purple-500/20 to-purple-500/0 rounded-full blur-sm" />
                      <div className="relative">
                        <Image
                          src="/images/instructors/sarah-cohen.jpg"
                          alt="Dr. Sarah Cohen"
                          width={48}
                          height={48}
                          className="rounded-full ring-1 ring-purple-500/20 transition-all duration-200 group-hover:ring-purple-500/30"
                        />
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full ring-1 ring-black" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-white group-hover:text-purple-400/90 transition-colors duration-200">Dr. Sarah Cohen</h3>
                      <p className="text-xs text-white/40">Professor of Old Testament Studies</p>
                    </div>
                  </div>
                  <p className="text-xs text-white/60 group-hover:text-white/70 transition-colors duration-200 leading-relaxed">
                    Dr. Sarah Cohen has been teaching Old Testament studies for over 15 years. She holds
                    a Ph.D. in Biblical Studies from Hebrew University and has published numerous works
                    on Genesis.
                  </p>
                  <div className="mt-4 pt-4 border-t border-white/[0.03]">
                    <div className="flex items-center justify-between text-xs">
                      <div className="text-white/30">Response Time</div>
                      <div className="text-white/60 bg-white/[0.02] px-2 py-0.5 rounded-xl backdrop-blur-sm">Within 24 hours</div>
                    </div>
                    <div className="flex items-center justify-between text-xs mt-2">
                      <div className="text-white/30">Languages</div>
                      <div className="text-white/60 bg-white/[0.02] px-2 py-0.5 rounded-xl backdrop-blur-sm">English, Hebrew</div>
                    </div>
                  </div>
                </div>

                <div className="group p-5 bg-white/[0.02] hover:bg-white/[0.03] rounded-xl backdrop-blur-sm border border-white/[0.03] transition-all duration-200">
                  <h3 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-purple-500/10 group-hover:bg-purple-500/20 transition-colors duration-200">
                      <BookOpen className="w-4 h-4 text-purple-400/60" />
                    </div>
                    Prerequisites
                  </h3>
                  <p className="text-xs text-white/60 group-hover:text-white/70 transition-colors duration-200 leading-relaxed">
                    No prior knowledge of Biblical studies is required. This course is designed for both
                    beginners and those with some familiarity with the Old Testament.
                  </p>
                  <ul className="mt-3 space-y-1.5">
                    <li className="flex items-center gap-2 text-xs text-white/60 bg-white/[0.02] px-3 py-1.5 rounded-xl backdrop-blur-sm">
                      <div className="w-1 h-1 rounded-full bg-purple-500/30 ring-1 ring-purple-500/10" />
                      <span>Basic reading comprehension</span>
                    </li>
                    <li className="flex items-center gap-2 text-xs text-white/60 bg-white/[0.02] px-3 py-1.5 rounded-xl backdrop-blur-sm">
                      <div className="w-1 h-1 rounded-full bg-purple-500/30 ring-1 ring-purple-500/10" />
                      <span>Interest in Biblical history</span>
                    </li>
                  </ul>
                </div>

                <div className="group p-5 bg-white/[0.02] hover:bg-white/[0.03] rounded-xl backdrop-blur-sm border border-white/[0.03] transition-all duration-200">
                  <h3 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-purple-500/10 group-hover:bg-purple-500/20 transition-colors duration-200">
                      <GraduationCap className="w-4 h-4 text-purple-400/60" />
                    </div>
                    What You'll Learn
                  </h3>
                  <ul className="space-y-1.5">
                    <li className="flex items-start gap-2 text-xs text-white/60 bg-white/[0.02] px-3 py-1.5 rounded-xl backdrop-blur-sm">
                      <div className="mt-1 w-1 h-1 rounded-full bg-purple-500/30 ring-1 ring-purple-500/10" />
                      <span>Understanding of ancient Near Eastern context</span>
                    </li>
                    <li className="flex items-start gap-2 text-xs text-white/60 bg-white/[0.02] px-3 py-1.5 rounded-xl backdrop-blur-sm">
                      <div className="mt-1 w-1 h-1 rounded-full bg-purple-500/30 ring-1 ring-purple-500/10" />
                      <span>Analysis of creation narratives and their theological significance</span>
                    </li>
                    <li className="flex items-start gap-2 text-xs text-white/60 bg-white/[0.02] px-3 py-1.5 rounded-xl backdrop-blur-sm">
                      <div className="mt-1 w-1 h-1 rounded-full bg-purple-500/30 ring-1 ring-purple-500/10" />
                      <span>Exploration of key themes in Genesis</span>
                    </li>
                  </ul>
                </div>
                
                {/* New Resources section */}
                <div className="group p-5 bg-white/[0.02] hover:bg-white/[0.03] rounded-xl backdrop-blur-sm border border-white/[0.03] transition-all duration-200">
                  <h3 className="text-sm font-medium text-white mb-3 flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-purple-500/10 group-hover:bg-purple-500/20 transition-colors duration-200">
                      <Download className="w-4 h-4 text-purple-400/60" />
                    </div>
                    Course Resources
                  </h3>
                  <ul className="space-y-2">
                    <li className="flex items-center justify-between text-xs text-white/60 bg-white/[0.02] px-3 py-2 rounded-xl backdrop-blur-sm hover:bg-white/[0.04] transition-colors cursor-pointer">
                      <span>Genesis Study Guide.pdf</span>
                      <Download className="w-3.5 h-3.5" />
                    </li>
                    <li className="flex items-center justify-between text-xs text-white/60 bg-white/[0.02] px-3 py-2 rounded-xl backdrop-blur-sm hover:bg-white/[0.04] transition-colors cursor-pointer">
                      <span>Creation Timeline.pdf</span>
                      <Download className="w-3.5 h-3.5" />
                    </li>
                    <li className="flex items-center justify-between text-xs text-white/60 bg-white/[0.02] px-3 py-2 rounded-xl backdrop-blur-sm hover:bg-white/[0.04] transition-colors cursor-pointer">
                      <span>Lecture Slides.pptx</span>
                      <Download className="w-3.5 h-3.5" />
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Add animation styles */}
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
}
